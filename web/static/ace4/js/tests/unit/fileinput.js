$(function () {
  'use strict'
  /* global QUnit */
  /* global $ */
  /* global AceApp */


  QUnit.module('fileinput plugin')

  QUnit.test('should be defined on jquery object', function (assert) {
    assert.expect(1)
    assert.ok($(document.body).aceFileInput, 'aceFileInput method is defined')
  })

  QUnit.module('aceFileInput', {
    beforeEach: function () {
      // Run all tests in noConflict mode -- it's the only way to ensure that the plugin works in noConflict mode
      $.fn.aceFileInputNC = $.fn.aceFileInput.noConflict()
    },
    afterEach: function () {
      $.fn.aceFileInput = $.fn.aceFileInputNC
      delete $.fn.aceFileInputNC
      $('#qunit-fixture').html('')
    }
  })
  
  QUnit.test('should provide no conflict', function (assert) {
    assert.expect(1)
    assert.strictEqual(typeof $.fn.aceFileInput, 'undefined', 'aceFileInput was set back to undefined (org value)')
  })

  

  QUnit.test('should return jquery collection containing the file input element.', function (assert) {
    assert.expect(2)

    var $el = $('<input type="file" />').appendTo('#qunit-fixture')
    var $fileinput = $el.aceFileInputNC()
    assert.ok($fileinput instanceof $, 'returns jquery collection')
    assert.strictEqual($fileinput[0], $el[0], 'collection contains element')
  })



  QUnit.test('Should not convert to file input if element is not `input[type=file]`', function (assert) {
    assert.expect(1)

    var $el2 = $('<div />').aceFileInputNC()
    assert.notOk($el2.parent().is('label.ace-file-input'), '`DIV` element not convereted to Ace file input')
  })

  QUnit.test('check basic passed parameters', function (assert) {
    assert.expect(4)

    var $chooseText = 'SELECT FILE'
    var $placeholderText = 'NO FILE YET'

    var $el = $('<input type="file" />').appendTo('#qunit-fixture').aceFileInputNC({
      btnChooseClass: 'brc-grey-m1 bgc-grey-l2 border-l-2 pt-15 px-2',
      btnChooseText: $chooseText,
      placeholderText: $placeholderText,
      placeholderIcon: '<i class="fa fa-file bgc-warning-m1 text-white w-4 py-2 text-center"></i>'
    })

    var container = $el.parent().find('.ace-file-container')

    assert.strictEqual(container.find('.ace-file-name').text().trim(), $placeholderText, 'Contains the passed `placeholderText`')
    assert.strictEqual(container.find('.ace-file-btn').text().trim(), $chooseText, 'Contains the passed `chooseText`')
    assert.strictEqual(container.find('.ace-file-icon').find('.fa-file.bgc-warning-m1').length, 1, '')
    assert.ok(container.find('.ace-file-btn').is('.brc-grey-m1.bgc-grey-l2'), '')
  })


  QUnit.test('should correctly set `accept` attribute when `allowMime` or `allowExt` is specified', function (assert) {
    assert.expect(2)
    var $el = $('<input type="file" />').appendTo('#qunit-fixture').aceFileInputNC({
      allowExt: 'png|gif',
      allowMime: 'text/html'
    })
    var $el2 = $('<input type="file" accept=".png" />').appendTo('#qunit-fixture').aceFileInputNC({
      allowExt: 'gif',
      allowMime: 'text/html'
    })

    assert.strictEqual($el.attr('accept'), '.png,.gif,text/html', 'set `accept` attribute')
    assert.strictEqual($el2.attr('accept'), '.png', 'should not change `accept` attribute')
  })

  QUnit.test('should disable/enable file input element', function (assert) {
    assert.expect(2)
    var $el = $('<input type="file" />').appendTo('#qunit-fixture').aceFileInputNC()

    $el.aceFileInputNC('disable')
    assert.strictEqual($el.attr('disabled'), 'disabled', 'File input disabled')

    $el.aceFileInputNC('enable')
    assert.strictEqual(typeof $el.attr('disabled'), 'undefined', 'File input enabled')
  })

  QUnit.test('should show/hide loading overlay ', function (assert) {
    assert.expect(2)
    var $el = $('<input type="file" />').appendTo('#qunit-fixture').aceFileInputNC()

    $el.aceFileInputNC('startLoading', '<i class="overlay-content fa fa-spin fa-spinner text-white fa-2x">IS LOADING</i>')
    assert.notEqual($el.parent().find('.ace-file-overlay').text().indexOf('IS LOADING'), -1)

    $el.aceFileInputNC('stopLoading')
    assert.equal($el.parent().find('.ace-file-overlay').length, 0)
  })


  QUnit.test('should show file list ', function (assert) {
    assert.expect(4)

    var $el = $('<input type="file" multiple />').appendTo('#qunit-fixture').aceFileInputNC()

    $el.aceFileInputNC('showFileList', [{ name: '111.png', type: 'image' }, { name: '222.txt', type: 'document' }])
    var containerText = $el.parent().find('.ace-file-container').text()

    assert.notEqual(containerText.indexOf('111.png'), -1)
    assert.notEqual(containerText.indexOf('222.txt'), -1)

    $el.aceFileInputNC('resetInput')
    containerText = $el.parent().find('.ace-file-container').text()
    assert.equal(containerText.indexOf('111.png'), -1)
    assert.equal(containerText.indexOf('222.txt'), -1)
  })


  QUnit.test('should change default video file icon', function (assert) {
    assert.expect(2)

    var $el = $('<input type="file" />').appendTo('#qunit-fixture').aceFileInputNC({
      fileIcons: {
        video: '<i class="fa fa-film bgc-purple text-white w-4 py-2 text-center"></i>'
      }
    })

    $el.aceFileInputNC('showFileList', [{ name: '1.mp4' }, { name: '2.pdf' }])

    var container = $el.parent().find('.ace-file-container')

    assert.equal(container.find('i.fa-film').length, 1, 'Shows new `fa-film` icon for video file')
    assert.equal(container.find('i.fa-file-alt').length, 1, 'Shows default `fa-file-alt` icon for document file')
  })


  QUnit.test('show check file list and remove unwanted ones', function (assert) {
    assert.expect(4)
    var done = assert.async()

    var $el = $('<input type="file" multiple />').appendTo('#qunit-fixture').aceFileInputNC({
      allowExt: 'png|gif',
      allowMime: 'image/png|image/gif',
      maxSize: 5000
    })

    var ref = $el.data('ace.file')

    var safeFiles = ref._checkFileList([
      { name: '1.png', type: 'image/png', size: 1000 },
      { name: '2.txt', type: 'image/png', size: 1000 },
      { name: '3.png', type: 'text/html', size: 1000 },
      { name: '4png', type: 'image/png', size: 1000 }
    ])

    setTimeout(function () {
      assert.equal(safeFiles.length, 1, '1 valid file(s) ... according to allowed extension or mimetype')

      safeFiles = ref._checkFileList([
        { name: 'test1.gif', type: 'image/gif', size: 1000 },
        { name: 'test2.png', type: 'image/png', size: 10000 }
      ])
      assert.equal(safeFiles.length, 1, '1 valid file(s) ... according to allowed file size')
    }, 0)

    var $el2 = $('<input type="file" multiple />').appendTo('#qunit-fixture').aceFileInputNC({
      denyExt: 'png',
      denyMime: 'image/png'
    })
    var ref2 = $el2.data('ace.file')
    var safeFiles2 = ref2._checkFileList([
      { name: '1.png', type: 'image/png' },
      { name: '2.jpg', type: 'image/jpg' }
    ])

    setTimeout(function () {
      assert.equal(safeFiles2.length, 1, '1 valid file(s) ... according to denied extension or mimetype')
    }, 0)

    var $el3 = $('<input type="file" multiple />').appendTo('#qunit-fixture').aceFileInputNC({
      allowMime: 'image/*|audio/*'
    })
    var ref3 = $el3.data('ace.file')
    var safeFiles3 = ref3._checkFileList([
      { name: '1.html', type: 'text/html' },
      { name: '2.jpg', type: 'image/jpg' },
      { name: '3.png', type: 'image/png' },
      { name: '4.pdf', type: 'application/pdf' },
      { name: '5.mp3', type: 'audio/mpeg' }
    ])

    setTimeout(function () {
      assert.equal(safeFiles3.length, 3, '3 valid file(s) ... according to denied extension or mimetype')
      done()
    }, 100)
  })


  QUnit.test('should trigger `invalid.ace.file` event', function (assert) {
    assert.expect(5)

    var $el = $('<input type="file" multiple />').appendTo('#qunit-fixture').aceFileInputNC({
      allowExt: 'png|gif',
      allowMime: 'image/png|image/gif',
      maxSize: 5000
    })
     $el.get(0).addEventListener('invalid.ace.file', function (e) {
       var p = e.$_fileErrors

        assert.equal(p.fileCount, 4, '4 input files')
        assert.equal(p.invalidCount, 3, '3 invalid files')
        assert.equal(p.errorCount.ext, 1, '1 invalid extensions')
        assert.equal(p.errorCount.mime, 1, '1 invalid mimetype')
        assert.equal(p.errorCount.size, 1, '1 invalid size')
      })

    var ref = $el.data('ace.file')
    ref._checkFileList([
      { name: '1.png', type: 'image/png', size: 1000 },
      { name: '2.txt', type: 'image/png', size: 1000 },
      { name: '3.png', type: 'text/html', size: 1000 },
      { name: '4.png', type: 'image/png', size: 10000 }
    ])
  })



  QUnit.test('should return fileinput version', function (assert) {
    assert.expect(1)

    if (typeof AceApp.FileInput !== 'undefined') {
      assert.ok(typeof AceApp.FileInput.VERSION === 'string')
    } else {
      assert.notOk()
    }
  })
})
