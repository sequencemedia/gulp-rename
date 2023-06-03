import {
  Transform
} from 'node:stream'
import path from 'node:path'
import PluginError from 'plugin-error'

const PLUGIN_NAME = '@sequencemedia/gulp-rename'

function getTransformFor (parameter, options) {
  function parsePath (filePath) {
    const extname = (
      options.multiExt
        ? path.basename(filePath).slice(path.basename(filePath).indexOf('.'))
        : path.extname(filePath)
    )

    return {
      dirname: path.dirname(filePath),
      basename: path.basename(filePath, extname),
      extname
    }
  }

  return function transform (sourceFile, encoding, done) {
    const file = sourceFile.clone({ contents: false })

    let filePath

    const parsedPath = parsePath(file.relative)

    const type = typeof parameter

    if (type === 'string' && parameter) {
      filePath = parameter
    } else {
      if (type === 'function') {
        const {
          dirname,
          basename,
          extname
        } = parameter(parsedPath, file) ?? parsedPath

        filePath = path.join(dirname, basename + extname)
      } else {
        if (type === 'object' && parameter) {
          const {
            dirname = parsedPath.dirname,
            prefix = '',
            suffix = '',
            basename = parsedPath.basename,
            extname = parsedPath.extname
          } = parameter

          filePath = path.join(dirname, prefix + basename + suffix + extname)
        } else {
          done(new PluginError(PLUGIN_NAME, 'Unsupported parameter type'))
          return
        }
      }
    }

    file.path = path.join(file.base, filePath)

    // Rename sourcemap if present
    if (file.sourceMap) {
      file.sourceMap.file = file.relative
    }

    done(null, file)
  }
}

export default function gulpRename (parameter, options = {}) {
  const transform = getTransformFor(parameter, options)

  return new Transform({ transform, objectMode: true })
}
