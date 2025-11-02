const { app, BrowserWindow, Menu, shell, dialog, ipcMain, session } = require("electron")
const path = require("path")

// Enable @electron/remote
require("@electron/remote/main").initialize()

// Keep a global reference of the window object
let mainWindow

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
      webSecurity: false,
      allowRunningInsecureContent: true,
      experimentalFeatures: true,
      webviewTag: true, // CRUCIAL pour les webviews
      nodeIntegrationInWorker: true,
      nodeIntegrationInSubFrames: true,
      plugins: true,
      sandbox: false, // Désactive le sandbox
      preload: undefined, // Pas de preload pour éviter les conflits
    },
    titleBarStyle: "hidden",
    frame: false,
    show: false,
  })

  // Enable @electron/remote for this window
  require("@electron/remote/main").enable(mainWindow.webContents)

  // IMPORTANT: Configuration spéciale pour webviews
  mainWindow.webContents.on("did-attach-webview", (event, webContents) => {
    console.log("🔗 Webview attached")

    // Enable remote for webview
    require("@electron/remote/main").enable(webContents)

    // Configure webview session
    webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
      console.log("📋 Webview permission request:", permission)
      callback(true) // Allow all permissions for webview
    })

    // Handle webview navigation
    webContents.on("will-navigate", (event, url) => {
      console.log("🧭 Webview navigating to:", url)
      // Allow all navigation in webviews
    })

    // Handle new windows in webview
    webContents.setWindowOpenHandler(({ url }) => {
      console.log("🔗 Webview opening:", url)
      shell.openExternal(url)
      return { action: "deny" }
    })
  })

  // Load the index.html file
  mainWindow.loadFile("index.html")

  // Show window when ready
  mainWindow.once("ready-to-show", () => {
    mainWindow.show()
    mainWindow.focus()
    console.log("✅ Window ready and shown")
  })

  // Open DevTools in development
  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools()
  }

  // Handle window closed
  mainWindow.on("closed", () => {
    mainWindow = null
  })

  // Handle external links in main window
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: "deny" }
  })

  console.log("🚀 Main window created")
}

// Enhanced web-contents handling for webviews
app.on("web-contents-created", (event, contents) => {
  console.log("📄 Web contents created:", contents.getType())

  if (contents.getType() === "webview") {
    console.log("🔗 Webview contents created")

    // Enable remote for webview contents
    require("@electron/remote/main").enable(contents)

    // Allow webview navigation
    contents.on("will-navigate", (event, navigationUrl) => {
      console.log("🧭 Webview will navigate to:", navigationUrl)
      // Allow all navigation in webviews
    })

    // Handle webview permissions
    contents.session.setPermissionRequestHandler((webContents, permission, callback) => {
      console.log("📋 Webview permission:", permission)
      callback(true)
    })
  } else {
    // For main window, be more restrictive
    contents.on("will-navigate", (event, navigationUrl) => {
      const parsedUrl = new URL(navigationUrl)
      if (parsedUrl.origin !== "file://") {
        console.log("🚫 Blocked navigation in main window to:", navigationUrl)
        event.preventDefault()
      }
    })
  }
})

// App event handlers
app.whenReady().then(() => {
  console.log("⚡ App ready, creating window...")

  // IMPORTANT: Disable web security globally for webviews
  app.commandLine.appendSwitch("--disable-web-security")
  app.commandLine.appendSwitch("--disable-features", "OutOfBlinkCors")
  app.commandLine.appendSwitch("--allow-running-insecure-content")

  createWindow()

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })

  createApplicationMenu()
})

// Quit when all windows are closed
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

// Handle certificate errors (allow all for webviews)
app.on("certificate-error", (event, webContents, url, error, certificate, callback) => {
  console.log("🔒 Certificate error for:", url, error)
  event.preventDefault()
  callback(true) // Allow all certificates
})

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

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
      label: "Affichage",
      submenu: [
        { label: "Recharger", accelerator: "CmdOrCtrl+R", role: "reload" },
        { label: "Outils de développement", accelerator: "F12", role: "toggleDevTools" },
        { type: "separator" },
        { label: "Plein écran", accelerator: "F11", role: "togglefullscreen" },
      ],
    },
    {
      label: "Aide",
      submenu: [
        {
          label: "À propos de Uniware Visa",
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "À propos de Uniware Visa",
              message: "Uniware Visa v1.3.0",
              detail: "Un navigateur web moderne et léger construit avec Electron.\n\nFait avec ❤ par Uniware Team",
              buttons: ["OK"],
            })
          },
        },
      ],
    },
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

console.log("🚀 Uniware Visa starting with webview support...")
