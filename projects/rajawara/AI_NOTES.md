AI Notes for Raja Kecil 3D

## Project Structure (Refactored)

The project uses a structured folder hierarchy to separate concerns.
Start point: `index.html` loads scripts in order.

### Core & Configuration
- `js/core/core.js`:
  Defines `Game` global object, shared state (`Game.state`), configuration (`Game.config`), and time system (`Game.time`).

### World & Environment
- `js/world/environment.js`:
  Builds the Three.js scene: renderer, camera, lights, sky (day/night cycle), terrain, water (waves), grass, and particle systems. Exposes `Game.env`.

### Animals & AI
- `js/animals/models.js`:
  Contains 3D model builders for all animals (Lion, Zebra, Gazelle, Warthog). Handles material tinting/effects.
- `js/animals/habits.js` (formerly animals.js):
  Manages animal lifecycle, spawning, AI behavior (wander, flee, chase), and threat logic.

### Systems
- `js/systems/audio.js`:
  Web Audio API manager. Handles background music (day/night/chase) and sound effects (eat/drink/attack).
- `js/systems/animations.js`:
  Manual keyframe animation system. Handles walk, run, idle, eat, drink, sleep, and attack animations for all models.
- `js/systems/controls.js`:
  Input handling (Keyboard, Touch/Joystick). Manages player movement physics and camera control.

### Interface
- `js/ui/ui.js`:
  Manages HUD (Health/Hunger/Thirst bars), Mobile controls visibility, Toast notifications, and Menus.

### Main Entry
- `js/game.js`:
  Bootstrap file. Initializes all systems, starts the game loop (`requestAnimationFrame`), and manages central game logic (interactions, stats updates).

## Styling
- `css/style.css`:
  All visual styling for UI overlay, HUD, and responsive design.

## Development Rules
1. **Separation of Concerns**: Keep potential new features in their specific folders (e.g., new systems in `js/systems/`).
2. **Global Access**: Most systems attach themselves to the `Game` object for cross-module access.
3. **No External Assets**: Models are procedural (Three.js primitives). Audio is synthesized (Web Audio API).
4. **Performance**: Maintain 60 FPS. Use object pooling or limit particle counts if needed.
