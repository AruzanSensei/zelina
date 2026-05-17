from flask import Flask, render_template, request, jsonify, send_file
import requests
from bs4 import BeautifulSoup
import re
import os
import json
from datetime import datetime

app = Flask(__name__)
port = int(os.environ.get("PORT", 5000))
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Referer': 'https://otakudesu.best/'
}

# Create downloads directory if it doesn't exist
DOWNLOADS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'downloads')
os.makedirs(DOWNLOADS_DIR, exist_ok=True)

class SearchResult:
    def __init__(self, title, url, genres, status, rating, episodes, image_url=None):
        self.title = title
        self.url = url
        self.genres = genres
        self.status = status
        self.rating = rating
        self.episodes = episodes
        self.episode_links = []
        self.image_url = image_url

    def to_dict(self):
        return {
            'title': self.title,
            'url': self.url,
            'genres': self.genres,
            'status': self.status,
            'rating': self.rating,
            'episodes': self.episodes,
            'image_url': self.image_url
        }

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search_anime():
    query = request.json.get('query', '').strip()
    if not query:
        return jsonify({'error': 'Please enter an anime title to search'}), 400

    try:
        search_url = f"https://otakudesu.best/?s={query}&post_type=anime"
        response = requests.get(search_url, headers=HEADERS)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        results = []
        results_container = soup.find('ul', class_='chivsrc')
        if not results_container:
            return jsonify({'results': []})

        anime_items = results_container.find_all('li', style='list-style:none;')
        for item in anime_items:
            try:
                title_elem = item.find('h2')
                if not title_elem or not title_elem.find('a'):
                    continue

                title = title_elem.find('a').text.strip()
                anime_url = title_elem.find('a')['href']

                # Extract image URL directly from the <img> tag within the <li>
                image_tag = item.find('img')
                image_url = image_tag['src'] if image_tag else None

                genres = 'Unknown'
                status = 'Unknown'
                rating = 'Unknown'
                episodes = 'Unknown'

                set_divs = item.find_all('div', class_='set')
                for div in set_divs:
                    strong_tag = div.find('b')
                    if not strong_tag:
                        continue
                    if strong_tag.text == 'Genres':
                        genres = ', '.join([a.text for a in div.find_all('a')])
                    elif strong_tag.text == 'Status':
                        status = div.text.replace('Status :', '').strip()
                    elif strong_tag.text == 'Rating':
                        rating = div.text.replace('Rating :', '').strip()

                episode_match = re.search(r'Episode\s+(\d+)\s*–\s*(\d+)', title)
                if episode_match:
                    episodes = f"{episode_match.group(1)}-{episode_match.group(2)}"
                else:
                    episode_match = re.search(r'Episode\s+(\d+)', title)
                    if episode_match:
                        episodes = episode_match.group(1)

                result = SearchResult(title, anime_url, genres, status, rating, episodes, image_url)
                results.append(result.to_dict())

            except Exception as e:
                print(f"Error processing item: {str(e)}")
                continue

        return jsonify({'results': results})

    except requests.exceptions.RequestException as e:
         return jsonify({'error': f'Network error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/get_episodes', methods=['POST'])
def get_episodes():
    anime_url = request.json.get('url')
    if not anime_url:
        return jsonify({'error': 'No URL provided'}), 400

    try:
        response = requests.get(anime_url, headers=HEADERS)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extract cover image from anime detail page (assuming it's in a div with class 'thumb')
        cover_image_tag = soup.find('div', class_='thumb')
        cover_image_url = cover_image_tag.find('img')['src'] if cover_image_tag and cover_image_tag.find('img') else None

        episode_list = soup.find_all('div', class_='episodelist')
        if not episode_list:
            return jsonify({'reguler': [], 'ova': [], 'batch': [], 'cover_image_url': cover_image_url})

        reguler = []
        ova = []
        batch = []

        for elist in episode_list:
            ul = elist.find('ul')
            if not ul:
                continue
            for li in ul.find_all('li'):
                a = li.find('a')
                if not a or not a.get('href'):
                    continue
                href = a['href']
                text = a.get_text(strip=True)
                
                if 'batch' in href:
                    batch.append({'name': text, 'url': href})
                elif re.search(r'OVA', text, re.I):
                    ova.append({'name': text, 'url': href})
                elif re.search(r'episode[- ]?\d+', href, re.I):
                    if re.search(r'Episode\s*\d+', text, re.I):
                        reguler.append({'name': text, 'url': href})

        return jsonify({
            'reguler': reguler,
            'ova': ova,
            'batch': batch,
            'cover_image_url': cover_image_url
        })

    except requests.exceptions.RequestException as e:
         return jsonify({'error': f'Network error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/download', methods=['POST'])
def download_episode():
    episode_url = request.json.get('url')
    if not episode_url:
        return jsonify({'error': 'No URL provided'}), 400

    try:
        # Extract Pixeldrain link
        response = requests.get(episode_url, headers=HEADERS)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        strong_tag = soup.find('strong', string=re.compile(r'(Mp4\s*)?720p', re.I)) # Assuming 720p is preferred
        if not strong_tag:
             # Try 480p if 720p not found
            strong_tag = soup.find('strong', string=re.compile(r'(Mp4\s*)?480p', re.I))
            if not strong_tag:
                 return jsonify({'error': 'No 720p or 480p download link found'}, 404)

        pdrain_safelink = None
        for sibling in strong_tag.find_all_next('a'):
            if re.search(r'Pdrain', sibling.text, re.I):
                pdrain_safelink = sibling['href']
                break

        if not pdrain_safelink:
            return jsonify({'error': 'No Pixeldrain link found'}, 404)

        # Bypass safelink
        session = requests.Session()
        response = session.get(pdrain_safelink, headers=HEADERS, allow_redirects=True)
        if 'pixeldrain.com' in response.url: # Direct Pixeldrain link
            final_url = response.url
        else: # Safelink that needs bypassing
            soup = BeautifulSoup(response.text, 'html.parser')
            link_tag = soup.find('a', href=re.compile(r'pixeldrain.com'))
            if not link_tag:
                return jsonify({'error': 'Could not bypass safelink to find Pixeldrain link'}, 404)
            final_url = link_tag['href']

        # Get file ID from Pixeldrain URL
        file_id_match = re.search(r'/(?:file|u)/([a-zA-Z0-9]+)', final_url)
        if not file_id_match:
            return jsonify({'error': 'Invalid Pixeldrain URL format'}, 400)

        file_id = file_id_match.group(1)

        # Get file name from Pixeldrain API
        info_url = f"https://pixeldrain.com/api/file/{file_id}/info"
        response = requests.get(info_url, headers=HEADERS)
        response.raise_for_status()
        data = response.json()
        filename = data.get("name", f"Episode_{file_id}.mp4")

        # Generate direct download URL (using API endpoint)
        download_url = f"https://pixeldrain.com/api/file/{file_id}?download"
        
        return jsonify({
            'download_url': download_url,
            'filename': filename
        })

    except requests.exceptions.RequestException as e:
         return jsonify({'error': f'Network error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

# if __name__ == '__main__':
#     app.run(debug=True) 

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=port)
