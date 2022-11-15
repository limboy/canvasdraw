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
  plugins: [htmlPlugin()]
}