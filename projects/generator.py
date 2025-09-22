import os
import webbrowser

# Lokasi script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# Cek apakah script ada di dalam folder "projects" atau di luarnya
if os.path.basename(SCRIPT_DIR) == "projects":
    PROJECTS_DIR = SCRIPT_DIR               # kalau script ada di dalam "projects"
    BASE_PATH = os.path.dirname(SCRIPT_DIR) # parent folder
else:
    PROJECTS_DIR = os.path.join(SCRIPT_DIR, "projects")  # kalau script sejajar dengan "projects"
    BASE_PATH = SCRIPT_DIR

# Validasi folder projects
if not os.path.exists(PROJECTS_DIR):
    raise FileNotFoundError(f"Folder 'projects' tidak ditemukan di {BASE_PATH}")

# Ambil daftar folder di projects/
projects = [
    d for d in os.listdir(PROJECTS_DIR)
    if os.path.isdir(os.path.join(PROJECTS_DIR, d))
]

# === Buat konten HTML ===
html_content = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Projects</title>
  <style>
    :root {
      --primary: #2563eb;
      --bg: #f8fafc;
      --text: #0f172a;
      --card-bg: #ffffff;
      --gray-400: #94a3b8;
      --dot-color: rgba(77, 37, 235, 0.075);
      --dot-size: 2px;
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
      font-family: 'Segoe UI', system-ui, sans-serif;
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
    }

    .breadcrumb span {
      color: var(--gray-400);
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
      font-weight: 500;
    }

    .card-title::before {
      content: "📂";
      font-size: 1.2rem;
    }

    .card-description {
      font-size: 0.9rem;
      color: var(--gray-400);
      margin-left: 0.5rem;
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
    <span>projects</span>
    <span>/</span>
  </nav>
  <header class="header">
    <h1>My Projects</h1>
    <p class="subtitle">A collection of my web development projects</p>
  </header>
  <ul class="grid">
"""

# Tentukan prefix link
link_prefix = "./projects/" if os.path.basename(SCRIPT_DIR) != "projects" else "./"

project_descriptions = {
    'AJI-Web': 'A modern web platform for seamless information management',
    'chatbot.zanxa': 'Interactive chatbot with advanced natural language processing',
    'contact': 'Simple and elegant contact management system',
    'dairyMilk': 'E-commerce platform for dairy products',
    'Kotoba-Minna-ni-Hongo': 'Japanese learning application with interactive features',
    'lms-2023-2024': 'Learning Management System with advanced tracking',
    'LMS2324': 'Updated version of the Learning Management System',
    'otakuDownload': 'Anime and manga content management platform',
    'pixel-commerce-oasis': 'Modern e-commerce solution with pixel-perfect design',
    'QurbanKu': 'Qurban management and distribution system'
}

for project in projects:
    title = project.replace("-", " ").title()
    description = project_descriptions.get(project, "A web development project in progress")
    html_content += f'''    <li class="card">
      <a href="{link_prefix}{project}/">
        <div class="card-title">{title}</div>
        <div class="card-description">{description}</div>
      </a>
    </li>\n'''

html_content += """  </ul>
</body>
</html>
"""

# Simpan file index.html di folder script
OUTPUT_PATH = os.path.join(SCRIPT_DIR, "index.html")
with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"✅ index.html berhasil digenerate di {OUTPUT_PATH}")

# Buka otomatis di browser
webbrowser.open("file://" + OUTPUT_PATH)
