/* =====================================================
   scanner.js — File System Access API Scanner
   Phase 2: Scan workspace folders, detect .todo/,
            list prompt files and asset files
   ===================================================== */

const scanner = (() => {

  /* ── Supported asset extensions ─────────────────── */
  const ASSET_EXTS = new Set([
    'png','jpg','jpeg','gif','svg','webp',
    'pdf','mp4','webm','zip','rar','7z',
    'md','txt','json','csv'
  ]);

  const IMAGE_EXTS  = new Set(['png','jpg','jpeg','gif','svg','webp']);
  const VIDEO_EXTS  = new Set(['mp4','webm','mov']);
  const ARCHIVE_EXTS = new Set(['zip','rar','7z','tar','gz']);

  /* ── Scan a workspace root → array of projects ───── */
  async function scanWorkspace(dirHandle) {
    const projects = [];

    for await (const [name, handle] of dirHandle.entries()) {
      if (handle.kind !== 'directory') continue;
      if (name.startsWith('.') && name !== '.todo') continue; // skip hidden except .todo

      try {
        const project = await scanProject(handle, name);
        projects.push(project);
      } catch (_) {
        // skip inaccessible folders silently
      }
    }

    return projects;
  }

  /* ── Scan a single project folder ───────────────── */
  async function scanProject(dirHandle, name) {
    let hasTodo     = false;
    let hasPrompts  = false;
    let hasAssets   = false;
    let todoHandle  = null;
    let todoDir     = null;

    // Look for .todo/ subfolder (case-insensitive)
    for await (const [childName, childHandle] of dirHandle.entries()) {
      if (childHandle.kind === 'directory' &&
          childName.toLowerCase() === '.todo') {
        hasTodo  = true;
        todoDir  = childHandle;

        // Check contents of .todo/
        for await (const [fname, fhandle] of childHandle.entries()) {
          if (fhandle.kind === 'file' && fname.toLowerCase() === 'todo.md') {
            todoHandle = fhandle;
          }
          if (fhandle.kind === 'directory' && fname.toLowerCase() === 'prompts') {
            hasPrompts = true;
          }
          if (fhandle.kind === 'directory' && fname.toLowerCase() === 'assets') {
            hasAssets = true;
          }
        }
        break;
      }
    }

    return {
      id:          `proj_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
      name,
      handle:      dirHandle,
      hasTodo,
      hasPrompts,
      hasAssets,
      todoDir,
      todoHandle,
      pendingCount: 0
    };
  }

  /* ── Read todo.md raw content ────────────────────── */
  async function readTodoFile(projectHandle) {
    try {
      // Find .todo/ dir
      for await (const [name, handle] of projectHandle.entries()) {
        if (handle.kind === 'directory' && name.toLowerCase() === '.todo') {
          for await (const [fname, fhandle] of handle.entries()) {
            if (fhandle.kind === 'file' && fname.toLowerCase() === 'todo.md') {
              const file = await fhandle.getFile();
              return await file.text();
            }
          }
        }
      }
    } catch (e) {
      console.warn('readTodoFile error:', e);
    }
    return null;
  }

  /* ── List prompt files (.md inside .todo/prompts/) ── */
  async function listPromptFiles(projectHandle) {
    const files = [];
    try {
      for await (const [name, handle] of projectHandle.entries()) {
        if (handle.kind === 'directory' && name.toLowerCase() === '.todo') {
          for await (const [cname, chandle] of handle.entries()) {
            if (chandle.kind === 'directory' && cname.toLowerCase() === 'prompts') {
              for await (const [fname, fhandle] of chandle.entries()) {
                if (fhandle.kind === 'file' && fname.endsWith('.md')) {
                  files.push({ name: fname, handle: fhandle });
                }
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('listPromptFiles error:', e);
    }
    return files.sort((a, b) => a.name.localeCompare(b.name));
  }

  /* ── List asset files (.todo/assets/) ───────────── */
  async function listAssetFiles(projectHandle) {
    const files = [];
    try {
      for await (const [name, handle] of projectHandle.entries()) {
        if (handle.kind === 'directory' && name.toLowerCase() === '.todo') {
          for await (const [cname, chandle] of handle.entries()) {
            if (chandle.kind === 'directory' && cname.toLowerCase() === 'assets') {
              for await (const [fname, fhandle] of chandle.entries()) {
                if (fhandle.kind !== 'file') continue;
                const ext = fname.split('.').pop().toLowerCase();
                if (!ASSET_EXTS.has(ext)) continue;

                let size = 0;
                try {
                  const f = await fhandle.getFile();
                  size = f.size;
                } catch (_) {}

                files.push({
                  name: fname,
                  ext,
                  size,
                  type: classifyAsset(ext),
                  handle: fhandle
                });
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('listAssetFiles error:', e);
    }
    return files.sort((a, b) => a.name.localeCompare(b.name));
  }

  /* ── Read a specific file handle's text content ─── */
  async function readFileText(fileHandle) {
    try {
      const file = await fileHandle.getFile();
      return await file.text();
    } catch (e) {
      console.warn('readFileText error:', e);
      return null;
    }
  }

  /* ── Get object URL for an asset file handle ─────── */
  async function getAssetObjectUrl(fileHandle) {
    try {
      const file = await fileHandle.getFile();
      return URL.createObjectURL(file);
    } catch (e) {
      return null;
    }
  }

  /* ── Write text content back to a file handle ────── */
  async function writeFile(fileHandle, content) {
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  }

  /* ── Backup todo.md ──────────────────────────────── */
  async function backupTodoFile(todoDir) {
    try {
      // Check if backup already exists
      for await (const [name] of todoDir.entries()) {
        if (name.toLowerCase() === 'todo.md.bak') return false; // skip
      }
      // Read original
      const orig = await readFromDir(todoDir, 'todo.md');
      if (!orig) return false;
      // Write backup
      const bakHandle = await todoDir.getFileHandle('todo.md.bak', { create: true });
      await writeFile(bakHandle, orig);
      return true;
    } catch (e) {
      console.warn('backup failed:', e);
      return false;
    }
  }

  /* ── Check permission ────────────────────────────── */
  async function verifyPermission(handle, writable = false) {
    const opts = { mode: writable ? 'readwrite' : 'read' };
    if (await handle.queryPermission(opts) === 'granted') return true;
    if (await handle.requestPermission(opts) === 'granted') return true;
    return false;
  }

  /* ── Helper: read a file by name from a dir handle ─ */
  async function readFromDir(dirHandle, fileName) {
    try {
      const fh   = await dirHandle.getFileHandle(fileName);
      const file = await fh.getFile();
      return await file.text();
    } catch (_) { return null; }
  }

  /* ── Classify asset type ─────────────────────────── */
  function classifyAsset(ext) {
    if (IMAGE_EXTS.has(ext))   return 'image';
    if (VIDEO_EXTS.has(ext))   return 'video';
    if (ARCHIVE_EXTS.has(ext)) return 'archive';
    if (ext === 'pdf')         return 'pdf';
    if (ext === 'md' || ext === 'txt' || ext === 'json' || ext === 'csv') return 'text';
    return 'other';
  }

  /* ── Format file size ────────────────────────────── */
  function formatSize(bytes) {
    if (bytes === 0)        return '0 B';
    if (bytes < 1024)       return `${bytes} B`;
    if (bytes < 1024*1024)  return `${(bytes/1024).toFixed(1)} KB`;
    return `${(bytes/(1024*1024)).toFixed(1)} MB`;
  }

  /* ── Public API ──────────────────────────────────── */
  return {
    scanWorkspace,
    scanProject,
    readTodoFile,
    listPromptFiles,
    listAssetFiles,
    readFileText,
    getAssetObjectUrl,
    writeFile,
    backupTodoFile,
    verifyPermission,
    classifyAsset,
    formatSize
  };
})();

export default scanner;
