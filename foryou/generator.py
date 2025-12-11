import os
import json
import webbrowser
from datetime import datetime
from typing import Dict, List, Optional

# Lokasi script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# Cek apakah script ada di dalam folder "foryou" atau di luarnya
if os.path.basename(SCRIPT_DIR) == "foryou":
    FORYOU_DIR = SCRIPT_DIR               # kalau script ada di dalam "foryou"
    BASE_PATH = os.path.dirname(SCRIPT_DIR) # parent folder
else:
    FORYOU_DIR = os.path.join(SCRIPT_DIR, "foryou")  # kalau script sejajar dengan "foryou"
    BASE_PATH = SCRIPT_DIR

# Validasi folder foryou
if not os.path.exists(FORYOU_DIR):
    raise FileNotFoundError(f"Folder 'foryou' tidak ditemukan di {BASE_PATH}")

# Color themes (pastel colors)
COLOR_THEMES = {
    "pink": {
        "gradient": "linear-gradient(135deg, #ffe5e5 0%, #fff0f5 100%)",
        "primary": "#ff69b4",
        "light": "#fff0f5",
        "shadow": "rgba(255, 105, 180, 0.3)"
    },
    "blue": {
        "gradient": "linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)",
        "primary": "#60a5fa",
        "light": "#dbeafe",
        "shadow": "rgba(96, 165, 250, 0.3)"
    },
    "yellow": {
        "gradient": "linear-gradient(135deg, #fef3c7 0%, #fef9e7 100%)",
        "primary": "#fbbf24",
        "light": "#fef3c7",
        "shadow": "rgba(251, 191, 36, 0.3)"
    },
    "orange": {
        "gradient": "linear-gradient(135deg, #fed7aa 0%, #ffedd5 100%)",
        "primary": "#fb923c",
        "light": "#fed7aa",
        "shadow": "rgba(251, 146, 60, 0.3)"
    },
    "gray": {
        "gradient": "linear-gradient(135deg, #e5e7eb 0%, #f3f4f6 100%)",
        "primary": "#9ca3af",
        "light": "#e5e7eb",
        "shadow": "rgba(156, 163, 175, 0.3)"
    }
}

def create_new_folder():
    """Interactive function to create a new folder with color theme selection"""
    print("\n" + "="*60)
    print("🎨 BUAT FOLDER BARU UNTUK ORANG SPESIAL")
    print("="*60)
    
    # Get folder name
    while True:
        folder_name = input("\n📁 Nama folder (gunakan huruf kecil dan tanda '-'): ").strip().lower()
        if not folder_name:
            print("❌ Nama folder tidak boleh kosong!")
            continue
        
        # Validate folder name
        if not all(c.isalnum() or c == '-' for c in folder_name):
            print("❌ Nama folder hanya boleh mengandung huruf, angka, dan tanda '-'")
            continue
        
        folder_path = os.path.join(FORYOU_DIR, folder_name)
        if os.path.exists(folder_path):
            print(f"❌ Folder '{folder_name}' sudah ada!")
            continue
        
        break
    
    # Get description
    description = input("📝 Deskripsi singkat: ").strip()
    if not description:
        description = f"Halaman spesial untuk {folder_name.replace('-', ' ').title()} 💖"
    
    # Choose color theme
    print("\n🎨 Pilih tema warna:")
    print("1. 💗 Pink (Pastel)")
    print("2. 💙 Blue (Pastel)")
    print("3. 💛 Yellow (Pastel)")
    print("4. 🧡 Orange (Pastel)")
    print("5. 🩶 Gray (Pastel)")
    
    while True:
        color_choice = input("\nPilih warna (1-5): ").strip()
        color_map = {"1": "pink", "2": "blue", "3": "yellow", "4": "orange", "5": "gray"}
        if color_choice in color_map:
            color_theme = color_map[color_choice]
            break
        print("❌ Pilihan tidak valid! Pilih 1-5")
    
    # Get message content
    print("\n✍️  Tulis pesan untuk orang spesial (tekan Enter 2x untuk selesai):")
    message_lines = []
    empty_count = 0
    while True:
        line = input()
        if not line:
            empty_count += 1
            if empty_count >= 2:
                break
        else:
            empty_count = 0
            message_lines.append(line)
    
    message_content = " ".join(message_lines) if message_lines else "Pesan spesial untuk kamu ❤️"
    
    # Get button text
    button_text = input("\n🔘 Teks tombol (kosongkan untuk default): ").strip()
    if not button_text:
        button_text = f"{folder_name.replace('-', ' ').title()}, tekan tombol ini"
    
    # Get title
    title_text = input("📌 Judul halaman (kosongkan untuk default): ").strip()
    if not title_text:
        title_text = f"Haii {folder_name.replace('-', ' ').title()}!!"
    
    # Create folder
    os.makedirs(folder_path)
    print(f"\n✅ Folder '{folder_name}' berhasil dibuat!")
    
    # Create config.json
    current_time = datetime.now().strftime("%Y-%m-%dT%H.%M.%S")
    config = {
        "created_at": current_time,
        "description": description,
        "last_modified": current_time,
        "order": 999,
        "color_theme": color_theme
    }
    
    config_path = os.path.join(folder_path, "config.json")
    with open(config_path, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2, ensure_ascii=False)
    
    # Create index.html
    theme = COLOR_THEMES[color_theme]
    index_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title_text}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: 'Poppins', sans-serif;
            background: {theme['gradient']};
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 1rem;
        }}

        .container {{
            text-align: center;
            padding: 2rem;
            max-width: 600px;
            margin: 0 auto;
            width: 100%;
        }}

        .main-button {{
            background: {theme['primary']};
            color: white;
            border: none;
            padding: 1.5rem 3rem;
            font-size: 1.5rem;
            border-radius: 50px;
            cursor: pointer;
            font-family: 'Poppins', sans-serif;
            font-weight: 500;
            box-shadow: 0 8px 20px {theme['shadow']};
            transition: all 0.3s ease;
        }}

        .main-button:hover {{
            transform: translateY(-3px);
            box-shadow: 0 12px 30px {theme['shadow']};
        }}

        .main-button:active {{
            transform: translateY(1px);
        }}

        .content {{
            margin-top: -2rem;
        }}

        .title {{
            font-family: 'Poppins', sans-serif;
            color: {theme['primary']};
            font-size: 2.5rem;
            margin-bottom: 2rem;
            animation: fadeIn 1s ease-out;
            font-weight: 700;
        }}

        .message {{
            background: white;
            padding: 2rem;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            animation: slideUp 1s ease-out;
        }}

        .message p {{
            font-size: 1.2rem;
            color: #666;
            line-height: 1.8;
            margin-bottom: 1rem;
        }}

        .signature {{
            font-family: 'Poppins', sans-serif;
            font-size: 1.5rem !important;
            color: {theme['primary']} !important;
            text-align: right;
            margin-top: 1rem !important;
            margin-bottom: 0rem !important;
            font-weight: 600;
        }}

        @keyframes fadeIn {{
            from {{
                opacity: 0;
            }}
            to {{
                opacity: 1;
            }}
        }}

        @keyframes slideUp {{
            from {{
                opacity: 0;
                transform: translateY(30px);
            }}
            to {{
                opacity: 1;
                transform: translateY(0);
            }}
        }}

        @media (max-width: 768px) {{
            .main-button {{
                font-size: 1.2rem;
                padding: 1.2rem 2.5rem;
            }}
            
            .title {{
                font-size: 2rem;
            }}
            
            .message p {{
                font-size: 1rem;
            }}

            .container {{
                padding: 1rem;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="content" style="display: none;">
            <h1 class="title">{title_text}</h1>
            <div class="message">
                <p>{message_content}</p>
                <p class="signature">~ ajan</p>
            </div>
        </div>
        <button class="main-button">{button_text}</button>
    </div>
    <script>
        document.addEventListener('DOMContentLoaded', () => {{
            const button = document.querySelector('.main-button');
            const content = document.querySelector('.content');
            let isClicked = false;

            button.addEventListener('click', () => {{
                if (isClicked) return;
                isClicked = true;

                // Hide button with animation
                button.style.opacity = '0';
                button.style.transform = 'scale(0.8)';
                
                // Show content after button animation
                setTimeout(() => {{
                    button.style.display = 'none';
                    content.style.display = 'block';
                }}, 500);
            }});
        }});
    </script>
</body>
</html>
"""
    
    index_path = os.path.join(folder_path, "index.html")
    with open(index_path, "w", encoding="utf-8") as f:
        f.write(index_html)
    
    print(f"✅ File index.html berhasil dibuat dengan tema {color_theme}!")
    print(f"✅ Lokasi: {folder_path}")
    print("\n" + "="*60)
    
    return folder_name

# Main menu
print("\n" + "="*60)
print("🎨 FOR YOU GENERATOR")
print("="*60)
print("\n1. 📁 Buat folder baru")
print("2. 📄 Generate index.html (admin)")
print("3. ✅ Buat folder baru + Generate index.html")

choice = input("\nPilih opsi (1-3): ").strip()

if choice == "1":
    create_new_folder()
    print("\n💡 Jangan lupa jalankan opsi 2 untuk generate index.html!")
elif choice in ["2", "3"]:
    if choice == "3":
        create_new_folder()
    
    # Ambil daftar folder di foryou/
    pages = [
        d for d in os.listdir(FORYOU_DIR)
        if os.path.isdir(os.path.join(FORYOU_DIR, d))
    ]
    
    # === Buat konten HTML ===
    html_content = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>For You Pages</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #2563eb;
      --bg: #f8fafc;
      --text: #0f172a;
      --card-bg: #ffffff;
      --gray-400: #94a3b8;
      --dot-color: rgba(77, 37, 235, 0.075);
      --dot-size: 1.5px;
      --dot-space: 22px;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .dots-background {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: -1;
      background-image: 
        radial-gradient(var(--dot-color) var(--dot-size), transparent var(--dot-size)),
        radial-gradient(var(--dot-color) var(--dot-size), transparent var(--dot-size));
      background-position: 0 0, calc(var(--dot-space) / 2) calc(var(--dot-space) / 2);
      background-size: var(--dot-space) var(--dot-space);
      mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
      -webkit-mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
    }
    
    body {
      font-family: 'Poppins', sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      padding: 1rem 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 2rem;
      font-size: 0.9rem;
      color: var(--gray-400);
    }

    .breadcrumb a {
      color: var(--primary);
      text-decoration: none;
      transition: color 0.2s;
    }

    .breadcrumb a:hover {
      color: #1d4ed8;
    }

    .breadcrumb span {
      color: #4c586a;
    }
    
    .header {
      text-align: center;
      margin-bottom: 1rem;
      padding: 1rem 0;
    }
    
    h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 0.5rem;
    }
    
    .subtitle {
      font-size: 1.1rem;
      color: #64748b;
      margin-bottom: 1.5rem;
      font-weight: 400;
    }
    
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
      padding: 0;
      list-style: none;
    }
    
    .card {
      background: var(--card-bg);
      border-radius: 1rem;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      overflow: hidden;
    }
    
    .card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    }
    
    .card a {
      display: block;
      padding: 1rem;
      text-decoration: none;
      color: var(--text);
    }

    .card-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .card-title::before {
      content: "💌";
      font-size: 1.2rem;
    }

    .card-description {
      font-size: 0.9rem;
      color: var(--gray-400);
      margin-left: 0.5rem;
      font-weight: 400;
    }
    
    @media (max-width: 640px) {
      body {
        padding: 0.75rem;
      }

      .breadcrumb {
        margin-bottom: 0.5rem;
      }
      
      .header {
        margin-bottom: 1.5rem;
        padding: 0.8rem;
      }
      
      h1 {
        font-size: 1.75rem;
        margin-bottom: 0rem;
      }

      .subtitle {
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
      }
      
      .grid {
        grid-template-columns: 1fr;
        gap: 0.75rem;
      }

      .card {
        border-radius: 0.75rem;
      }

      .card a {
        padding: 0.5rem 1rem 0.8rem 1rem;
      }

      .card-title {
        font-size: 1rem;
      }

      .card-description {
        font-size: 0.8rem;
        margin-left: 0.2rem;
      }
    }
  </style>
</head>
<body>
  <div class="dots-background"></div>
  <nav class="breadcrumb">
    <a href="../">🏠</a>
    <span>/</span>
    <span>foryou</span>
  </nav>
  <header class="header">
    <h1>For You Pages</h1>
    <p class="subtitle">Halaman khusus untuk orang spesial ❤️</p>
  </header>
  <ul class="grid">
"""
    
    # Fungsi untuk mendapatkan atau membuat config.json
    def get_or_create_config(folder_path: str, folder_name: str) -> Dict:
        config_path = os.path.join(folder_path, "config.json")
        if os.path.exists(config_path):
            try:
                with open(config_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except json.JSONDecodeError:
                pass
        
        # Default config jika file tidak ada atau rusak
        current_time = datetime.now().strftime("%Y-%m-%dT%H.%M.%S")
        default_config = {
            "created_at": current_time,
            "description": f"Halaman spesial untuk {folder_name.replace('-', ' ').title()} 💖",
            "last_modified": current_time,
            "order": 999  # Will be updated by fix_page_order
        }
        
        # Simpan default config
        with open(config_path, "w", encoding="utf-8") as f:
            json.dump(default_config, f, indent=2, ensure_ascii=False)
        
        return default_config
    
    def fix_page_order(pages: List[str]) -> None:
        """
        Memperbaiki urutan halaman:
        1. Mengisi gap dalam urutan (misal 1,2,4,5 -> 1,2,3,4)
        2. Menempatkan folder baru di urutan terakhir
        3. Memastikan urutan dimulai dari 1 dan berurutan
        """
        # Kumpulkan semua data halaman dengan order dan created_at
        page_data = []
        for page in pages:
            page_path = os.path.join(FORYOU_DIR, page)
            config = get_or_create_config(page_path, page)
            order = config.get("order", 999)
            created_at = config.get("created_at", "")
            page_data.append((page, order, created_at))
        
        # Urutkan berdasarkan order, lalu created_at untuk yang order sama
        page_data.sort(key=lambda x: (x[1], x[2]))
        
        # Perbaiki urutan
        new_order = 1
        for page, order, _ in page_data:
            page_path = os.path.join(FORYOU_DIR, page)
            config_path = os.path.join(page_path, "config.json")
            
            with open(config_path, "r", encoding="utf-8") as f:
                config = json.load(f)
            
            if config["order"] != new_order:
                config["order"] = new_order
                config["last_modified"] = datetime.now().strftime("%Y-%m-%dT%H.%M.%S")
                with open(config_path, "w", encoding="utf-8") as f:
                    json.dump(config, f, indent=4, ensure_ascii=False)
            
            new_order += 1
    
    def sort_pages(pages: List[str], sort_method: str = "order") -> List[str]:
        """
        Mengurutkan halaman berdasarkan metode yang dipilih
        sort_method: "order" (dari config), "name" (alfabetis), "date" (tanggal pembuatan)
        """
        if sort_method == "name":
            return sorted(pages)
        
        page_data = []
        for page in pages:
            page_path = os.path.join(FORYOU_DIR, page)
            config = get_or_create_config(page_path, page)
            
            if sort_method == "date":
                sort_key = config.get("created_at", "")
            else:  # default to order
                sort_key = config.get("order", 999)
                
            page_data.append((page, sort_key))
        
        return [page for page, _ in sorted(page_data, key=lambda x: x[1])]
    
    # Tentukan prefix link
    link_prefix = "./foryou/" if os.path.basename(SCRIPT_DIR) != "foryou" else "./"
    
    # Baca konfigurasi sorting dari settings.json
    settings_path = os.path.join(FORYOU_DIR, "settings.json")
    try:
        with open(settings_path, "r", encoding="utf-8") as f:
            settings = json.load(f)
            sort_method = settings.get("sort_method", "order")
    except (FileNotFoundError, json.JSONDecodeError):
        sort_method = "order"
        # Buat settings.json default
        with open(settings_path, "w", encoding="utf-8") as f:
            json.dump({"sort_method": sort_method}, indent=2)
    
    # Perbaiki urutan pages terlebih dahulu
    fix_page_order(pages)
    
    # Urutkan pages berdasarkan metode yang dipilih
    pages = sort_pages(pages, sort_method)
    
    # Dictionary untuk menyimpan descriptions dari config.json files
    page_descriptions = {}
    
    # Baca config dari setiap folder
    for page in pages:
        page_path = os.path.join(FORYOU_DIR, page)
        config = get_or_create_config(page_path, page)
        page_descriptions[page] = config["description"]
    
    for page in pages:
        title = page.replace("-", " ").title()
        description = page_descriptions.get(page, "A special page for someone special 💖")
        html_content += f'''    <li class="card">
      <a href="{link_prefix}{page}/">
        <div class="card-title">{title}</div>
        <div class="card-description">{description}</div>
      </a>
    </li>\n'''
    
    html_content += """  </ul>
</body>
</html>
"""
    
    # Simpan file index.html di folder admin
    ADMIN_DIR = os.path.join(FORYOU_DIR, "admin")
    if not os.path.exists(ADMIN_DIR):
        os.makedirs(ADMIN_DIR)
    
    OUTPUT_PATH = os.path.join(ADMIN_DIR, "index.html")
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        f.write(html_content)
    
    print(f"\n✅ index.html berhasil digenerate di {OUTPUT_PATH}")
    
    # Buka otomatis di browser
    webbrowser.open("file://" + OUTPUT_PATH)
else:
    print("\n❌ Pilihan tidak valid!")