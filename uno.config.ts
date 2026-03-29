import { defineConfig, presetAttributify, presetUno } from 'unocss'

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
    // Layout
    'panel': 'bg-white/90 backdrop-blur-sm rounded-xl shadow-lg shadow-black/5 border border-gray-100 p-4',
    'card': 'bg-gray-100 border border-gray-200 rounded-lg p-3 text-xs font-mono shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200',
    'section-title': 'text-sm font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-100 flex items-center gap-2',

    // Buttons
    'btn-base': 'font-medium cursor-pointer border-none outline-none select-none active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200',
    'btn-sm': 'btn-base px-3 py-1 text-xs rounded-md',
    'btn-md': 'btn-base px-4 py-1.5 text-sm rounded-lg',
    'btn-primary': 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-md shadow-purple-500/20 hover:shadow-lg hover:shadow-purple-500/30 hover:from-purple-500 hover:to-violet-500',
    'btn-warning': 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 hover:from-orange-400 hover:to-amber-400',
    'btn-danger': 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 hover:from-red-400 hover:to-rose-400',
    'btn-success': 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md shadow-green-500/20 hover:shadow-lg hover:shadow-green-500/30 hover:from-green-400 hover:to-emerald-400',
    'btn-default': 'bg-white text-gray-600 border border-gray-200 shadow-sm hover:bg-gray-50 hover:border-gray-300 hover:shadow-md',

    // Form elements
    'input-base': 'w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono transition-all duration-200 placeholder:text-gray-400 hover:bg-white hover:border-indigo-300 hover:shadow-sm focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:shadow-sm outline-none',
    'checkbox-wrapper': 'inline-flex items-center gap-2 cursor-pointer select-none',
    'checkbox-box': 'w-[18px] h-[18px] rounded-[5px] border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200',
    'checkbox-checked': 'bg-gradient-to-br from-purple-500 to-violet-600 border-purple-500 shadow-md shadow-purple-500/30 scale-100',
    'checkbox-unchecked': 'bg-gray-200 border-gray-500 shadow-sm hover:border-purple-400 hover:shadow-md',

    // Highlight states
    'highlight-green': 'bg-green-100 text-green-700',
    'highlight-red': 'bg-red-100 text-red-600',
    'highlight-blue': 'bg-blue-100 text-blue-600',
    'highlight-orange': 'bg-orange-100 text-orange-700',
    'highlight-yellow': 'bg-yellow-100 text-yellow-700',

    // Diff item
    'diff-item': 'flex gap-1 px-1 py-0.5 rounded',
    'diff-item-clickable': 'diff-item cursor-pointer hover:ring-1 hover:ring-indigo-300 transition-all',

    // Param tag
    'param-index': 'opacity-60 w-8 inline-block',

    // Icon button
    'icon-btn': 'flex items-center justify-center',

    // Text with icon
    'label-with-icon': 'flex items-center gap-2',
    'label-sm': 'text-xs font-medium text-gray-600 flex items-center gap-1',

    // Status bar
    'status-bar': 'bg-gray-800 text-white px-4 py-1.5 text-xs flex items-center justify-between',

    // Header
    'page-header': 'bg-white shadow-sm border-b border-gray-200 px-2 md:px-4 py-2 flex items-center justify-between',
    'page-title': 'text-sm md:text-base font-bold text-gray-800',
  },
  theme: {
    colors: {
      primary: '#7c3aed',
      warning: '#f97316',
      success: '#22c55e',
    },
    animation: {
      keyframes: {
        'modal-fade-in': '{from{opacity:0}to{opacity:1}}',
        'modal-scale-in': '{from{opacity:0;transform:scale(0.95) translateY(-10px)}to{opacity:1;transform:scale(1) translateY(0)}}',
      },
    },
  },
})
