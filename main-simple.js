const { app, BrowserWindow } = require("electron")
const path = require("path")

// Enable @electron/remote
require("@electron/remote/main").initialize()

let mainWindow

function createWindow() {
  console.log("🚀 Creating Uniware Wax window...")

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      webviewTag: true, // IMPORTANT pour webview
      enableRemoteModule: true,
    },
    frame: false,
    show: false,
  })

  // Enable remote
  require("@electron/remote/main").enable(mainWindow.webContents)

  // Load HTML
  mainWindow.loadFile("index.html")

  // Show when ready
  mainWindow.once("ready-to-show", () => {
    console.log("✅ Window ready!")
    mainWindow.show()
  })

  // Handle webview
  mainWindow.webContents.on("did-attach-webview", (event, webContents) => {
    console.log("🔗 Webview attached!")
    require("@electron/remote/main").enable(webContents)
  })

  mainWindow.on("closed", () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  console.log("⚡ App ready!")
  createWindow()
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

console.log("🚀 Uniware Wax starting...")
