const _ = require('lodash')
const Color = require('color')
const plugin = require('tailwindcss/plugin')
const flattenColorPalette = require('tailwindcss/lib/util/flattenColorPalette')

function getColor(color) {
  try {
    return Color(color)
  } catch (error) {
    return Color('transparent')
  }
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

    // Prepare theme colors
    let themeColors = []
    _.map(flattenColorPalette.default(theme('colors')), (value, name) => {
      themeColors.push({
        name: name,
        color: getColor(value)
      })
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
      
      // Iterate over shadow layers
      let shadowLayers = []
      _.map(config.shadows, (s) => {
        
        // Prepare layers
        let shadowLayer = {
          modifiers: [],
          options: []
        }
        if (s.color) {
          // Handle user defined colors
          const c = getColor(s.color)
          if (c) {
            shadowLayer.options.push(`${s.x} ${s.x} ${s.blur} rgba(${c.red()}, ${c.green()}, ${c.blue()}, ${s.opacity})`)
          } else {
            shadowLayer.options.push('none')
          }
        } else {
          // Color is not defined, generate variants for theme colors
          _.map(themeColors, (tc, i) => {
            const c = tc.color
            shadowLayer.modifiers.push(tc.name)
            if (c) {
              shadowLayer.options.push(`${s.x} ${s.x} ${s.blur} rgba(${c.red()}, ${c.green()}, ${c.blue()}, ${s.opacity})`)
            } else {
              shadowLayer.options.push('none')
            }
          })
        }
        shadowLayers.push(shadowLayer)
      })

      // Generate variants 
      let modifiers = []
      let values = []
      _.map(shadowLayers, (layer) => {
        if (values.length === 0) {
          layer.options.forEach((option, i) => {
            values.push(option)
            if (layer.modifiers[i]) {
              modifiers.push(layer.modifiers[i])
            }
          })
        } else {
          let layerValues = []
          let layerModifiers = []
          values.forEach((inner, j) => {
            layer.options.forEach((outer, i) => {
              layerValues.push(`${inner}, ${outer}`)
              if (layer.modifiers[i]) {
                if (modifiers[j]) {
                  layerModifiers.push(`${modifiers[j]}-${layer.modifiers[i]}`)
                } else {
                  layerModifiers.push(`${layer.modifiers[i]}`)
                }
              } else {
                layerModifiers = modifiers
              }
            })
          })
          values = layerValues
          modifiers = layerModifiers
        }
      })

      // Generate classes
      _.map(values, (option, i) => {
        let className = ''
        if (modifiers[i]) {
          className = `${e(`text-shadow-${modifier}-${modifiers[i]}`)}`
        } else {
          className = `${e(`text-shadow-${modifier}`)}`
        }
        utilities[`.${className}`] = {'text-shadow': option}
      })
    }
    
  })

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
      test1: {
        custom: '1px 1px 3px rgb(0 0 0 / 29%), 2px 4px 7px rgb(73 64 125 / 35%)',
      },
      test2: {
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
          }
        ],
      },
      test3: {
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
            color: '#000000',
            opacity: '1'
          }
        ],
      },
      none: 'none',
    },
  },
  variants: {
    textShadow: ['responsive', 'hover'],
  }
})
