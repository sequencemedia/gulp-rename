import {
  Transform
} from 'node:stream'
import path from 'node:path'

export default (param, options = {}) => {
  const streamTransform = new Transform({ objectMode: true })

  function parsePath (filePath) {
    const extname = options.multiExt
      ? path.basename(filePath).slice(path.basename(filePath).indexOf('.'))
      : path.extname(filePath)

    return {
      dirname: path.dirname(filePath),
      basename: path.basename(filePath, extname),
      extname
    }
  }

  streamTransform._transform = function (originalFile, encoding, done) {
    const file = originalFile.clone({ contents: false })
    let parsedPath = parsePath(file.relative)
    let filePath

    const type = typeof param

    if (type === 'string' && param !== '') {
      filePath = param
    } else if (type === 'function') {
      const newParsedPath = param(parsedPath, file)
      if (typeof newParsedPath === 'object' && newParsedPath !== null) {
        parsedPath = newParsedPath
      }

      filePath = path.join(
        parsedPath.dirname,
        parsedPath.basename + parsedPath.extname
      )
    } else if (type === 'object' && param !== undefined && param !== null) {
      const dirname = 'dirname' in param ? param.dirname : parsedPath.dirname
      const prefix = param.prefix || ''
      const suffix = param.suffix || ''
      const basename = 'basename' in param ? param.basename : parsedPath.basename
      const extname = 'extname' in param ? param.extname : parsedPath.extname

      filePath = path.join(dirname, prefix + basename + suffix + extname)
    } else {
      done(
        new Error('Unsupported renaming parameter type supplied'),
        undefined
      )
      return
    }

    file.path = path.join(file.base, filePath)

    // Rename sourcemap if present
    if (file.sourceMap) {
      file.sourceMap.file = file.relative
    }

    done(null, file)
  }

  return streamTransform
}
