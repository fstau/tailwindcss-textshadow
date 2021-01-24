
const _ = require('lodash')
const plugin = require('tailwindcss/plugin')
const flattenColorPalette = require('tailwindcss/lib/util/flattenColorPalette')

// Utility to handle hexToRgb conversion
function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

module.exports = plugin(function({ addUtilities, e, theme, variants }) {
  const textShadow = theme('textShadow', {})
  
  const textShadowVariants = variants('textShadow', [])

  let utilities = {}
    
  _.map(textShadow, (options, modifier) => {

    let config = {
      value: '',
      shadows: []
    }

    // Prepare colors
    let themeColors = []
    let themeColorNames = []
    const colors = flattenColorPalette.default(theme('colors'))
    _.map(colors, (hashValue, name) => {
      themeColors.push(hashValue)
      themeColorNames.push(name)
    })

    // Parse options
    const isObj = typeof(options) == 'object'
    if (isObj && options.custom) {
      config.value = options.custom 
    } else if (isObj && options.shadows) {
      if (typeof(options.shadows) == 'object') {
        config.shadows = options.shadows
      }
    } else {
      config.value = options
    }

    // Handle simple shadows
    if (config.value.length > 0) {
      const className = modifier === 'default' ? 'text-shadow' : `${e(`text-shadow-${modifier}`)}`
      utilities[`.${className}`] = {'text-shadow': config.value}
    }

    // Handle multiple shadows
    if (config.shadows.length > 0 && config.value.length === 0) {

      let generateShadows = []

      _.map(config.shadows, (s) => {
        // FOR EVERY SHADOW
        let out = {
          modifiers: [],
          options: []
        }
        if (s.color) {
          // If shadow has color defined
          const c = hexToRgb(s.color)
          if (c) {
            out.options.push(`${s.x} ${s.x} ${s.blur} rgba(${c.r}, ${c.g}, ${c.b}, ${s.opacity})`)
          } else {
            out.options.push('none')
          }
        } else {
          // Color is not defined
          _.map(themeColors, (color, i) => {
            // Iterate over theme colors
            const c = hexToRgb(color)
            out.modifiers.push(themeColorNames[i])
            if (c) {
              out.options.push(`${s.x} ${s.x} ${s.blur} rgba(${c.r}, ${c.g}, ${c.b}, ${s.opacity})`)
            } else {
              out.options.push('none')
            }
          })
        }
        generateShadows.push(out)
      })

      let opts = []
      let mods = []
      _.map(generateShadows, (layer) => {
        if (opts.length === 0) {
          layer.options.forEach((option, i) => {
            opts.push(option)
            if (layer.modifiers[i]) {
              mods.push(layer.modifiers[i])
            }
          })
        } else {
          let ret = []
          let retmods = []
          opts.forEach((inner, j) => {
            layer.options.forEach((outer, i) => {
              ret.push(`${inner}, ${outer}`)
              if (layer.modifiers[i]) {
                if (mods[j]) {
                  retmods.push(`${mods[j]}-${layer.modifiers[i]}`)
                } else {
                  retmods.push(`${layer.modifiers[i]}`)
                }
              } else {
                retmods = mods
              }
            })
          })
          opts = ret
          mods = retmods
        }
      })

      _.map(opts, (option, i) => {
        let className = ''
        if (mods[i]) {
          className = `${e(`text-shadow-${modifier}-${mods[i]}`)}`
        } else {
          className = `${e(`text-shadow-${modifier}`)}`
        }
        utilities[`.${className}`] = {'text-shadow': option}
      })
  
    }
    
  })

  // console.log(utilities)

  addUtilities(utilities, textShadowVariants)
},
{
  theme: {
    textShadow: {
      default: '0px 0px 1px rgb(0 0 0 / 20%), 0px 0px 1px rgb(1 0 5 / 10%)',
      sm: '1px 1px 3px rgb(36 37 47 / 25%)',
      md: '0px 1px 2px rgb(30 29 39 / 19%), 1px 2px 4px rgb(54 64 147 / 18%)',
      lg: '3px 3px 6px rgb(0 0 0 / 26%), 0 0 5px rgb(15 3 86 / 22%)',
      xl: '1px 1px 3px rgb(0 0 0 / 29%), 2px 4px 7px rgb(73 64 125 / 35%)',
      test: {
        custom: '1px 1px 3px rgb(0 0 0 / 29%), 2px 4px 7px rgb(73 64 125 / 35%)',
      },
      testm: {
        shadows: [
          {
            x: '0px',
            y: '3px',
            blur: '4px',
            color: '#000000',
            opacity: '0.25'
          },
          {
            x: '5px',
            y: '5px',
            blur: '0px',
            color: '#FCCD17',
            opacity: '1'
          },
          {
            x: '10px',
            y: '10px',
            blur: '0px',
            color: '#000000',
            opacity: '1'
          }
        ],
      },
      testn: {
        shadows: [
          {
            x: '0px',
            y: '3px',
            blur: '4px',
            color: '#000000',
            opacity: '0.25'
          },
          {
            x: '5px',
            y: '5px',
            blur: '0px',
            opacity: '1'
          },
          {
            x: '10px',
            y: '10px',
            blur: '0px',
            // color: '#000000',
            opacity: '1'
          }
        ],
      },
      none: 'none',
    },
  },
  variants: {
    textShadow: ['responsive', 'hover', 'focus'],
  }
})
