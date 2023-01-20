import { resolve } from 'path'

import VueI18n from '@intlify/vite-plugin-vue-i18n'
import Vue from '@vitejs/plugin-vue'
// import LinkAttributes from 'markdown-it-link-attributes'
// import Prism from 'markdown-it-prism'
import visualizer from 'rollup-plugin-visualizer'
import Unocss from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
// import Markdown from 'vite-plugin-md'

// const markdownWrapperClasses = 'prose prose-sm m-auto text-left'

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, process.env.VITE_BUILD_SIGNING ? 'signing/index.html' : 'index.html')
      },
      plugins: [
        visualizer()
      ]
    }
  },
  server: {
    host: true
  },
  resolve: {
    alias: {
      '@/': `${resolve(__dirname, 'src')}/`,
      'vue-i18n': 'vue-i18n/dist/vue-i18n.runtime.esm-bundler.js'
    }
  },
  define: {
    __VUE_I18N_FULL_INSTALL__: 'false',
    __VUE_I18N_LEGACY_API__: 'false',
    __VUE_I18N_PROD_DEVTOOLS__: 'false'
  },
  plugins: [
    Vue({
      include: [/\.vue$/, /\.md$/],
      reactivityTransform: true
    }),

    // https://github.com/antfu/unplugin-auto-import
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'vue-i18n',
        'vue/macros',
        '@vueuse/head',
        '@vueuse/core',
        {
          '@vueuse/router': [
            'useRouteQuery'
          ]
        }
      ],
      dts: 'src/auto-imports.d.ts'
    }),

    // https://github.com/antfu/unplugin-vue-components
    Components({
      // allow auto load markdown components under `./src/components/`
      extensions: ['vue'/* , 'md' */],
      // allow auto import and register components used in markdown
      include: [/\.vue$/, /\.vue\?vue//* , /\.md$/ */],
      dirs: [
        'src/components',
        'src/pages',
        'src/ui'
      ],
      dts: 'src/components.d.ts',
      resolvers: [
        IconsResolver({
          componentPrefix: 'Icon',
          customCollections: ['go']
        })
      ]
    }),

    Icons({
      compiler: 'vue3',
      customCollections: {
        go: FileSystemIconLoader(
          './icons'
          // (svg) => svg.replace(/^<svg /, '<svg fill="currentColor"')
        )
      },
      defaultClass: 'shrink-0'
    }),

    // https://github.com/antfu/unocss
    // see unocss.config.ts for config
    Unocss(),

    // https://github.com/antfu/vite-plugin-md
    // Don't need this? Try vitesse-lite: https://github.com/antfu/vitesse-lite
    // Markdown({
    //   wrapperClasses: markdownWrapperClasses,
    //   headEnabled: true,
    //   markdownItSetup: (md) => {
    //     // https://prismjs.com/
    //     md.use(Prism)
    //     md.use(LinkAttributes, {
    //       matcher: (link: string) => /^https?:\/\//.test(link),
    //       attrs: {
    //         target: '_blank',
    //         rel: 'noopener'
    //       }
    //     })
    //   }
    // }),

    // https://github.com/antfu/vite-plugin-pwa
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   includeAssets: ['favicon.svg', 'safari-pinned-tab.svg', 'robots.txt'],
    //   manifest: {
    //     name: 'GoSign',
    //     short_name: 'GoSign',
    //     theme_color: '#ffffff',
    //     icons: [
    //       {
    //         src: '/pwa-192x192.png',
    //         sizes: '192x192',
    //         type: 'image/png'
    //       },
    //       {
    //         src: '/pwa-512x512.png',
    //         sizes: '512x512',
    //         type: 'image/png'
    //       },
    //       {
    //         src: '/pwa-512x512.png',
    //         sizes: '512x512',
    //         type: 'image/png',
    //         purpose: 'any maskable'
    //       }
    //     ]
    //   }
    // }),

    // https://github.com/intlify/bundle-tools/tree/main/packages/vite-plugin-vue-i18n
    VueI18n({
      runtimeOnly: true,
      compositionOnly: true,
      include: [resolve(__dirname, 'locales/**')]
    }),

    // https://github.com/antfu/vite-plugin-inspect
    // Visit http://localhost:3333/__inspect/ to see the inspector
    Inspect()
  ],

  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      '@vueuse/core',
      '@vueuse/head'
    ],
    exclude: [
      'vue-demi'
    ]
  },

  // https://github.com/vitest-dev/vitest
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'jsdom',
    deps: {
      inline: ['@vue', '@vueuse', 'vue-demi']
    }
  }
})
