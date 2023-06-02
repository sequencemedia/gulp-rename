import path from 'node:path'

import { helper } from './spec-helper.mjs'

describe('gulp-rename path parsing', function () {
  describe('dirname', function () {
    context('when src pattern contains no globs', function () {
      it("dirname is '.'", function (done) {
        const srcPattern = 'test/fixtures/hello.txt'
        const func = function (filePath) {
          filePath.dirname.should.equal('.')
        }
        helper(srcPattern, func, null, done)
      })
    })

    context('when src pattern contains filename glob', function () {
      it("dirname is '.'", function (done) {
        const srcPattern = 'test/fixtures/*.min.txt'
        const func = function (filePath) {
          filePath.dirname.should.equal('.')
        }
        helper(srcPattern, func, null, done)
      })
    })

    const dirnameHelper = function (srcPattern) {
      it('dirname is path from directory glob to file', function (done) {
        const func = function (filePath) {
          filePath.dirname.should.match(/^fixtures[0-9]?$/)
        }
        helper(srcPattern, func, null, done)
      })
    }

    context('when src pattern matches a directory with *', function () {
      dirnameHelper('test/*/*.min.txt')
    })

    context('when src pattern matches a directory with **', function () {
      dirnameHelper('test/**/*.min.txt')
    })

    context('when src pattern matches a directory with [...]', function () {
      dirnameHelper('test/fixt[a-z]res/*.min.txt')
    })

    context('when src pattern matches a directory with {...,...}', function () {
      dirnameHelper('test/f{ri,ixtur}es/*.min.txt')
    })

    /* SKIP: glob2base does not handle brace expansion as expected. See wearefractal/glob2base#1 */
    context.skip(
      'when src pattern matches a directory with {#..#}',
      function () {
        dirnameHelper('test/fixtures{0..9}/*.min.txt')
      }
    )

    context('when src pattern matches a directory with an extglob', function () {
      dirnameHelper('test/f+(ri|ixtur)es/*.min.txt')
    })

    context('when src pattern includes `base` option', function () {
      it('dirname is path from given directory to file', function (done) {
        const srcPattern = 'test/**/*.min.txt'
        const srcOptions = { base: process.cwd() }
        const func = function (filePath) {
          filePath.dirname.should.equal(path.join('test', 'fixtures'))
        }
        helper({ pattern: srcPattern, options: srcOptions }, func, null, done)
      })
    })
  })

  describe('basename', function () {
    it('strips extension like path.basename(filePath, ext)', function (done) {
      const srcPattern = 'test/fixtures/hello.min.txt'
      const func = function (filePath) {
        filePath.basename.should.equal('hello.min')
        filePath.basename.should.equal(
          path.basename(srcPattern, path.extname(srcPattern))
        )
      }
      helper(srcPattern, func, null, done)
    })
  })

  describe('extname', function () {
    it("includes '.' like path.extname", function (done) {
      const srcPattern = 'test/fixtures/hello.txt'
      const func = function (filePath) {
        filePath.extname.should.equal('.txt')
        filePath.extname.should.equal(path.extname(srcPattern))
      }
      helper(srcPattern, func, null, done)
    })

    it('excludes multiple extensions like path.extname', function (done) {
      const srcPattern = 'test/fixtures/hello.min.txt'
      const func = function (filePath) {
        filePath.extname.should.equal('.txt')
        filePath.extname.should.equal(path.extname(srcPattern))
      }
      helper(srcPattern, func, null, done)
    })
  })

  describe('multiExt option', function () {
    it('includes multiple extensions in extname', function (done) {
      const srcPattern = 'test/fixtures/hello.min.txt'
      const func = function (filePath) {
        filePath.extname.should.equal('.min.txt')
        filePath.basename.should.equal('hello')
      }
      helper(srcPattern, func, null, done, { multiExt: true })
    })
  })

  describe('original file context', function () {
    it('passed to plugin as second argument', function (done) {
      const srcPattern = 'test/fixtures/hello.min.txt'
      const func = function (filePath, file) {
        file.should.be.instanceof(Object)
        file.should.be.ok()
      }
      helper(srcPattern, func, null, done, { multiExt: true })
    })

    it('has expected properties', function (done) {
      const srcPattern = 'test/fixtures/hello.min.txt'
      const func = function (filePath, file) {
        file.filePath.should.equal(path.resolve(srcPattern))
        file.base.should.equal(path.dirname(path.resolve(srcPattern)))
        file.basename.should.equal(path.basename(srcPattern))
        file.relative.should.equal(path.basename(srcPattern))
        file.extname.should.equal(path.extname(srcPattern))
      }
      helper(srcPattern, func, null, done, { multiExt: true })
    })
  })
})
