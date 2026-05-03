# SocratiCode Setup Guide — Any Project

> A complete guide to initializing SocratiCode for codebase intelligence on any project. Covers installation, indexing, dependency graphs, context artifacts, and all 21 tools.

---

## Table of Contents

1. [What SocratiCode Does](#1-what-socrati-code-does)
2. [Prerequisites](#2-prerequisites)
3. [Installation](#3-installation)
4. [Project Configuration](#4-project-configuration)
5. [Verifying Infrastructure](#5-verifying-infrastructure)
6. [Indexing Your Codebase](#6-indexing-your-codebase)
7. [Search Tools](#7-search-tools)
8. [Dependency Graph Tools](#8-dependency-graph-tools)
9. [Impact Analysis (Symbol-Level Call Graph)](#9-impact-analysis-symbol-level-call-graph)
10. [Interactive Graph Explorer](#10-interactive-graph-explorer)
11. [Context Artifacts](#11-context-artifacts)
12. [File Watcher](#12-file-watcher)
13. [Multi-Project Setup](#13-multi-project-setup)
14. [Daily Workflow](#14-daily-workflow)
15. [Known Limitations](#15-known-limitations)
16. [Troubleshooting](#16-troubleshooting)
17. [Quick Reference — All 21 Tools](#17-quick-reference--all-21-tools)

---

## 1. What SocratiCode Does

SocratiCode is a codebase intelligence MCP server that gives your AI assistant (Claude Code) deep understanding of your project. It provides:

- **Hybrid semantic + keyword search** — find code by meaning, not just exact matches
- **AST-based dependency graphs** — see file imports/dependents, circular deps, most connected files
- **Symbol-level impact analysis** — know what breaks before you change code
- **Context artifacts** — index docs, schemas, API specs alongside your code
- **File watching** — auto-updates the index as you code

**Why this matters for your API usage:** Instead of the AI reading every file from scratch each session (costing context tokens), SocratiCode provides instant semantic search over a pre-built index. The index persists across sessions, so every new conversation starts with full codebase awareness.

---

## 2. Prerequisites

| Requirement | Details |
|---|---|
| **Docker Desktop** | Must be installed and running. SocratiCode uses Docker containers for Qdrant (vector database) and Ollama (embedding model). Download from [docker.com](https://docker.com). |
| **Claude Code** | CLI, desktop app, or IDE extension with MCP support |
| **npm/npx** | Available via Node.js — used to run the SocratiCode server |
| **Disk space** | ~2GB for Docker images (Qdrant + Ollama + nomic-embed-text model). One-time pull. |

**Verify Docker is running:**
```bash
docker info | grep "Server Version"
# Should output: Server Version: X.X.X
```

If Docker is installed but not running, launch it:
```bash
# macOS
open -a "Docker"

# Then wait ~30 seconds and verify:
docker info | grep "Server Version"
```

---

## 3. Installation

There are two methods to install SocratiCode:

### Method A: Claude Code Plugin (Recommended)

Run these commands in your Claude Code session:

```
/plugin marketplace add giancarloerra/socraticode
/plugin install socraticode@socraticode
/reload-plugins
```

This registers SocratiCode as a plugin with skills, agents, and auto-configured MCP.

### Method B: Direct MCP Server Config

Add the SocratiCode MCP server to your project's `.mcp.json` file (or your global `~/.claude/settings.json` under `mcpServers`):

**`.mcp.json` (project root):**
```json
{
  "mcpServers": {
    "socraticode": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "socraticode"],
      "env": {
        "SOCRATICODE_PROJECT_ID": "your-project-name"
      }
    }
  }
}
```

The `SOCRATICODE_PROJECT_ID` env var sets a human-readable name for your project in the index. Use a short slug like `blue-sky-web`, `my-api`, etc.

After creating or editing `.mcp.json`, restart Claude Code or run `/mcp` to reload.

---

## 4. Project Configuration

### Required: `.mcp.json` (if using Method B)

See Method B above. This file goes in your project root.

### Optional: `.socraticodecontextartifacts.json`

This file tells SocratiCode to index non-code files (docs, schemas, API specs, configs) alongside your source code. Create it in your project root:

```json
{
  "artifacts": [
    {
      "name": "database-schema",
      "path": "./docs/schema.sql",
      "description": "PostgreSQL schema — all tables, indexes, constraints, foreign keys."
    },
    {
      "name": "architecture-guide",
      "path": "./docs/architecture.md",
      "description": "System architecture overview, tech stack, and data flow."
    },
    {
      "name": "api-spec",
      "path": "./docs/openapi.yaml",
      "description": "OpenAPI 3.0 spec for all REST endpoints."
    }
  ]
}
```

**Supported artifact types:**
- SQL schemas
- OpenAPI/Protobuf specs
- Markdown docs
- Terraform configs
- Kubernetes manifests
- Any text file
- Directories (all files within will be indexed)

Context artifacts are searched via `codebase_context_search` — a separate search space from code search, optimized for infrastructure and domain knowledge.

---

## 5. Verifying Infrastructure

Before indexing, verify everything is healthy:

```
Ask Claude Code: "run codebase_health"
```

Or call the tool directly — `codebase_health` checks:
- Docker availability
- Qdrant container (auto-started on first index if missing)
- Ollama container (auto-started on first index if missing)
- Embedding model (nomic-embed-text — auto-pulled on first index if missing)

**Expected first-run output:**
```
Qdrant mode: managed
[MISSING] Qdrant image: Not pulled — will be pulled on first index
[MISSING] Qdrant container: Not running — will be started on first index

Embedding provider: ollama
[MISSING] Ollama image: Not pulled — will be pulled on first index
[MISSING] Embedding model (nomic-embed-text): Not pulled — will be pulled on first index
```

This is normal — everything auto-provisions on the first `codebase_index` call.

**After first index, you should see:**
```
Qdrant mode: managed
[OK] Docker: Running
[OK] Qdrant container: Running

Embedding provider: ollama
[OK] Docker: Running
[OK] Ollama container: Running
[OK] Embedding model (nomic-embed-text): Loaded
```

---

## 6. Indexing Your Codebase

### Step 1: Start the Index

Ask Claude Code: "index my project with SocratiCode"

This triggers `codebase_index` with your project path. On first run it will:
1. Pull the Qdrant Docker image (~500MB)
2. Start the Qdrant container
3. Pull the Ollama Docker image (~1GB)
4. Start the Ollama container
5. Pull the nomic-embed-text embedding model (~270MB)
6. Scan all source files in your project
7. Chunk the files into semantically meaningful segments
8. Generate embeddings for each chunk

### Step 2: Poll Progress

Ask Claude Code: "check indexing status"

This triggers `codebase_status`. Keep polling until progress reaches 100%.

**Example status during indexing:**
```
Full index in progress
  Phase: generating embeddings (batch 1/2)
  Progress: 128/279 chunks embedded (46%)
  Batches: 0/2 completed (76/76 files)
  Elapsed: 176s
```

**Example status when complete:**
```
Last operation: Full index — completed
  Files: 76, Chunks: 279
  Took: 389.3s

Code graph: 70 files, 83 edges
  Last built: 18s ago (cached in memory)
```

Note: First index is slower because Docker images need pulling. Subsequent indexes on new projects only need to chunk and embed — typically 1-5 minutes depending on project size.

### Step 3: Verify

After indexing completes, the dependency graph is auto-built. Confirm with:
```
codebase_graph_status
```

### Incremental Updates

After modifying code, the file watcher auto-updates. If the watcher isn't active, run:
```
codebase_update
```
This only re-indexes changed files — much faster than a full index.

### Removing an Index

```
codebase_remove
```
This stops the watcher, cancels any in-flight operations, and deletes the project from the vector database.

---

## 7. Search Tools

### `codebase_search` — Hybrid Semantic + Keyword Search

The primary search tool. Combines dense vector search (semantic meaning) with BM25 (keyword matching), fused via Reciprocal Rank Fusion.

**When to use:** Any time you need to find code related to a concept, feature, or pattern.

**Examples:**
```
"find the authentication middleware"
"where is payment processing handled"
"database connection setup"
"error handling patterns"
```

**Parameters:**
| Parameter | Type | Default | Description |
|---|---|---|---|
| `query` | string | required | Natural language search query |
| `projectPath` | string | CWD | Absolute path to project |
| `limit` | number | 10 | Max results (1-50) |
| `fileFilter` | string | none | Filter to specific file (relative path) |
| `languageFilter` | string | none | Filter to specific language (e.g. "typescript", "python") |
| `minScore` | number | 0.10 | Minimum relevance score threshold (0-1). Set to 0 to disable. |
| `includeLinked` | boolean | false | Also search across linked projects |

**Pro tip:** Search before reading files. If the search result snippet isn't enough, then use `Read` on the specific file and line range.

### `codebase_status` — Check Index Health

Returns chunk count, indexing progress, file watcher state, and graph metadata.

### `codebase_context_search` — Search Context Artifacts

Searches non-code artifacts (docs, schemas, API specs) defined in `.socraticodecontextartifacts.json`. Auto-indexes on first use.

**When to use:** Looking up database schemas, API contracts, infrastructure configs, architecture docs.

```
"what are the rate limits for the Bluesky API"
"database tables related to billing"
```

### `codebase_context` — List Context Artifacts

Shows all configured artifacts with their name, description, path, and index status.

### `codebase_context_index` — Re-index Artifacts

Manually trigger re-indexing of all context artifacts. Usually automatic on first search.

### `codebase_context_remove` — Remove Artifact Index

Clears all indexed context artifacts for a project.

---

## 8. Dependency Graph Tools

The dependency graph is built using AST analysis (ast-grep). It maps import/require/export relationships between files.

### `codebase_graph_build` — Build the Graph

Usually auto-built after indexing. Can be triggered manually:

```
codebase_graph_build
```

Runs in the background. Poll with `codebase_graph_status`.

**Parameters:**
| Parameter | Type | Default | Description |
|---|---|---|---|
| `projectPath` | string | CWD | Absolute path to project |
| `extraExtensions` | string | none | Additional file extensions to include (e.g. ".tpl,.blade") |

### `codebase_graph_status` — Check Graph Status

Returns file/edge count, build progress, and whether it's cached in memory.

### `codebase_graph_query` — Query a File's Dependencies

Returns what a file imports and what files depend on it.

```
codebase_graph_query({ filePath: "convex/posting.ts" })
```

**When to use:** Before refactoring — see what a file depends on and what depends on it.

### `codebase_graph_stats` — Graph Statistics

Returns:
- Total files and edges
- Average dependencies per file
- Circular dependency count
- Language breakdown
- Most connected files (top 10)
- Orphan files (no dependencies)

**When to use:** Getting a quick health check of your codebase architecture.

### `codebase_graph_circular` — Find Circular Dependencies

Lists all circular dependency chains.

**When to use:** Debugging import cycles that cause initialization issues or bundling problems.

### `codebase_graph_visualize` — Visualize the Graph

Two modes:

**`mode: "mermaid"` (default)** — Returns a Mermaid diagram as text, color-coded by language, circular deps highlighted in red. Renders inline in Claude Code chat.

**`mode: "interactive"`** — Generates a self-contained HTML page and opens it in your browser. See [Section 10](#10-interactive-graph-explorer) for full details.

### `codebase_graph_remove` — Remove the Graph

Deletes the persisted dependency graph. Rebuilds automatically on next `codebase_index` or `codebase_graph_build`.

---

## 9. Impact Analysis (Symbol-Level Call Graph)

A second graph layer tracks which functions and methods call which. Use these tools **before** refactoring, renaming, or deleting code.

> **Important caveat for framework-heavy codebases:** The call graph is static-analysis-based with no type inference. Dynamic dispatch, reflection, and framework magic (Convex `ctx.runQuery`, Spring DI, Angular decorators, Rails metaprogramming) are invisible. Callers that reach a method only through these mechanisms will not appear. Check `unresolvedEdgePct` in `codebase_graph_status` — if it's very high (like 97% for Convex projects), rely on file-level graph and semantic search instead.

### `codebase_impact` — Blast Radius Analysis

Returns every file and function that could break if you change a target.

```
codebase_impact({ target: "src/utils/formatDate.ts" })     // file mode
codebase_impact({ target: "validateUser" })                 // symbol mode
codebase_impact({ target: "handleSubmit", depth: 5 })       // deeper traversal
```

**Parameters:**
| Parameter | Type | Default | Description |
|---|---|---|---|
| `target` | string | required | File path (relative) OR symbol name |
| `projectPath` | string | CWD | Absolute path to project |
| `depth` | number | 3 | How many hops back (max 10) |

**When to use:** Before refactoring, renaming functions, deleting code, or changing interfaces.

### `codebase_flow` — Trace Execution Flow

Traces forward from an entry point — what does this code call into?

```
codebase_flow()                    // no args → lists all auto-detected entry points
codebase_flow({ entrypoint: "main" })
codebase_flow({ entrypoint: "publishPendingPosts", file: "convex/posting.ts", depth: 6 })
```

**Parameters:**
| Parameter | Type | Default | Description |
|---|---|---|---|
| `entrypoint` | string | none | Symbol name to trace from |
| `file` | string | none | File hint to disambiguate the symbol |
| `projectPath` | string | CWD | Absolute path to project |
| `depth` | number | 5 | Max DFS depth (max 10) |

**Auto-detected entry points:** Orphans with outgoing calls, `main()`, framework routes, and tests.

### `codebase_symbol` — 360° Symbol View

Complete picture of one symbol: definition location, kind (function/class), callers, and callees.

```
codebase_symbol({ name: "generatePost", file: "convex/aiGeneration.ts" })
```

**When to use:** Understanding a function before modifying it.

### `codebase_symbols` — List or Search Symbols

```
codebase_symbols({ file: "convex/posting.ts" })   // all symbols in a file
codebase_symbols({ query: "mutation" })            // search by name across project
```

**Parameters:**
| Parameter | Type | Default | Description |
|---|---|---|---|
| `file` | string | none | Relative file path — lists all symbols in that file |
| `query` | string | none | Substring to match against symbol names project-wide |
| `projectPath` | string | CWD | Absolute path to project |
| `limit` | number | 200 | Max results |

---

## 10. Interactive Graph Explorer

The interactive graph explorer is the most powerful visualization tool. It generates a single self-contained HTML file (vendored Cytoscape.js + Dagre — works offline, no CDN required).

### How to Open

Ask Claude Code: "show me an interactive graph of this project"

Or: `codebase_graph_visualize({ mode: "interactive", open: true })`

### Features

**File View:**
- Every source file as a node, imports as edges
- Color-coded by language
- Circular dependencies highlighted in red

**Symbol View:**
- Toggle at the top of the page
- Functions/classes/methods as nodes with call edges
- Available when symbol count is under the embed cap

**Sidebar (click any node):**
- File path, language, line count
- Imports and dependents lists
- Symbols in the file with line numbers
- Action buttons for blast radius and call flow

**Right-click any node:**
- Highlights its reverse-transitive closure (blast radius)
- Shows everything that would break if you change that file

**Toolbar:**
- Live search — filters and centers matching nodes
- Layout switcher — Dagre / force-directed / concentric / breadth-first / grid / circle
- Export PNG — produces a shareable image of the current view
- Toggle Files / Symbols view

**Offline-safe:** All dependencies are vendored inside the HTML file. No network required. You can commit the file to a PR or share it on Slack.

---

## 11. Context Artifacts

Context artifacts extend semantic search beyond source code to include project knowledge: database schemas, API specs, infrastructure configs, architecture docs.

### Setup

Create `.socraticodecontextartifacts.json` in your project root:

```json
{
  "artifacts": [
    {
      "name": "artifact-name",
      "path": "./path/to/file.sql",
      "description": "Human-readable description of what this artifact contains."
    }
  ]
}
```

**Name** should be a short slug. **Path** is relative to project root. **Description** is used by the search engine to rank results.

**You can point at directories too** — all files within will be indexed:
```json
{
  "artifacts": [
    {
      "name": "all-docs",
      "path": "./docs",
      "description": "All documentation files in the docs directory."
    }
  ]
}
```

### Search Artifacts

```
codebase_context_search({ query: "payment flow" })
```

Results come from context artifacts only, not source code. This gives you a clean separation between "how does the code work" (`codebase_search`) and "what is the system design" (`codebase_context_search`).

### Management

| Tool | Purpose |
|---|---|
| `codebase_context` | List all artifacts with index status |
| `codebase_context_search` | Search across artifacts |
| `codebase_context_index` | Force re-index all artifacts |
| `codebase_context_remove` | Delete all indexed artifacts |

---

## 12. File Watcher

The file watcher automatically updates the index when you modify code.

### Start Watching

```
codebase_watch({ action: "start" })
```

On start, it first runs an incremental update to catch any changes since the last session, then watches for future changes with debouncing.

### Check Status

```
codebase_watch({ action: "status" })
```

### Stop Watching

```
codebase_watch({ action: "stop" })
```

**Note:** The watcher is automatically started after the first `codebase_index`. It persists as long as the MCP server is running. In most Claude Code setups, this means it stays active for the duration of your session.

---

## 13. Multi-Project Setup

If you work with multiple related projects (monorepo, frontend + backend repos), you can:

### Option A: Index Each Project Separately

Create a `.mcp.json` in each project root with its own `SOCRATICODE_PROJECT_ID`.

### Option B: Linked Projects (Cross-Project Search)

Configure linked projects in `.socraticode.json`:

```json
{
  "linkedProjects": ["../my-api", "../shared-lib"]
}
```

Then search across all linked projects:
```
codebase_search({ query: "user authentication", includeLinked: true })
```

Results include a project label showing which project each result came from.

### List All Indexed Projects

```
codebase_list_projects
```

---

## 14. Daily Workflow

### Starting a New Project

```
1. Install Docker Desktop and ensure it's running
2. Add SocratiCode MCP config to .mcp.json (or install as plugin)
3. Ask Claude Code to "index my project"
4. Wait for indexing to complete (poll status)
5. (Optional) Create .socraticodecontextartifacts.json for docs/schemas
6. (Optional) Open interactive graph explorer
```

### During Development

The file watcher keeps the index current. Just use search naturally:

```
"where is the payment logic"
"find all API endpoints"
"what uses the User model"
"show me the blast radius of changing convex/schema.ts"
```

### Before Refactoring

```
codebase_impact({ target: "src/utils/format.ts" })   // what breaks?
codebase_graph_query({ filePath: "src/utils/format.ts" })  // who imports this?
```

### After Major Changes

```
codebase_update     // re-index changed files
codebase_graph_build  // rebuild dependency graph
```

---

## 15. Known Limitations

| Limitation | Details |
|---|---|
| **Framework magic** | Static analysis can't resolve `ctx.runQuery`, DI containers, decorator-driven routing, reflection. Check `unresolvedEdgePct` — if high, rely on file-level graph + semantic search. |
| **Dynamic dispatch** | `obj[method]()`, `getattr`, `eval`, macro expansion — invisible to the call graph. |
| **Generated code** | Files in `_generated/` or `dist/` folders get indexed too. Consider `.gitignore`-ing them or they add noise. |
| **Binary files** | Images, PDFs, compiled binaries are not indexed. |
| **Embedding quality** | nomic-embed-text is good for English. Other languages may have lower search quality. |
| **Docker dependency** | Qdrant and Ollama run in Docker. No Docker = no SocratiCode. |
| **First-run time** | First index pulls ~2GB of Docker images. Subsequent runs are fast. |

---

## 16. Troubleshooting

### Docker not running

```
Error: Docker is required for Qdrant.
```

**Fix:** Open Docker Desktop and wait for it to start. Verify with `docker info`.

### Index stuck at 0%

Check Docker has enough memory (at least 4GB allocated in Docker Desktop settings).

### "No context artifacts configured"

Create `.socraticodecontextartifacts.json` in your project root. See [Section 11](#11-context-artifacts).

### Symbol graph shows 0 callers for everything

This is expected on framework-heavy codebases (Convex, Next.js server actions, etc.). The file-level graph and `codebase_search` are the primary tools for these projects.

### High `unresolvedEdgePct` (>90%)

Normal for projects using ORMs, DI frameworks, or runtime dispatch. The file-level dependency graph (imports/exports) is always accurate.

### Rebuild from scratch

```
codebase_remove
codebase_index
```

### Clear Docker and start fresh

```bash
docker system prune -a  # removes all unused images/containers
# Then re-run codebase_index — it will re-pull everything
```

---

## 17. Quick Reference — All 21 Tools

### Indexing (5 tools)

| Tool | Description |
|---|---|
| `codebase_index` | Index a project (background). Poll with `codebase_status`. |
| `codebase_update` | Incremental re-index — changed files only. |
| `codebase_stop` | Gracefully stop in-progress indexing (current batch checkpoints). |
| `codebase_remove` | Delete a project's entire index. |
| `codebase_watch` | Start/stop/status of live file watcher. |

### Search (2 tools)

| Tool | Description |
|---|---|
| `codebase_search` | Hybrid semantic + BM25 search with optional filters. Use after indexing. |
| `codebase_status` | Check index status, chunk count, watcher state. |

### Dependency Graph (7 tools)

| Tool | Description |
|---|---|
| `codebase_graph_build` | Build AST-based dependency graph (background). |
| `codebase_graph_query` | Imports and dependents for a specific file. |
| `codebase_graph_stats` | Graph stats: files, edges, most connected, orphans. |
| `codebase_graph_circular` | Find circular dependencies. |
| `codebase_graph_visualize` | Mermaid diagram (`mermaid`) or interactive browser explorer (`interactive`). |
| `codebase_graph_status` | Poll graph build progress. |
| `codebase_graph_remove` | Delete the persisted graph. |

### Impact Analysis (4 tools)

| Tool | Description |
|---|---|
| `codebase_impact` | Blast radius — what breaks if you change file/function X. |
| `codebase_flow` | Trace forward execution flow from an entry point. |
| `codebase_symbol` | 360° view: definition, callers, callees for one symbol. |
| `codebase_symbols` | List symbols in a file or search by name across project. |

### Context Artifacts (4 tools)

| Tool | Description |
|---|---|
| `codebase_context` | List all context artifacts with names, descriptions, index status. |
| `codebase_context_search` | Semantic search across artifacts (schemas, specs, configs, docs). |
| `codebase_context_index` | Index or re-index all artifacts (usually automatic). |
| `codebase_context_remove` | Delete all indexed artifacts for a project. |

### Management (2 tools)

| Tool | Description |
|---|---|
| `codebase_health` | Check Docker, Qdrant, embedding model status. |
| `codebase_list_projects` | List all indexed projects with metadata. |

---

## File Checklist for New Projects

```
your-project/
├── .mcp.json                              # MCP server config (SocratiCode)
├── .socraticodecontextartifacts.json      # Optional: docs/schemas to index
├── src/                                   # Your source code (auto-indexed)
└── ...
```

**Minimum setup (2 steps):**
1. Create `.mcp.json` with SocratiCode config
2. Run `codebase_index`

**Recommended setup (4 steps):**
1. Create `.mcp.json` with SocratiCode config
2. Create `.socraticodecontextartifacts.json` for docs/schemas
3. Ensure Docker Desktop is running
4. Run `codebase_index` and wait for completion

---

*SocratiCode v1.7.2 · https://github.com/giancarloerra/socraticode · AGPL-3.0*
