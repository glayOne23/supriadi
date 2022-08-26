$(function () {
  'use strict'
  /* global QUnit */
  /* global $ */
  /* global AceApp */


  QUnit.module('toaster plugin')

  QUnit.test('should be defined on jquery object', function (assert) {
    assert.expect(1)
    assert.ok($(document.body).aceToaster && $.aceToaster, 'toaster method is defined')
  })

  QUnit.module('aceToaster', {
    beforeEach: function () {
      // Run all tests in noConflict mode -- it's the only way to ensure that the plugin works in noConflict mode
      $.fn.aceToasterNC = $.fn.aceToaster.noConflict()
    },
    afterEach: function () {
      $.fn.aceToaster = $.fn.aceToasterNC
      delete $.fn.aceToasterNC
      $('#qunit-fixture').html('')
      $('.ace-toaster-container').remove()
    }
  })


  QUnit.test('should provide no conflict', function (assert) {
    assert.expect(1)
    assert.strictEqual(typeof $.fn.aceToaster, 'undefined', 'aside was set back to undefined (org value)')
  })

  
  QUnit.test('should return jquery collection containing the element', function (assert) {
    assert.expect(2)
    var $el = $('<div/>')
    var $toaster = $el.aceToasterNC()
    assert.ok($toaster instanceof $, 'returns jquery collection')
    assert.strictEqual($toaster[0], $el[0], 'collection contains element')
  })


  QUnit.test('shoud add toast message', function (assert) {
    assert.expect(6)

    var toast = $.aceToaster.add({
      placement: 'tr',
      title: 'title1',
      body: 'body1',

      bodyClass: 'text-blue',
      headerClass: 'text-orange'
    })

    assert.ok($(toast).hasClass('showing'))
    assert.ok($(toast).closest('.ace-toaster-container').hasClass('position-tr'))
    assert.ok($(toast).hasClass('toast'))
    assert.strictEqual($(toast).find('.toast-body').text(), 'body1')

    assert.ok($(toast).find('.toast-body').hasClass('text-blue'), 'body class set')
    assert.ok($(toast).find('.toast-header').hasClass('text-orange'), 'header class set')
  })


  QUnit.test('should add toast message based on existing HTML element', function (assert) {
    assert.expect(2)

    var toast = $('<div id="toast-1" class="toast"><div class="toast-body" /></div>').get(0)
    $(toast).aceToasterNC({
      placement: 'br'
    })

    assert.ok($(toast).hasClass('showing'))
    assert.ok($(toast).closest('.ace-toaster-container').hasClass('position-br'))
  })


  QUnit.test('should remove toast by selector', function (assert) {
    assert.expect(1)
    var done = assert.async()

    var toast = $.aceToaster.add({
      title: 'title2',
      body: 'body2'
    })

    setTimeout(function () {
      $.aceToaster.remove('#' + toast.id)
      setTimeout(function () {
        assert.strictEqual(toast.parentNode, null)
        done()
      }, 500)
    }, 500)
  })

  QUnit.test('should remove toasts by position', function (assert) {
    assert.expect(2)
    var done = assert.async()

    var toast1 = $.aceToaster.add({
      placement: 'br',

      title: 'title3',
      body: 'body3'
    })
    var toast2 = $.aceToaster.add({
      placement: 'tr',

      title: 'title4',
      body: 'body4'
    })

    setTimeout(function () {
      $.aceToaster.removeAll('br')
      setTimeout(function () {
        assert.strictEqual(toast1.parentNode, null)
        assert.notEqual(toast2.parentNode, null)
        done()
      }, 500)
    }, 500)
  })

  QUnit.test('should prevent adding toaster', function (assert) {
    assert.expect(2)

    let fn = (ev) => {
      if (ev.target.innerHTML.indexOf('title1') > 0) ev.preventDefault()
    }
    document.addEventListener('add.ace.toaster', fn)
    var toast1 = $.aceToaster.add({
      title: 'title1',
      body: 'body1'
    })
    var toast2 = $.aceToaster.add({
      title: 'title2',
      body: 'body2'
    })

    assert.equal(toast1, null)
    assert.notEqual(toast2, null)

    document.removeEventListener('add.ace.toaster', fn)
  })



  QUnit.test('should prevent removing toast messages when they are in "top-right" position', function (assert) {
    assert.expect(2)
    var done = assert.async()

    let fn = (ev) => {
      if (ev.detail.placement === 'tr' || ev.detail.placement === 'all') ev.preventDefault()
    }
    document.addEventListener('clear.ace.toaster', fn)

    var toast1 = $.aceToaster.add({
      title: 'title1',
      body: 'body1',
      position: 'tr'
    })
    var toast2 = $.aceToaster.add({
      title: 'title2',
      body: 'body2',
      position: 'br'
    })

    $.aceToaster.removeAll('br')
    $.aceToaster.removeAll('tr')

    setTimeout(function () {
      setTimeout(function () {
        assert.notEqual(toast1.parentNode, null)
        setTimeout(function () {
          assert.notEqual(toast2.parentNode, null)
          done()

          document.removeEventListener('clear.ace.toaster', fn)
        }, 500)
      }, 500)
    }, 500)
  })

  QUnit.test('should return toaster version', function (assert) {
    assert.expect(1)

    if (typeof AceApp.Toaster !== 'undefined') {
      assert.ok(typeof AceApp.Toaster.VERSION === 'string')
    } else {
      assert.notOk()
    }
  })
})
