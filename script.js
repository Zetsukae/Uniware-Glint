console.log("JS chargé correctement")
const { getCurrentWindow } = require("@electron/remote")
const { shell } = require("electron")
const win = getCurrentWindow()

// App version
const APP_VERSION = "1.0.0"
const LATEST_VERSION = "1.0.0"

// Language system
let currentLanguage = localStorage.getItem("language") || "fr"

// Layout system
let currentLayout = localStorage.getItem("layout") || "vivaldi"

// Add after the layout system variables
let browsingHistory = JSON.parse(localStorage.getItem("browsingHistory") || "[]")

// Favicon cache
const faviconCache = {}

let currentThemeColor = localStorage.getItem("themeColor") || "#1a1a1a"

function applyThemeColor(color) {
  const root = document.documentElement

  // Convert hex to RGB for lighter/darker variants
  const hex = color.replace("#", "")
  const r = Number.parseInt(hex.substr(0, 2), 16)
  const g = Number.parseInt(hex.substr(2, 2), 16)
  const b = Number.parseInt(hex.substr(4, 2), 16)

  const lighter = `rgb(${Math.min(255, r + 60)}, ${Math.min(255, g + 60)}, ${Math.min(255, b + 60)})`
  const darker = `rgb(${Math.min(255, Math.max(30, r + 16))}, ${Math.min(255, Math.max(30, g + 16))}, ${Math.min(255, Math.max(30, b + 16))})`

  // Apply colors to CSS variables
  root.style.setProperty("--primary-color", color)
  root.style.setProperty("--primary-color-light", lighter)
  root.style.setProperty("--primary-color-dark", darker)

  // Reset all previously modified elements first
  const allElements = document.querySelectorAll("*")
  allElements.forEach((el) => {
    if (el.hasAttribute("data-theme-modified")) {
      el.style.backgroundColor = ""
      el.removeAttribute("data-theme-modified")
    }
  })

  // Update specific elements that need the new color
  document.body.style.background = color
  document.body.setAttribute("data-theme-modified", "true")

  const zoneBarre = document.getElementById("zone-barre")
  if (zoneBarre) {
    zoneBarre.style.background = color
    zoneBarre.setAttribute("data-theme-modified", "true")
  }

  // Update all elements with default dark colors
  allElements.forEach((el) => {
    const computedStyle = window.getComputedStyle(el)
    const bgColor = computedStyle.backgroundColor

    if (bgColor === "rgb(26, 26, 26)" || bgColor === "rgb(34, 34, 34)") {
      el.style.backgroundColor = color
      el.setAttribute("data-theme-modified", "true")
    } else if (bgColor === "rgb(51, 51, 51)") {
      el.style.backgroundColor = lighter
      el.setAttribute("data-theme-modified", "true")
    }
  })
}

function changeThemeColor(color) {
  currentThemeColor = color
  localStorage.setItem("themeColor", color)
  applyThemeColor(color)

  // Show success notification
  showToast(t("themeColorChanged"), "success")
}

function resetThemeColor() {
  changeThemeColor("#1a1a1a")
}

// Apply saved theme color on load
document.addEventListener("DOMContentLoaded", () => {
  applyThemeColor(currentThemeColor)
})

const translations = {
  fr: {
    searchGoogle: "Recherche Google ou URL…",
    searchTabs: "Recherche onglets…",
    newTab: "+ Nouvel onglet",
    adBlocker: "Bloqueur de pub",
    adBlockerEnabled: "Bloqueur activé",
    adBlockerDisabled: "Bloqueur désactivé",
    settings: "Paramètres",
    general: "Général",
    closeTab: "Fermer l'onglet",
    resizeBar: "Redimensionner la barre",
    version: "Version",
    sidebarWidth: "Largeur de la barre latérale",
    tabCount: "Nombre d'onglets",
    adBlockerStatus: "Bloqueur de publicité",
    searchEngine: "Moteur de recherche",
    google: "Google",
    qwant: "Qwant",
    duckduckgo: "DuckDuckGo",
    searx: "SearX",
    startpage: "Startpage",
    brave: "Brave Search",
    ecosia: "Ecosia",
    swisscows: "Swisscows",
    metager: "MetaGer",
    enabled: "Activé (Renforcé)",
    disabled: "Désactivé",
    about: "À propos",
    aboutText: "est un navigateur web moderne et léger construit avec Electron.",
    aboutDescription:
      "Conçu pour offrir une expérience de navigation fluide avec des fonctionnalités avancées comme le blocage de publicités renforcé et la gestion d'onglets.<br> Basé sur Uniware Visa.",
    madeWithLove: "Fait avec ❤ par Uniware Team",
    checkUpdates: "🔄 Voir les mises à jour",
    upToDate: "✅ Vous êtes à jour !",
    close: "Fermer",
    cancel: "Annuler",
    language: "Langue",
    french: "Français",
    english: "English",
    layout: "Disposition",
    sidebar: "Barre latérale",
    highbar: "Barre haute",
    topbar: "Barre haute",
    history: "Historique",
    clearHistory: "Effacer l'historique",
    noHistory: "Aucun historique disponible",
    confirmClearHistory: "Êtes-vous sûr de vouloir effacer tout l'historique ?",
    historyCleared: "Historique effacé",
    dangerZone: "Zone de danger",
    deleteApp: "Supprimer l'application",
    deleteCache: "Vider le cache",
    uninstallApp: "Désinstaller l'application",
    confirmDeleteApp: "Êtes-vous sûr de vouloir supprimer toutes les données de l'application ?",
    confirmDeleteCache: "Êtes-vous sûr de vouloir vider le cache ?",
    confirmUninstallApp: "Êtes-vous sûr de vouloir désinstaller Uniware Glint ?",
    uninstallerNotFound: "Impossible de trouver le programme de désinstallation. Pour désinstaller l'app, aller dans les paramètres de votre système d'exploitation.",
    appDeleted: "Données supprimées",
    cacheCleared: "Cache vidé",
    shortcuts: "Raccourcis",
    shortcutsDesc: "Personnalisez les raccourcis clavier",
    resetShortcuts: "Réinitialiser les raccourcis",
    confirmResetShortcuts: "Réinitialiser tous les raccourcis par défaut ?",
    shortcutsResetSuccess: "Raccourcis réinitialisés par défaut",
    shortcutInUse: "Ce raccourci est déjà utilisé",
    enterShortcut: "Appuyez sur les touches...",
    shortcutSaved: "Raccourci sauvegardé",
    // Added translations for personalization
    personalization: "Personnalisation",
    appColor: "Couleur de l'application",
    appColorDesc: "Personnalisez la couleur principale de l'interface",
    selectColor: "Sélectionner une couleur",
    reset: "Réinitialiser",
    themeColorChanged: "La couleur du thème a été changée.",
    // Added translations for scrollbar customization
    scrollbarStyle: "Style de la barre de défilement",
    scrollbarStyleDesc: "Personnalisez l'apparence des barres de défilement",
    modern: "Moderne",
    minimalist: "Minimaliste",
    macOS: "macOS",
    dark: "Sombre",
    colorful: "Coloré",
    hideScrollbars: "Masquer",
  },
  en: {
    searchGoogle: "Google search or URL…",
    searchTabs: "Search tabs…",
    newTab: "+ New tab",
    adBlocker: "Ad Blocker",
    adBlockerEnabled: "Blocker enabled",
    adBlockerDisabled: "Blocker disabled",
    settings: "Settings",
    general: "General",
    closeTab: "Close tab",
    resizeBar: "Resize sidebar",
    version: "Version",
    sidebarWidth: "Sidebar width",
    tabCount: "Tab count",
    adBlockerStatus: "Ad blocker",
    searchEngine: "Search engine",
    google: "Google",
    qwant: "Qwant",
    duckduckgo: "DuckDuckGo",
    searx: "SearX",
    startpage: "Startpage",
    brave: "Brave Search",
    ecosia: "Ecosia",
    swisscows: "Swisscows",
    metager: "MetaGer",
    enabled: "Enabled (Enhanced)",
    disabled: "Disabled",
    about: "About",
    aboutText: "is a modern and lightweight web browser built with Electron.",
    aboutDescription:
      "Designed to provide a smooth browsing experience with advanced features like enhanced ad blocking and tab management.<br> Based on Uniware Visa.",
    madeWithLove: "Made with ❤ by Uniware Team",
    checkUpdates: "🔄 Check for updates",
    upToDate: "✅ You are up to date!",
    close: "Close",
    cancel: "Cancel",
    language: "Language",
    french: "Français",
    english: "English",
    layout: "Layout",
    sidebar: "Top bar",
    highbar: "Top bar",
    topbar: "Top bar",
    history: "History",
    clearHistory: "Clear history",
    noHistory: "No history available",
    confirmClearHistory: "Are you sure you want to clear all history?",
    historyCleared: "History cleared",
    dangerZone: "Danger zone",
    deleteApp: "Delete application",
    clearCache: "Clear cache",
    uninstallApp: "Uninstall application",
    confirmDeleteApp: "Are you sure you want to delete all application data?",
    confirmDeleteCache: "Are you sure you want to clear the cache?",
    confirmUninstallApp: "Are you sure you want to uninstall Uniware Glint?",
    uninstallerNotFound: "Unable to find the uninstaller program. To uninstall the app, go to your operating system settings.",
    appDeleted: "Data deleted",
    cacheCleared: "Cache cleared",
    shortcuts: "Shortcuts",
    shortcutsDesc: "Customize keyboard shortcuts",
    resetShortcuts: "Reset Shortcuts",
    confirmResetShortcuts: "Reset all shortcuts to default?",
    shortcutsResetSuccess: "Shortcuts reset to default",
    shortcutInUse: "This shortcut is already in use",
    enterShortcut: "Press keys...",
    shortcutSaved: "Shortcut saved",
    // Added translations for personalization
    personalization: "Personalization",
    appColor: "App Color",
    appColorDesc: "Customize the main interface color",
    selectColor: "Select color",
    reset: "Reset",
    themeColorChanged: "Theme color has been changed.",
    // Added translations for scrollbar customization
    scrollbarStyle: "Scrollbar Style",
    scrollbarStyleDesc: "Customize the appearance of scrollbars",
    modern: "Modern",
    minimalist: "Minimalist",
    macOS: "macOS",
    dark: "Dark",
    colorful: "Colorful",
    hideScrollbars: "Hide",
  },
}

function t(key) {
  return translations[currentLanguage][key] || translations.fr[key] || key
}

function updateLanguage() {
  // Update placeholders
  document.getElementById("searchBarGoogle").placeholder = t("searchGoogle")
  document.getElementById("searchBarOnglets").placeholder = t("searchTabs")
  document.getElementById("nav-url-bar").placeholder = t("searchGoogle")

  // Update button texts
  document.getElementById("ajouterOnglet").textContent = t("newTab")
  document.querySelector("#settingsBtn span").textContent = t("settings")
  document.getElementById("dragHandle").title = t("resizeBar")

  // Update ad blocker button
  updateAdBlockerUI()

  // Update any existing tab close button titles
  document.querySelectorAll(".btn-fermer, .close-btn").forEach((btn) => {
    btn.title = t("closeTab")
  })
}

function updateLayout() {
  const mainContainer = document.getElementById("main-container")
  const titlebarTabs = document.getElementById("titlebar-tabs")
  const navigationBar = document.getElementById("navigation-bar")
  const zoneBarre = document.getElementById("zone-barre")
  const titlebarControls = document.querySelector(".titlebar-controls")

  if (currentLayout === "vivaldi") {
    mainContainer.classList.add("vivaldi-layout")
    mainContainer.classList.remove("sidebar-layout")
    titlebarTabs.classList.add("active")
    navigationBar.classList.add("active")
    zoneBarre.classList.add("vivaldi-mode")
    if (titlebarControls) titlebarControls.style.display = "none"
    majAffichageOngletsVivaldi()
  } else {
    mainContainer.classList.remove("vivaldi-layout")
    mainContainer.classList.add("sidebar-layout")
    titlebarTabs.classList.remove("active")
    navigationBar.classList.remove("active")
    zoneBarre.classList.remove("vivaldi-mode")
    if (titlebarControls) titlebarControls.style.display = "flex"
    if (currentLayout === "sidebar") {
      majAffichageOnglets()
    }
  }
}

function changeLayout(newLayout) {
  currentLayout = newLayout
  localStorage.setItem("layout", newLayout)
  updateLayout()

  // Close settings modal and reopen to show updated layout
  const modal = document.querySelector('[style*="position: fixed"]')
  if (modal) {
    modal.remove()
    setTimeout(() => {
      ouvrirParametres()
    }, 100)
  }
}

// Add history management functions after the existing functions
function addToHistory(url, title) {
  if (url === "./pages/home.html" || url.includes("home.html")) {
    return // Don't add home page to history
  }

  const historyItem = {
    url: url,
    title: title || url,
    timestamp: Date.now(),
    date: new Date().toLocaleDateString(currentLanguage === "fr" ? "fr-FR" : "en-US"),
  }

  // Remove duplicate entries for the same URL
  browsingHistory = browsingHistory.filter((item) => item.url !== url)

  // Add to beginning of array
  browsingHistory.unshift(historyItem)

  // Keep only last 100 entries
  if (browsingHistory.length > 100) {
    browsingHistory = browsingHistory.slice(0, 100)
  }

  localStorage.setItem("browsingHistory", JSON.stringify(browsingHistory))
}

function clearHistory() {
  browsingHistory = []
  localStorage.setItem("browsingHistory", JSON.stringify(browsingHistory))
}

function removeHistoryItem(url) {
  browsingHistory = browsingHistory.filter((item) => item.url !== url)
  localStorage.setItem("browsingHistory", JSON.stringify(browsingHistory))
}

// Enhanced favicon functionality
async function getFaviconUrl(url) {
  try {
    const urlObj = new URL(url)
    const domain = urlObj.hostname

    // Check cache first
    if (faviconCache[domain]) {
      return faviconCache[domain]
    }

    // Try multiple favicon sources in order of preference
    const faviconSources = [
      // Google's favicon service (most reliable)
      `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
      // DuckDuckGo favicon service
      `https://icons.duckduckgo.com/ip3/${domain}.ico`,
      // Website's own favicon
      `${urlObj.protocol}//${domain}/favicon.ico`,
      `${urlObj.protocol}//${domain}/favicon.png`,
      `${urlObj.protocol}//${domain}/apple-touch-icon.png`,
      // Fallback services
      `https://favicons.githubusercontent.com/${domain}`,
      `https://icon.horse/icon/${domain}`,
    ]

    // Try each source until one works
    for (const faviconUrl of faviconSources) {
      try {
        const response = await fetch(faviconUrl, {
          method: "HEAD",
          timeout: 3000,
          mode: "no-cors",
        })

        // For no-cors requests, we can't check status, so we assume it worked
        // Google's service is very reliable, so we'll use it as primary
        faviconCache[domain] = faviconUrl
        return faviconUrl
      } catch (e) {
        continue
      }
    }

    // If all fail, use Google's service as fallback (it almost always works)
    const fallbackUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
    faviconCache[domain] = fallbackUrl
    return fallbackUrl
  } catch (e) {
    // Ultimate fallback - generic page icon
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiByeD0iMiIgZmlsbD0iIzMzMzMzMyIvPgo8cGF0aCBkPSJNNCA2SDEyVjEwSDRWNloiIGZpbGw9IiM2NjY2NjYiLz4KPC9zdmc+"
  }
}

async function createFaviconElement(url, isVivaldi = false) {
  const favicon = document.createElement("img")
  favicon.className = "tab-favicon"
  favicon.alt = ""

  // Set loading placeholder
  favicon.src =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiByeD0iMiIgZmlsbD0iIzMzMzMzMyIvPgo8cGF0aCBkPSJNNCA2SDEyVjEwSDRWNloiIGZpbGw9IiM2NjY2NjYiLz4KPC9zdmc+"

  // Get the actual favicon URL and update
  try {
    const faviconUrl = await getFaviconUrl(url)
    favicon.src = faviconUrl
  } catch (e) {
    // Keep the placeholder if favicon loading fails
  }

  // Additional error handling
  favicon.onerror = function () {
    // Try Google's favicon service as final fallback
    try {
      const urlObj = new URL(url)
      this.src = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`
    } catch (e) {
      // Keep the placeholder
    }
  }

  return favicon
}



document.getElementById("btn-minimize").addEventListener("click", () => win.minimize())
document.getElementById("btn-maximize").addEventListener("click", () => {
  win.isMaximized() ? win.unmaximize() : win.maximize()
})
document.getElementById("btn-close").addEventListener("click", () => win.close())

const ongletsContainer = document.getElementById("onglets")
const boutonPlus = document.getElementById("ajouterOnglet")
const webview = document.getElementById("webview")
const btnBack = document.getElementById("retour")
const btnForward = document.getElementById("avancer")
const btnReload = document.getElementById("actualiser")
const searchBarGoogle = document.getElementById("searchBarGoogle")
const searchBarOnglets = document.getElementById("searchBarOnglets")

// HB elements
const titlebarTabs = document.getElementById("titlebar-tabs")
const titlebarAddTab = document.getElementById("titlebar-add-tab")
const navBack = document.getElementById("nav-back")
const navForward = document.getElementById("nav-forward")
const navReload = document.getElementById("nav-reload")
const navUrlBar = document.getElementById("nav-url-bar")
const navAdBlocker = document.getElementById("nav-adblocker")
const navSettings = document.getElementById("nav-settings")

let tabs = []
let activeTabIndex = 0

let currentSearchEngine = localStorage.getItem("searchEngine") || "google"



const searchEngines = {
  google: "https://www.google.com/search?q=",
  qwant: "https://www.qwant.com/?q=",
  duckduckgo: "https://duckduckgo.com/?q=",
  searx: "https://searx.org/search?q=",
  startpage: "https://www.startpage.com/sp/search?query=",
  brave: "https://search.brave.com/search?q=",
  ecosia: "https://www.ecosia.org/search?q=",
  swisscows: "https://swisscows.com/web?query=",
  metager: "https://metager.org/meta/meta.ger3?eingabe=",
}

const homePages = {
  google: { url: "https://www.google.com", title: "Google" },
  qwant: { url: "https://www.qwant.com", title: "Qwant" },
  duckduckgo: { url: "https://duckduckgo.com", title: "DuckDuckGo" },
  searx: { url: "https://searx.org", title: "SearX" },
  startpage: { url: "https://www.startpage.com", title: "Startpage" },
  brave: { url: "https://search.brave.com", title: "Brave Search" },
  ecosia: { url: "https://www.ecosia.org", title: "Ecosia" },
  swisscows: { url: "https://swisscows.com", title: "Swisscows" },
  metager: { url: "https://metager.org", title: "MetaGer" },
}

function getHomeForEngine(engine) {
  return homePages[engine] || homePages.google
}



function changeSearchEngine(engine) {
  currentSearchEngine = engine
  localStorage.setItem("searchEngine", engine)
  // Ne touche pas aux onglets existants !
  // Le nouveau moteur sera utilisé pour les nouvelles recherches ou nouveaux onglets.
}

function loadTabs() {
  const { url, title } = getHomeForEngine(currentSearchEngine)
  tabs = [{ url, title }]
  activeTabIndex = 0
  loadTab(0)
}

function saveTabs() {
  localStorage.setItem("tabs", JSON.stringify(tabs))
  localStorage.setItem("activeTabIndex", activeTabIndex)
}

function updateNav() {
  btnBack.disabled = !webview.canGoBack()
  btnForward.disabled = !webview.canGoForward()
  navBack.disabled = !webview.canGoBack()
  navForward.disabled = !webview.canGoForward()
  
  const titlebarBack = document.getElementById("titlebar-back")
  const titlebarForward = document.getElementById("titlebar-forward")
  if (titlebarBack) titlebarBack.disabled = !webview.canGoBack()
  if (titlebarForward) titlebarForward.disabled = !webview.canGoForward()
}

async function updateSidebarTabs() {
  if (currentLayout !== "sidebar") return
  
  ongletsContainer.innerHTML = ''
  
  for (let i = 0; i < tabs.length; i++) {
    const tab = tabs[i]
    const div = document.createElement("div")
    div.className = "onglet" + (i === activeTabIndex ? " actif" : "")
    
    const favicon = await createFaviconElement(tab.url)
    const title = document.createElement("span")
    title.textContent = tab.title
    
    const closeBtn = document.createElement("button")
    closeBtn.textContent = "✕"
    closeBtn.onclick = (e) => { e.stopPropagation(); closeTab(i) }
    
    div.appendChild(favicon)
    div.appendChild(title)
    div.appendChild(closeBtn)
    div.onclick = () => loadTab(i)
    
    ongletsContainer.appendChild(div)
  }
  
  ongletsContainer.appendChild(boutonPlus)
}

async function updateVivaldiTabs() {
  if (currentLayout !== "vivaldi") return
  
  const wrapper = document.getElementById("titlebar-tabs-wrapper")
  wrapper.innerHTML = ''
  
  for (let i = 0; i < tabs.length; i++) {
    const tab = tabs[i]
    const btn = document.createElement("button")
    btn.className = "titlebar-tab" + (i === activeTabIndex ? " active" : "")
    
    const favicon = await createFaviconElement(tab.url)
    const title = document.createElement("span")
    title.textContent = tab.title
    
    const closeBtn = document.createElement("button")
    closeBtn.textContent = "✕"
    closeBtn.onclick = (e) => { e.stopPropagation(); closeTab(i) }
    
    btn.appendChild(favicon)
    btn.appendChild(title)
    btn.appendChild(closeBtn)
    btn.onclick = () => loadTab(i)
    
    wrapper.appendChild(btn)
  }
}

function addTab(url, title) {
  tabs.push({ url, title })
  activeTabIndex = tabs.length - 1
  loadTab(activeTabIndex)
  updateTabs()
}

function closeTab(index) {
  if (tabs.length === 1) {
    tabs = [{ url: "./pages/home.html", title: "Accueil" }]
    activeTabIndex = 0
  } else {
    tabs.splice(index, 1)
    if (activeTabIndex >= tabs.length) activeTabIndex = tabs.length - 1
  }
  loadTab(activeTabIndex)
  updateTabs()
}

function loadTab(index) {
  if (index < 0 || index >= tabs.length) return
  activeTabIndex = index
  const tab = tabs[index]
  webview.src = tab.url
  
  searchBarGoogle.value = tab.url
  navUrlBar.value = tab.url
  
  updateTabs()
}

function updateTabs() {
  if (currentLayout === "sidebar") {
    updateSidebarTabs()
  } else {
    updateVivaldiTabs()
  }
}

webview.addEventListener("did-finish-load", async () => {
  try {
    const title = await webview.getTitle()
    const url = webview.getURL()
    tabs[activeTabIndex].title = title || url
    tabs[activeTabIndex].url = url
    
    searchBarGoogle.value = url
    navUrlBar.value = url
    
    updateTabs()
    
    if (adBlockerEnabled) {
      appliquerBlocagePublicite()
    }
    addToHistory(url, title)
  } catch {}
})

// Sidebar navigation
btnBack.addEventListener("click", () => {
  if (webview.canGoBack()) webview.goBack()
})
btnForward.addEventListener("click", () => {
  if (webview.canGoForward()) webview.goForward()
})
btnReload.addEventListener("click", () => webview.reload())

// Vivaldi navigation
navBack.addEventListener("click", () => {
  if (webview.canGoBack()) webview.goBack()
})
navForward.addEventListener("click", () => {
  if (webview.canGoForward()) webview.goForward()
})
navReload.addEventListener("click", () => webview.reload())
titlebarAddTab.onclick = () => {
  const { url, title } = getHomeForEngine(currentSearchEngine)
  addTab(url, title)
}
navAdBlocker.addEventListener("click", () => {
  adBlockerEnabled = !adBlockerEnabled
  localStorage.setItem("adBlockerEnabled", adBlockerEnabled)
  updateAdBlockerUI()

  if (adBlockerEnabled) {
    appliquerBlocagePublicite()
  } else {
    webview.reload()
  }
})
navSettings.addEventListener("click", () => ouvrirParametres())

// Titlebar button event listeners
document.getElementById("titlebar-settings").addEventListener("click", () => ouvrirParametres())
document.getElementById("titlebar-adblocker").addEventListener("click", () => {
  adBlockerEnabled = !adBlockerEnabled
  localStorage.setItem("adBlockerEnabled", adBlockerEnabled)
  updateAdBlockerUI()

  if (adBlockerEnabled) {
    appliquerBlocagePublicite()
  } else {
    webview.reload()
  }
})

// Titlebar navigation event listeners
document.getElementById("titlebar-back").addEventListener("click", () => {
  if (webview.canGoBack()) webview.goBack()
})
document.getElementById("titlebar-forward").addEventListener("click", () => {
  if (webview.canGoForward()) webview.goForward()
})
document.getElementById("titlebar-reload").addEventListener("click", () => webview.reload())

// Titlebar URL bar event listener
const titlebarUrlBar = document.getElementById("titlebar-url-bar")
titlebarUrlBar.addEventListener("keydown", (e) => handleSearchInput(e, titlebarUrlBar))
titlebarUrlBar.addEventListener("click", function() { this.select() })
titlebarUrlBar.addEventListener("focus", function() {
  setTimeout(() => { this.select() }, 10)
})

webview.addEventListener("did-navigate", () => {
  updateNav()
  const url = webview.getURL()
  if (url && activeTabIndex >= 0 && activeTabIndex < tabs.length) {
    tabs[activeTabIndex].url = url
    searchBarGoogle.value = url
    navUrlBar.value = url
  }
})
webview.addEventListener("did-navigate-in-page", () => {
  updateNav()
  const url = webview.getURL()
  if (url && activeTabIndex >= 0 && activeTabIndex < tabs.length) {
    tabs[activeTabIndex].url = url
    searchBarGoogle.value = url
    navUrlBar.value = url
  }
})

function handleSearchInput(e, searchInput) {
  if (e.key === "Enter") {
    let val = searchInput.value.trim()
    if (!val) return
    const urlPattern = /^(https?:\/\/)/i
    const domainPattern = /^[a-z0-9-]+(\.[a-z0-9-]+)+(:\d+)?(\/.*)?$/i
    if (urlPattern.test(val)) {
    } else if (domainPattern.test(val)) {
      val = "https://" + val
    } else {
      val = searchEngines[currentSearchEngine] + encodeURIComponent(val)
    }
    tabs[activeTabIndex].url = val
    tabs[activeTabIndex].title = val
    webview.src = val
  }
}

searchBarGoogle.addEventListener("keydown", (e) => handleSearchInput(e, searchBarGoogle))
navUrlBar.addEventListener("keydown", (e) => handleSearchInput(e, navUrlBar))

boutonPlus.onclick = () => {
  const { url, title } = getHomeForEngine(currentSearchEngine)
  addTab(url, title)
}

// URL bar click to select all functionality
searchBarGoogle.addEventListener("click", function () {
  this.select()
})

navUrlBar.addEventListener("click", function () {
  this.select()
})

// Also add focus event for better UX (select all when tabbing into the field)
searchBarGoogle.addEventListener("focus", function () {
  // Small delay to ensure the focus event completes before selecting
  setTimeout(() => {
    this.select()
  }, 10)
})

navUrlBar.addEventListener("focus", function () {
  // Small delay to ensure the focus event completes before selecting
  setTimeout(() => {
    this.select()
  }, 10)
})

// FIXED: Improved drag handle functionality with 300px max width
const dragHandle = document.getElementById("dragHandle")
const ongletsDiv = document.getElementById("onglets")
let isDragging = false
let startX = 0
let startWidth = 0

function startDrag(e) {
  isDragging = true
  startX = e.clientX
  startWidth = ongletsDiv.offsetWidth

  // Add visual feedback
  document.body.classList.add("dragging")
  document.body.style.userSelect = "none"

  // Prevent text selection and other interactions
  e.preventDefault()
  e.stopPropagation()
}

function stopDrag() {
  if (isDragging) {
    isDragging = false
    document.body.classList.remove("dragging")
    document.body.style.userSelect = ""
    sauvegarderEtatLargeur()
  }
}

function handleDrag(e) {
  if (!isDragging) return

  e.preventDefault()
  e.stopPropagation()

  const deltaX = e.clientX - startX
  const newWidth = startWidth + deltaX

  const minWidth = 150
  const maxWidth = 300 // Changed from 600px to 300px

  const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
  ongletsDiv.style.width = clampedWidth + "px"
  document.documentElement.style.setProperty('--sidebar-width', clampedWidth + 'px')
}

// Mouse events
dragHandle.addEventListener("mousedown", startDrag)

// Use document for mouse events to capture them even when mouse leaves the drag handle
document.addEventListener("mouseup", stopDrag)
document.addEventListener("mousemove", handleDrag)

// Additional safety: stop dragging when mouse leaves the window
document.addEventListener("mouseleave", stopDrag)

// Handle context menu to prevent issues
dragHandle.addEventListener("contextmenu", (e) => e.preventDefault())

// Keyboard escape to stop dragging
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && isDragging) {
    stopDrag()
  }
})

function sauvegarderEtatLargeur() {
  const width = ongletsDiv.offsetWidth
  localStorage.setItem("sidebarWidth", width)
  document.documentElement.style.setProperty('--sidebar-width', width + 'px')
}

function chargerEtatLargeur() {
  let w = localStorage.getItem("sidebarWidth")
  if (w) {
    w = Number.parseInt(w, 10)
    if (!isNaN(w)) {
      if (w < 150) w = 150
      if (w > 300) w = 300 // Changed from 600px to 300px
      ongletsDiv.style.width = w + "px"
      document.documentElement.style.setProperty('--sidebar-width', w + 'px')
    }
  } else {
    document.documentElement.style.setProperty('--sidebar-width', '150px')
  }
}

// Enhanced Ad Blocker functionality
let adBlockerEnabled = localStorage.getItem("adBlockerEnabled") === "true"
const adBlockerBtn = document.getElementById("adblocker")

function appliquerBlocagePublicite() {
  if (!adBlockerEnabled) return

  // ENHANCED: Comprehensive CSS blocking rules with more patterns
  const blocageCSS = `
  /* === GENERIC AD SELECTORS === */
  [class*="ad"], [id*="ad"], [class*="banner"], [id*="banner"],
  [class*="popup"], [id*="popup"], [class*="overlay"], [id*="overlay"],
  [class*="modal"], [id*="modal"], [class*="advertisement"], [id*="advertisement"],
  [class*="sponsor"], [id*="sponsor"], [class*="promo"], [class*="promo"],
  [class*="commercial"], [class*="marketing"], [class*="marketing"],
  
  /* === SPECIFIC AD CLASSES === */
  .advertisement, .ads, .google-ads, .adsystem, .ad-container, .ad-wrapper,
  .ad-banner, .text-ad, .display-ad, .video-ad, .native-ad, .sponsored-ad,
  .sidebar-ad, .header-ad, .footer-ad, .inline-ad, .floating-ad, .sticky-ad,
  .interstitial, .lightbox-ad, .popup-ad, .overlay-ad, .modal-ad,
  
  /* === SOCIAL MEDIA ADS === */
  [data-testid*="ad"], [data-testid*="sponsor"], [aria-label*="Sponsored"], 
  [aria-label*="Publicité"], [aria-label*="Advertisement"], [aria-label*="Promoted"],
  [data-ad-preview], [data-ad-details], [data-sponsored], [data-promoted],
  [data-ad-slot], [data-ad-unit], [data-ad-client], [data-ad-channel],
  
  /* === VIDEO ADS === */
  .video-ads, .preroll-ads, .midroll-ads, .postroll-ads, .video-overlay,
  .ad-overlay, .skip-ad, .ad-countdown, .video-ad-container, .player-ads,
  .youtube-ads, .vimeo-ads, .twitch-ads, .video-advertisement,
  
  /* === TRACKING AND ANALYTICS === */
  [class*="track"], [id*="track"], [class*="analytics"], [id*="analytics"],
  [class*="pixel"], [id*="pixel"], [class*="beacon"], [id*="beacon"],
  [class*="gtm"], [id*="gtm"], [class*="ga"], [id*="ga"],
  [class*="facebook-pixel"], [class*="fb-pixel"], [class*="google-tag"],
  
  /* === MAJOR AD NETWORKS === */
  iframe[src*="doubleclick"], iframe[src*="googlesyndication"], iframe[src*="googleadservices"],
  iframe[src*="amazon-adsystem"], iframe[src*="facebook.com/tr"], iframe[src*="googletagmanager"],
  iframe[src*="google-analytics"], iframe[src*="googletagservices"],
  iframe[src*="adsystem"], iframe[src*="ads.yahoo"], iframe[src*="bing.com/ads"],
  iframe[src*="outbrain"], iframe[src*="taboola"], iframe[src*="criteo"],
  iframe[src*="pubmatic"], iframe[src*="openx"], iframe[src*="rubiconproject"],
  iframe[src*="adsystem"], iframe[src*="adnxs"], iframe[src*="adsafeprotected"],
  iframe[src*="moatads"], iframe[src*="scorecardresearch"], iframe[src*="quantserve"],
  iframe[src*="chartbeat"], iframe[src*="hotjar"], iframe[src*="crazyegg"],
  iframe[src*="mouseflow"], iframe[src*="fullstory"], iframe[src*="logrocket"],
  
  /* === INTERNATIONAL AD NETWORKS === */
  iframe[src*="yandex"], iframe[src*="baidu"], iframe[src*="naver"],
  iframe[src*="rakuten"], iframe[src*="alibaba"], iframe[src*="tencent"],
  iframe[src*="unity3d"], iframe[src*="applovin"], iframe[src*="ironsource"],
  iframe[src*="chartboost"], iframe[src*="admob"], iframe[src*="adsense"],
  
  /* === SOCIAL MEDIA TRACKING === */
  iframe[src*="twitter.com/widgets"], iframe[src*="linkedin.com/embed"],
  iframe[src*="instagram.com/embed"], iframe[src*="tiktok.com/embed"],
  iframe[src*="snapchat.com"], iframe[src*="pinterest.com/widgets"],
  iframe[src*="reddit.com/embed"], iframe[src*="discord.com/widget"],
  
  /* === NEWSLETTER AND SUBSCRIPTION POPUPS === */
  [class*="newsletter"], [id*="newsletter"], [class*="subscribe"], [id*="subscribe"],
  [class*="signup"], [id*="signup"], [class*="email-capture"], [id*="email-capture"],
  .modal-newsletter, .popup-newsletter, .subscribe-popup, .email-popup,
  .newsletter-modal, .subscription-popup, .email-signup, .newsletter-signup,
  
  /* === COOKIE AND PRIVACY BANNERS === */
  [class*="cookie"], [id*="cookie"], [class*="gdpr"], [id*="gdpr"],
  [class*="privacy"], [id*="privacy"], [class*="consent"], [id*="consent"],
  .cookie-banner, .cookie-notice, .gdpr-banner, .privacy-notice,
  .consent-banner, .cookie-popup, .privacy-popup, .gdpr-popup,
  
  /* === PROMOTIONAL CONTENT === */
  [class*="offer"], [id*="offer"], [class*="deal"], [id*="deal"],
  [class*="discount"], [id*="discount"], [class*="sale"], [id*="sale"],
  [class*="coupon"], [id*="coupon"], [class*="promotion"], [id*="promotion"],
  .special-offer, .limited-time, .flash-sale, .discount-banner,
  
  /* === MOBILE ADS === */
  .mobile-ad, .mobile-banner, .app-install, .app-promotion,
  .mobile-interstitial, .mobile-popup, .app-ad, .mobile-overlay,
  
  /* === AFFILIATE AND REFERRAL === */
  [class*="affiliate"], [id*="affiliate"], [class*="referral"], [id*="referral"],
  [class*="commission"], [id*="commission"], .affiliate-link, .referral-banner,
  
  /* === FRENCH AD TERMS === */
  [class*="publicite"], [id*="publicite"], [class*="pub"], [id*="pub"],
  [class*="reclame"], [id*="reclame"], [class*="annonce"], [id*="annonce"],
  .publicite, .pub, .reclame, .annonce, .sponsor, .commandite,
  
  /* === GERMAN AD TERMS === */
  [class*="werbung"], [id*="werbung"], [class*="anzeige"], [id*="anzeige"],
  .werbung, .anzeige, .reklame, .werbebanner,
  
  /* === SPANISH AD TERMS === */
  [class*="anuncio"], [id*="anuncio"], [class*="publicidad"], [id*="publicidad"],
  .anuncio, .publicidad, .patrocinio, .promocion,
  
  /* === ITALIAN AD TERMS === */
  [class*="pubblicita"], [id*="pubblicita"], [class*="annuncio"], [id*="annuncio"],
  .pubblicita, .annuncio, .sponsorizzato, .promozione,
  
  /* === PORTUGUESE AD TERMS === */
  [class*="anuncio"], [id*="anuncio"], [class*="publicidade"], [id*="publicidade"],
  .anuncio, .publicidade, .patrocinio, .promocao,
  
  /* === RUSSIAN AD TERMS === */
  [class*="реклама"], [id*="реклама"], [class*="объявление"], [id*="объявление"],
  
  /* === CHINESE AD TERMS === */
  [class*="广告"], [id*="广告"], [class*="推广"], [id*="推广"],
  
  /* === JAPANESE AD TERMS === */
  [class*="広告"], [id*="広告"], [class*="宣伝"], [id*="宣伝"]
  
  { 
    display: none !important; 
    visibility: hidden !important;
    opacity: 0 !important;
    width: 0 !important;
    height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    background: none !important;
    position: absolute !important;
    left: -9999px !important;
    top: -9999px !important;
    z-index: -1 !important;
    pointer-events: none !important;
    overflow: hidden !important;
  }
  
  /* === BLOCK AUTOPLAY VIDEOS === */
  video[autoplay], audio[autoplay] {
    autoplay: false !important;
  }
  
  /* === REMOVE AD SPACES AND PLACEHOLDERS === */
  .ad-placeholder, .ad-loading, .ad-error, .ad-failed, .ad-empty {
    display: none !important;
  }
  
  /* === CLEAN UP LAYOUT AFTER AD REMOVAL === */
  body {
    margin: 0 !important;
  }
  
  /* === BLOCK COMMON AD CONTAINERS === */
  div[class*="ad"]:empty, div[id*="ad"]:empty,
  div[class*="banner"]:empty, div[id*="banner"]:empty {
    display: none !important;
  }
  
  /* === HIDE SPONSORED CONTENT === */
  [data-sponsored="true"], [data-ad="true"], [data-promoted="true"] {
    display: none !important;
  }
  
  /* === BLOCK NOTIFICATION REQUESTS === */
  .notification-request, .push-notification, .browser-notification {
    display: none !important;
  }
`

  webview.insertCSS(blocageCSS)

  // ENHANCED: Comprehensive JavaScript blocking for dynamic ads
  const blocageJS = `
  (function() {
    console.log('🛡 Uniware Enhanced Ad Blocker: Initializing protection...');
    
    // === BLOCK GOOGLE ADS === //
    window.googletag = window.googletag || {};
    window.googletag.cmd = window.googletag.cmd || [];
    window.googletag.display = function() { console.log('🛡 Blocked: Google Ad Display'); };
    window.googletag.enableServices = function() { console.log('🛡 Blocked: Google Ad Services'); };
    window.googletag.defineSlot = function() { console.log('🛡 Blocked: Google Ad Slot'); return { addService: function() { return this; } }; };
    window.googletag.pubads = function() { 
      return {
        enableSingleRequest: function() {},
        collapseEmptyDivs: function() {},
        setTargeting: function() {},
        enableLazyLoad: function() {},
        refresh: function() {}
      };
    };
    
    // === BLOCK GOOGLE ANALYTICS === //
    window.ga = function() { console.log('🛡 Blocked: Google Analytics'); };
    window.gtag = function() { console.log('🛡 Blocked: Google Tag Manager'); };
    window._gaq = [];
    window.GoogleAnalyticsObject = 'ga';
    window.dataLayer = window.dataLayer || [];
    
    // === BLOCK FACEBOOK PIXEL === //
    window.fbq = function() { console.log('🛡 Blocked: Facebook Pixel'); };
    window._fbq = window.fbq;
    window.fbq.loaded = true;
    
    // === BLOCK OTHER TRACKING === //
    window._paq = [];
    window.mixpanel = { track: function() { console.log('🛡 Blocked: Mixpanel'); } };
    window.amplitude = { track: function() { console.log('🛡 Blocked: Amplitude'); } };
    window.heap = { track: function() { console.log('🛡 Blocked: Heap Analytics'); } };
    window.hotjar = function() { console.log('🛡 Blocked: Hotjar'); };
    window.Intercom = function() { console.log('🛡 Blocked: Intercom'); };
    window.drift = { load: function() { console.log('🛡 Blocked: Drift'); } };
    
    // === BLOCK AD NETWORKS === //
    window.pbjs = { que: [] };
    window.apstag = { init: function() {}, fetchBids: function() {} };
    window.headertag = { cmd: [] };
    window.criteo_q = [];
    
    // === ENHANCED POPUP BLOCKING === //
    const originalOpen = window.open;
    window.open = function(url, name, features) {
      if (url && (
        url.includes('ad') || url.includes('popup') || url.includes('banner') ||
        url.includes('sponsor') || url.includes('promo') ||
        url.includes('offer') || url.includes('deal') || url.includes('discount') || url.includes('casino') ||
        url.includes('dating') || url.includes('loan') || url.includes('credit')
      )) {
        console.log('🛡 Blocked popup:', url);
        return null;
      }
      return originalOpen.call(this, url, name, features);
    };
    
    // === BLOCK ALERT/CONFIRM SPAM === //
    const originalAlert = window.alert;
    const originalConfirm = window.confirm;
    
    window.alert = function(message) {
      if (message && typeof message === 'string') {
        const lowerMsg = message.toLowerCase();
        if (lowerMsg.includes('ad') || lowerMsg.includes('winner') || 
            lowerMsg.includes('congratulations') || lowerMsg.includes('prize') ||
            lowerMsg.includes('click here') || lowerMsg.includes('free') ||
            lowerMsg.includes('virus') || lowerMsg.includes('infected')) {
          console.log('🛡 Blocked spam alert:', message);
          return;
        }
      }
      return originalAlert.call(this, message);
    };
    
    window.confirm = function(message) {
      if (message && typeof message === 'string') {
        const lowerMsg = message.toLowerCase();
        if (lowerMsg.includes('ad') || lowerMsg.includes('subscribe') ||
            lowerMsg.includes('notification') || lowerMsg.includes('allow')) {
          console.log('🛡 Blocked spam confirm:', message);
          return false;
        }
      }
      return originalConfirm.call(this, message);
    };
    
    // === BLOCK NOTIFICATION REQUESTS === //
    if ('Notification' in window) {
      const originalRequestPermission = Notification.requestPermission;
      Notification.requestPermission = function() {
        console.log('🛡 Blocked: Notification permission request');
        return Promise.resolve('denied');
      };
    }
    
    // === ENHANCED DOM OBSERVER FOR DYNAMIC ADS === //
    const adSelectors = [
      '[class*="ad"]', '[id*="ad"]', '[class*="banner"]', '[id*="banner"]',
      '[class*="popup"]', '[class*="overlay"]', '[data-ad]', '[data-sponsored]',
      '[class*="publicite"]', '[class*="pub"]', '[class*="sponsor"]',
      '[class*="promo"]', '[class*="offer"]', '[class*="deal"]',
      '.advertisement', '.google-ads', '.facebook-ad', '.twitter-ad',
      '.instagram-ad', '.youtube-ad', '.tiktok-ad', '.snapchat-ad'
    ];
    
    function removeAds(container = document) {
      adSelectors.forEach(selector => {
        try {
          const ads = container.querySelectorAll(selector);
          ads.forEach(ad => {
            if (ad && ad.parentNode && !ad.hasAttribute('data-uniware-protected')) {
              console.log('🛡 Removed ad element:', selector);
              ad.style.display = 'none';
              ad.remove();
            }
          });
        } catch (e) {
          // Ignore selector errors
        }
      });
      
      // Remove elements with suspicious text content
      const suspiciousTexts = [
        'advertisement', 'sponsored', 'promoted', 'ad', 'ads',
        'publicité', 'pub', 'reclame', 'anuncio', 'werbung'
      ];
      
      document.querySelectorAll('div, span, p').forEach(el => {
        if (el.textContent && suspiciousTexts.some(text => 
          el.textContent.toLowerCase().includes(text)) && 
          el.offsetHeight < 200 && el.offsetWidth < 500) {
          const parent = el.closest('[class*="ad"], [id*="ad"], [class*="banner"]');
          if (parent) {
            parent.style.display = 'none';
            parent.remove();
          }
        }
      });
    }
    
    // Initial ad removal
    removeAds();
    
    // Enhanced mutation observer
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) {
            // Check the node itself
            if (node.className && typeof node.className === 'string') {
              const className = node.className.toLowerCase();
              if (className.includes('ad') || className.includes('banner') || 
                  className.includes('popup') || className.includes('sponsor') ||
                  className.includes('publicite') || className.includes('promo')) {
                console.log('🛡 Blocked dynamic ad:', className);
                node.style.display = 'none';
                if (node.parentNode) node.remove();
                return;
              }
            }
            
            // Check for ads in the new node
            removeAds(node);
            
            // Block iframes with suspicious sources
            if (node.tagName === 'IFRAME') {
              const src = node.src || '';
              const suspiciousDomains = [
                'doubleclick', 'googlesyndication', 'googleadservices',
                'amazon-adsystem', 'facebook.com/tr', 'googletagmanager',
                'google-analytics', 'adsystem', 'outbrain', 'taboola',
                'criteo', 'pubmatic', 'rubiconproject', 'adsafeprotected'
              ];
              
              if (suspiciousDomains.some(domain => src.includes(domain))) {
                console.log('🛡 Blocked suspicious iframe:', src);
                node.style.display = 'none';
                if (node.parentNode) node.remove();
              }
            }
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'id', 'src']
    });
    
    // === BLOCK REDIRECT ATTEMPTS === //
    let redirectBlocked = false;
    const originalReplace = window.location.replace;
    const originalAssign = window.location.assign;
    
    window.location.replace = function(url) {
      if (url && typeof url === 'string' && (
        url.includes('ad') || url.includes('popup') || url.includes('redirect') ||
        url.includes('affiliate') || url.includes('referral')
      )) {
        console.log('🛡 Blocked redirect:', url);
        return;
      }
      return originalReplace.call(this, url);
    };
    
    window.location.assign = function(url) {
      if (url && typeof url === 'string' && (
        url.includes('ad') || url.includes('popup') || url.includes('redirect') ||
        url.includes('affiliate') || url.includes('referral')
      )) {
        console.log('🛡 Blocked redirect:', url);
        return;
      }
      return originalAssign.call(this, url);
    };
    
    // === BLOCK FOCUS STEALING === //
    const originalFocus = window.focus;
    window.focus = function() {
      if (document.activeElement && document.activeElement.tagName === 'IFRAME') {
        console.log('🛡 Blocked focus steal attempt');
        return;
      }
      return originalFocus.call(this);
    };
    
    // === PERIODIC CLEANUP === //
    setInterval(() => {
      removeAds();
    }, 2000);
    
    console.log('🛡 Uniware Enhanced Ad Blocker: Protection fully active');
    console.log('🛡 Blocked networks: Google Ads, Facebook, Analytics, Tracking, Popups, Redirects');
  })();
`

  webview.executeJavaScript(blocageJS)
}

function updateAdBlockerUI() {
  const titlebarAdBlocker = document.getElementById("titlebar-adblocker")
  
  if (adBlockerEnabled) {
    adBlockerBtn.classList.add("active")
    adBlockerBtn.querySelector("span").textContent = t("adBlockerEnabled")
    if (navAdBlocker) {
      navAdBlocker.classList.add("adblocker-active")
      navAdBlocker.title = t("adBlockerEnabled")
    }
    if (titlebarAdBlocker) {
      titlebarAdBlocker.classList.add("adblocker-active")
      titlebarAdBlocker.title = t("adBlockerEnabled")
    }
  } else {
    adBlockerBtn.classList.remove("active")
    adBlockerBtn.querySelector("span").textContent = t("adBlockerDisabled")
    if (navAdBlocker) {
      navAdBlocker.classList.remove("adblocker-active")
      navAdBlocker.title = t("adBlockerDisabled")
    }
    if (titlebarAdBlocker) {
      titlebarAdBlocker.classList.remove("adblocker-active")
      titlebarAdBlocker.title = t("adBlockerDisabled")
    }
  }
}

adBlockerBtn.addEventListener("click", () => {
  adBlockerEnabled = !adBlockerEnabled
  localStorage.setItem("adBlockerEnabled", adBlockerEnabled)
  updateAdBlockerUI()

  if (adBlockerEnabled) {
    appliquerBlocagePublicite()
  } else {
    webview.reload()
  }
})

// Apply ad blocker on navigation
webview.addEventListener("did-start-loading", () => {
  if (adBlockerEnabled) {
    setTimeout(() => appliquerBlocagePublicite(), 100)
  }
})

// Function to check for updates
function verifierMisesAJour() {
  if (APP_VERSION === LATEST_VERSION) {
    // Show "up to date" message
    const modal = document.querySelector('[style*="position: fixed"]')
    const updateButton = modal.querySelector('button[onclick*="verifierMisesAJour"]')

    // Create success message
    const successMsg = document.createElement("div")
    successMsg.style.cssText = `
      background: #2d5a2d; color: #90ee90; padding: 8px 12px;
      border-radius: 4px; margin-top: 8px; text-align: center;
      font-weight: 500;
    `
    successMsg.innerHTML = t("upToDate")

    // Replace button with success message
    updateButton.parentNode.replaceChild(successMsg, updateButton)

    // Auto-hide message after 3 seconds
    setTimeout(() => {
      if (successMsg.parentNode) {
        const newButton = document.createElement("button")
        newButton.onclick = verifierMisesAJour
        newButton.style.cssText = updateButton.style.cssText
        newButton.innerHTML = t("checkUpdates")
        successMsg.parentNode.replaceChild(newButton, successMsg)
      }
    }, 3000)
  } else {
    // Open updates in new tab
    ajouterOnglet("https://github.com/Zetsukae/uniware.site/releases", "Mises à jour - Uniware")
    // Close the settings modal
    const modal = document.querySelector('[style*="position: fixed"]')
    if (modal) modal.remove()
  }
}

// Function to open Web Fonts website
function ouvrirWebFonts() {
  ajouterOnglet("http://www.onlinewebfonts.com", "Online Web Fonts")
  // Close the settings modal
  const modal = document.querySelector('[style*="position: fixed"]')
  if (modal) modal.remove()
}

// Language change function
function changeLanguage(newLanguage) {
  currentLanguage = newLanguage
  localStorage.setItem("language", newLanguage)
  updateLanguage()

  // Close settings modal and reopen to show updated language
  const modal = document.querySelector('[style*="position: fixed"]')
  if (modal) {
    modal.remove()
    setTimeout(() => {
      document.getElementById("settingsBtn").click()
    }, 100)
  }
}

// Settings tab functionality
function switchSettingsTab(tabName) {
  // Hide all content sections
  document.querySelectorAll(".settings-content").forEach((content) => {
    content.classList.remove("active")
  })

  // Remove active class from all tabs
  document.querySelectorAll(".settings-tab").forEach((tab) => {
    tab.classList.remove("active")
  })

  // Show selected content and activate tab
  document.getElementById(tabName + "-content").classList.add("active")
  document.querySelector(`[onclick="switchSettingsTab('${tabName}')"]`).classList.add("active")
}

// Settings functionality
function ouvrirParametres() {
  // Create a simple settings modal
  const settingsModal = document.createElement("div")
  settingsModal.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.8); z-index: 20000;
    display: flex; align-items: center; justify-content: center;
  `

  const settingsContent = document.createElement("div")
  settingsContent.style.cssText = `
    background: #222; padding: 20px; border-radius: 8px;
    color: white; min-width: 400px; max-width: 600px;
    max-height: 80vh; overflow-y: auto;
  `

  settingsContent.innerHTML = `
    <h3 style="margin-top: 0; margin-bottom: 20px;">${t("settings")}</h3>
    
    <div class="settings-tabs">
      <button class="settings-tab active" onclick="switchSettingsTab('general')">${t("general")}</button>
      <button class="settings-tab" onclick="switchSettingsTab('personalization')">${t("personalization") || "Personalisation"}</button>
      <button class="settings-tab" onclick="switchSettingsTab('language')">${t("language")}</button>
      <button class="settings-tab" onclick="switchSettingsTab('history')">${t("history")}</button>
      <button class="settings-tab" onclick="switchSettingsTab('about')">${t("about")}</button>
      <button class="settings-tab" onclick="switchSettingsTab('danger')">${t("dangerZone")}</button>
    </div>
    
    <div id="general-content" class="settings-content active">
      <div class="setting-item">
        <label class="setting-label">${t("layout")}</label>
        <select class="layout-select" onchange="changeLayout(this.value)">
          <option value="sidebar" ${currentLayout === "sidebar" ? "selected" : ""}>${t("sidebar")}</option>
          <option value="vivaldi" ${currentLayout === "vivaldi" ? "selected" : ""}>${t("topbar")}</option>
        </select>
      </div>
       
      <div class="setting-item">
        <label class="setting-label">${t("searchEngine")}</label>
        <select class="layout-select" onchange="changeSearchEngine(this.value)">
          <option value="google" ${currentSearchEngine === "google" ? "selected" : ""}>${t("google")}</option>
          <option value="qwant" ${currentSearchEngine === "qwant" ? "selected" : ""}>${t("qwant")}</option>
          <option value="duckduckgo" ${currentSearchEngine === "duckduckgo" ? "selected" : ""}>${t("duckduckgo")}</option>
          <option value="searx" ${currentSearchEngine === "searx" ? "selected" : ""}>SearX</option>
          <option value="startpage" ${currentSearchEngine === "startpage" ? "selected" : ""}>Startpage</option>
          <option value="brave" ${currentSearchEngine === "brave" ? "selected" : ""}>Brave Search</option>
          <option value="ecosia" ${currentSearchEngine === "ecosia" ? "selected" : ""}>Ecosia</option>
          <option value="swisscows" ${currentSearchEngine === "swisscows" ? "selected" : ""}>Swisscows</option>
          <option value="metager" ${currentSearchEngine === "metager" ? "selected" : ""}>MetaGer</option>
        </select>
      </div>
      
      <p style="margin: 8px 0;">${t("version")}: ${APP_VERSION}</p>
      <p style="margin: 8px 0;">${currentLayout === "sidebar" ? t("sidebarWidth") + ": " + ongletsDiv.offsetWidth + "px" : ""}</p>
      <p style="margin: 8px 0;">${t("tabCount")}: ${onglets.length}</p>
      <p style="margin: 8px 0;">${t("adBlockerStatus")}: ${adBlockerEnabled ? t("enabled") : t("disabled")}</p>

      <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.2); margin: 20px 0;" />
      
      <h4 style="margin: 16px 0 12px 0; color: #ccc;">${t("shortcuts")}</h4>
      <p style="color: #aaa; margin-bottom: 16px; font-size: 13px;">${t("shortcutsDesc")}</p>
      <div style="margin-bottom: 16px;">
        <button onclick="resetAllShortcuts()"
                style="background: #dc3545; border: none; color: white; padding: 6px 12px; border-radius: 4px; cursor: pointer; transition: background-color 0.2s ease; font-size: 12px;"
                onmouseover="this.style.backgroundColor='#c82333'"
                onmouseout="this.style.backgroundColor='#dc3545'">
          ${t("resetShortcuts")}
        </button>
      </div>
      <div id="shortcuts-list" style="max-height: 300px; overflow-y: auto; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px;">
        ${Object.keys(shortcuts)
          .map(
            (key) => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <div style="flex: 1;">
              <div style="font-weight: 500; font-size: 13px;">${shortcutNames[key] || key}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <input type="text" 
                     value="${shortcuts[key]}" 
                     readonly
                     onclick="editShortcut('${key}', this)"
                     style="background: #333; border: 1px solid #555; color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer; min-width: 100px; text-align: center; font-size: 12px;"
                     placeholder="${t("enterShortcut")}" />
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
    
    <!-- Added personalization tab content -->
    <div id="personalization-content" class="settings-content">
      <div class="setting-item">
        <label class="setting-label">${t("appColor") || "Couleur de l'application"}</label>
        <p style="color: #aaa; font-size: 13px; margin-bottom: 12px;">${t("appColorDesc") || "Personnalisez la couleur principale de l'interface"}</p>
        <div class="color-picker-container">
          <input type="color" 
                 class="color-picker" 
                 value="${currentThemeColor}" 
                 onchange="changeThemeColor(this.value)"
                 title="${t("selectColor") || "Sélectionner une couleur"}" />
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="color-preview" style="background-color: ${currentThemeColor};"></span>
            <span style="font-size: 13px; color: #ccc;">${currentThemeColor.toUpperCase()}</span>
          </div>
          <button onclick="resetThemeColor()" class="reset-color-btn">
            ${t("reset") || "Réinitialiser"}
          </button>
        </div>
      </div>
      
      <!-- Added scrollbar customization options -->
      <div class="setting-item">
        <label class="setting-label">${t("scrollbarStyle") || "Style de la barre de défilement"}</label>
        <p style="color: #aaa; font-size: 13px; margin-bottom: 12px;">${t("scrollbarStyleDesc") || "Personnalisez l'apparence des barres de défilement"}</p>
        <div class="scrollbar-preset-container" style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <select id="scrollbar-preset-select" onchange="applyScrollbarPreset(this.value)" class="preset-select" style="
              background: #3a3a3a;
              color: white;
              border: 1px solid #555;
              border-radius: 6px;
              padding: 8px 12px;
              font-size: 14px;
              min-width: 150px;
            ">
              <option value="moderne">${t("modern") || "Moderne"}</option>
              <option value="minimaliste">${t("minimalist") || "Minimaliste"}</option>
              <option value="macos">${t("macOS") || "macOS"}</option>
              <option value="sombre">${t("dark") || "Sombre"}</option>
              <option value="colore">${t("colorful") || "Coloré"}</option>
              <!-- Added masquer option to hide scrollbars -->
              <option value="masquer">${t("hideScrollbars") || "Masquer"}</option>
            </select>
            <button onclick="resetScrollbarStyle()" class="reset-scrollbar-btn" style="
              background: #e74c3c;
              color: white;
              border: none;
              border-radius: 6px;
              padding: 8px 16px;
              font-size: 14px;
              cursor: pointer;
              transition: background 0.2s;
            " onmouseover="this.style.background='#c0392b'" onmouseout="this.style.background='#e74c3c'">
              ${t("reset") || "Réinitialiser"}
            </button>
          </div>
          <div id="scrollbar-color-picker" style="display: none; align-items: center; gap: 10px; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 6px;">
            <label style="color: #ccc; font-size: 14px;">Couleur personnalisée:</label>
            <input type="color" id="scrollbar-custom-color" value="#a8edea" onchange="applyCustomScrollbarColor(this.value)" style="
              width: 40px;
              height: 30px;
              border: none;
              border-radius: 4px;
              cursor: pointer;
            ">
          </div>
        </div>
      </div>
    </div>
    
    <div id="language-content" class="settings-content">
      <select class="language-select" onchange="changeLanguage(this.value)">
        <option value="fr" ${currentLanguage === "fr" ? "selected" : ""}>${t("french")}</option>
        <option value="en" ${currentLanguage === "en" ? "selected" : ""}>${t("english")}</option>
      </select>
    </div>
    
    <div id="history-content" class="settings-content">
      <div style="margin-bottom: 16px;">
        <button onclick="clearAllHistory()" 
                style="background: #dc3545; border: none; color: white; padding: 8px 16px; border-radius: 4px; cursor: pointer; transition: background-color 0.2s ease;"
                onmouseover="this.style.backgroundColor='#c82333'" 
                onmouseout="this.style.backgroundColor='#dc3545'">
          ${t("clearHistory")}
        </button>
      </div>
      <div id="history-list" style="max-height: 300px; overflow-y: auto;">
        ${
          browsingHistory.length === 0
            ? `<p style="color: #aaa; text-align: center; padding: 20px;">${t("noHistory")}</p>`
            : browsingHistory
                .map(
                  (item) => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); cursor: pointer;"
                 onclick="ajouterOnglet('${item.url}', '${item.title}')"
                 onmouseover="this.style.backgroundColor='rgba(255,255,255,0.1)'"
                 onmouseout="this.style.backgroundColor='transparent'">
              <div style="flex: 1; min-width: 0;">
                <div style="font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.title}</div>
                <div style="font-size: 12px; color: #aaa; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.url}</div>
                <div style="font-size: 11px; color: #888;">${item.date}</div>
              </div>
              <button onclick="event.stopPropagation(); removeHistoryItemAndRefresh('${item.url}')"
                      style="background: transparent; border: none; color: #aaa; cursor: pointer; padding: 4px; margin-left: 8px;"
                      onmouseover="this.style.color='#fff'"
                      onmouseout="this.style.color='#aaa'">✕</button>
            </div>
          `,
                )
                .join("")
        }
      </div>
    </div>
    
    <div id="about-content" class="settings-content">
      <p style="margin: 8px 0; line-height: 1.4;">
        <strong>Uniware Glint</strong> ${t("aboutText")}
      </p>
      <p style="margin: 8px 0; line-height: 1.4; color: #aaa;">
        ${t("aboutDescription")}
      </p>
      <p style="margin: 12px 0; color: #ff6b6b; font-style: italic;">
        ${t("madeWithLove")}
      </p>
      <div style="display: flex; gap: 8px; margin-top: 8px;">
        <button onclick="verifierMisesAJour()" 
                style="background: #0066cc; border: none; color: white; padding: 8px 16px; border-radius: 4px; cursor: pointer; transition: background-color 0.2s ease;"
                onmouseover="this.style.backgroundColor='#0052a3'" 
                onmouseout="this.style.backgroundColor='#0066cc'">
          ${t("checkUpdates")}
        </button>
        <button onclick="ajouterOnglet('https://github.com/Zetsukae/uniware.site', 'GitHub - Uniware')"
                style="background: #333; border: none; color: white; padding: 8px 16px; border-radius: 4px; cursor: pointer; transition: background-color 0.2s ease;"
                onmouseover="this.style.backgroundColor='#444'"
                onmouseout="this.style.backgroundColor='#333'">
          GitHub
        </button>
      </div>
    </div>

    <div id="danger-content" class="settings-content">
      <p style="color: #aaa; margin-bottom: 16px;">${t("dangerZone")}</p>
      <button onclick="deleteAppData()"
              style="background: #dc3545; border: none; color: white; padding: 8px 16px; border-radius: 4px; cursor: pointer; transition: background-color 0.2s ease; margin-bottom: 8px; margin-right: 8px;"
              onmouseover="this.style.backgroundColor='#c82333'"
              onmouseout="this.style.backgroundColor='#dc3545'">
        ${t("deleteApp")}
      </button>
      <button onclick="clearAppCache()"
              style="background: #dc3545; border: none; color: white; padding: 8px 16px; border-radius: 4px; cursor: pointer; transition: background-color 0.2s ease; margin-bottom: 8px; margin-right: 8px;"
              onmouseover="this.style.backgroundColor='#c82333'"
              onmouseout="this.style.backgroundColor='#dc3545'">
        ${t("deleteCache")}
      </button>
      <button onclick="uninstallApp()"
              style="background: #8b0000; border: none; color: white; padding: 8px 16px; border-radius: 4px; cursor: pointer; transition: background-color 0.2s ease;"
              onmouseover="this.style.backgroundColor='#660000'"
              onmouseout="this.style.backgroundColor='#8b0000'">
        ${t("uninstallApp")}
      </button>
    </div>
    
    
    
    <div style="text-align: center; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2); margin-top: 20px;">
      <button onclick="this.closest('[style*=fixed]').remove()" 
              style="background: #555; border: none; color: white; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
        ${t("close")}
      </button>
    </div>
  `

  settingsModal.appendChild(settingsContent)
  document.body.appendChild(settingsModal)

  settingsModal.addEventListener("click", (e) => {
    if (e.target === settingsModal) {
      settingsModal.remove()
    }
  })

  setTimeout(() => {
    loadScrollbarPreset()
  }, 100)
}

document.getElementById("parametres").addEventListener("click", ouvrirParametres)

// Make functions global so they can be called from the modal
window.changeLanguage = changeLanguage
window.changeLayout = changeLayout
window.switchSettingsTab = switchSettingsTab
window.verifierMisesAJour = verifierMisesAJour
window.ouvrirWebFonts = ouvrirWebFonts
window.changeThemeColor = changeThemeColor
window.resetThemeColor = resetThemeColor

window.applyScrollbarPreset = applyScrollbarPreset
window.resetScrollbarStyle = resetScrollbarStyle
window.loadScrollbarPreset = loadScrollbarPreset
window.applyCustomScrollbarColor = applyCustomScrollbarColor

// Add these functions to the global scope (after the existing global functions)
window.clearAllHistory = async () => {
  const confirmed = await showCustomConfirm(t("confirmClearHistory"), t("clearHistory"))

  if (confirmed) {
    clearHistory()
    showToast(t("historyCleared"), "success")

    // Refresh the settings modal
    const modal = document.querySelector('[style*="position: fixed"]')
    if (modal) {
      modal.remove()
      setTimeout(() => {
        ouvrirParametres()
        setTimeout(() => switchSettingsTab("history"), 100)
      }, 100)
    }
  }
}

window.removeHistoryItemAndRefresh = (url) => {
  removeHistoryItem(url)
  // Refresh the settings modal
  const modal = document.querySelector('[style*="position: fixed"]')
  if (modal) {
    modal.remove()
    setTimeout(() => {
      ouvrirParametres()
      setTimeout(() => switchSettingsTab("history"), 100)
    }, 100)
  }
}

window.deleteAppData = async () => {
  const confirmed = await showCustomConfirm(t("confirmDeleteApp"), t("deleteApp"))

  if (confirmed) {
    localStorage.clear()
    showToast(t("appDeleted"), "success")
    setTimeout(() => {
      win.close()
    }, 1000)
  }
}

window.clearAppCache = async () => {
  const confirmed = await showCustomConfirm(t("confirmDeleteCache"), t("deleteCache"))

  if (confirmed) {
    webview.clearCache(true)
    showToast(t("cacheCleared"), "success")

    // Refresh the settings modal
    const modal = document.querySelector('[style*="position: fixed"]')
    if (modal) {
      modal.remove()
      setTimeout(() => {
        ouvrirParametres()
        setTimeout(() => switchSettingsTab("danger"), 100)
      }, 100)
    }
  }
}

window.uninstallApp = async () => {
  const confirmed = await showCustomConfirm(t("confirmUninstallApp"), t("uninstallApp"))

  if (confirmed) {
    const { spawn } = require('child_process')
    const fs = require('fs')
    const os = require('os')
    
    const username = os.userInfo().username
    const possiblePaths = [
      `C:\\Users\\${username}\\AppData\\Local\\Programs\\Uniware Glint\\Uninstall Uniware Glint.exe`,
      `C:\\Program Files\\Uniware Glint\\Uninstall Uniware Glint.exe`,
      `C:\\Program Files (x86)\\Uniware Glint\\Uninstall Uniware Glint.exe`
    ]
    
    let uninstallerPath = null
    for (const path of possiblePaths) {
      if (fs.existsSync(path)) {
        uninstallerPath = path
        break
      }
    }
    
    if (uninstallerPath) {
      try {
        spawn(uninstallerPath, [], { detached: true, stdio: 'ignore' })
        win.close()
      } catch (error) {
        showToast(t("uninstallerNotFound"), "error")
      }
    } else {
      showToast(t("uninstallerNotFound"), "error")
    }
  }
}

window.resetAllShortcuts = async () => {
  const confirmed = await showCustomConfirm(t("confirmResetShortcuts"), t("resetShortcuts"))

  if (confirmed) {
    resetShortcuts()
    showToast(t("shortcutsResetSuccess"), "success")

    // Refresh the settings modal
    const modal = document.querySelector('[style*="position: fixed"]')
    if (modal) {
      modal.remove()
      setTimeout(() => {
        ouvrirParametres()
      }, 100)
    }
  }
}

// === KEYBOARD SHORTCUTS SYSTEM === //
const shortcuts = JSON.parse(
  localStorage.getItem("shortcuts") ||
    JSON.stringify({
      newTab: "Ctrl+T",
      closeTab: "Ctrl+W",
      reopenTab: "Ctrl+Shift+T",
      reload: "Ctrl+R",
      reloadAlt: "F5",
      focusAddressBar: "Ctrl+L",
      nextTab: "Ctrl+Tab",
      prevTab: "Ctrl+Shift+Tab",
      fullscreen: "F11",
      back: "Alt+Left",
      forward: "Alt+Right",
      zoomIn: "Ctrl+Plus",
    }),
)

const shortcutNames = {
  newTab: "New Tab",
  closeTab: "Close Tab",
  reopenTab: "Reopen Last Tab",
  reload: "Reload Page",
  reloadAlt: "Reload Page (Alternative)",
  focusAddressBar: "Focus Address Bar",
  nextTab: "Next Tab",
  prevTab: "Previous Tab",
  fullscreen: "Toggle Fullscreen",
  back: "Go Back",
  forward: "Go Forward",
  zoomIn: "Zoom In",
}

function saveShortcuts() {
  localStorage.setItem("shortcuts", JSON.stringify(shortcuts))
}

function resetShortcuts() {
  const defaultShortcuts = {
    newTab: "Ctrl+T",
    closeTab: "Ctrl+W",
    reopenTab: "Ctrl+Shift+T",
    reload: "Ctrl+R",
    reloadAlt: "F5",
    focusAddressBar: "Ctrl+L",
    nextTab: "Ctrl+Tab",
    prevTab: "Ctrl+Shift+Tab",
    fullscreen: "F11",
    back: "Alt+Left",
    forward: "Alt+Right",
    zoomIn: "Ctrl+Plus",
  }
  Object.assign(shortcuts, defaultShortcuts)
  saveShortcuts()
}

const shortcutInUse = (shortcut) => {
  for (const key in shortcuts) {
    if (shortcuts[key] === shortcut) {
      return true
    }
  }
  return false
}

let currentEditingShortcut = null

function editShortcut(key, inputElement) {
  currentEditingShortcut = key
  inputElement.value = ""
  inputElement.placeholder = t("enterShortcut")
  inputElement.focus()
}

document.addEventListener("keydown", (e) => {
  if (currentEditingShortcut) {
    e.preventDefault()

    let shortcut = ""
    if (e.ctrlKey) shortcut += "Ctrl+"
    if (e.shiftKey) shortcut += "Shift+"
    if (e.altKey) shortcut += "Alt+"

    shortcut += e.key.toUpperCase()

    if (shortcutInUse(shortcut)) {
      showToast(t("shortcutInUse"), "error")
      const inputElement = document.querySelector(
        `#shortcuts-list input[onclick*="editShortcut('${currentEditingShortcut}')"]`,
      )
      if (inputElement) {
        inputElement.value = shortcuts[currentEditingShortcut]
        inputElement.placeholder = shortcuts[currentEditingShortcut]
      }
      currentEditingShortcut = null
      return
    }

    shortcuts[currentEditingShortcut] = shortcut
    saveShortcuts()
    showToast(t("shortcutSaved"), "success")
    currentEditingShortcut = null

    // Refresh the settings modal
    const modal = document.querySelector('[style*="position: fixed"]')
    if (modal) {
      modal.remove()
      setTimeout(() => {
        ouvrirParametres()
      }, 100)
    }
  }
})

// === UTILITY FUNCTIONS === //
function showToast(message, type = "success") {
  const toast = document.createElement("div")
  toast.className = `toast toast-${type}`
  toast.textContent = message
  document.body.appendChild(toast)

  setTimeout(() => {
    toast.classList.add("show")
  }, 10)

  setTimeout(() => {
    toast.classList.remove("show")
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 300)
  }, 3000)
}

async function showCustomConfirm(message, confirmText = "Confirm") {
  return new Promise((resolve) => {
    const confirmModal = document.createElement("div")
    confirmModal.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.8); z-index: 20001;
      display: flex; align-items: center; justify-content: center;
      backdrop-filter: blur(4px);
    `

    const confirmContent = document.createElement("div")
    confirmContent.style.cssText = `
      background: #1a1a1a; padding: 24px; border-radius: 12px;
      color: #ffffff; min-width: 320px; max-width: 420px;
      text-align: center; border: 1px solid #333;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
    `

    confirmContent.innerHTML = `
      <p style="margin-bottom: 24px; font-size: 16px; line-height: 1.5; color: #e5e5e5;">${message}</p>
      <div style="display: flex; justify-content: space-between; gap: 12px;">
        <button class="cancel-btn" style="
          background: #374151; border: 1px solid #4b5563; color: #f9fafb; 
          padding: 10px 20px; border-radius: 8px; cursor: pointer; 
          font-size: 14px; font-weight: 500; flex: 1;
          transition: all 0.2s ease;
        ">${t("cancel")}</button>
        <button class="confirm-btn" style="
          background: #dc2626; border: 1px solid #ef4444; color: white; 
          padding: 10px 20px; border-radius: 8px; cursor: pointer; 
          font-size: 14px; font-weight: 500; flex: 1;
          transition: all 0.2s ease;
        ">${confirmText}</button>
      </div>
    `

    confirmModal.appendChild(confirmContent)
    document.body.appendChild(confirmModal)

    const confirmBtn = confirmContent.querySelector(".confirm-btn")
    const cancelBtn = confirmContent.querySelector(".cancel-btn")

    confirmBtn.addEventListener("mouseenter", () => {
      confirmBtn.style.background = "#b91c1c"
    })
    confirmBtn.addEventListener("mouseleave", () => {
      confirmBtn.style.background = "#dc2626"
    })

    cancelBtn.addEventListener("mouseenter", () => {
      cancelBtn.style.background = "#4b5563"
    })
    cancelBtn.addEventListener("mouseleave", () => {
      cancelBtn.style.background = "#374151"
    })

    confirmBtn.addEventListener("click", () => {
      resolve(true)
      document.body.removeChild(confirmModal)
    })

    cancelBtn.addEventListener("click", () => {
      resolve(false)
      document.body.removeChild(confirmModal)
    })
  })
}

function injecterScrollbarPersonnalisee(preset = "moderne", customColor = null) {
  const scrollbarPresets = {
    moderne: `
      ::-webkit-scrollbar {
        width: 8px !important;
        height: 8px !important;
      }
      ::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.05) !important;
        border-radius: 10px !important;
        margin: 2px !important;
      }
      ::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #667eea 0%, #764ba2 100%) !important;
        border-radius: 10px !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
        transition: all 0.2s ease !important;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(180deg, #5a6fd8 0%, #6a4190 100%) !important;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4) !important;
        transform: scale(1.1) !important;
      }
    `,
    minimaliste: `
      ::-webkit-scrollbar {
        width: 6px !important;
        height: 6px !important;
      }
      ::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1) !important;
        border-radius: 3px !important;
      }
      ::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.3) !important;
        border-radius: 3px !important;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 0, 0, 0.5) !important;
      }
    `,
    macos: `
      ::-webkit-scrollbar {
        width: 12px !important;
        height: 12px !important;
      }
      ::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.05) !important;
        border-radius: 6px !important;
      }
      ::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.2) !important;
        border-radius: 6px !important;
        border: 2px solid transparent !important;
        background-clip: content-box !important;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 0, 0, 0.4) !important;
        background-clip: content-box !important;
      }
    `,
    sombre: `
      ::-webkit-scrollbar {
        width: 10px !important;
        height: 10px !important;
      }
      ::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1) !important;
        border-radius: 5px !important;
      }
      ::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #4a5568 0%, #2d3748 100%) !important;
        border-radius: 5px !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(180deg, #5a6578 0%, #3d4758 100%) !important;
      }
    `,
    colore: customColor
      ? `
      ::-webkit-scrollbar {
        width: 12px !important;
        height: 12px !important;
      }
      ::-webkit-scrollbar-track {
        background: ${customColor}20 !important;
        border-radius: 6px !important;
      }
      ::-webkit-scrollbar-thumb {
        background: ${customColor} !important;
        border-radius: 6px !important;
        border: 2px solid rgba(255, 255, 255, 0.3) !important;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: ${customColor}dd !important;
        transform: scale(1.05) !important;
      }
    `
      : `
      ::-webkit-scrollbar {
        width: 12px !important;
        height: 12px !important;
      }
      ::-webkit-scrollbar-track {
        background: linear-gradient(90deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%) !important;
        border-radius: 6px !important;
      }
      ::-webkit-scrollbar-thumb {
        background: linear-gradient(90deg, #a8edea 0%, #fed6e3 100%) !important;
        border-radius: 6px !important;
        border: 2px solid rgba(255, 255, 255, 0.3) !important;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(90deg, #96e6e0 0%, #fcc8d9 100%) !important;
        transform: scale(1.05) !important;
      }
    `,
    // Added masquer preset to hide scrollbars
    masquer: `
      ::-webkit-scrollbar {
        display: none !important;
        width: 0px !important;
        height: 0px !important;
        background: transparent !important;
      }
      ::-webkit-scrollbar-track {
        display: none !important;
      }
      ::-webkit-scrollbar-thumb {
        display: none !important;
      }
      ::-webkit-scrollbar-corner {
        display: none !important;
      }
      /* For Firefox */
      * {
        scrollbar-width: none !important;
      }
    `,
  }

  const existingStyle = document.getElementById("custom-scrollbar-style")
  if (existingStyle) {
    existingStyle.remove()
  }

  const scrollbarCSS = `
    /* === CUSTOM SCROLLBAR STYLES === */
    ${scrollbarPresets[preset] || scrollbarPresets.moderne}
    
    ::-webkit-scrollbar-thumb:active {
      transform: scale(0.95) !important;
    }
    
    ::-webkit-scrollbar-corner {
      background: transparent !important;
    }
  `

  if (webview && webview.insertCSS) {
    // Clear existing scrollbar styles first
    webview.insertCSS(`
      ::-webkit-scrollbar { display: initial !important; width: initial !important; height: initial !important; }
      ::-webkit-scrollbar-track { display: initial !important; background: initial !important; }
      ::-webkit-scrollbar-thumb { display: initial !important; background: initial !important; }
    `)

    // Apply new styles
    webview.insertCSS(scrollbarCSS)
    console.log(`🎨 Scrollbar personnalisée "${preset}" injectée dans la webview`)
  }

  // Apply to main interface as well
  const style = document.createElement("style")
  style.id = "custom-scrollbar-style"
  style.textContent = scrollbarCSS
  document.head.appendChild(style)
}

function loadScrollbarPreset() {
  const savedPreset = localStorage.getItem("scrollbar-preset") || "moderne"
  console.log("[v0] Loading scrollbar preset:", savedPreset)

  const select = document.getElementById("scrollbar-preset-select")
  if (select) {
    select.value = savedPreset
    console.log("[v0] Set select value to:", savedPreset)
  } else {
    console.log("[v0] Select element not found")
  }

  const colorPicker = document.getElementById("scrollbar-color-picker")
  if (colorPicker && savedPreset === "colore") {
    colorPicker.style.display = "flex"
    const customColor = localStorage.getItem("scrollbar-custom-color") || "#a8edea"
    const colorInput = document.getElementById("scrollbar-custom-color")
    if (colorInput) {
      colorInput.value = customColor
    }
    injecterScrollbarPersonnalisee(savedPreset, customColor)
  } else {
    if (colorPicker) colorPicker.style.display = "none"
    injecterScrollbarPersonnalisee(savedPreset)
  }
}

function applyScrollbarPreset(preset) {
  localStorage.setItem("scrollbar-preset", preset)

  const colorPicker = document.getElementById("scrollbar-color-picker")
  if (colorPicker) {
    if (preset === "colore") {
      colorPicker.style.display = "flex"
      const customColor = localStorage.getItem("scrollbar-custom-color") || "#a8edea"
      document.getElementById("scrollbar-custom-color").value = customColor
      injecterScrollbarPersonnalisee(preset, customColor)
    } else {
      colorPicker.style.display = "none"
      injecterScrollbarPersonnalisee(preset)
    }
  } else {
    injecterScrollbarPersonnalisee(preset)
  }
}

function applyCustomScrollbarColor(color) {
  localStorage.setItem("scrollbar-custom-color", color)
  injecterScrollbarPersonnalisee("colore", color)
}

function resetScrollbarStyle() {
  localStorage.removeItem("scrollbar-preset")
  localStorage.removeItem("scrollbar-custom-color")
  document.getElementById("scrollbar-preset-select").value = "moderne"
  const colorPicker = document.getElementById("scrollbar-color-picker")
  if (colorPicker) {
    colorPicker.style.display = "none"
  }
  injecterScrollbarPersonnalisee("moderne")
}



// Update favorite URL when user navigates
webview.addEventListener("did-finish-load", async () => {
  try {
    const titre = await webview.getTitle()
    const url = webview.getURL()
    onglets[ongletActifIndex].titre = titre || url
    onglets[ongletActifIndex].url = url



    updateFavicon(url)

    if (url === "./pages/home.html" || url.includes("home.html")) {
      searchBarGoogle.value = "Bienvenue à l'accueil d'Uniware Glint !"
      navUrlBar.value = "Bienvenue à l'accueil d'Uniware Glint !"
    } else {
      searchBarGoogle.value = url
      navUrlBar.value = url
    }

    if (currentLayout === "sidebar") {
      majAffichageOnglets()
    } else if (currentLayout === "vivaldi") {
      majAffichageOngletsVivaldi()
    }

    sauvegarderEtat()

    // Apply ad blocker to newly loaded pages
    if (adBlockerEnabled) {
      appliquerBlocagePublicite()
    }
    addToHistory(url, titre)
  } catch {}
})

// Hidden settings refresh function
function refreshScrollbarStyles() {
  const hiddenModal = document.createElement("div")
  hiddenModal.style.cssText = `
    position: fixed;
    bottom: -1000px;
    left: -1000px;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
    z-index: -1;
    transform: scale(0.01);
    overflow: hidden;
  `
  
  const hiddenContent = document.createElement("div")
  hiddenContent.innerHTML = `
    <select id="hidden-scrollbar-preset-select">
      <option value="moderne">Moderne</option>
      <option value="minimaliste">Minimaliste</option>
      <option value="macos">macOS</option>
      <option value="sombre">Sombre</option>
      <option value="colore">Coloré</option>
      <option value="masquer">Masquer</option>
    </select>
    <div id="hidden-scrollbar-color-picker" style="display: none;">
      <input type="color" id="hidden-scrollbar-custom-color" value="#a8edea">
    </div>
  `
  
  hiddenModal.appendChild(hiddenContent)
  document.body.appendChild(hiddenModal)
  
  // Load scrollbar preset with hidden elements
  const savedPreset = localStorage.getItem("scrollbar-preset") || "moderne"
  const select = document.getElementById("hidden-scrollbar-preset-select")
  if (select) select.value = savedPreset
  
  const colorPicker = document.getElementById("hidden-scrollbar-color-picker")
  if (colorPicker && savedPreset === "colore") {
    colorPicker.style.display = "flex"
    const customColor = localStorage.getItem("scrollbar-custom-color") || "#a8edea"
    const colorInput = document.getElementById("hidden-scrollbar-custom-color")
    if (colorInput) colorInput.value = customColor
    injecterScrollbarPersonnalisee(savedPreset, customColor)
  } else {
    injecterScrollbarPersonnalisee(savedPreset)
  }
  
  // Remove hidden modal after 100ms
  setTimeout(() => {
    if (document.body.contains(hiddenModal)) {
      document.body.removeChild(hiddenModal)
    }
  }, 100)
}

// Auto-refresh scrollbar styles every second
setInterval(() => {
  const currentPreset = localStorage.getItem("scrollbar-preset")
  const visibleModal = document.querySelector('[style*="position: fixed"][style*="z-index: 20000"]')
  
  if (currentPreset && !visibleModal) {
    refreshScrollbarStyles()
  }
}, 1000)

// Initializations
chargerEtatLargeur()
loadTabs()
updateLanguage()
updateLayout()
updateAdBlockerUI()

document.addEventListener("DOMContentLoaded", () => {
  // Wait for settings modal to be fully loaded
  setTimeout(() => {
    loadScrollbarPreset()
  }, 500)
})