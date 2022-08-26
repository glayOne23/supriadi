$(function () {
  'use strict'
  /* global QUnit */
  /* global $ */
  /* global AceApp */


  QUnit.module('aside plugin')

  QUnit.test('should be defined on jquery object', function (assert) {
    assert.expect(1)
    assert.ok($(document.body).aceAside, 'aside method is defined')
  })

  QUnit.module('aceAside', {
    beforeEach: function () {
      // Run all tests in noConflict mode -- it's the only way to ensure that the plugin works in noConflict mode
      $.fn.aceAsideNC = $.fn.aceAside.noConflict()
    },
    afterEach: function () {
      $.fn.aceAside = $.fn.aceAsideNC
      delete $.fn.aceAsideNC
      $('#qunit-fixture').html('')
    }
  })


  QUnit.test('should provide no conflict', function (assert) {
    assert.expect(1)
    assert.strictEqual(typeof $.fn.aceAside, 'undefined', 'aside was set back to undefined (org value)')
  })

  QUnit.test('should return jquery collection containing the element', function (assert) {
    assert.expect(2)
    var $el = $('<div/>')
    var $aside = $el.aceAsideNC()
    assert.ok($aside instanceof $, 'returns jquery collection')
    assert.strictEqual($aside[0], $el[0], 'collection contains element')
  })

  QUnit.test('should set basic options', function (assert) {
    assert.expect(4)

    var aside = $('<div id="aside-1" class="modal"><div class="modal-dialog"/></div>').appendTo('#qunit-fixture')
    aside.aceAsideNC({
      placement: 'tr',
      blocking: true,

      width: 200,
      height: 300
    })

    assert.notOk(aside.hasClass('modal-nb'))
    assert.ok(aside.hasClass('aside-top aside-r'))

    assert.equal(aside.find('.modal-dialog').css('width'), '200px')
    assert.equal(aside.find('.modal-dialog').css('height'), '300px')
  })


  QUnit.test('should be automatically hidden after 500ms', function (assert) {
    assert.expect(2)
    var done = assert.async()

    var aside = $('<div id="aside-123s" class="modal"><div class="modal-dialog"/></div>').appendTo('#qunit-fixture')
    aside.aceAsideNC({
      autohide: 500
    }).aceAsideNC('show')

    assert.ok(aside.hasClass('show'))

    var d1 = new Date()
    var t1 = d1.getTime()

    aside.on('hide.bs.modal', function (e) {
      if (e.namespace != 'bs.modal') return

      var d2 = new Date()
      var t2 = d2.getTime()

      var diff = t2 - t1


      assert.ok(diff > 500 && diff < 1000)

      done()
    })
  })


  QUnit.test('should hide aside when clicking outside of its area if it has `.modal-dismiss`', function (assert) {
    assert.expect(3)
    var done = assert.async(2)

    var aside = $('<div id="aside-1" class="modal ace-aside modal-nb modal-dismiss"><div class="modal-dialog"/></div>').appendTo('#qunit-fixture')
    aside.on('shown.bs.modal', function () {
      assert.ok(aside.hasClass('show'), 'aside is shown')

      setTimeout(function () {
        // clicking inside aside won't hide it
        AceApp.EventHandler.trigger(document.body, 'mouseup')

        setTimeout(function () {
          assert.notOk(aside.hasClass('show'), 'aside is hidden -- timeout')
          done()
        }, 500)
      }, 0)
    })

      .on('hidden.bs.modal', function () {
        assert.notOk(aside.hasClass('show'), 'aside is hidden -- event')
        done()
      })

      .aceAsideNC('show')
  })

  QUnit.test('should not hide aside when clicking inside its area if it has `.modal-dismiss`', function (assert) {
    assert.expect(1)
    var done = assert.async()

    var aside = $('<div id="aside-1" class="modal ace-aside modal-nb modal-dismiss"><div class="modal-dialog"/></div>').appendTo('#qunit-fixture')
    aside.on('shown.bs.modal', function () {
      setTimeout(function () {
        // clicking inside aside won't hide it
        aside.find('.modal-dialog').trigger('mouseup')

        setTimeout(function () {
          assert.ok(aside.hasClass('show'), 'aside is not hidden')
          done()
        }, 500)
      }, 0)
    })

      .aceAsideNC('show')
  })

  QUnit.test('should return aside version', function (assert) {
    assert.expect(1)

    if (typeof AceApp.Aside !== 'undefined') {
      assert.ok(typeof AceApp.Aside.VERSION === 'string')
    } else {
      assert.notOk()
    }
  })

})
