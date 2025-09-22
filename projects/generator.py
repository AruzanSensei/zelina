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
  <title>Daftar Projects</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #f9f9f9; }
    h1 { color: #222; }
    ul { list-style: none; padding: 0; }
    li { margin: 8px 0; }
    a { text-decoration: none; color: #0077cc; font-size: 18px; }
    a:hover { text-decoration: underline; }
    .card {
      background: #fff;
      padding: 15px;
      margin: 10px 0;
      border-radius: 10px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }
  </style>
</head>
<body>
  <h1>📂 Daftar Projects</h1>
  <ul>
"""

# Tentukan prefix link
link_prefix = "./projects/" if os.path.basename(SCRIPT_DIR) != "projects" else "./"

for project in projects:
    html_content += f'    <li class="card"><a href="{link_prefix}{project}/">{project}</a></li>\n'

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
