# Anime Downloader Web

A web-based anime downloader application that allows you to search for anime and download episodes directly from your browser.

## Features

- Search for anime titles
- View anime details (episodes, rating, genres, status)
- Download regular episodes, OVAs, and batch downloads
- Modern, responsive dark-themed UI
- Direct download support

## Requirements

- Python 3.7 or higher
- Flask
- Requests
- BeautifulSoup4

## Installation

1. Clone this repository or download the source code
2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

1. Start the application:
   ```bash
   python app.py
   ```
2. Open your web browser and navigate to `http://localhost:5000`
3. Use the search bar to find anime
4. Click "View Episodes" to see available episodes
5. Click the download button next to any episode to start downloading

## Notes

- The application uses the Pixeldrain service for downloads
- Downloads are handled directly through your browser
- Make sure you have a stable internet connection for downloading

## License

This project is for educational purposes only. Please respect copyright laws and the terms of service of the websites you access. "# otakuDownload" 
