import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  vue: true,
  ignores: ['.github', '**/.github/**', 'dist', '**/dist/**', 'public', '**/public/**', '**/*.d.ts'],
})
