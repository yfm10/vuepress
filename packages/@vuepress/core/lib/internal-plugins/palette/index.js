const {
  fs, path, logger,
  datatypes: {
    isPlainObject,
    assertTypes,
    isString
  }
} = require('@vuepress/shared-utils')

module.exports = (options, ctx) => ({
  name: '@vuepress/internal-palette',

  async ready () {
    // 1. enable config.styl globally.
    const configFile = path.resolve(__dirname, '../../app/style/config.styl')
    if (!ctx.siteConfig.stylus) {
      ctx.siteConfig.stylus = {
        import: [configFile]
      }
    } else if (isPlainObject(ctx.siteConfig.stylus)) {
      ctx.siteConfig.stylus.import = (ctx.siteConfig.stylus.import || []).concat([configFile])
    }

    // 2. write palette.styl
    const { sourceDir, writeTemp } = ctx

    const themePalette = ctx.themePalette
    const { palette: userPalette } = ctx.siteConfig
    const palettePath = path.resolve(sourceDir, '.vuepress/styles/palette.styl')

    const themePaletteContent = resolvePaletteContent(themePalette)
    const userPaletteContent = resolvePaletteContent(userPalette)
    const userPaletteContent2 = resolvePaletteContent(palettePath)

    // user's palette can override theme's palette.
    const paletteContent = themePaletteContent + userPaletteContent + userPaletteContent2
    await writeTemp('palette.styl', paletteContent)
  }
})

/**
 * resolve palette content
 * @param {string|object} palette
 * @returns {string}
 */

function resolvePaletteContent (palette) {
  const { valid, warnMsg } = assertTypes(palette, [String, Object])
  if (!valid) {
    if (palette !== undefined) {
      logger.warn(
        `[vuepress] Invalid value for "palette": ${warnMsg}`
      )
    }
    return ''
  }

  if (isString(palette)) {
    if (fs.existsSync(palette)) {
      return `@import(${JSON.stringify(palette)})\n`
    }
    return ''
  } else if (isPlainObject(palette)) {
    return Object.keys(palette).map(variableName => {
      return `${variableName} = ${palette[variableName]}`
    }).join('\n') + '\n'
  }
}
