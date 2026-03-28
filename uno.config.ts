import { defineConfig, presetUno, presetAttributify } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
  ],
  safelist: [
    'bg-green-100',
    'text-green-700',
    'bg-red-100',
    'text-red-600',
    'bg-blue-100',
    'text-blue-600',
  ],
  shortcuts: {
    'panel': 'bg-white/90 backdrop-blur-sm rounded-xl shadow-lg shadow-black/5 border border-gray-100 p-4',
    'card': 'bg-white border border-gray-200/80 rounded-lg p-3 text-xs font-mono shadow-sm hover:shadow-md hover:border-gray-300/80 transition-all duration-200',
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
