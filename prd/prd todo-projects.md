\# PRD — Local Project Todo \& Asset Hub



\*\*Version:\*\* 2.0

\*\*Type:\*\* Frontend Only (No Backend)

\*\*Style:\*\* SaaS Minimal (Notion-like)

\*\*Mode:\*\* Multi-Root Local File Manager



\---



\# 1. OVERVIEW



Web app untuk:



\* Mengelola todo dari banyak project lokal

\* Menyimpan prompt \& asset per project

\* Menjadi "control center" developer (bukan sekadar todo list)



Semua data berasal dari:



\* File system lokal (`.todo/`)

\* Tanpa server / tanpa database eksternal



\---



\# 2. DESIGN SYSTEM (WAJIB DETAIL)



\## 2.1 Visual Theme



\* Style: \*\*Notion-like SaaS\*\*

\* Background: putih (`#FFFFFF`)

\* Secondary background: abu soft (`#F7F7F8`)

\* Border: tipis (`#E5E7EB`)

\* Shadow: sangat subtle (soft elevation)



\---



\## 2.2 Typography



\* Font: `Inter` / `Plus Jakarta Sans`

\* Heading:



&#x20; \* H1: 24–28px (bold)

&#x20; \* H2: 18–20px (semi-bold)

\* Body: 14–16px

\* Line height: 1.5–1.7



\---



\## 2.3 Color System



| Purpose        | Color   |

| -------------- | ------- |

| Primary        | #111827 |

| Secondary text | #6B7280 |

| Border         | #E5E7EB |

| Hover          | #F3F4F6 |

| Active         | #EDE9FE |



\### Status Color



| Status        | Color         |

| ------------- | ------------- |

| Done          | Hijau #10B981 |

| Pending       | Abu           |

| Priority High | Merah #EF4444 |

| Tag           | Biru #3B82F6  |



\---



\## 2.4 Component Style



\### Card



\* Background putih

\* Border 1px

\* Radius 8px

\* Padding 12–16px



\### Button



\* Primary: solid

\* Secondary: outline

\* Hover: opacity + slight scale (1.02)



\---



\# 3. LAYOUT STRUCTURE



\## 3.1 Main Layout (WAJIB)



```

\[ Sidebar ] \[ Main Content ]

```



\---



\## 3.2 Sidebar (FIXED LEFT)



Width:



\* Desktop: 240px

\* Mobile: hidden (drawer)



Isi:



1\. Logo / App name

2\. Workspace list

3\. Divider

4\. Project list

5\. Button "+ Add Folder"



\---



\## 3.3 Topbar (Main Area)



Isi:



\* Search bar (center)

\* Filter dropdown

\* Toggle Write Mode



\---



\## 3.4 Main Content Area



Mode:



\* Empty state

\* Project detail

\* Search result



\---



\# 4. CORE UX FLOW



\## 4.1 First Open (EMPTY STATE)



Tampilan:



\* Icon besar (folder)

\* Text:

&#x20; "No workspace added"

\* Button:

&#x20; "Add Folder"



\---



\## 4.2 Add Workspace Flow



1\. Klik "Add Folder"

2\. Trigger:

&#x20;  window.showDirectoryPicker()

3\. Simpan handle

4\. Auto scan



\---



\## 4.3 Project Selection



\* Klik project di sidebar

\* Load detail ke main area



\---



\# 5. PROJECT UI DETAIL



\## 5.1 Header Project



Isi:



\* Project name

\* Path (small text)

\* Progress bar



\---



\## 5.2 Tabs



```

\[ Todo ] \[ Prompt ] \[ Assets ]

```



\---



\# 6. TODO VIEW (SUPER DETAIL)



\## 6.1 Task Item Layout



```

\[checkbox] Task text     \[tags] \[due date]

```



\---



\## 6.2 Behavior



\* Klik checkbox:



&#x20; \* Read mode → disabled

&#x20; \* Write mode → toggle



\---



\## 6.3 Visual Rules



\* Done:



&#x20; \* text: strike-through

&#x20; \* opacity 0.6

\* Priority:



&#x20; \* border-left merah

\* Overdue:



&#x20; \* text merah



\---



\## 6.4 Grouping



\* Berdasarkan heading `#`

\* Render sebagai section



\---



\# 7. PROMPT VIEW



\## 7.1 Layout



\* Sidebar kecil (list file)

\* Main: markdown viewer



\---



\## 7.2 Behavior



\* Switch antar file prompt

\* Render markdown clean



\---



\# 8. ASSET VIEW



\## 8.1 Layout



Grid:



\* Desktop: 4 kolom

\* Tablet: 3

\* Mobile: 2



\---



\## 8.2 Asset Card



Isi:



\* Thumbnail

\* Filename

\* Size



\---



\## 8.3 Interaction



\* Klik:



&#x20; \* preview modal

\* Hover:



&#x20; \* scale + shadow



\---



\# 9. SEARCH SYSTEM



\## 9.1 UI



\* Input di topbar

\* Real-time result dropdown



\---



\## 9.2 Behavior



Search:



\* project name

\* task

\* tag



\---



\# 10. WRITE MODE (KRUSIAL)



\## 10.1 Toggle



Switch di topbar:



\* OFF (default)

\* ON



\---



\## 10.2 Indicator



\* Banner kecil:

&#x20; "Write mode enabled"



\---



\## 10.3 Safety



\* Confirm sebelum write

\* Backup otomatis



\---



\# 11. ANIMATION



| Element         | Behavior             |

| --------------- | -------------------- |

| Sidebar hover   | background highlight |

| Task hover      | subtle bg            |

| Checkbox toggle | smooth transition    |

| Tab switch      | fade                 |

| Modal           | scale + fade         |



\---



\# 12. RESPONSIVE



\## Mobile (<768px)



\* Sidebar jadi drawer

\* Grid asset 2 kolom

\* Font sedikit lebih besar



\---



\# 13. PERFORMANCE



\* Lazy load project

\* Debounce search

\* Cache IndexedDB



\---



\# 14. ERROR HANDLING



\* File gagal dibaca:

&#x20; → tampilkan warning UI

\* Permission hilang:

&#x20; → minta re-authorization



\---



\# 15. EDGE CASE (PENTING)



\* Duplicate project name → pakai path

\* Folder tanpa todo.md → tetap tampil

\* File kosong → tampilkan empty state



\---



\# 16. IMPLEMENTATION RULES (STRICT)



\* Vanilla JS ONLY

\* Modular file:



&#x20; \* scanner.js

&#x20; \* parser.js

&#x20; \* ui.js

&#x20; \* storage.js

\* Jangan re-render full DOM

\* Gunakan event delegation



\---



\# 17. MVP PRIORITY



WAJIB ADA:



\* scan folder

\* tampilkan todo

\* UI basic



\---



\# 18. UX PRINCIPLE (FINAL)



\* Cepat

\* Clean

\* Tidak ribet

\* Fokus ke productivity



\---



