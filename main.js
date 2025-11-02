const { app, BrowserWindow, Menu, shell, dialog, ipcMain, session } = require("electron")
const path = require("path")
const fs = require("fs")

// Enable @electron/remote
require("@electron/remote/main").initialize()

// Keep a global reference of the window object
let mainWindow

// Enable live reload for development
if (process.env.NODE_ENV === "development") {
  try {
    require("electron-reload")(__dirname, {
      electron: path.join(__dirname, "..", "node_modules", ".bin", "electron"),
      hardResetMethod: "exit",
    })
  } catch (e) {
    console.log("electron-reload not available")
  }
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, "assets", "icon.png"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false, // Required for webview
      allowRunningInsecureContent: true,
      experimentalFeatures: true,
      webviewTag: true, // IMPORTANT: Active les webviews
      nodeIntegrationInWorker: true,
      nodeIntegrationInSubFrames: true,
      plugins: true,
    },
    titleBarStyle: "hidden", // Hide default title bar for custom one
    frame: false, // Remove window frame for custom title bar
    show: false, // Don't show until ready
  })

  // Enable @electron/remote for this window
  require("@electron/remote/main").enable(mainWindow.webContents)

  // Configure webview permissions
  mainWindow.webContents.on("did-attach-webview", (event, webContents) => {
    // Enable remote for webview
    require("@electron/remote/main").enable(webContents)

    // Allow webview to access node
    webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url)
      return { action: "deny" }
    })
  })

  // Load the index.html file
  mainWindow.loadFile("index.html")

  // Show window when ready to prevent visual flash
  mainWindow.once("ready-to-show", () => {
    mainWindow.show()

    // Focus the window
    if (process.platform === "darwin") {
      app.dock.show()
    }
    mainWindow.focus()
  })

  // Open DevTools in development
  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools()
  }

  // Handle window closed
  mainWindow.on("closed", () => {
    mainWindow = null
  })

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: "deny" }
  })

  // Security: Prevent new window creation
  mainWindow.webContents.on("new-window", (event, navigationUrl) => {
    event.preventDefault()
    shell.openExternal(navigationUrl)
  })

  // Handle webview permissions
  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    // Allow all permissions for webview functionality
    if (permission === "media" || permission === "geolocation" || permission === "notifications") {
      callback(true)
    } else {
      callback(false)
    }
  })

  // Configure session for better security and ad blocking
  const ses = mainWindow.webContents.session

  // Block ads and trackers at network level
  ses.webRequest.onBeforeRequest({ urls: ["*://*/*"] }, (details, callback) => {
    const url = details.url.toLowerCase()

    // List of ad/tracker domains to block
    const blockedDomains = [
      "doubleclick.net",
      "googlesyndication.com",
      "googleadservices.com",
      "amazon-adsystem.com",
      "facebook.com/tr",
      "google-analytics.com",
      "googletagmanager.com",
      "outbrain.com",
      "taboola.com",
      "criteo.com",
      "adsystem.com",
      "ads.yahoo.com",
      "scorecardresearch.com",
      "quantserve.com",
      "moatads.com",
      "adsafeprotected.com",
    ]

    const shouldBlock = blockedDomains.some((domain) => url.includes(domain))

    if (shouldBlock) {
      console.log("🛡️ Blocked:", url)
      callback({ cancel: true })
    } else {
      callback({ cancel: false })
    }
  })

  // Set custom user agent
  ses.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 UniwareGlint/1.0.0",
  )
}

// App event handlers
app.whenReady().then(() => {
  createWindow()

  // macOS: Re-create window when dock icon is clicked
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })

  // Set application menu
  createApplicationMenu()
})

// Quit when all windows are closed
app.on("window-all-closed", () => {
  // On macOS, keep app running even when all windows are closed
  if (process.platform !== "darwin") {
    app.quit()
  }
})

// Security: Prevent navigation to external protocols
app.on("web-contents-created", (event, contents) => {
  contents.on("will-navigate", (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl)

    if (parsedUrl.origin !== "file://") {
      // Allow navigation within webview
      if (contents.getType() === "webview") {
        return
      }

      // Block navigation in main window
      event.preventDefault()
    }
  })

  if (contents.getType() === "webview") {
    // Enable remote for webview contents
    require("@electron/remote/main").enable(contents)

    // Allow webview navigation
    contents.on("will-navigate", (event, navigationUrl) => {
      // Allow all navigation in webviews
      return
    })

    // Handle new windows in webview
    contents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url)
      return { action: "deny" }
    })
  }
})

// Create application menu
function createApplicationMenu() {
  const template = [
    {
      label: "Fichier",
      submenu: [
        {
          label: "Nouvel onglet",
          accelerator: "CmdOrCtrl+T",
          click: () => {
            mainWindow.webContents.executeJavaScript('ajouterOnglet("https://www.google.com", "Google")')
          },
        },
        {
          label: "Fermer l'onglet",
          accelerator: "CmdOrCtrl+W",
          click: () => {
            mainWindow.webContents.executeJavaScript("fermerOnglet(ongletActifIndex)")
          },
        },
        { type: "separator" },
        {
          label: "Paramètres",
          accelerator: "CmdOrCtrl+,",
          click: () => {
            mainWindow.webContents.executeJavaScript('document.getElementById("settingsBtn").click()')
          },
        },
        { type: "separator" },
        {
          label: "Quitter",
          accelerator: process.platform === "darwin" ? "Cmd+Q" : "Ctrl+Q",
          click: () => {
            app.quit()
          },
        },
      ],
    },
    {
      label: "Édition",
      submenu: [
        { label: "Annuler", accelerator: "CmdOrCtrl+Z", role: "undo" },
        { label: "Rétablir", accelerator: "Shift+CmdOrCtrl+Z", role: "redo" },
        { type: "separator" },
        { label: "Couper", accelerator: "CmdOrCtrl+X", role: "cut" },
        { label: "Copier", accelerator: "CmdOrCtrl+C", role: "copy" },
        { label: "Coller", accelerator: "CmdOrCtrl+V", role: "paste" },
        { label: "Tout sélectionner", accelerator: "CmdOrCtrl+A", role: "selectall" },
      ],
    },
    {
      label: "Affichage",
      submenu: [
        { label: "Recharger", accelerator: "CmdOrCtrl+R", role: "reload" },
        { label: "Forcer le rechargement", accelerator: "CmdOrCtrl+Shift+R", role: "forceReload" },
        { label: "Outils de développement", accelerator: "F12", role: "toggleDevTools" },
        { type: "separator" },
        { label: "Zoom avant", accelerator: "CmdOrCtrl+Plus", role: "zoomIn" },
        { label: "Zoom arrière", accelerator: "CmdOrCtrl+-", role: "zoomOut" },
        { label: "Taille réelle", accelerator: "CmdOrCtrl+0", role: "resetZoom" },
        { type: "separator" },
        { label: "Plein écran", accelerator: "F11", role: "togglefullscreen" },
      ],
    },
    {
      label: "Navigation",
      submenu: [
        {
          label: "Précédent",
          accelerator: "Alt+Left",
          click: () => {
            mainWindow.webContents.executeJavaScript("if (webview.canGoBack()) webview.goBack()")
          },
        },
        {
          label: "Suivant",
          accelerator: "Alt+Right",
          click: () => {
            mainWindow.webContents.executeJavaScript("if (webview.canGoForward()) webview.goForward()")
          },
        },
        {
          label: "Actualiser",
          accelerator: "F5",
          click: () => {
            mainWindow.webContents.executeJavaScript("webview.reload()")
          },
        },
      ],
    },
    {
      label: "Aide",
      submenu: [
        {
          label: "À propos de Uniware Glint",
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "À propos de Uniware Glint",
              message: "Uniware Glint v1.0.0",
              detail: "Un navigateur web moderne et léger construit avec Electron.\n\nFait avec ❤ par Uniware Team",
              buttons: ["OK"],
            })
          },
        },
        {
          label: "GitHub",
          click: () => {
            shell.openExternal("https://github.com/Zetsukae/uniware.site")
          },
        },
      ],
    },
  ]

  // macOS specific menu adjustments
  if (process.platform === "darwin") {
    template.unshift({
      label: app.getName(),
      submenu: [
        { label: "À propos de " + app.getName(), role: "about" },
        { type: "separator" },
        { label: "Services", role: "services", submenu: [] },
        { type: "separator" },
        { label: "Masquer " + app.getName(), accelerator: "Command+H", role: "hide" },
        { label: "Masquer les autres", accelerator: "Command+Shift+H", role: "hideothers" },
        { label: "Tout afficher", role: "unhide" },
        { type: "separator" },
        { label: "Quitter", accelerator: "Command+Q", click: () => app.quit() },
      ],
    })
  }

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// Handle certificate errors
app.on("certificate-error", (event, webContents, url, error, certificate, callback) => {
  // Allow all certificates for development
  event.preventDefault()
  callback(true)
})

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on("second-instance", () => {
    // Someone tried to run a second instance, focus our window instead
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

// Auto-updater (optional)
if (process.env.NODE_ENV === "production") {
  // Add auto-updater logic here if needed
}

console.log("🚀 Uniware Glint DEV version starting... - This may take a while. TY for using our app.")