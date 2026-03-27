import { defineConfig, presetUno, presetAttributify } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
  ],
  shortcuts: {
    'panel': 'bg-white/90 backdrop-blur-sm rounded-xl shadow-lg shadow-black/5 border border-gray-100 p-4',
    'card': 'bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-lg p-3 text-xs font-mono shadow-sm hover:shadow-md transition-shadow',
    'section-title': 'text-sm font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-100 flex items-center gap-2',
  },
  theme: {
    colors: {
      primary: '#7c3aed',
      warning: '#f97316',
      success: '#22c55e',
    },
  },
})
