const defaultConverterOptions = {
  filter: false,
  scope: []
}

export const createConverter = function (defaultOptions, enforcedOptions, func = null) {
  if (func == null) {
    func = enforcedOptions
    enforcedOptions = {}
  }

  const converter = (input, configuration) => {
    const options = Object.assign({}, defaultOptions, defaultConverterOptions, configuration, enforcedOptions)

    return func(input, options)
  }

  converter.configure = function (options) {
    return createConfigurableConverter(converter)(options)
  }
  return converter
}

export const createConfigurableConverter = function (converter) {
  return function (options) {
    return function (input) {
      return converter(input, options)
    }
  }
}
