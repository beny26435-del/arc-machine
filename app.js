const powerScreen = document.querySelector("#powerScreen");
const bootScreen = document.querySelector("#bootScreen");
const desktop = document.querySelector("#desktop");
const powerButton = document.querySelector("#powerButton");
const bootLog = document.querySelector("#bootLog");
const bootProgress = document.querySelector("#bootProgress");
const clock = document.querySelector("#clock");
const windowTemplate = document.querySelector("#windowTemplate");
const usernameModal = document.querySelector("#usernameModal");
const usernameForm = document.querySelector("#usernameForm");
const usernameInput = document.querySelector("#usernameInput");
const userBadge = document.querySelector("#userBadge");

const windows = new Map();
let zIndex = 30;
let clockClicks = 0;
let terminalCwd = "/";
let terminalHistory = [];
let activeGameController = null;

const wallpapers = [
  { id: "arc-dawn", name: "Arc Dawn", description: "Mint, blue, and soft pink glass." },
  { id: "stable-glass", name: "Stable Glass", description: "Clean blue infrastructure mood." },
  { id: "memo-field", name: "Memo Field", description: "Green finance ops glow." },
  { id: "midnight", name: "Midnight RPC", description: "Dark network operator mode." },
  { id: "starfield", name: "Starfield", description: "Dark space with blinking stars." },
];

const fileSystem = {
  "/": ["Applications", "Documents", "Macintosh HD", "Trash"],
  "/Applications": ["Arc House.url", "Creator X.url", "Bridge USDC.url", "Arc Docs.app", "App Kit.app", "USDC Drop.app", "Terminal.app", "Arcscan.url", "Faucet.url"],
  "/Documents": ["Memo Pad.note", "Arclet Receipt.memo", "Bridge Checklist.txt"],
  "/Macintosh HD": ["System", "Network", "Contracts", "Utilities"],
  "/Macintosh HD/System": [".stablecoin-native", ".arc-cache", "rpc.conf", "chain-id.txt"],
  "/Macintosh HD/Network": ["Arc Testnet.net", "Sepolia Bridge.route", "App Kit.driver"],
  "/Macintosh HD/Contracts": ["Arclet.contract", "MemoEmitter.contract", "USDC.native"],
  "/Macintosh HD/Utilities": ["Terminal.app", "System Settings.app"],
  "/Trash": ["memo-draft-old.txt", ".arc-cache"],
};

const fileText = {
  "Memo Pad.note": "invoice:ARC-2026-001\ncustomer:arc-machine\npurpose:desktop-demo",
  "Arclet Receipt.memo": "app=Arclet\nmode=Payment Link\nmemo=checkout receipt with structured context",
  "Bridge Checklist.txt": "1. Bridge USDC to Arc\n2. Return to checkout\n3. Pay with native Arc USDC\n4. Keep the receipt",
  ".stablecoin-native": "Arc native gas token: USDC\nResult: payment UX feels like finance, not token plumbing.",
  ".arc-cache": "Recovered hidden cache:\n- memos enabled\n- app kit drivers loaded\n- user owns the machine",
  "rpc.conf": "https://rpc.testnet.arc.network",
  "chain-id.txt": "5042002",
  "memo-draft-old.txt": "invoice_id=ARCLET-0007\nworkflow=creator_profile_tip_jar\ncontext=transaction hashes are not enough",
};

const bootLines = [
  "Starting Arc Machine...",
  "Loading Aqua glass compositor",
  "Mounting Macintosh HD",
  "Checking Arc Testnet chain id: 5042002",
  "Native gas token: USDC",
  "Loading App Kit extensions",
  "Registering transaction memo handler",
  "Preparing Finder",
  "Done",
];

const content = {
  finder: {
    title: "Finder",
    width: 780,
    className: "finder-window",
    html: finderLayout(
      "Recents",
      `
        <p class="eyebrow">Finder</p>
        <h2>Arc Machine</h2>
        <p>A small Arc desktop with folders that make sense: apps in Applications, notes in Documents, chain files in Macintosh HD, and secrets tucked away where curious people look.</p>
        <div class="file-grid">
          ${fileButton("applications", "Applications", "Arc apps and tools", "apps")}
          ${fileButton("documents", "Documents", "Memos and notes", "folder")}
          ${fileButton("computer", "Macintosh HD", "System and network files", "drive")}
          ${fileButton("settings", "System Settings", "Wallpaper and preferences", "settings")}
        </div>
      `,
    ),
  },
  applications: {
    title: "Applications",
    width: 790,
    className: "finder-window",
    html: finderLayout(
      "Applications",
      `
        <p class="eyebrow">Applications</p>
        <h2>Arc apps</h2>
        <div class="file-grid">
          ${externalCard("Arc House", "Community home, updates, and builder resources.", "https://community.arc.io/home", "arc")}
          ${externalCard("Creator X", "Follow Benyamin's builds and updates.", "https://x.com/benyaminstyles", "x")}
          ${externalCard("Bridge USDC", "Open Arclet bridge for Sepolia and Arc.", "https://arclet.xyz/bridge", "bridge")}
          ${fileButton("docs", "Arc Docs", "Developer documentation", "folder")}
          ${fileButton("appkit", "App Kit", "Funding and USDC movement", "kit")}
          ${fileButton("game", "USDC Drop", "Built-in arcade game", "game")}
          ${fileButton("terminal", "Terminal", "ArcShell command line", "terminal")}
          ${externalCard("Arcscan", "Open testnet explorer", "https://testnet.arcscan.app/")}
          ${externalCard("Faucet", "Get testnet USDC", "https://faucet.circle.com/")}
        </div>
      `,
    ),
  },
  documents: {
    title: "Documents",
    width: 760,
    className: "finder-window",
    html: finderLayout(
      "Documents",
      `
        <p class="eyebrow">Documents</p>
        <h2>Notes and memos</h2>
        <div class="file-grid">
          ${fileButton("memos", "Memo Pad", "Create structured context", "doc")}
          ${fileButton("receiptNote", "Arclet Receipt.memo", "Receipt-shaped memo", "doc")}
          ${fileButton("bridgeNote", "Bridge Checklist.txt", "Funding flow note", "doc")}
          ${fileButton("docs", "Arc References", "Documentation shortcuts", "folder")}
        </div>
      `,
    ),
  },
  computer: {
    title: "Macintosh HD",
    width: 800,
    className: "finder-window",
    html: finderLayout(
      "Macintosh HD",
      `
        <p class="eyebrow">System disk</p>
        <h2>Arc Testnet</h2>
        <div class="stat-grid">
          <div class="stat-card"><strong>Chain ID</strong><span>5042002</span></div>
          <div class="stat-card"><strong>Native gas</strong><span>USDC</span></div>
          <div class="stat-card"><strong>RPC</strong><span>rpc.testnet.arc.network</span></div>
        </div>
        <div class="file-grid">
          ${fileButton("system", "System", "Hidden network files", "folder")}
          ${fileButton("network", "Network", "Bridge and RPC routes", "folder")}
          ${fileButton("contracts", "Contracts", "Arclet and memo contracts", "folder")}
          ${fileButton("settings", "System Settings", "Wallpaper", "settings")}
        </div>
      `,
    ),
  },
  docs: {
    title: "Arc Docs",
    width: 810,
    className: "finder-window",
    html: finderLayout(
      "Arc Docs",
      `
        <p class="eyebrow">Docs folder</p>
        <h2>Arc developer shortcuts</h2>
        <div class="link-grid">
          ${externalCard("Arc Docs", "Everything you need to build onchain finance with stablecoins.", "https://docs.arc.io/")}
          ${externalCard("Connect to Arc", "RPC, chain ID, wallet setup.", "https://docs.arc.io/arc/references/connect-to-arc")}
          ${externalCard("Stablecoin-native model", "USDC-native gas and stablecoin UX.", "https://docs.arc.io/arc/concepts/stablecoin-native-model")}
          ${externalCard("Transaction memos", "Structured context attached to successful calls.", "https://docs.arc.io/arc/concepts/transaction-memos")}
          ${externalCard("Deploy with Foundry", "Deploy contracts on Arc Testnet.", "https://docs.arc.io/arc/tutorials/deploy-on-arc")}
          ${externalCard("Contract addresses", "Reference contracts and system addresses.", "https://docs.arc.io/arc/references/contract-addresses")}
        </div>
      `,
    ),
  },
  appkit: {
    title: "App Kit",
    width: 780,
    className: "finder-window",
    html: finderLayout(
      "App Kit",
      `
        <p class="eyebrow">USDC operations</p>
        <h2>Funding tools around checkout.</h2>
        <p>Arc App Kit handles stablecoin movement around product flows: Send, Bridge, Swap, and Unified Balance.</p>
        <div class="link-grid">
          ${externalCard("App Kit", "SDK overview and setup.", "https://docs.arc.io/app-kit")}
          ${externalCard("Send", "Same-chain USDC movement.", "https://docs.arc.io/app-kit/send")}
          ${externalCard("Bridge", "Move USDC between supported chains.", "https://docs.arc.io/app-kit/bridge")}
          ${externalCard("Unified Balance", "Chain-abstracted balance and spend.", "https://docs.arc.io/app-kit/unified-balance")}
        </div>
      `,
    ),
  },
  system: {
    title: "System",
    width: 760,
    className: "finder-window",
    html: finderLayout(
      "System",
      `
        <p class="eyebrow">System</p>
        <h2>Network files</h2>
        <div class="file-grid">
          ${fileButton("systemSecret", ".stablecoin-native", "Hidden native USDC note", "doc")}
          ${fileButton("arcCache", ".arc-cache", "Recovered cache", "folder")}
          ${fileButton("rpcFile", "rpc.conf", "RPC endpoint", "doc")}
          ${fileButton("chainFile", "chain-id.txt", "Arc Testnet ID", "doc")}
        </div>
      `,
    ),
  },
  network: {
    title: "Network",
    width: 720,
    className: "finder-window",
    html: finderLayout(
      "Network",
      `
        <p class="eyebrow">Routes</p>
        <h2>Stablecoin movement</h2>
        <div class="file-grid">
          ${externalCard("Arc Testnet RPC", "https://rpc.testnet.arc.network", "https://docs.arc.io/arc/references/rpc-endpoints")}
          ${externalCard("Arcscan", "https://testnet.arcscan.app", "https://testnet.arcscan.app/")}
          ${externalCard("Bridge docs", "Ethereum Sepolia ↔ Arc Testnet", "https://docs.arc.io/app-kit/bridge")}
          ${externalCard("Faucet", "Testnet USDC", "https://faucet.circle.com/")}
        </div>
      `,
    ),
  },
  contracts: {
    title: "Contracts",
    width: 760,
    className: "finder-window",
    html: finderLayout(
      "Contracts",
      `
        <p class="eyebrow">Contracts</p>
        <h2>Onchain objects</h2>
        <div class="file-grid">
          ${externalCard("Arclet contract", "Profile Tip Jar deployment", "https://testnet.arcscan.app/address/0x531f40744d9c675dE15C0326766955F5b1cbC938")}
          ${externalCard("Memo docs", "Structured transaction context", "https://docs.arc.io/arc/concepts/transaction-memos")}
          ${externalCard("Contract addresses", "Arc references", "https://docs.arc.io/arc/references/contract-addresses")}
          ${fileButton("terminal", "Inspect with Terminal", "Try cat and open", "terminal")}
        </div>
      `,
    ),
  },
  settings: {
    title: "System Settings",
    width: 760,
    html: plainWindow(`
      <p class="eyebrow">Appearance</p>
      <h2>Choose wallpaper</h2>
      <p>Wallpapers are saved locally in this browser.</p>
      <div class="wallpaper-grid" id="wallpaperGrid">
        ${wallpapers.map((wallpaper) => wallpaperButton(wallpaper)).join("")}
      </div>
    `),
    mount: () => {
      updateWallpaperButtons();
      document.querySelectorAll("[data-wallpaper-choice]").forEach((button) => {
        button.addEventListener("click", () => setWallpaper(button.dataset.wallpaperChoice));
      });
    },
  },
  memos: {
    title: "Memo Pad",
    width: 720,
    html: plainWindow(`
      <p class="eyebrow">Transaction memo</p>
      <h2>Make hashes readable.</h2>
      <p>Memos attach structured business context to successful Arc calls, useful for invoices, reconciliation, and reporting.</p>
      <div class="memo-composer">
        <textarea id="memoInput" spellcheck="false">invoice:ARC-2026-001
customer:arc-machine
purpose:desktop-demo</textarea>
        <div class="quick-actions">
          <button class="primary-button" id="memoButton" type="button">Compile memo</button>
          <a class="ghost-button" href="https://docs.arc.io/arc/concepts/transaction-memos" target="_blank" rel="noreferrer">Memo docs</a>
        </div>
        <div class="memo-output" id="memoOutput">Memo compiler idle.</div>
      </div>
    `),
    mount: () => {
      const input = document.querySelector("#memoInput");
      const output = document.querySelector("#memoOutput");
      document.querySelector("#memoButton")?.addEventListener("click", () => {
        const memo = input.value
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);
        output.textContent = JSON.stringify({ app: "Arc Machine", memo, createdAt: new Date().toISOString() }, null, 2);
        toast("Memo compiled", "Now it looks like something finance ops can reconcile.");
      });
    },
  },
  receiptNote: {
    title: "Arclet Receipt.memo",
    width: 620,
    html: noteWindow("Arclet Receipt.memo", fileText["Arclet Receipt.memo"]),
  },
  bridgeNote: {
    title: "Bridge Checklist.txt",
    width: 620,
    html: noteWindow("Bridge Checklist.txt", fileText["Bridge Checklist.txt"]),
  },
  rpcFile: {
    title: "rpc.conf",
    width: 560,
    html: noteWindow("rpc.conf", fileText["rpc.conf"]),
  },
  chainFile: {
    title: "chain-id.txt",
    width: 520,
    html: noteWindow("chain-id.txt", fileText["chain-id.txt"]),
  },
  terminal: {
    title: "Terminal",
    width: 820,
    html: plainWindow(`
      <div class="terminal-output" id="terminalOutput">Last login: Tue Jun 23 on ArcShell
arc-machine:~ <span data-terminal-user>user</span>$ help
</div>
      <form class="terminal-form" id="terminalForm">
        <input id="terminalInput" autocomplete="off" aria-label="Terminal command" placeholder="try: ls /Applications" />
        <button class="terminal-submit" type="submit">Run</button>
      </form>
    `),
    mount: () => {
      const output = document.querySelector("#terminalOutput");
      const input = document.querySelector("#terminalInput");
      const terminalUser = document.querySelector("[data-terminal-user]");
      if (terminalUser) terminalUser.textContent = getLocalUsername();
      document.querySelector("#terminalForm")?.addEventListener("submit", (event) => {
        event.preventDefault();
        runCommand(input.value, output);
        input.value = "";
      });
      input?.focus();
    },
  },
  game: {
    title: "USDC Drop",
    width: 760,
    html: plainWindow(`
      <p class="eyebrow">Arcade</p>
      <h2>USDC Drop</h2>
      <div class="game-hud">
        <span>Player: <strong id="gameUser">Guest</strong></span>
        <span>Score: <strong id="gameScore">0</strong></span>
        <span>High: <strong id="gameHighScore">0</strong></span>
        <span>Lives: <strong id="gameLives">1</strong></span>
        <span>Power: <strong id="gamePower">None</strong></span>
      </div>
      <div class="game-board" id="gameBoard">
        <div class="game-player" id="gamePlayer">wallet</div>
      </div>
      <div class="game-touch-controls" aria-label="Touch game controls">
        <button class="game-touch-button" id="gameLeft" type="button">← Left</button>
        <button class="game-touch-button" id="gameRight" type="button">Right →</button>
      </div>
      <div class="ability-row">
        <span class="ability-pill">One mode. One life. Score makes the drop field faster.</span>
        <span class="ability-pill">Rare colored drops trigger powers instantly.</span>
        <span class="ability-pill">M magnet</span>
        <span class="ability-pill">S slow</span>
        <span class="ability-pill">SH shield</span>
        <span class="ability-pill">+ life</span>
      </div>
      <div class="quick-actions">
        <button class="primary-button" id="gameStart" type="button">Start game</button>
        <button class="ghost-button" id="gameReset" type="button">Reset</button>
      </div>
    `),
    mount: mountGame,
  },
  trash: {
    title: "Trash",
    width: 720,
    className: "finder-window",
    html: finderLayout(
      "Trash",
      `
        <p class="eyebrow">Trash</p>
        <h2>Recently deleted</h2>
        <p>Mostly harmless. One or two things are worth opening.</p>
        <div class="file-grid">
          ${fileButton("deletedMemo", "memo-draft-old.txt", "Recovered Arc memo draft", "doc")}
          ${fileButton("arcCache", ".arc-cache", "Hidden cache folder", "folder")}
        </div>
      `,
    ),
  },
  deletedMemo: {
    title: "memo-draft-old.txt",
    width: 620,
    html: noteWindow("memo-draft-old.txt", fileText["memo-draft-old.txt"]),
  },
  arcCache: {
    title: ".arc-cache",
    width: 650,
    html: noteWindow(".arc-cache", fileText[".arc-cache"]),
  },
  systemSecret: {
    title: ".stablecoin-native",
    width: 650,
    html: plainWindow(`
      <p class="eyebrow">Hidden file</p>
      <h2>Stablecoin native mode</h2>
      <p>Arc Machine quietly prefers apps where payment, gas, receipt, and reconciliation all speak the same financial language.</p>
      <div class="memo-output">${fileText[".stablecoin-native"]}</div>
      <div class="quick-actions">
        <a class="ghost-button" href="https://docs.arc.io/arc/concepts/stablecoin-native-model" target="_blank" rel="noreferrer">Read the model</a>
      </div>
    `),
  },
};

function finderLayout(active, main) {
  return `
    <div class="finder-layout">
      <aside class="finder-sidebar">
        ${sidebarButton("finder", "Recents", active === "Recents")}
        ${sidebarButton("applications", "Applications", active === "Applications")}
        ${sidebarButton("documents", "Documents", active === "Documents")}
        ${sidebarButton("computer", "Macintosh HD", active === "Macintosh HD")}
        ${sidebarButton("docs", "Arc Docs", active === "Arc Docs")}
        ${sidebarButton("appkit", "App Kit", active === "App Kit")}
        ${sidebarButton("settings", "Settings", active === "Settings")}
        ${sidebarButton("trash", "Trash", active === "Trash")}
      </aside>
      <div class="finder-main">${main}</div>
    </div>
  `;
}

function plainWindow(html) {
  return `<div class="plain-window">${html}</div>`;
}

function noteWindow(title, text) {
  return plainWindow(`
    <p class="eyebrow">Document</p>
    <h2>${title}</h2>
    <div class="memo-output">${escapeHtml(text)}</div>
  `);
}

function sidebarButton(target, label, active) {
  return `<button class="sidebar-item${active ? " active" : ""}" data-folder="${target}" type="button">${label}</button>`;
}

function fileButton(target, title, subtitle, type) {
  const iconMap = {
    apps: "mini-folder apps",
    doc: "mini-doc",
    terminal: "mini-terminal",
    kit: "mini-folder cyan",
    settings: "mini-settings",
    game: "mini-game",
    folder: "mini-folder",
    drive: "mini-folder",
  };
  return `<button class="file-card" data-window="${target}" type="button"><span class="${iconMap[type] ?? "mini-folder"}"></span><strong>${title}</strong><small>${subtitle}</small></button>`;
}

function externalCard(title, body, href, icon = "") {
  const iconHtml = icon === "arc"
    ? `<span class="mini-arc-home"><img src="./assets/arc-logo.png" alt="" /></span>`
    : icon === "x"
      ? `<span class="mini-x-icon">X</span>`
      : icon === "bridge"
        ? `<span class="mini-bridge-icon"></span>`
      : "";
  return `<a class="link-card" href="${href}" target="_blank" rel="noreferrer">${iconHtml}<strong>${title}</strong><small>${body}</small></a>`;
}

function wallpaperButton(wallpaper) {
  return `
    <button class="wallpaper-option" data-wallpaper-choice="${wallpaper.id}" type="button">
      <span class="wallpaper-preview ${wallpaper.id}"></span>
      <strong>${wallpaper.name}</strong>
      <small>${wallpaper.description}</small>
    </button>
  `;
}

powerButton.addEventListener("click", boot);

clock.addEventListener("click", () => {
  clockClicks += 1;
  if (clockClicks === 7) {
    openWindow("systemSecret");
    toast("Hidden file opened", "Clock clicks revealed a system note.");
    clockClicks = 0;
  }
});

document.querySelector("#arcMenuButton").addEventListener("click", () => {
  toast("About Arc Machine", "A small desktop for Arc, App Kit, memos, and stablecoin-native experiments.");
});

usernameForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const username = normalizeUsername(usernameInput.value);
  if (!username) {
    usernameInput.focus();
    return;
  }
  localStorage.setItem("arc-machine-username", username);
  setUsername(username);
  usernameModal.classList.add("hidden");
  toast("Welcome", `${username} is now logged in locally.`);
});

function boot() {
  powerScreen.classList.add("hidden");
  desktop.classList.add("hidden");
  bootScreen.classList.remove("hidden");
  bootLog.textContent = "";
  bootProgress.style.width = "0%";
  applySavedWallpaper();

  bootLines.forEach((line, index) => {
    setTimeout(() => {
      bootLog.textContent += `${line}\n`;
      bootProgress.style.width = `${Math.round(((index + 1) / bootLines.length) * 100)}%`;
      if (index === bootLines.length - 1) setTimeout(showDesktop, 520);
    }, 230 * index);
  });
}

function showDesktop() {
  bootScreen.classList.add("hidden");
  desktop.classList.remove("hidden");
  ensureUsername();
  updateClock();
  setInterval(updateClock, 1000);
}

function ensureUsername() {
  const username = localStorage.getItem("arc-machine-username");
  if (username) {
    setUsername(username);
    return;
  }
  usernameModal.classList.remove("hidden");
  usernameInput.focus();
}

function setUsername(username) {
  userBadge.textContent = username;
}

function getLocalUsername() {
  return localStorage.getItem("arc-machine-username") ?? "guest";
}

function normalizeUsername(value) {
  return value.trim().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 24);
}

function updateClock() {
  clock.textContent = new Intl.DateTimeFormat("en", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function openWindow(name) {
  const data = content[name];
  if (!data) return;

  const existing = windows.get(name);
  if (existing) {
    if (existing.style.display === "none") {
      restoreWindow(existing);
      showOnlyCompactWindow(existing);
      return;
    }
    focusWindow(existing);
    showOnlyCompactWindow(existing);
    return;
  }

  const node = windowTemplate.content.firstElementChild.cloneNode(true);
  node.dataset.windowPanel = name;
  node.style.setProperty("--w", `${data.width ?? 700}px`);
  node.style.setProperty("--x", `${Math.max(28, Math.min(170 + windows.size * 30, window.innerWidth - 440))}px`);
  node.style.setProperty("--y", `${Math.max(48, Math.min(70 + windows.size * 26, window.innerHeight - 360))}px`);
  if (data.className) node.classList.add(data.className);
  node.querySelector(".window-title").textContent = data.title;
  node.querySelector(".window-body").innerHTML = data.html;
  node.addEventListener("pointerdown", () => focusWindow(node));
  makeDraggable(node);

  desktop.appendChild(node);
  windows.set(name, node);
  bindWindowLaunchers(node);
  focusWindow(node);
  showOnlyCompactWindow(node);
  data.mount?.();
  requestAnimationFrame(() => constrainWindowToViewport(node));
}

function bindWindowLaunchers(root = document) {
  root.querySelectorAll("[data-folder]").forEach((button) => {
    if (button.dataset.folderBound === "true") return;
    button.dataset.folderBound = "true";
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      navigateInPlace(button.closest(".window"), button.dataset.folder);
    });
  });

  root.querySelectorAll("[data-window]").forEach((button) => {
    if (button.dataset.bound === "true") return;
    button.dataset.bound = "true";
    button.addEventListener("click", () => openWindow(button.dataset.window));
  });

  root.querySelectorAll(".window-close").forEach((button) => {
    if (button.dataset.closeBound === "true") return;
    button.dataset.closeBound = "true";
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      closeNodeWindow(button.closest(".window"));
    });
  });

  root.querySelectorAll(".window-minimize").forEach((button) => {
    if (button.dataset.minBound === "true") return;
    button.dataset.minBound = "true";
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      minimizeWindow(button.closest(".window"));
    });
  });

  root.querySelectorAll(".window-zoom").forEach((button) => {
    if (button.dataset.zoomBound === "true") return;
    button.dataset.zoomBound = "true";
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleZoom(button.closest(".window"));
    });
  });
}

function navigateInPlace(node, target) {
  const data = content[target];
  if (!node || !data) {
    openWindow(target);
    return;
  }

  const oldName = node.dataset.windowPanel;
  if (oldName && windows.get(oldName) === node && oldName !== target) {
    windows.delete(oldName);
  }
  node.querySelector(".window-title").textContent = data.title;
  node.querySelector(".window-body").innerHTML = data.html;
  node.classList.toggle("finder-window", data.className === "finder-window");
  node.dataset.windowPanel = target;
  node.dataset.currentPanel = target;
  windows.set(target, node);
  bindWindowLaunchers(node);
  data.mount?.();
  focusWindow(node);
  showOnlyCompactWindow(node);
}

function closeWindow(name) {
  stopWindowRuntime(name);
  windows.get(name)?.remove();
  windows.delete(name);
}

function closeNodeWindow(node) {
  if (!node) return;
  const name = node.dataset.windowPanel;
  stopWindowRuntime(name);
  if (name && windows.has(name)) {
    closeWindow(name);
    return;
  }
  node.remove();
}

function minimizeWindow(node) {
  if (!node) return;
  stopWindowRuntime(node.dataset.windowPanel);
  node.style.transform = "scale(0.96)";
  node.style.opacity = "0";
  node.style.pointerEvents = "none";
  setTimeout(() => {
    node.style.display = "none";
  }, 160);
}

function restoreWindow(node) {
  if (!node) return;
  node.style.display = "";
  requestAnimationFrame(() => {
    node.style.transform = "";
    node.style.opacity = "";
    node.style.pointerEvents = "";
    focusWindow(node);
  });
}

function toggleZoom(node) {
  if (!node || window.matchMedia("(max-width: 840px)").matches) return;
  const isZoomed = node.dataset.zoomed === "true";
  if (isZoomed) {
    node.dataset.zoomed = "false";
    node.style.left = node.dataset.prevLeft ?? node.style.left;
    node.style.top = node.dataset.prevTop ?? node.style.top;
    node.style.width = node.dataset.prevWidth ?? "";
    node.style.height = node.dataset.prevHeight ?? "";
    return;
  }

  node.dataset.zoomed = "true";
  node.dataset.prevLeft = node.style.left;
  node.dataset.prevTop = node.style.top;
  node.dataset.prevWidth = node.style.width;
  node.dataset.prevHeight = node.style.height;
  node.style.left = "42px";
  node.style.top = "54px";
  node.style.width = "calc(100vw - 84px)";
  node.style.height = "calc(100vh - 158px)";
  focusWindow(node);
}

function focusWindow(node) {
  document.querySelectorAll(".window").forEach((item) => item.classList.remove("active"));
  node.classList.add("active");
  node.style.zIndex = String(++zIndex);
}

function isCompactViewport() {
  return window.matchMedia("(max-width: 840px)").matches;
}

function showOnlyCompactWindow(node) {
  if (!isCompactViewport() || !node) return;
  document.querySelectorAll(".window").forEach((item) => {
    if (item !== node) item.style.display = "none";
  });
  node.style.display = "";
  node.style.transform = "";
  node.style.opacity = "";
  node.style.pointerEvents = "";
  window.scrollTo({ top: 0, left: 0 });
}

function stopWindowRuntime(name) {
  if (name === "game") {
    activeGameController?.stop?.();
    activeGameController?.abort?.();
    activeGameController = null;
  }
}

function constrainWindowToViewport(node) {
  if (!node || window.matchMedia("(max-width: 840px)").matches) return;
  const rect = node.getBoundingClientRect();
  const left = Math.max(12, Math.min(rect.left, window.innerWidth - rect.width - 12));
  const top = Math.max(46, Math.min(rect.top, window.innerHeight - rect.height - 112));
  node.style.left = `${left}px`;
  node.style.top = `${top}px`;
}

function makeDraggable(node) {
  const titlebar = node.querySelector(".window-titlebar");
  let dragging = false;
  let originX = 0;
  let originY = 0;
  let startX = 0;
  let startY = 0;

  titlebar.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button") || window.matchMedia("(max-width: 840px)").matches) return;
    dragging = true;
    titlebar.setPointerCapture(event.pointerId);
    originX = event.clientX;
    originY = event.clientY;
    startX = node.offsetLeft;
    startY = node.offsetTop;
    focusWindow(node);
  });

  titlebar.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const x = Math.max(12, Math.min(window.innerWidth - node.offsetWidth - 12, startX + event.clientX - originX));
    const y = Math.max(38, Math.min(window.innerHeight - node.offsetHeight - 98, startY + event.clientY - originY));
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
  });

  titlebar.addEventListener("pointerup", () => {
    dragging = false;
    constrainWindowToViewport(node);
  });
}

function setWallpaper(id) {
  const exists = wallpapers.some((wallpaper) => wallpaper.id === id);
  const next = exists ? id : "arc-dawn";
  desktop.dataset.wallpaper = next;
  localStorage.setItem("arc-machine-wallpaper", next);
  updateWallpaperButtons();
  toast("Wallpaper changed", wallpapers.find((wallpaper) => wallpaper.id === next)?.name ?? "Arc Dawn");
}

function applySavedWallpaper() {
  const saved = localStorage.getItem("arc-machine-wallpaper") ?? "arc-dawn";
  desktop.dataset.wallpaper = wallpapers.some((wallpaper) => wallpaper.id === saved) ? saved : "arc-dawn";
}

function updateWallpaperButtons() {
  const current = desktop.dataset.wallpaper || "arc-dawn";
  document.querySelectorAll("[data-wallpaper-choice]").forEach((button) => {
    button.classList.toggle("active", button.dataset.wallpaperChoice === current);
  });
}

function mountGame() {
  activeGameController?.stop?.();
  activeGameController?.abort?.();

  const board = document.querySelector("#gameBoard");
  const player = document.querySelector("#gamePlayer");
  const scoreNode = document.querySelector("#gameScore");
  const highScoreNode = document.querySelector("#gameHighScore");
  const livesNode = document.querySelector("#gameLives");
  const powerNode = document.querySelector("#gamePower");
  const userNode = document.querySelector("#gameUser");
  const startButton = document.querySelector("#gameStart");
  const resetButton = document.querySelector("#gameReset");
  const leftButton = document.querySelector("#gameLeft");
  const rightButton = document.querySelector("#gameRight");

  const highScoreKey = "arc-machine-usdc-drop-high-score";
  const playerName = localStorage.getItem("arc-machine-username") ?? "Guest";
  const abilityTypes = ["magnet", "slow", "shield", "life"];
  let score = 0;
  let lives = 1;
  let highScore = Number(localStorage.getItem(highScoreKey) ?? "0");
  let playerX = 0.5;
  let drops = [];
  let running = false;
  let activePower = null;
  let shieldCharges = 0;
  let lastTime = 0;
  let frame = null;
  let draggingPlayer = false;

  const controller = new AbortController();
  activeGameController = {
    abort: () => controller.abort(),
    stop: () => {
      running = false;
      cancelAnimationFrame(frame);
    },
  };

  userNode.textContent = playerName;
  highScoreNode.textContent = String(highScore);

  function randomDropType() {
    const abilityChance = Math.max(0.015, 0.045 - score * 0.0006);
    if (Math.random() < abilityChance) return abilityTypes[Math.floor(Math.random() * abilityTypes.length)];
    return Math.random() < 0.06 ? "bonus" : "usdc";
  }

  function makeDrop(offset = 0) {
    const difficulty = difficultyForScore();
    return {
      x: 0.08 + Math.random() * 0.84,
      y: -44 - Math.random() * 170 - offset,
      speed: difficulty.baseSpeed + Math.random() * 44 + Math.min(430, score * 6.5),
      kind: randomDropType(),
    };
  }

  function difficultyForScore() {
    return {
      baseSpeed: 138 + Math.min(210, Math.floor(score / 6) * 18),
      maxDrops: Math.min(5, 1 + Math.floor(score / 12)),
    };
  }

  function targetDropCount() {
    return difficultyForScore().maxDrops;
  }

  function syncDropNodes() {
    while (board.querySelectorAll(".game-coin").length < drops.length) {
      const node = document.createElement("div");
      node.className = "game-coin";
      board.appendChild(node);
    }
    while (board.querySelectorAll(".game-coin").length > drops.length) {
      board.querySelector(".game-coin")?.remove();
    }
  }

  function activePowerLabel(now = performance.now()) {
    if (shieldCharges > 0) return `Shield x${shieldCharges}`;
    if (!activePower || activePower.until <= now) return "None";
    const seconds = Math.max(1, Math.ceil((activePower.until - now) / 1000));
    return `${activePower.name} ${seconds}s`;
  }

  function renderOnly() {
    if (!board.isConnected) return;
    const boardWidth = board.clientWidth;
    player.style.left = `${playerX * 100}%`;
    board.querySelectorAll(".game-coin").forEach((node, index) => {
      const drop = drops[index];
      node.style.left = `${Math.max(8, drop.x * (boardWidth - 42))}px`;
      node.style.top = `${drop.y}px`;
      node.className = `game-coin ${drop.kind === "bonus" ? "bonus" : ""} ${abilityTypes.includes(drop.kind) ? `ability ${drop.kind}` : ""}`;
      node.textContent = abilityTypes.includes(drop.kind) ? abilityLabel(drop.kind) : "";
    });
    scoreNode.textContent = String(score);
    highScoreNode.textContent = String(highScore);
    livesNode.textContent = String(lives);
    powerNode.textContent = activePowerLabel();
  }

  function tick(timestamp) {
    if (!running || !board.isConnected) return;
    if (!lastTime) lastTime = timestamp;
    const delta = Math.min(34, timestamp - lastTime) / 1000;
    lastTime = timestamp;

    const boardWidth = board.clientWidth;
    const boardHeight = board.clientHeight;
    const playerCenter = playerX * boardWidth;
    const now = performance.now();
    if (activePower?.until <= now) activePower = null;
    const speedMultiplier = activePower?.type === "slow" ? 0.54 : 1;

    drops.forEach((drop, index) => {
      if (activePower?.type === "magnet" && (drop.kind === "usdc" || drop.kind === "bonus")) {
        const targetX = playerX;
        drop.x += (targetX - drop.x) * Math.min(1, delta * 2.6);
      }

      drop.y += drop.speed * delta * speedMultiplier;
      const dropCenter = drop.x * (boardWidth - 42) + 19;
      const nearWallet = drop.y > boardHeight - 74;
      if (nearWallet && Math.abs(playerCenter - dropCenter) < 66) {
        collectDrop(drop);
        drops[index] = makeDrop(index * 40);
        return;
      }

      if (drop.y > boardHeight + 22) {
        if (drop.kind === "usdc" || drop.kind === "bonus") {
          if (shieldCharges > 0) {
            shieldCharges -= 1;
          } else {
            lives -= 1;
          }
          if (lives <= 0) {
            endGame();
            return;
          }
        } else {
          score = Math.max(0, score - 1);
        }
        drops[index] = makeDrop(index * 40);
      }
    });

    if (!running) return;

    if (score > highScore) {
      highScore = score;
      localStorage.setItem(highScoreKey, String(highScore));
    }
    refillDifficultyDrops();
    renderOnly();
    frame = requestAnimationFrame(tick);
  }

  function refillDifficultyDrops() {
    const target = targetDropCount();
    while (drops.length < target) drops.push(makeDrop(drops.length * 55));
    if (drops.length > target) drops = drops.slice(0, target);
    syncDropNodes();
  }

  function collectDrop(drop) {
    if (drop.kind === "usdc") {
      score += 1;
      return;
    }
    if (drop.kind === "bonus") {
      score += 3;
      return;
    }
    if (drop.kind === "magnet") {
      activePower = { type: "magnet", name: "Magnet", until: performance.now() + 6500 };
      toast("Magnet active", "USDC drops bend toward the wallet.");
      return;
    }
    if (drop.kind === "slow") {
      activePower = { type: "slow", name: "Slow", until: performance.now() + 6200 };
      toast("Slow time", "The drop field is calmer for a few seconds.");
      return;
    }
    if (drop.kind === "shield") {
      shieldCharges = Math.min(3, shieldCharges + 1);
      toast("Shield collected", "The next missed USDC is covered.");
      return;
    }
    if (drop.kind === "life") {
      lives = Math.min(5, lives + 1);
      toast("Extra life", "Wallet health restored.");
    }
  }

  function abilityLabel(kind) {
    return {
      magnet: "M",
      slow: "S",
      shield: "SH",
      life: "+",
    }[kind] ?? "";
  }

  function start() {
    if (running) return;
    if (!drops.length) drops = Array.from({ length: targetDropCount() }, (_, index) => makeDrop(index * 60));
    syncDropNodes();
    running = true;
    lastTime = 0;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(tick);
  }

  function reset() {
    score = 0;
    lives = 1;
    activePower = null;
    shieldCharges = 0;
    drops = Array.from({ length: targetDropCount() }, (_, index) => makeDrop(index * 60));
    syncDropNodes();
    running = false;
    cancelAnimationFrame(frame);
    renderOnly();
  }

  function endGame() {
    running = false;
    cancelAnimationFrame(frame);
    renderOnly();
    toast("Game over", `${playerName} caught ${score} USDC drops. High score: ${highScore}.`);
  }

  function updatePlayerFromPointer(event) {
    const rect = board.getBoundingClientRect();
    playerX = Math.max(0.08, Math.min(0.92, (event.clientX - rect.left) / rect.width));
    renderOnly();
  }

  board.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    draggingPlayer = true;
    board.setPointerCapture?.(event.pointerId);
    updatePlayerFromPointer(event);
  }, { signal: controller.signal });

  board.addEventListener("pointermove", (event) => {
    if (!draggingPlayer && event.pointerType !== "mouse") return;
    event.preventDefault();
    updatePlayerFromPointer(event);
  }, { signal: controller.signal });

  board.addEventListener("pointerup", (event) => {
    draggingPlayer = false;
    board.releasePointerCapture?.(event.pointerId);
  }, { signal: controller.signal });

  board.addEventListener("pointercancel", () => {
    draggingPlayer = false;
  }, { signal: controller.signal });

  document.addEventListener("keydown", (event) => {
    if (!windows.has("game")) return;
    if (event.key === "ArrowLeft") playerX = Math.max(0.08, playerX - 0.06);
    if (event.key === "ArrowRight") playerX = Math.min(0.92, playerX + 0.06);
    renderOnly();
  }, { signal: controller.signal });

  leftButton?.addEventListener("click", () => {
    playerX = Math.max(0.08, playerX - 0.12);
    renderOnly();
  }, { signal: controller.signal });

  rightButton?.addEventListener("click", () => {
    playerX = Math.min(0.92, playerX + 0.12);
    renderOnly();
  }, { signal: controller.signal });

  startButton?.addEventListener("click", start, { signal: controller.signal });
  resetButton?.addEventListener("click", reset, { signal: controller.signal });
  reset();
}

function runCommand(raw, output) {
  const input = raw.trim();
  const command = input.toLowerCase();
  if (!command) return;

  terminalHistory.push(input);
  terminalHistory = terminalHistory.slice(-40);
  output.textContent += `\narc-machine:${terminalCwd} ${getLocalUsername()}$ ${raw}\n`;

  if (command === "clear") {
    output.textContent = `Last login: Tue Jun 23 on ArcShell\narc-machine:${terminalCwd} ${getLocalUsername()}$ `;
    return;
  }

  const response = handleCommand(input);
  output.textContent += `${response}\n`;
  output.scrollTop = output.scrollHeight;
}

function handleCommand(input) {
  const [rawCommand, ...args] = input.split(/\s+/);
  const command = rawCommand.toLowerCase();
  const arg = args.join(" ");

  if (command === "help") {
    return [
      "Commands:",
      "  ls [path]                 list files",
      "  tree [path]               show folder tree",
      "  find <text>               search files and notes",
      "  cd <path>                 change folder",
      "  pwd                       show current folder",
      "  open <file|folder|app>    open apps, folders, docs, links",
      "  cat <file>                read text files",
      "  wallpaper list            list wallpapers",
      "  wallpaper set <id>        change wallpaper",
      "  wallpaper current         show active wallpaper",
      "  calc <expr>               safe calculator",
      "  encode <text>             base64 encode text",
      "  decode <base64>           base64 decode text",
      "  memo new a=b c=d          build structured memo JSON",
      "  memo sample               show memo example",
      "  balance | gas | rpc       Arc testnet info",
      "  chain | status | memo     Arc shortcuts",
      "  apps                      list desktop apps",
      "  house | docs | appkit     open Arc resources",
      "  x | creator               open creator profile",
      "  bridge                    open App Kit Bridge docs",
      "  game                      open USDC Drop",
      "  highscore                 show USDC Drop high score",
      "  highscore reset           reset local high score",
      "  whoami                    show local username",
      "  username set <name>       rename local user",
      "  history                   show recent commands",
      "  uname                     system name",
      "  clear                     clear terminal",
    ].join("\n");
  }

  if (command === "pwd") return terminalCwd;
  if (command === "ls") return listPath(arg || terminalCwd);
  if (command === "tree") return treePath(arg || terminalCwd);
  if (command === "find") return findFiles(arg);
  if (command === "cd") return changeDirectory(arg || "/");
  if (command === "open") return openFromTerminal(arg);
  if (command === "cat") return catFile(arg);
  if (command === "wallpaper") return wallpaperCommand(args);
  if (command === "calc") return calculateExpression(arg);
  if (command === "encode") return encodeText(arg);
  if (command === "decode") return decodeText(arg);
  if (command === "whoami") return getLocalUsername();
  if (command === "username") return usernameCommand(args);
  if (command === "date") return new Date().toString();
  if (command === "uname") return "Arc Machine 1.0 Darwin-ish x86_64 stablecoin-native";
  if (command === "chain") return "Arc Testnet\nchainId=5042002\nnativeGas=USDC\nrpc=https://rpc.testnet.arc.network";
  if (command === "status") return "Arc Machine online. App Kit drivers loaded. Memo handler ready.";
  if (command === "memo") return memoCommand(args);
  if (command === "balance") return "Native Arc USDC balance: simulated desktop only. Use Arclet bridge page for live wallet balances.";
  if (command === "gas") return "Arc gas token: native USDC. Sepolia bridge source still needs ETH for gas.";
  if (command === "rpc") return "https://rpc.testnet.arc.network";
  if (command === "apps") return fileSystem["/Applications"].join("\n");
  if (command === "history") return terminalHistory.map((item, index) => `${index + 1}  ${item}`).join("\n");
  if (command === "highscore") return highScoreCommand(args);
  if (command === "docs") {
    window.open("https://docs.arc.io/", "_blank", "noopener,noreferrer");
    return "Opening Arc Docs...";
  }
  if (command === "appkit") {
    openWindow("appkit");
    return "Opening App Kit folder...";
  }
  if (command === "bridge") {
    window.open("https://arclet.xyz/bridge", "_blank", "noopener,noreferrer");
    return "Opening Arclet Bridge...";
  }
  if (command === "explorer" || command === "arcscan") {
    window.open("https://testnet.arcscan.app/", "_blank", "noopener,noreferrer");
    return "Opening Arcscan...";
  }
  if (command === "faucet") {
    window.open("https://faucet.circle.com/", "_blank", "noopener,noreferrer");
    return "Opening faucet...";
  }
  if (command === "game") {
    openWindow("game");
    return "Launching USDC Drop...";
  }
  if (command === "arclet") {
    window.open("https://arclet.xyz/", "_blank", "noopener,noreferrer");
    return "Opening Arclet...";
  }
  if (command === "sudo") return "Permission denied. This machine is user-owned.";
  if (command === "house" || command === "archouse" || command === "home" || command === "archome") {
    window.open("https://community.arc.io/home", "_blank", "noopener,noreferrer");
    return "Opening Arc House...";
  }
  if (command === "x" || command === "creator") {
    window.open("https://x.com/benyaminstyles", "_blank", "noopener,noreferrer");
    return "Opening Creator X...";
  }
  if (command === "secret") return "Try the Trash, hidden files, or the menu bar clock. Arc machines reward curiosity.";

  return `zsh: command not found: ${input}`;
}

function usernameCommand(args) {
  const subcommand = args[0]?.toLowerCase();
  if (subcommand !== "set") return "Usage: username set <name>";
  const username = normalizeUsername(args.slice(1).join("-"));
  if (!username) return "username: invalid name";
  localStorage.setItem("arc-machine-username", username);
  setUsername(username);
  return `Username set to ${username}`;
}

function memoCommand(args) {
  const subcommand = args[0]?.toLowerCase();
  if (!subcommand) return "Transaction memos attach structured business context to successful Arc contract calls.";
  if (subcommand === "sample") {
    return JSON.stringify({
      invoiceId: "ARC-2026-001",
      customer: "arc-machine",
      purpose: "checkout-reconciliation",
      chainId: 5042002,
    }, null, 2);
  }
  if (subcommand === "new") {
    const pairs = args.slice(1);
    if (!pairs.length) return "Usage: memo new invoice=ARC-1 customer=ben amount=12.5";
    const memo = {};
    pairs.forEach((pair) => {
      const [key, ...rest] = pair.split("=");
      if (!key || !rest.length) return;
      memo[key] = rest.join("=");
    });
    return Object.keys(memo).length ? JSON.stringify({ memo, createdAt: new Date().toISOString() }, null, 2) : "memo: use key=value pairs";
  }
  return "Usage: memo | memo sample | memo new key=value";
}

function highScoreCommand(args) {
  const key = "arc-machine-usdc-drop-high-score";
  if (args[0]?.toLowerCase() === "reset") {
    localStorage.setItem(key, "0");
    return "USDC Drop high score reset.";
  }
  return `USDC Drop high score: ${localStorage.getItem(key) ?? "0"}`;
}

function treePath(pathInput) {
  const root = normalizePath(pathInput);
  if (!fileSystem[root]) return `tree: ${pathInput}: No such directory`;
  const lines = [root];
  walkTree(root, "", lines, new Set([root]));
  return lines.join("\n");
}

function walkTree(path, prefix, lines, visited) {
  const items = fileSystem[path] ?? [];
  items.forEach((item, index) => {
    const last = index === items.length - 1;
    const childPath = `${path === "/" ? "" : path}/${item}`;
    lines.push(`${prefix}${last ? "`-- " : "|-- "}${item}`);
    if (fileSystem[childPath] && !visited.has(childPath)) {
      visited.add(childPath);
      walkTree(childPath, `${prefix}${last ? "    " : "|   "}`, lines, visited);
    }
  });
}

function findFiles(query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return "find: enter text to search";
  const paths = [];
  Object.entries(fileSystem).forEach(([folder, items]) => {
    items.forEach((item) => {
      if (item.toLowerCase().includes(needle)) paths.push(`${folder === "/" ? "" : folder}/${item}`);
    });
  });
  Object.entries(fileText).forEach(([name, text]) => {
    if (name.toLowerCase().includes(needle) || text.toLowerCase().includes(needle)) paths.push(`text:${name}`);
  });
  return paths.length ? [...new Set(paths)].join("\n") : `find: no matches for "${query}"`;
}

function calculateExpression(expression) {
  const clean = expression.trim();
  if (!clean) return "calc: enter an expression";
  if (!/^[\d+\-*/().\s%]+$/.test(clean)) return "calc: only numbers and arithmetic operators are allowed";
  try {
    const result = Function(`"use strict"; return (${clean});`)();
    return Number.isFinite(result) ? String(result) : "calc: invalid result";
  } catch {
    return "calc: invalid expression";
  }
}

function encodeText(value) {
  if (!value) return "encode: enter text";
  return btoa(unescape(encodeURIComponent(value)));
}

function decodeText(value) {
  if (!value) return "decode: enter base64 text";
  try {
    return decodeURIComponent(escape(atob(value)));
  } catch {
    return "decode: invalid base64";
  }
}

function listPath(pathInput) {
  const path = normalizePath(pathInput);
  const items = fileSystem[path];
  if (!items) return `ls: ${pathInput}: No such directory`;
  return items.join("\n");
}

function changeDirectory(pathInput) {
  const path = normalizePath(pathInput);
  if (!fileSystem[path]) return `cd: no such directory: ${pathInput}`;
  terminalCwd = path;
  return terminalCwd;
}

function openFromTerminal(target) {
  if (!target) return "open: missing file or app";
  const normalized = target.toLowerCase();
  const map = {
    applications: "applications",
    documents: "documents",
    "macintosh hd": "computer",
    system: "system",
    network: "network",
    contracts: "contracts",
    trash: "trash",
    "arc docs.app": "docs",
    "arc docs": "docs",
    "app kit.app": "appkit",
    "app kit": "appkit",
    "arc house.url": "arcHouse",
    "arc house": "arcHouse",
    "arc home.url": "arcHouse",
    "arc home": "arcHouse",
    "creator x.url": "creatorX",
    "creator x": "creatorX",
    "bridge usdc.url": "bridgeUsdc",
    "bridge usdc": "bridgeUsdc",
    "usdc drop.app": "game",
    "usdc drop": "game",
    terminal: "terminal",
    "terminal.app": "terminal",
    "system settings.app": "settings",
    settings: "settings",
    ".arc-cache": "arcCache",
    ".stablecoin-native": "systemSecret",
    "memo pad.note": "memos",
    "memo pad": "memos",
  };
  const windowName = map[normalized];
  if (windowName) {
    if (windowName === "arcHouse") {
      window.open("https://community.arc.io/home", "_blank", "noopener,noreferrer");
      return "Opening Arc House...";
    }
    if (windowName === "creatorX") {
      window.open("https://x.com/benyaminstyles", "_blank", "noopener,noreferrer");
      return "Opening Creator X...";
    }
    if (windowName === "bridgeUsdc") {
      window.open("https://arclet.xyz/bridge", "_blank", "noopener,noreferrer");
      return "Opening Arclet Bridge...";
    }
    openWindow(windowName);
    return `Opening ${target}...`;
  }
  if (normalized === "arcscan.url") {
    window.open("https://testnet.arcscan.app/", "_blank", "noopener,noreferrer");
    return "Opening Arcscan...";
  }
  if (normalized === "faucet.url") {
    window.open("https://faucet.circle.com/", "_blank", "noopener,noreferrer");
    return "Opening Faucet...";
  }
  return `open: ${target}: file not found`;
}

function catFile(target) {
  if (!target) return "cat: missing file";
  const clean = target.split("/").pop();
  const text = fileText[clean] ?? fileText[target];
  if (!text) return `cat: ${target}: not a text file`;
  return text;
}

function wallpaperCommand(args) {
  const subcommand = args[0]?.toLowerCase();
  if (subcommand === "list") return wallpapers.map((wallpaper) => `${wallpaper.id} - ${wallpaper.name}`).join("\n");
  if (subcommand === "current") {
    const current = desktop.dataset.wallpaper || "arc-dawn";
    return `${current} - ${wallpapers.find((wallpaper) => wallpaper.id === current)?.name ?? "Arc Dawn"}`;
  }
  if (subcommand === "set") {
    const id = args[1];
    if (!wallpapers.some((wallpaper) => wallpaper.id === id)) return `wallpaper: unknown wallpaper "${id}"`;
    setWallpaper(id);
    return `Wallpaper set to ${id}`;
  }
  return "Usage: wallpaper list | wallpaper set <id>";
}

function normalizePath(pathInput) {
  if (!pathInput || pathInput === ".") return terminalCwd;
  if (pathInput === "~") return "/";
  if (pathInput === "..") {
    if (terminalCwd === "/") return "/";
    const parts = terminalCwd.split("/").filter(Boolean);
    parts.pop();
    return parts.length ? `/${parts.join("/")}` : "/";
  }
  if (pathInput.startsWith("/")) return pathInput.replace(/\/+$/, "") || "/";
  return `${terminalCwd === "/" ? "" : terminalCwd}/${pathInput}`.replace(/\/+$/, "") || "/";
}

function toast(title, body) {
  document.querySelector(".secret-toast")?.remove();
  const node = document.createElement("div");
  node.className = "secret-toast";
  node.innerHTML = `<strong>${title}</strong><span>${body}</span>`;
  desktop.appendChild(node);
  setTimeout(() => node.remove(), 3600);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const konami = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
let konamiIndex = 0;

document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === konami[konamiIndex]) {
    konamiIndex += 1;
    if (konamiIndex === konami.length) {
      konamiIndex = 0;
      openWindow("deletedMemo");
      toast("Recovered file", "A memo draft came back from Trash.");
    }
  } else {
    konamiIndex = 0;
  }
});

applySavedWallpaper();
bindWindowLaunchers();
bootstrapFromQuery();

function bootstrapFromQuery() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("boot") !== "1") return;
  const username = normalizeUsername(params.get("username") || localStorage.getItem("arc-machine-username") || "ben");
  localStorage.setItem("arc-machine-username", username);
  setUsername(username);
  powerScreen.classList.add("hidden");
  bootScreen.classList.add("hidden");
  desktop.classList.remove("hidden");
  usernameModal.classList.add("hidden");
  updateClock();
  setInterval(updateClock, 1000);
  const panel = params.get("window");
  if (panel && content[panel]) requestAnimationFrame(() => openWindow(panel));
}
