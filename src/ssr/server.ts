import fs from 'fs'
import path from 'path'

import { SSRContext } from '@vue/server-renderer'
import express, { Request } from 'express'
import serveStatic from 'serve-static'
import shrinkRay from 'shrink-ray-current'
import { createServer as createViteServer } from 'vite'

import { SsrManifest } from '@/entry-server'

const resolve = (p: string) => path.resolve(process.cwd(), p)

const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITE_TEST_BUILD
const isProd = process.env.NODE_ENV === 'production'

export type Render = (req: Request, manifest: SsrManifest) => Promise<{ html: string, preloadLinks: string, initScripts: string }>
export interface SSRContextVite extends SSRContext {
  req: Request
}

export const createServer = () => {
  const root = process.cwd()

  const manifest: SsrManifest = isProd
    ? require('./dist/client/ssr-manifest.json')
    : {}

  const app = express()

  const renderTemplate = (template: string, render: Render, req: Request): Promise<string> => {
    return render(req, manifest).then(({ html, preloadLinks, initScripts = '' }) => {
      return template
        .replace('</head>', `${preloadLinks}</head>`)
        .replace('<div id="app"></div>', `<div id="app">${html}</div>${initScripts}`)
    })
  }

  if (isProd) {
    app.use(shrinkRay())
    app.use(serveStatic(resolve('./dist/client'), { index: false }))

    const indexHtml = fs.readFileSync(resolve('./dist/client/index.html'), 'utf-8')

    app.use('*', (req: Request, res) => {
      const render = require('./dist/server/entry-server.ts').render as Render
      void renderTemplate(indexHtml, render, req).then((html) => {
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
      }).catch((e) => {
        console.error(e.stack)
        res.status(500).end(e.stack)
      })
    })
  } else {
    createViteServer({
      root,
      logLevel: isTest ? 'error' : 'info',
      server: {
        middlewareMode: 'ssr',
        watch: {
          // During tests we edit the files too fast and sometimes chokidar
          // misses change events, so enforce polling for consistency
          usePolling: true,
          interval: 100
        }
      }
    }).then((vite) => {
      app.use(vite.middlewares)

      app.use('*', (req, res) => {
        // always read fresh template in dev
        const indexHtml = fs.readFileSync(resolve('index.html'), 'utf-8')
        // This injects the vite HMR client, and
        // also applies HTML transforms from Vite plugins, e.g. global preambles
        // from @vitejs/plugin-react-refresh
        vite.transformIndexHtml(req.originalUrl, indexHtml).then((template) => {
          vite.ssrLoadModule('./src/entry-server.ts').then((entryServer) => {
            void renderTemplate(template, entryServer.render as Render, req).then((html) => {
              res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
            }).catch((e) => {
              vite.ssrFixStacktrace(e)
              console.error(e.stack)
              res.status(500).end(e.stack)
            })
          })
        })
      })
    })
  }

  return app
}

if (!isTest) {
  const app = createServer()
  app.listen(3000, () => {
    console.log('http://localhost:3000')
  })
}
