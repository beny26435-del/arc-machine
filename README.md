# Arc Machine

Arc Machine is a standalone interactive microsite that boots into an Arc-themed desktop.

It is intentionally separate from the Arclet app and can be opened as a static site.

## Run

Open `index.html` directly in a browser, or serve this folder locally:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Features

- Power-on screen and BIOS-style boot sequence.
- Desktop environment with menu bar, Dock, Finder-style windows, and draggable panels.
- Finder, Macintosh HD, Applications, Documents, System Settings, Arc House, Creator X, Bridge USDC, Arc Docs, App Kit, Arcscan, Faucet, Memo Pad, Terminal, USDC Drop, and Trash.
- Wallpaper picker with locally saved Arc-themed wallpapers.
- Dark Starfield wallpaper with subtle blinking stars.
- First-boot username prompt saved locally in the browser.
- Arc House desktop shortcut using the Arc logo, linking to `https://community.arc.io/home`.
- Creator X desktop shortcut linking to `https://x.com/benyaminstyles`.
- Bridge USDC desktop widget linking to `https://arclet.xyz/bridge`.
- USDC Drop, a small built-in one-life game inside Applications and the Dock. USDC-logo drops get faster as score rises, rare power-ups drop automatically, and high score is cached locally.
- Terminal commands such as `help`, `ls`, `tree`, `find`, `cd`, `pwd`, `open`, `cat`, `calc`, `encode`, `decode`, `memo new`, `wallpaper`, `username set <name>`, `highscore`, `docs`, `appkit`, `bridge`, and `clear`.
- Hidden interactions tucked into Trash, system folders, clock clicks, Konami code, and secret terminal commands.
