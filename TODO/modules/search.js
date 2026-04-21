/* =====================================================
   search.js — In-Memory Search Engine
   Phase 3: Full-text search across tasks, projects, tags
   ===================================================== */

const search = (() => {

  /* ── Index structure ─────────────────────────────── */
  let _index = {
    tasks:    [],   // { id, text, textLower, tags, projectId, projectName, done, lineNumber }
    projects: [],   // { id, name, nameLower }
    tags:     {}    // tagName → [ taskId, ... ]
  };

  let _debounceTimer = null;
  let _cache = {};   // query string → { tasks, projects, tags }

  /* ── Build index from all projects ──────────────── */
  function buildIndex(projects, projectTasksMap) {
    _index.tasks    = [];
    _index.projects = [];
    _index.tags     = {};
    _cache          = {};

    for (const proj of projects) {
      indexProject(proj, projectTasksMap[proj.id]?.tasks || []);
    }
  }

  /* ── Update index for one project ───────────────── */
  function updateIndex(project, tasks) {
    // Remove old entries for this project
    _index.tasks = _index.tasks.filter(t => t.projectId !== project.id);
    // Rebuild tag index excluding this project
    for (const tag of Object.keys(_index.tags)) {
      _index.tags[tag] = _index.tags[tag].filter(id => {
        const task = _index.tasks.find(t => t.id === id);
        return task && task.projectId !== project.id;
      });
      if (_index.tags[tag].length === 0) delete _index.tags[tag];
    }

    indexProject(project, tasks);
    _cache = {};
  }

  function indexProject(proj, tasks) {
    // Project entry
    if (!_index.projects.find(p => p.id === proj.id)) {
      _index.projects.push({
        id:        proj.id,
        name:      proj.name,
        nameLower: proj.name.toLowerCase()
      });
    }

    // Task entries
    for (const task of tasks) {
      const entry = {
        id:          task.id,
        text:        task.text,
        textLower:   task.text.toLowerCase(),
        tags:        task.tags || [],
        priority:    task.priority,
        done:        task.done,
        projectId:   proj.id,
        projectName: proj.name,
        lineNumber:  task.lineNumber,
        section:     task.section
      };

      _index.tasks.push(entry);

      // Tag index
      for (const tag of task.tags || []) {
        if (!_index.tags[tag]) _index.tags[tag] = [];
        _index.tags[tag].push(task.id);
      }
    }
  }

  /* ── Query ───────────────────────────────────────── */
  function query(text, opts = {}) {
    const { limit = 5, includeDone = true } = opts;
    if (!text || !text.trim()) return { tasks: [], projects: [], tags: [] };

    const q = text.toLowerCase().trim();

    // Cache check
    const cacheKey = `${q}_${includeDone}`;
    if (_cache[cacheKey]) return _cache[cacheKey];

    // ── Tasks: substring match on text
    let taskResults = _index.tasks
      .filter(t => {
        if (!includeDone && t.done) return false;
        return t.textLower.includes(q);
      })
      .slice(0, limit)
      .map(t => ({ ...t, highlight: highlightText(t.text, text) }));

    // ── Projects: prefix + substring match on name
    const projectResults = _index.projects
      .filter(p => p.nameLower.includes(q))
      .slice(0, limit);

    // ── Tags: exact match on tag name (without #)
    const cleanQ = q.replace(/^#/, '');
    const tagResults = Object.entries(_index.tags)
      .filter(([tag]) => tag.includes(cleanQ))
      .map(([tag, taskIds]) => ({
        tag,
        count:    taskIds.length,
        taskIds:  taskIds.slice(0, 3)
      }))
      .slice(0, 5);

    // If query starts with # → prioritize tags
    if (text.startsWith('#')) {
      taskResults = _index.tasks
        .filter(t => t.tags.some(tag => tag.includes(cleanQ)))
        .slice(0, limit)
        .map(t => ({ ...t, highlight: highlightText(t.text, text.slice(1)) }));
    }

    const result = { tasks: taskResults, projects: projectResults, tags: tagResults };
    _cache[cacheKey] = result;
    return result;
  }

  /* ── Debounced query ─────────────────────────────── */
  function queryDebounced(text, callback, delay = 200) {
    if (_debounceTimer) clearTimeout(_debounceTimer);
    _debounceTimer = setTimeout(() => {
      const result = query(text);
      callback(result);
    }, delay);
  }

  /* ── Highlight matching text ─────────────────────── */
  function highlightText(text, query) {
    if (!query) return escHtml(text);
    const escaped = escHtml(text);
    const q       = escHtml(query);
    return escaped.replace(new RegExp(`(${q})`, 'gi'), '<strong>$1</strong>');
  }

  /* ── Get total indexed stats ─────────────────────── */
  function getStats() {
    return {
      tasks:    _index.tasks.length,
      projects: _index.projects.length,
      tags:     Object.keys(_index.tags).length
    };
  }

  /* ── Clear index ─────────────────────────────────── */
  function clearIndex() {
    _index = { tasks: [], projects: [], tags: {} };
    _cache = {};
  }

  function escHtml(str = '') {
    return String(str)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ── Public API ──────────────────────────────────── */
  return { buildIndex, updateIndex, query, queryDebounced, getStats, clearIndex };

})();

export default search;
