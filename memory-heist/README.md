# Memory Heist

> **"Steal the treasure before the map disappears."**

A complete, playable single-player tactical web game built with **React, Spring Boot, and MongoDB** using an interactive **HTML Canvas** rendering engine and RESTful API communication.

---

## 1. Project Overview & Concept

In **Memory Heist**, players act as an elite infiltration operative. Before entering a high-security vault, they are given a brief window to study the architectural blueprints, vault doors, guard patrols, and evacuation routes. Once the countdown expires, darkness falls: the blueprint disappears into tactical fog of war, and players must navigate the facility from memory.

### Core Mechanics
1. **Four Mission Phases**:
   - **Briefing**: Review objective, dimensions, difficulty rating, time limit, and security forces.
   - **Memorize**: The entire building layout is revealed for a short countdown (7s to 12s). Guards remain stationary and movement is disabled while you memorize the floor plan.
   - **Heist**: Darkness falls! Only a **one-tile local visibility radius** around your operative is illuminated. Areas outside that radius become hidden again as you walk away. Guards begin patrolling on fixed intervals.
   - **Result**: Debrief modal showing success or failure reason, complete score breakdown, and retry / progression options.
2. **Objective Chain**:
   - Infiltrate from the **Entrance**.
   - Pick up the **Brass Key** to unlock the **Vault Door**.
   - Steal the **Diamond** sealed inside the vault room.
   - Reach the **Exit** carrying the diamond to win. Escaping without the diamond is blocked with an explanation.
3. **Memory Flashes**:
   - Each attempt grants **3 Memory Flash charges**.
   - Pressing `Space` (or clicking the Flash button) illuminates a 3-tile circular radius for 1.5 seconds.
   - Flashes consume 1 charge, do not pause guard patrols, and cannot be stacked while a flash is already active.
4. **Deterministic Guard AI**:
   - Guards patrol along predefined waypoint routes.
   - Straight-line directional flashlight vision (3-4 tiles ahead).
   - Solid walls and closed vault doors block guard vision.
   - Stepping into a guard's sightline or colliding with a guard triggers immediate alarm and ends the heist.
5. **Practice Mode**:
   - Allows full blueprint visibility throughout the mission to learn patrol timings and experiment with routes.
   - Practice results are explicitly flagged and excluded from official personal best scores.

---

## 2. Technology Stack

- **Frontend**:
  - React 19 with Vite 8 (JavaScript, JSX).
  - Vanilla CSS with a blueprint-inspired design system (deep navy `#070c18`, warm off-white `#f8fafc`, amber `#f59e0b`, coral `#ef4444`).
  - HTML Canvas for 60fps game rendering (no emoji sprites).
  - Vitest for automated unit testing.
- **Backend**:
  - Java 17+ (tested with JDK 26) with Spring Boot 4.1.1.
  - Spring Web MVC (REST Controllers).
  - Spring Data MongoDB (document repositories).
  - Jakarta Bean Validation (data integrity & input bounds checking).
  - Jackson Databind (JSON serialization & seed loading).
- **Database**:
  - MongoDB 8.x / 9.x (`memory_heist` database).
  - Handcrafted maps seeded automatically into the `levels` collection on first startup without overwriting existing data.
  - Attempt records and lifetime progress stored in the `attempts` collection.

---

## 3. Project Structure

```text
memory-heist/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/memoryheist/
│   │   │   │   ├── config/          # CorsConfig, DataSeeder
│   │   │   │   ├── controller/      # HealthController, LevelController, AttemptController, ProgressController
│   │   │   │   ├── dto/             # LevelSummaryDto, CreateAttemptRequest, CompleteAttemptRequest, PlayerProgressDto
│   │   │   │   ├── exception/       # GlobalExceptionHandler, ResourceNotFoundException, BadRequestException
│   │   │   │   ├── model/           # Level, Attempt, GuardDefinition, Position, ScoreBreakdown, GameMode
│   │   │   │   ├── repository/      # LevelRepository, AttemptRepository
│   │   │   │   └── service/         # LevelService, AttemptService, ProgressService, ScoreCalculator
│   │   │   │   └── BackendApplication.java
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── maps.json        # 5 handcrafted map configurations
│   │   └── test/
│   │       └── java/com/memoryheist/
│   │           ├── ScoreCalculatorTest.java
│   │           ├── AttemptServiceTest.java
│   │           └── BackendApplicationTests.java
│   ├── .env.example
│   ├── pom.xml
│   └── mvnw.cmd / mvnw
├── frontend/
│   ├── src/
│   │   ├── components/      # HomeScreen, LevelSelectScreen, GameScreen, ResultModal, HowToPlayModal
│   │   ├── data/            # defaultMaps.js (handcrafted levels offline fallback)
│   │   ├── game/            # constants.js, mapParser.js, movement.js, visibility.js, guardPatrol.js, canvasRenderer.js
│   │   ├── services/        # api.js (REST client & local storage resilience)
│   │   ├── styles/          # index.css (blueprint design system & responsive styling)
│   │   ├── test/            # collision.test.js, visibility.test.js, guardDetection.test.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 4. Five Handcrafted Vault Maps

All five maps have been mathematically verified with Breadth-First Search (BFS) to ensure 100% reachable routes and valid guard waypoints:

| Level | Vault Name | Grid Size | Difficulty | Study Time | Time Limit | Guards | Infiltration Layout |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|:---|
| **1** | **Training Vault** | 10×10 | EASY | 12s | 45s | 1 | Simple U-loop layout. One guard pacing horizontal hallway. Key in south-west alcove; vault door guarding eastern diamond safe. |
| **2** | **Office After Hours** | 12×12 | MEDIUM | 10s | 55s | 2 | Branching corporate hallways and executive cubicles. 2 guards patrolling north and central corridors. Key in executive suite. |
| **3** | **Museum Wing** | 14×14 | HARD | 9s | 65s | 2 | Symmetrical gallery with intersecting patrol routes and display pillars. Key in curator's office; central glass vault room. |
| **4** | **Archive Basement** | 16×16 | EXPERT | 8s | 75s | 3 | Staggered archive shelving rows with dead ends. 3 guards synchronizing staggered rows. Memorize safe turns to avoid being cornered. |
| **5** | **The Grand Heist** | 18×18 | MASTER | 7s | 90s | 4 | High-security multi-layered bank fortress. 4 synchronized guards patrolling outer perimeter, inner ring, and cross tunnels. Laser security server room (key) and central master vault. |

---

## 5. Scoring Formula

The backend calculates scores using one documented formula:

$$\text{Score} = \text{Base Bonus} + \text{Time Bonus} + \text{Flash Bonus}$$

- **Base Completion Bonus**: $1{,}000\text{ pts}$ on successful diamond extraction.
- **Time Remaining Bonus**: $25\text{ pts} \times \text{remaining seconds}$ ($\max(0, \text{timeLimit} - \text{timeTaken})$).
- **Unused Flashes Bonus**: $200\text{ pts} \times (3 - \text{flashesUsed})$ (up to $600\text{ pts}$).
- **Failed Attempts**: $0\text{ pts}$.
- **Practice Mode Attempts**: Score is calculated for feedback but **excluded** from official personal best records and progression tracking.

---

## 6. REST API Endpoints

| Method | Endpoint | Description | Request Body / Parameters |
|:---|:---|:---|:---|
| `GET` | `/api/health` | Health check and MongoDB connection status | None |
| `GET` | `/api/levels` | Summary list of all 5 levels | `?playerId={uuid}` (optional, attaches personal bests) |
| `GET` | `/api/levels/{id}` | Full level geometry, tile grid, items, and guard routes | None |
| `POST` | `/api/attempts` | Register a new heist attempt | `{"levelId": "...", "playerId": "...", "mode": "NORMAL"}` |
| `POST` | `/api/attempts/{id}/complete` | Record result and calculate score | `{"playerId": "...", "success": true, "timeTakenSeconds": 20, "flashesUsed": 1, "reason": "DIAMOND_SECURED"}` |
| `GET` | `/api/progress` | Lifetime player stats and best scores | `?playerId={uuid}` |

---

## 7. Setup & Run Instructions

### Prerequisites
1. **Java 17 or higher** (JDK 17, 21, or 26).
2. **Node.js 18+** and **npm**.
3. **MongoDB** running locally on default port `27017` (or configured via `MONGODB_URI`).

---

### Step 1: Start MongoDB
Ensure the MongoDB daemon is active. If running as a Windows service:
```powershell
Get-Service -Name "MongoDB"
# Or start if stopped:
Start-Service -Name "MongoDB"
```
Or with standard CLI:
```bash
mongod --dbpath /path/to/data
```

---

### Step 2: Run the Spring Boot Backend
From the `memory-heist/backend/` directory:

```bash
# On Windows PowerShell:
.\mvnw.cmd spring-boot:run

# On Linux / macOS:
./mvnw spring-boot:run
```

The backend server starts on **`http://localhost:8080`**.
On first startup, `DataSeeder` automatically inserts all 5 handcrafted maps into MongoDB.

To run the backend unit test suite:
```bash
.\mvnw.cmd test
```

---

### Step 3: Run the React Frontend
In a new terminal, navigate to `memory-heist/frontend/`:

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend launches on **`http://localhost:5173`**.

To run the frontend unit test suite:
```bash
npm test
```

To build the production bundle:
```bash
npm run build
```

---

## 8. Controls & Usability

- **Movement**:
  - Desktop: `W`, `A`, `S`, `D` or `Arrow Keys` (short movement cooldown, consistent holding movement, prevents browser scrolling).
  - Mobile: On-screen responsive **D-Pad** (`▲`, `◀`, `▼`, `▶`).
- **Memory Flash**:
  - Desktop: `Space` bar.
  - Mobile: Large on-screen **FLASH** button.
- **Pause**:
  - `Escape` key or the top HUD **Pause** button.
  - **Security Feature**: Pausing completely covers and conceals the board so players cannot cheat or study the blueprint while paused.
  - **Auto-Pause**: Automatically freezes the game when the browser tab becomes hidden.
- **Accessibility & Polish**:
  - Reduced-motion support via CSS media query.
  - Color-blind friendly contrast (amber for items, cyan for operative, coral for danger, emerald for exit).
  - Offline resilience: If network connection drops, game continues seamlessly using local cached maps and preserves results in browser storage with retry sync.

---

## 9. Verification Summary

- [x] **5 Handcrafted Maps**: Verified with BFS pathfinding; all keys, locked doors, diamonds, exits, and guard routes validated.
- [x] **Phase Progression**: Briefing $\rightarrow$ Memorize countdown $\rightarrow$ Heist fog of war $\rightarrow$ Result modal.
- [x] **Memory Mechanics**: 1-tile local radius re-obscures tiles; 3 memory flash charges illuminate 3 tiles for 1.5s and cannot stack.
- [x] **Guard Behavior**: Deterministic patrol loops, directional vision blocked by walls and closed doors, instant detection alerts.
- [x] **Backend & Database**: MongoDB seeding is idempotent; REST endpoints validate payloads, prevent duplicate submissions, and compute scores.
- [x] **Automated Testing**: 21 frontend vitest unit tests and 11 backend JUnit/Mockito tests pass with 100% success.
