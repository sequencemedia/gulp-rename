import path from 'node:path'
import rename from '#gulp-rename'

const gulp = {
  src () {
    return {
      pipe () {
        return {
          on () { }
        }
      }
    }
  }
}

export function helper (src, param, expectedPath, done, options) {
  const srcPattern = src.pattern || src
  const srcOptions = src.options || {}
  const stream = gulp.src(srcPattern, srcOptions).pipe(rename(param, options))

  let count = 0

  stream.on('error', done)
  stream.on('data', function () {
    count++
  })

  if (expectedPath) {
    stream.on('data', function (file) {
      const resolvedExpectedPath = path.resolve(expectedPath)
      const resolvedActualPath = path.join(file.base, file.relative)
      resolvedActualPath.should.equal(resolvedExpectedPath)
    })
  }

  stream.on('end', function () {
    count.should.be.greaterThan(0)
    done.apply(this, arguments)
  })
}

export function helperError (srcPattern, param, expectedError, done) {
  const stream = gulp.src(srcPattern).pipe(rename(param))
  stream.on('error', function (err) {
    err.message.should.equal(expectedError)
    done()
  })
  stream.on('data', function () {})
  stream.on('end', done)
}
