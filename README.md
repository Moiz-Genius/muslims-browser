# 🌐 Muslim's Browser

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Electron](https://img.shields.io/badge/Electron-40.x-47848F.svg?logo=electron)](https://www.electronjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen.svg?logo=node.js)](https://nodejs.org/)
[![Build Tool](https://img.shields.io/badge/Packaged%20with-Electron%20Forge-blue.svg)](https://www.electronforge.io/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Moiz-Genius/muslims-browser/pulls)

A modern, fast, and privacy-focused desktop web browser built with [Electron](https://www.electronjs.org/) and [Electron Forge](https://www.electronforge.io/). Engineered for lightning-fast browsing speeds with hardware-accelerated Chromium flags, zero-overhead C++ level ad blocking, isolated multi-tab BrowserViews, and strict telemetry stripping.

---

## ✨ Features

- ⚡ **Optimized Chromium Engine**:
  - Hardware-accelerated GPU rasterization and zero-copy rendering.
  - Tiered V8 JIT compiler tuning with expanded heap allocation.
  - Back-Forward cache and parallel downloading enabled out of the box.
- 🛡️ **Zero-Overhead Native Ad-Blocking**:
  - Direct C++ level URL pattern filtering using Electron session request filters.
  - Intercepts and blocks tracking and advertising networks (DoubleClick, Google AdServices, Moat, OpenX, AdRoll, Criteo, and more) before network requests touch renderer JavaScript.
- 🗂️ **Isolated Multi-Tab Architecture**:
  - Independent `BrowserView` instances for every tab, providing sandboxed execution, memory isolation, and crash resistance.
  - Tab management: open new tabs, close individual tabs, and switch seamlessly with state preservation.
- 🎨 **Minimalist Dark UI**:
  - Sleek, modern dark-mode interface designed for distraction-free browsing.
  - Integrated navigation controls (Back, Forward, Reload) with dynamic enabled/disabled states.
  - Omnibox address bar: automatically detects URLs vs. search queries.
- 🔒 **Zero Telemetry & Bloat**:
  - Stripped background services: disabled component updates, domain reliability monitoring, background pings, metrics reporting, and sync daemons.

---

## 📋 Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher
- Compatible with Windows 10/11, macOS, and Linux

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Moiz-Genius/muslims-browser.git
cd muslims-browser
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Launch Development Instance

```bash
npm start
```

---

## 📦 Building Distributables

Package and compile standalone binaries for your operating system using Electron Forge:

```bash
# Package the application into an unpackaged build folder
npm run package

# Build production installers (.exe, .zip, etc.)
npm run make
```

Compiled distributions will be placed into the `out/` directory (which is excluded from Git to keep the repository lightweight).

---

## 📁 Project Structure

```text
muslims-browser/
├── main.js             # Electron main process (lifecycle, flags, adblock, BrowserViews)
├── renderer.js         # Renderer process (tab strip, omnibox, UI events, IPC)
├── index.html          # Browser chrome markup (title bar, tabs, navigation bar)
├── styles.css          # Modern dark-theme stylesheet
├── forge.config.js     # Electron Forge packaging & maker configuration
├── package.json        # Dependencies & build scripts
└── package-lock.json   # Deterministic dependency lockfile
```

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
