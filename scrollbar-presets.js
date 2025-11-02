// Différents presets de scrollbar pour votre application

const scrollbarPresets = {
  // Style moderne avec gradient
  moderne: `
    ::-webkit-scrollbar {
      width: 8px !important;
      height: 8px !important;
    }
    ::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.05) !important;
      border-radius: 10px !important;
    }
    ::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, #667eea 0%, #764ba2 100%) !important;
      border-radius: 10px !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(180deg, #5a6fd8 0%, #6a4190 100%) !important;
    }
  `,

  // Style minimaliste
  minimaliste: `
    ::-webkit-scrollbar {
      width: 4px !important;
      height: 4px !important;
    }
    ::-webkit-scrollbar-track {
      background: transparent !important;
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2) !important;
      border-radius: 2px !important;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 0.4) !important;
    }
  `,

  // Style macOS
  macos: `
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

  // Style sombre
  sombre: `
    ::-webkit-scrollbar {
      width: 8px !important;
      height: 8px !important;
    }
    ::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1) !important;
      border-radius: 4px !important;
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3) !important;
      border-radius: 4px !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.5) !important;
    }
  `,

  // Style coloré
  colore: `
    ::-webkit-scrollbar {
      width: 10px !important;
      height: 10px !important;
    }
    ::-webkit-scrollbar-track {
      background: linear-gradient(90deg, #ff9a9e 0%, #fecfef 100%) !important;
      border-radius: 5px !important;
    }
    ::-webkit-scrollbar-thumb {
      background: linear-gradient(90deg, #a18cd1 0%, #fbc2eb 100%) !important;
      border-radius: 5px !important;
      border: 2px solid white !important;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(90deg, #9575cd 0%, #f8bbd9 100%) !important;
    }
  `,
}

// Fonction pour appliquer un preset
function appliquerPresetScrollbar(preset, webview) {
  if (scrollbarPresets[preset]) {
    // Appliquer à la webview
    if (webview && webview.insertCSS) {
      webview.insertCSS(scrollbarPresets[preset])
    }
    
    // Appliquer à l'interface principale
    let styleElement = document.getElementById('scrollbar-style')
    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = 'scrollbar-style'
      document.head.appendChild(styleElement)
    }
    styleElement.textContent = scrollbarPresets[preset]
    
    console.log(`🎨 Preset "${preset}" appliqué à la scrollbar`)
  }
}

// Expose globally
window.appliquerPresetScrollbar = appliquerPresetScrollbar
window.scrollbarPresets = scrollbarPresets

// Fonction pour créer un sélecteur de presets
function creerSelecteurPresets() {
  const selecteur = document.createElement("select")
  selecteur.id = "scrollbar-preset-selector"
  selecteur.style.cssText = `
    position: fixed;
    top: 50px;
    right: 10px;
    z-index: 9999;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 5px;
    font-size: 12px;
  `

  // Ajouter les options
  const defaultOption = document.createElement("option")
  defaultOption.value = ""
  defaultOption.textContent = "Choisir un style"
  selecteur.appendChild(defaultOption)

  Object.keys(scrollbarPresets).forEach((preset) => {
    const option = document.createElement("option")
    option.value = preset
    option.textContent = preset.charAt(0).toUpperCase() + preset.slice(1)
    selecteur.appendChild(option)
  })

  selecteur.addEventListener("change", (e) => {
    if (e.target.value) {
      const webview = document.getElementById("webview")
      appliquerPresetScrollbar(e.target.value, webview)
      localStorage.setItem('scrollbarPreset', e.target.value)
    }
  })

  document.body.appendChild(selecteur)
}

// Initialiser le sélecteur au chargement
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    creerSelecteurPresets()
  }, 1000)
})