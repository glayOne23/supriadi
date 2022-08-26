$(function () {
  'use strict'
  /* global QUnit */
  /* global viewport */
  /* global $ */

  QUnit.module('sticky event')

  QUnit.module('aceSticky', {
    afterEach: function () {
      $('#qunit-fixture').html('')
    }
  })

  QUnit.test('should trigger sticky event', function (assert) {
    assert.expect(1)
    var done = assert.async()

    $('<div style="height: 100px; width: 100%;"></div>').appendTo('#qunit-fixture')
    var nav = $('<ul class="sticky-nav"><li>11</li></ul>').appendTo('#qunit-fixture')
    $('<div style="height: 3000px; width: 100%;"></div>').appendTo('#qunit-fixture')

    setTimeout(function () {
      nav.get(0).addEventListener('sticky-change', function (e) {
        assert.ok(e.detail.isSticky, 'sticky-change triggered')
        done()
      })

      $('html,body').scrollTop(3300)
    }, 100)

    nav.aceSticky()
  })

  QUnit.test('should not trigger sticky event on above `md` size', function (assert) {
    assert.expect(1)
    var done = assert.async()

    $('<div style="height: 100px; width: 100%;"></div>').appendTo('#qunit-fixture')
    var nav = $('<ul class="sticky-nav-md"><li>11</li></ul>').appendTo('#qunit-fixture')
    $('<div style="height: 3000px; width: 100%;"></div>').appendTo('#qunit-fixture')

    setTimeout(function () {
      nav.get(0).addEventListener('sticky-change', function (e) {
        assert.notOk(e.detail.isSticky, 'sticky-change triggered')
        done()
      })

      $('html,body').scrollTop(3300)
    }, 100)

    nav.aceSticky()
  })

  QUnit.test('should trigger sticky event on below `md` size', function (assert) {
    assert.expect(1)
    var done = assert.async()

    viewport.set(480, 640)

    $('<div style="height: 100px; width: 100%;"></div>').appendTo('#qunit-fixture')
    var nav = $('<ul class="sticky-nav-md"><li>11</li></ul>').appendTo('#qunit-fixture')
    $('<div style="height: 3000px; width: 100%;"></div>').appendTo('#qunit-fixture')

    setTimeout(function () {
      nav.get(0).addEventListener('sticky-change', function (e) {
        assert.ok(e.detail.isSticky, 'sticky-change triggered')
        viewport.reset()
        done()
      })

      $('html,body').scrollTop(3300)
    }, 100)

    nav.aceSticky()
  })
})
