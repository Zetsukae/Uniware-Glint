const { app, BrowserWindow } = require("electron")

// Enable @electron/remote
require("@electron/remote/main").initialize()

let mainWindow

function createWindow() {
  console.log("🚀 Creating window...")

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true,
      webSecurity: false,
    },
  })

  // Enable remote
  require("@electron/remote/main").enable(mainWindow.webContents)

  // Load HTML
  mainWindow.loadFile("index.html")

  mainWindow.on("closed", () => {
    mainWindow = null
  })

  console.log("✅ Window created!")
}

app.whenReady().then(createWindow)

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
