import type { PackageManifest } from './types'

export const packages: PackageManifest[] = [
  {
    name: 'shared',
    display: 'Shared utilities',
  },
  {
    name: 'core',
    display: 'VueUse',
    description: 'Collection of essential Vue Composition Utilities',
  },
  {
    name: 'components',
    display: 'Components',
    description: 'Renderless components for VueUse',
    author: 'Jacob Clevenger<https://github.com/wheatjs>',
    external: [
      '@vueuse/core',
      '@vueuse/shared',
    ],
  },
  {
    name: 'nuxt',
    display: 'Nuxt',
    description: 'VueUse Nuxt Module',
    manualImport: true,
    addon: true,
    iife: false,
    cjs: false,
    dts: false,
    target: 'node14',
    external: [
      '@vueuse/core',
      '@vueuse/shared',
      'local-pkg',
    ],
  },
  {
    name: 'router',
    display: 'Router',
    description: 'Utilities for vue-router',
    addon: true,
    external: [
      'vue-router',
    ],
    globals: {
      'vue-router': 'VueRouter',
    },
  },
  {
    name: 'integrations',
    display: 'Integrations',
    description: 'Integration wrappers for utility libraries',
    addon: true,
    submodules: true,
    external: [
      'axios',
      'universal-cookie',
      'qrcode',
      'http',
      'nprogress',
      'jwt-decode',
      'focus-trap',
      'drauu',
      '@vueuse/core',
      '@vueuse/shared',
      'fuse.js',
    ],
    globals: {
      'axios': 'axios',
      'universal-cookie': 'UniversalCookie',
      'qrcode': 'QRCode',
      'nprogress': 'nprogress',
      'jwt-decode': 'jwt_decode',
      'focus-trap': 'focusTrap',
      'drauu': 'Drauu',
      'fuse.js': 'Fuse',
    },
  },
  {
    name: 'rxjs',
    display: 'RxJS',
    description: 'Enables RxJS reactive functions in Vue',
    addon: true,
    external: [
      'rxjs',
      'rxjs/operators',
    ],
    globals: {
      'rxjs': 'rxjs',
      'rxjs/operators': 'rxjs.operator',
    },
  },
  {
    name: 'firebase',
    display: 'Firebase',
    description: 'Enables realtime bindings for Firebase',
    addon: true,
    submodules: true,
    external: [
      'firebase',
      'firebase/app',
    ],
    globals: {
      'firebase': 'firebase',
      'firebase/app': 'firebase',
    },
  },
  {
    name: 'electron',
    display: 'Electron',
    description: 'Electron renderer process modules for VueUse',
    author: 'Archer Gu<https://github.com/ArcherGu>',
    addon: true,
    external: [
      'electron',
    ],
    iife: false,
  },
]
