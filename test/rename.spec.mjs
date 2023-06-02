import path from 'node:path'
import { helper, helperError } from './spec-helper.mjs'
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

describe('gulp-rename', () => {
  context('with string parameter', () => {
    context('when src pattern does not contain directory glob', () => {
      it('sets filename to value', (done) => {
        const srcPattern = 'test/fixtures/hello.txt'
        const param = 'hola.md'
        const expectedPath = 'test/fixtures/hola.md'
        helper(srcPattern, param, expectedPath, done)
      })
    })
    context('when src pattern contains directory glob', () => {
      it('sets relative path to value', (done) => {
        const srcPattern = 'test/**/hello.txt'
        const param = 'fixtures/hola.md'
        const expectedPath = 'test/fixtures/hola.md'
        helper(srcPattern, param, expectedPath, done)
      })
    })
  })

  context('with object parameter', () => {
    let srcPattern

    beforeEach(() => {
      srcPattern = 'test/**/hello.txt'
    })

    context('with empty object', () => {
      it('has no effect', (done) => {
        const param = {}
        const expectedPath = 'test/fixtures/hello.txt'
        helper(srcPattern, param, expectedPath, done)
      })
    })

    context('with dirname value', () => {
      it('replaces dirname with value', (done) => {
        const param = {
          dirname: 'elsewhere'
        }
        const expectedPath = 'test/elsewhere/hello.txt'
        helper(srcPattern, param, expectedPath, done)
      })

      it("removes dirname with './'", (done) => {
        const param = {
          dirname: './'
        }
        const expectedPath = 'test/hello.txt'
        helper(srcPattern, param, expectedPath, done)
      })

      it('removes dirname with empty string', (done) => {
        const param = {
          dirname: ''
        }
        const expectedPath = 'test/hello.txt'
        helper(srcPattern, param, expectedPath, done)
      })
    })

    context('with prefix value', () => {
      it('prepends value to basename', (done) => {
        const param = {
          prefix: 'bonjour-'
        }
        const expectedPath = 'test/fixtures/bonjour-hello.txt'
        helper(srcPattern, param, expectedPath, done)
      })
    })

    context('with basename value', () => {
      it('replaces basename with value', (done) => {
        const param = {
          basename: 'aloha'
        }
        const expectedPath = 'test/fixtures/aloha.txt'
        helper(srcPattern, param, expectedPath, done)
      })
      it('removes basename with empty string (for consistency)', (done) => {
        const param = {
          prefix: 'aloha',
          basename: ''
        }
        const expectedPath = 'test/fixtures/aloha.txt'
        helper(srcPattern, param, expectedPath, done)
      })
    })

    context('with suffix value', () => {
      it('appends value to basename', (done) => {
        const param = {
          suffix: '-hola'
        }
        const expectedPath = 'test/fixtures/hello-hola.txt'
        helper(srcPattern, param, expectedPath, done)
      })
    })

    context('with extname value', () => {
      it('replaces extname with value', (done) => {
        const param = {
          extname: '.md'
        }
        const expectedPath = 'test/fixtures/hello.md'
        helper(srcPattern, param, expectedPath, done)
      })

      it('removes extname with empty string', (done) => {
        const param = {
          extname: ''
        }
        const expectedPath = 'test/fixtures/hello'
        helper(srcPattern, param, expectedPath, done)
      })
    })
  })

  context('with function parameter', () => {
    let srcPattern
    beforeEach(() => {
      srcPattern = 'test/**/hello.txt'
    })

    it('receives object with dirname', (done) => {
      const param = function (filePath) {
        filePath.dirname.should.equal('fixtures')
        filePath.dirname = 'elsewhere'
      }
      const expectedPath = 'test/elsewhere/hello.txt'
      helper(srcPattern, param, expectedPath, done)
    })

    it('receives object with basename', (done) => {
      const param = function (filePath) {
        filePath.basename.should.equal('hello')
        filePath.basename = 'aloha'
      }
      const expectedPath = 'test/fixtures/aloha.txt'
      helper(srcPattern, param, expectedPath, done)
    })

    it('receives object with extname', (done) => {
      const param = function (filePath) {
        filePath.extname.should.equal('.txt')
        filePath.extname = '.md'
      }
      const expectedPath = 'test/fixtures/hello.md'
      helper(srcPattern, param, expectedPath, done)
    })

    it('receives object from return value', (done) => {
      const param = function (filePath) {
        return {
          dirname: filePath.dirname,
          basename: filePath.basename,
          extname: '.md'
        }
      }
      const expectedPath = 'test/fixtures/hello.md'
      helper(srcPattern, param, expectedPath, done)
    })

    it('ignores null return value but uses passed object', (done) => {
      const param = function (filePath) {
        filePath.extname.should.equal('.txt')
        filePath.extname = '.md'
        return null
      }
      const expectedPath = 'test/fixtures/hello.md'
      helper(srcPattern, param, expectedPath, done)
    })

    it('receives object with extname even if a different value is returned', (done) => {
      const param = function (filePath) {
        filePath.extname.should.equal('.txt')
        filePath.extname = '.md'
      }
      const expectedPath = 'test/fixtures/hello.md'
      helper(srcPattern, param, expectedPath, done)
    })
  })

  context('in parallel streams', () => {
    it('only changes the file in the current stream', (done) => {
      const files = gulp.src('test/fixtures/hello.txt')

      const pipe1 = files.pipe(rename({ suffix: '-1' }))
      const pipe2 = files.pipe(rename({ suffix: '-2' }))
      let end1 = false
      let end2 = false
      let file1
      let file2

      function check () {
        file1.filePath.should.equal(path.resolve('test/fixtures/hello-1.txt'))
        file2.filePath.should.equal(path.resolve('test/fixtures/hello-2.txt'))

        return done()
      }

      pipe1
        .on('data', function (file) {
          file1 = file
        })
        .on('end', () => {
          end1 = true

          if (end2) {
            return check()
          }
        })

      pipe2
        .on('data', function (file) {
          file2 = file
        })
        .on('end', () => {
          end2 = true

          if (end1) {
            return check()
          }
        })
    })
  })

  context('throws unsupported parameter type', () => {
    let srcPattern
    beforeEach(() => {
      srcPattern = 'test/**/hello.txt'
    })

    const UNSUPPORTED_PARAMATER = 'Unsupported renaming parameter type supplied'
    it('with undefined object', (done) => {
      let param
      const expectedError = UNSUPPORTED_PARAMATER
      helperError(srcPattern, param, expectedError, done)
    })

    it('with null object', (done) => {
      const param = null
      const expectedError = UNSUPPORTED_PARAMATER
      helperError(srcPattern, param, expectedError, done)
    })

    it('with empty string', (done) => {
      const param = ''
      const expectedError = UNSUPPORTED_PARAMATER
      helperError(srcPattern, param, expectedError, done)
    })

    it('with boolean value', (done) => {
      const param = true
      const expectedError = UNSUPPORTED_PARAMATER
      helperError(srcPattern, param, expectedError, done)
    })

    it('with numeric value', (done) => {
      const param = 1
      const expectedError = UNSUPPORTED_PARAMATER
      helperError(srcPattern, param, expectedError, done)
    })
  })
})
