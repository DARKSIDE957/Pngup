# Pngup

Floating photo overlay for Windows. Pin an image on your screen, keep working behind it, and control opacity, size, click-through, theme, and language.

## Features

- Always-on-top transparent photo window
- Separate draggable settings ball anywhere on screen
- Pass clicks through the photo when you want to use apps behind it
- Opacity and size controls
- Dark and light themes
- Six languages: English, Arabic (RTL), Spanish, French, German, Russian
- System tray quick actions
- Settings persistence across restarts

## Download

After building, the Windows installer is here:

`src-tauri/target/release/bundle/nsis/Pngup_0.1.0_x64-setup.exe`

## Development

### Prerequisites

- Node.js 20+
- Rust stable (`rustup`)
- Visual Studio 2022 Build Tools with the **Desktop development with C++** workload
- WebView2 (included on Windows 11)

### Install dependencies

```powershell
npm install
```

### Run locally

```powershell
npm run tauri:dev
```

On Windows, if `link.exe` is missing, open **Developer PowerShell for VS 2022** first, then run the commands above.

### Build installer

```powershell
npm run tauri:build
```

## Shortcuts

- `Ctrl+O` — pick photo
- `Ctrl+T` — toggle pass clicks through
- `Ctrl+Shift+H` — show settings
- `Ctrl+Shift+P` — toggle pass clicks through (global)
- `Ctrl+Shift+O` — pick photo (global)

## Stack

- Tauri 2
- React 19 + TypeScript + Vite
- react-i18next
- tauri-plugin-dialog, store, global-shortcut
