import { defineConfig, presetUno, presetAttributify } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
  ],
  shortcuts: {
    'btn': 'px-4 py-1.5 rounded text-sm font-medium cursor-pointer transition-colors border-none outline-none',
    'btn-primary': 'btn bg-purple-600 text-white hover:bg-purple-700',
    'btn-warning': 'btn bg-orange-500 text-white hover:bg-orange-600',
    'btn-success': 'btn bg-green-500 text-white hover:bg-green-600',
    'panel': 'bg-white rounded-lg shadow p-3',
    'card': 'bg-gray-50 border border-gray-200 rounded p-2 text-xs font-mono',
    'section-title': 'text-sm font-bold text-gray-700 mb-2 pb-1 border-b border-gray-200',
  },
  theme: {
    colors: {
      primary: '#7c3aed',
      warning: '#f97316',
      success: '#22c55e',
    },
  },
})
