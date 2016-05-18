const defaultImporterOptions = {
}

const defaultExporterOptions = {
  filter: false,
  scope: []
}

const validScopes = ['Color', 'Reference', 'Palette']

export const createImporter = function (defaultOptions, enforcedOptions, func = null) {
  if (func == null) {
    func = enforcedOptions
    enforcedOptions = {}
  }

  const importer = (input, configuration) => {
    const options = Object.assign({}, defaultOptions, defaultImporterOptions, configuration, enforcedOptions)

    return func(input, options)
  }

  importer.configure = function (options) {
    return createConfigurableConverter(importer)(options)
  }
  return importer
}

export const createExporter = function (defaultOptions, enforcedOptions, func = null) {
  if (func == null) {
    func = enforcedOptions
    enforcedOptions = {}
  }

  const exporter = (tree, configuration) => {
    const toBeExported = tree.clone()
    const options = Object.assign({}, defaultOptions, defaultExporterOptions, configuration, enforcedOptions)

    if (typeof options.scope === 'string') {
      options.scope = [options.scope]
    }
    if (options.scope && options.scope.length && options.scope.some(scope => validScopes.indexOf(scope) === -1)) {
      return Promise.reject(new Error(`Invalid option scope: ${options.scope.join(', ')} - valid elements are ${validScopes.join(', ')}`))
    }
    let isInSearchScope = () => true
    if (options.filter) {
      if (options.filter instanceof RegExp) {
        isInSearchScope = (term) => options.filter.test(term)
      } else {
        isInSearchScope = (term) => (term.indexOf(options.filter) !== -1)
      }
    }
    toBeExported.exportEntries = (cb) => {
      toBeExported.traverseTree(options.scope, (entry) => {
        if (!isInSearchScope(entry.name)) {
          return
        }
        cb(entry)
      })
    }
    return func(toBeExported, options)
  }

  exporter.configure = function (options) {
    return createConfigurableConverter(exporter)(options)
  }
  return exporter
}

export const createConfigurableConverter = function (converter) {
  return function (options) {
    return function (input) {
      return converter(input, options)
    }
  }
}
