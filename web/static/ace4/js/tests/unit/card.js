$(function () {
  'use strict'
  /* global QUnit */
  /* global $ */
  /* global AceApp */


  QUnit.module('card plugin')

  QUnit.test('should be defined on jquery object', function (assert) {
    assert.expect(1)
    assert.ok($(document.body).aceCard, 'card method is defined')
  })

  QUnit.module('aceCard', {
    beforeEach: function () {
      // Run all tests in noConflict mode -- it's the only way to ensure that the plugin works in noConflict mode
      $.fn.aceCardNC = $.fn.aceCard.noConflict()
    },
    afterEach: function () {
      $.fn.aceCard = $.fn.aceCardNC
      delete $.fn.aceCardNC
      $('#qunit-fixture').html('')
    }
  })

  QUnit.test('should provide no conflict', function (assert) {
    assert.expect(1)
    assert.strictEqual(typeof $.fn.aceCard, 'undefined', 'aside was set back to undefined (org value)')
  })

  QUnit.test('should return jquery collection containing the element', function (assert) {
    assert.expect(2)
    var $el = $('<div/>')
    var $card = $el.aceCardNC()
    assert.ok($card instanceof $, 'returns jquery collection')
    assert.strictEqual($card[0], $el[0], 'collection contains element')
  })


  QUnit.test('shoud hide/collapse card', function (assert) {
    assert.expect(2)
    var done = assert.async()

    var card = $('<div class="card"><div class="card-header"></div><div class="card-body"></div></div>').appendTo('#qunit-fixture')
    card.get(0).addEventListener('hidden.ace.card', function () {
      assert.ok(card.find('.card-body').is('.collapse:not(.show)'))
      done()
    })

    card.aceCardNC('hide')
    assert.ok(card.find('.card-body').is('.collapsing'))
  })


  QUnit.test('shoud hide/collapse card fast', function (assert) {
    assert.expect(1)
    var done = assert.async()

    var d1 = new Date()
    var t1 = d1.getTime()

    var card = $('<div class="card"><div class="card-header"></div><div class="card-body"></div></div>').appendTo('#qunit-fixture')
    card.get(0).addEventListener('hidden.ace.card', function () {
      var d2 = new Date()
      var t2 = d2.getTime()

      assert.ok(t2 - t1 < 20)
      done()
    })

    card.aceCardNC('toggleFast')
  })

  QUnit.test('shoud show card', function (assert) {
    assert.expect(2)
    var done = assert.async()

    var card = $('<div class="card"><div class="card-header"></div><div class="card-body collapse"></div></div>').appendTo('#qunit-fixture')
    card.get(0).addEventListener('shown.ace.card', function () {
      assert.ok(card.find('.card-body').is('.show'))
      done()
    })

    card.aceCardNC('show')
    assert.ok(card.find('.card-body').is('.collapsing'))
  })

  QUnit.test('shoud show card fast', function (assert) {
    assert.expect(1)
    var done = assert.async()

    var d1 = new Date()
    var t1 = d1.getTime()

    var card = $('<div class="card"><div class="card-header"></div><div class="card-body collapse"></div></div>').appendTo('#qunit-fixture')
    card.get(0).addEventListener('shown.ace.card', function () {
      var d2 = new Date()
      var t2 = d2.getTime()

      assert.ok(t2 - t1 < 20)
      done()
    })

    card.aceCardNC('toggleFast')
  })

  QUnit.test('shoud close/remove card', function (assert) {
    assert.expect(2)
    var done = assert.async()

    var card = $('<div class="card"></div>').appendTo('#qunit-fixture')
    card.get(0).addEventListener('closed.ace.card', function () {
      setTimeout(function () {
        assert.equal(card.get(0).parentElement, null)
        done()
      }, 0)
    })

    card.aceCardNC('close')
    assert.ok(card.is('.fade'))
  })

  QUnit.test('shoud close/remove card fast', function (assert) {
    assert.expect(2)
    var done = assert.async()

    var d1 = new Date()
    var t1 = d1.getTime()

    var card = $('<div class="card"></div>').appendTo('#qunit-fixture')
    card.get(0).addEventListener('closed.ace.card', function () {
      setTimeout(function () {
        var d2 = new Date()
        var t2 = d2.getTime()

        assert.ok(t2 - t1 < 50)
        assert.equal(card.get(0).parentElement, null)

        done()
      }, 0)
    })

    card.aceCardNC('closeFast')
  })

  QUnit.test('shoud expand/restore card', function (assert) {
    assert.expect(7)
    var done = assert.async()

    var card = $('<div class="card"></div>').appendTo('#qunit-fixture')
    card.get(0).addEventListener('expanded.ace.card', function () {
        assert.ok(card.hasClass('card-expand'))
        assert.equal(card.outerWidth(), $(window).width())
        assert.equal(card.outerHeight(), $(window).height())

        card.aceCardNC('restore')
      })
      card.get(0).addEventListener('restored.ace.card', function () {
        assert.notOk(card.hasClass('card-expand'))
        assert.notEqual(card.outerWidth(), $(window).width())
        assert.notEqual(card.outerHeight(), $(window).height())

        done()
      })

    card.aceCardNC('expand')
    assert.ok(card.is('.card-expanding'))
  })

  QUnit.test('shoud expand card fast', function (assert) {
    assert.expect(1)
    var done = assert.async()

    var d1 = new Date()
    var t1 = d1.getTime()

    var card = $('<div class="card"></div>').appendTo('#qunit-fixture')
    card.get(0).addEventListener('expanded.ace.card', function () {
      var d2 = new Date()
      var t2 = d2.getTime()

      assert.ok(t2 - t1 < 20)
      done()
    })

    card.aceCardNC('expandFast')
  })

  QUnit.test('shoud remove placeholder of an expanded card', function (assert) {
    assert.expect(3)
    var done = assert.async()

    var card = $('<div class="card"></div>').appendTo('#qunit-fixture')
    AceApp.EventHandler.one(card.get(0), 'expanded.ace.card', function () {
        card.aceCardNC('close')
      })
    
    AceApp.EventHandler.one(card.get(0), 'closed.ace.card', function () {
        assert.equal($('.card-expanded-placeholder').length, 0)
        setTimeout(function () {
          assert.equal(card.get(0).parentElement, null)
          done()
        }, 0)
      })

    card.aceCardNC('expand')
    assert.equal($('.card-expanded-placeholder').length, 1)
  })


  QUnit.test('shoud add/remove loading overlay', function (assert) {
    assert.expect(2)

    var card = $('<div class="card"></div>').appendTo('#qunit-fixture')

    card.aceCardNC('startLoading', '<i class="bs-card-loading-icon fa fa-spinner fa-spin fa-2x text-white">LOADING</i>')
    assert.ok(card.text().indexOf('LOADING') >= 0)

    card.aceCardNC('stopLoading')
    assert.ok(card.text().indexOf('LOADING') === -1)
  })

  QUnit.test('shoud prevent collapsing/showing/closing/expanding/restoring card', function (assert) {
    assert.expect(3)

    var card = $('<div class="card"><div class="card-header"></div><div class="card-body"></div></div>').appendTo('#qunit-fixture')
    card.get(0).addEventListener('hide.ace.card', (ev) => {
        ev.preventDefault()
      })
    
    card.get(0).addEventListener('expand.ace.card', (ev) => {
        ev.preventDefault()
      })

    card.get(0).addEventListener('close.ace.card', (ev) => {
        ev.preventDefault()
      })


    card.aceCardNC('hide')
    assert.notOk(card.find('.card-body').is('.collapsing'))

    card.aceCardNC('expand')
    assert.notOk(card.is('.card-expanding'))

    card.aceCardNC('close')
    assert.notOk(card.is('.fade'))
  })

  QUnit.test('should return card version', function (assert) {
    assert.expect(1)

    if (typeof AceApp.Card !== 'undefined') {
      assert.ok(typeof AceApp.Card.VERSION === 'string')
    } else {
      assert.notOk()
    }
  })
 
})
