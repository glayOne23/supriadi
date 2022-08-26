$(function () {
  'use strict'
  /* global QUnit */
  /* global viewport */
  /* global $ */

  QUnit.module('tab scrolling/swiping')

  QUnit.module('aceTab', {
    afterEach: function () {
      $('#qunit-fixture').html('')
    }
  })

  QUnit.test('should scroll tab buttons', function (assert) {
    assert.expect(1)
    var done = assert.async()

    viewport.set(320, 480)

    var tabs = $(`<ul class="nav nav-tabs nav-tabs-scroll">
        <li><a href="#">1111111111111111</a></li>
        <li><a href="#">222222222222222222222</a></li>
        <li><a href="#">3333333333333333333333333</a></li>
        <li><a href="#">44444444444444444444444444444</a></li>
        <li><a href="#">555555555555555555555555555555555</a></li>
    </ul>`).appendTo('#qunit-fixture')

    tabs.aceTabScroll()

    tabs.find('a').get(3).click()

    setTimeout(function () {
      assert.ok(tabs.get(0).scrollLeft > 0)
      done()
      viewport.reset()
    }, 500)
  })

  QUnit.test('should swipe tab', function (assert) {
    assert.expect(2)
    var done = assert.async()
    viewport.set(320, 480)

    var tabContent = $('<div class="tab-content tab-sliding"><div class="tab-pane active show"></div><div class="tab-pane"></div><div class="tab-pane"></div></div>').appendTo('#qunit-fixture')
    tabContent.aceTabSwipe()

    var tabPane = tabContent.find('.tab-pane.active').get(0)

    var e1 = document.createEvent('UIEvent')
    e1.initUIEvent('touchstart')
    e1.changedTouches = [{ pageX: 150, pageY: 10 }]

    // trigger for tabContent but set target to be tabPane
    Object.defineProperty(e1, 'target', { writable: false, value: tabPane })
    tabContent.get(0).dispatchEvent(e1)

    setTimeout(function () {
      var e2 = document.createEvent('UIEvent')
      e2.initUIEvent('touchmove')
      e2.changedTouches = [{ pageX: 10, pageY: 10 }]
      tabPane.dispatchEvent(e2)

      var e3 = document.createEvent('UIEvent')
      e3.initUIEvent('touchend')
      e3.changedTouches = [{ pageX: 10, pageY: 10 }]
      tabPane.dispatchEvent(e3)

      assert.notOk(tabPane.matches('.show.active'), '')
      assert.ok(tabPane.nextElementSibling.matches('.show.active'), '')

      viewport.reset()

      done()
    }, 0)
  })

  QUnit.test('should swipe tabs only in specified direction (right)', function (assert) {
    assert.expect(4)
    var done = assert.async()
    viewport.set(320, 480)

    var tabContent = $(`<div class="tab-content tab-sliding" data-swipe="right">
        <div class="tab-pane"></div>
        <div class="tab-pane active show"></div>
        <div class="tab-pane"></div>
      </div>`).appendTo('#qunit-fixture')
    tabContent.aceTabSwipe()

    var tabPane = tabContent.find('.tab-pane.active').get(0)

    var e1 = document.createEvent('UIEvent')
    e1.initUIEvent('touchstart')
    e1.changedTouches = [{ pageX: 150, pageY: 10 }]

    // trigger for tabContent but set target to be tabPane
    Object.defineProperty(e1, 'target', { writable: false, value: tabPane })
    tabContent.get(0).dispatchEvent(e1)

    setTimeout(function () {
      var e2 = document.createEvent('UIEvent')
      e2.initUIEvent('touchmove')
      e2.changedTouches = [{ pageX: 10, pageY: 10 }]
      tabPane.dispatchEvent(e2)

      var e3 = document.createEvent('UIEvent')
      e3.initUIEvent('touchend')
      e3.changedTouches = [{ pageX: 10, pageY: 10 }]
      tabPane.dispatchEvent(e3)

      assert.ok(tabPane.matches('.show.active'), 'active pane has not changed')
      assert.notOk(tabPane.nextElementSibling.matches('.show.active'), 'active page has not changed')

      var e11 = document.createEvent('UIEvent')
      e11.initUIEvent('touchstart')
      e11.changedTouches = [{ pageX: 10, pageY: 10 }]

      // trigger for tabContent but set target to be tabPane
      Object.defineProperty(e11, 'target', { writable: false, value: tabPane })
      tabContent.get(0).dispatchEvent(e11)

      setTimeout(function () {
        var e22 = document.createEvent('UIEvent')
        e22.initUIEvent('touchmove')
        e22.changedTouches = [{ pageX: 150, pageY: 10 }]
        tabPane.dispatchEvent(e22)

        var e33 = document.createEvent('UIEvent')
        e33.initUIEvent('touchend')
        e33.changedTouches = [{ pageX: 150, pageY: 10 }]
        tabPane.dispatchEvent(e33)

        assert.notOk(tabPane.matches('.show.active'), 'active pane has changed')
        assert.ok(tabPane.previousElementSibling.matches('.show.active'), 'active page has changed')

        viewport.reset()

        done()
      }, 0)
    }, 0)
  })

  QUnit.test('should swipe next to specified target', function (assert) {
    assert.expect(3)
    var done = assert.async()
    viewport.set(320, 480)

    var tabContent = $(`<div class="tab-content tab-sliding">
        <div class="tab-pane active show" id="tab-1" data-swipe-next="#tab-3"></div>
        <div class="tab-pane" id="tab-2"></div>
        <div class="tab-pane" id="tab-3"></div>
      </div>`).appendTo('#qunit-fixture')

    tabContent.aceTabSwipe()

    var tabPane = tabContent.find('.tab-pane.active').get(0)

    var e1 = document.createEvent('UIEvent')
    e1.initUIEvent('touchstart')
    e1.changedTouches = [{ pageX: 150, pageY: 10 }]

    // trigger for tabContent but set target to be tabPane
    Object.defineProperty(e1, 'target', { writable: false, value: tabPane })
    tabContent.get(0).dispatchEvent(e1)

    setTimeout(function () {
      var e2 = document.createEvent('UIEvent')
      e2.initUIEvent('touchmove')
      e2.changedTouches = [{ pageX: 10, pageY: 10 }]
      tabPane.dispatchEvent(e2)

      var e3 = document.createEvent('UIEvent')
      e3.initUIEvent('touchend')
      e3.changedTouches = [{ pageX: 10, pageY: 10 }]
      tabPane.dispatchEvent(e3)

      assert.notOk(document.getElementById('tab-1').matches('.show.active'), '')
      assert.notOk(document.getElementById('tab-2').matches('.show.active'), '')
      assert.ok(document.getElementById('tab-3').matches('.show.active'), '')

      viewport.reset()

      done()
    }, 0)
  })

  QUnit.test('should swipe prev to specified target', function (assert) {
    assert.expect(3)
    var done = assert.async()
    viewport.set(320, 480)

    var tabContent = $(`<div class="tab-content tab-sliding">
        <div class="tab-pane" id="tab-1"></div>
        <div class="tab-pane" id="tab-2"></div>
        <div class="tab-pane active show" id="tab-3" data-swipe-prev="#tab-1"></div>
      </div>`).appendTo('#qunit-fixture')

    tabContent.aceTabSwipe()

    var tabPane = tabContent.find('.tab-pane.active').get(0)

    var e1 = document.createEvent('UIEvent')
    e1.initUIEvent('touchstart')
    e1.changedTouches = [{ pageX: 10, pageY: 10 }]

    // trigger for tabContent but set target to be tabPane
    Object.defineProperty(e1, 'target', { writable: false, value: tabPane })
    tabContent.get(0).dispatchEvent(e1)

    setTimeout(function () {
      var e2 = document.createEvent('UIEvent')
      e2.initUIEvent('touchmove')
      e2.changedTouches = [{ pageX: 150, pageY: 10 }]
      tabPane.dispatchEvent(e2)

      var e3 = document.createEvent('UIEvent')
      e3.initUIEvent('touchend')
      e3.changedTouches = [{ pageX: 150, pageY: 10 }]
      tabPane.dispatchEvent(e3)

      assert.notOk(document.getElementById('tab-3').matches('.show.active'), '')
      assert.notOk(document.getElementById('tab-2').matches('.show.active'), '')
      assert.ok(document.getElementById('tab-1').matches('.show.active'), '')

      viewport.reset()

      done()
    }, 0)
  })
})
