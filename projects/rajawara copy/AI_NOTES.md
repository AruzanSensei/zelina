AI Notes for Raja Kecil 3D

File Responsibilities
- `core.js`:
  Defines shared state, utilities, and config. Holds `Game.state`, `Game.controls`, and helper functions.
- `environment.js`:
  Builds the Three.js scene (renderer, camera, lights, ground, water, den, foliage) and exposes `Game.env`.
- `models.js`:
  Creates meshes and materials for the lion and animals. Also includes helper functions for tinting/restoring materials.
- `animals.js`:
  Spawns and updates animals, handles AI wandering and predator threats, and exposes helper lookups.
- `controls.js`:
  Keyboard/mouse/touch input, mobile joystick, and camera/player update logic.
- `ui.js`:
  HUD updates, EXP popup, toasts, and mobile interaction button visibility.
- `game.js`:
  Main bootstrap. Wires DOM elements, initializes environment, starts the loop, and manages interactions.

UI / Layout
- `index.html`:
  HUD markup, mobile controls, and script load order.
- `style.css`:
  UI styling, circular stats, EXP bar, and mobile touch behavior.
