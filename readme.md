# 🍦 Zoom Transcript Grabber

<img src="./avatar2.jpg" alt="Frosty" width="100">

**Zoom Transcript Grabber** is a lightweight macOS GUI tool that helps you **extract and save real-time captions** from Zoom recording pages with just a few clicks.

## 🎯 Features

- Automatically detects Zoom caption panels  
- Listens to and collects subtitles in real-time  
- One-click export to `.txt` on your desktop  
- Clean and user-friendly interface  
- Comes with a cute cat mascot: *Frosty* 🐱

## 🚀 How to Use

1. Paste the Zoom video link into the input box  
2. Click `Start Listening`  
3. Once captions are detected, click `Export Transcript`  

> If the caption panel fails to load, the app will guide you to restart the process.

## 🧪 Developer Guide

### ▶️ Run Script Directly

If you'd like to run the Puppeteer subtitle collector directly (e.g., without the GUI), use the following command in your terminal:

```bash
npx electron gui_launcher.js
```

Make sure to install dependencies first:

```bash
npm install
```

### 🛠 Build macOS App (Electron)

To package this project into a macOS `.app` using Electron Forge:

```bash
rm -rf node_modules package-lock.json out
npm install
npm run make
```

The built app will appear in the `out/` directory.

> For notarization and DMG creation, refer to Apple's Developer ID documentation and `create-dmg` tool.

## ☕ Support Me

If you find this tool helpful, feel free to support me:

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=flat&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/lalalands)

---

🧊 Built with ❤️ by Xiaoyang and Frosty
