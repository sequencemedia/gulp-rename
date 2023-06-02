'use strict'

import rename from '#gulp-rename'
import Vinyl from 'vinyl'

const sourceMaps = {
  init () {

  }
}

describe('gulp-rename', function () {
  context('when file has source map', function () {
    it('updates source map file to match relative path of renamed file', function (done) {
      const init = sourceMaps.init()
      const stream = init
        .pipe(rename({ prefix: 'test-' }))
        .pipe(rename({ prefix: 'test-' }))

      stream.on('data', function (file) {
        file.sourceMap.file.should.equal('test-test-fixture.css')
        file.sourceMap.file.should.equal(file.relative)
        done()
      })

      init.write(
        new Vinyl({
          base: 'fixtures',
          path: 'fixtures/fixture.css',
          contents: Buffer.from('')
        })
      )

      init.end()
    })
  })
})
