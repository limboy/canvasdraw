import { fileURLToPath } from 'url'

const htmlPlugin = () => {
  return {
    name: 'html-transform',
    transformIndexHtml(html) {
      return html.replace(
        /__OG_IMAGE__/g,
        `https://canvasdraw.limboy.me/assets/og.jpg`
      )
    }
  }
}

/** @type {import('vite').UserConfig} */
export default {
  plugins: [htmlPlugin()],
  build: {
    rollupOptions: {
      input: {
        index: fileURLToPath(new URL('./index.html', import.meta.url)),
        code: fileURLToPath(new URL('./code.html', import.meta.url)),
        render: fileURLToPath(new URL('./render.html', import.meta.url)),
      },
    },
  },
}