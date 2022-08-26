$(function () {
  'use strict'
  /* global QUnit */
  /* global viewport */
  /* global $ */
  /* global AceApp */


  QUnit.module('sidebar plugin')

  QUnit.test('should be defined on jquery object', function (assert) {
    assert.expect(1)
    assert.ok($(document.body).aceSidebar, 'sidebar method is defined')
  })

  QUnit.module('aceSidebar', {
    beforeEach: function () {
      // Run all tests in noConflict mode -- it's the only way to ensure that the plugin works in noConflict mode
      $.fn.aceSidebarNC = $.fn.aceSidebar.noConflict()
    },
    afterEach: function () {
      $.fn.aceSidebar = $.fn.aceSidebarNC
      delete $.fn.aceSidebarNC
      $('#qunit-fixture').html('')
    }
  })

  QUnit.test('should provide no conflict', function (assert) {
    assert.expect(1)
    assert.strictEqual(typeof $.fn.aceSidebar, 'undefined', 'sidebar was set back to undefined (org value)')
  })

  QUnit.test('should return jquery collection containing the element', function (assert) {
    assert.expect(2)
    var $el = $('<div />')
    var $aside = $el.aceSidebarNC()
    assert.ok($aside instanceof $, 'returns jquery collection')
    assert.strictEqual($aside[0], $el[0], 'collection contains element')
  })


  QUnit.test('should return jquery collection containing the element', function (assert) {
    assert.expect(4)

    var sidebar = $('<div id="sidebar" class="sidebar"></div>').aceSidebarNC()
    var sidebar$ = sidebar.data('ace.sidebar')
    assert.strictEqual(sidebar$._triggerArrayMobile.length, 0)
    assert.strictEqual(sidebar$._triggerArray.length, 0)

    $('<button type="button" data-toggle-mobile="sidebar" data-target="#sidebar2"></button>').appendTo('#qunit-fixture')
    $('<button type="button" data-toggle="sidebar" data-target="#sidebar2"></button>').appendTo('#qunit-fixture')

    var sidebar2 = $('<div id="sidebar2" class="sidebar"></div>').aceSidebarNC()
    var sidebar2$ = sidebar2.data('ace.sidebar')
    assert.strictEqual(sidebar2$._triggerArrayMobile.length, 1)
    assert.strictEqual(sidebar2$._triggerArray.length, 1)
  })



  QUnit.test('should disable body scrollbars when sidebar is being swiped and hide sidebar when swiped more than 40px', function (assert) {
    viewport.set(320, 480)

    assert.expect(4)
    var done = assert.async()

    var sidebar = $('<div id="sidebar" class="sidebar" data-swipe="true"><div class="sidebar-inner"><div class="ace-scroll"></div></div></div>').appendTo('#qunit-fixture')
    sidebar.aceSidebarNC('show')

    sidebar.get(0).addEventListener('shown.ace.sidebar', function() {

      AceApp.EventHandler.trigger(document, 'touchstart', {changedTouches: [{ pageX: 50, pageY: 10 }]})
      AceApp.EventHandler.trigger(document, 'touchmove', {changedTouches: [{ pageX: 30, pageY: 10 }]})

      assert.ok($(document.body).hasClass('mob-sidebarswipe-body'), 'hide body scrollbars')


      AceApp.EventHandler.trigger(document, 'touchend', {changedTouches: [{ pageX: 30, pageY: 10 }]})

      assert.notOk($(document.body).hasClass('mob-sidebarswipe-body'), 'bring back body scrollbars')

      assert.ok(sidebar.hasClass('sidebar-visible'), 'sidebar is still visible')

      /// //////

      AceApp.EventHandler.trigger(document, 'touchstart', {changedTouches: [{ pageX: 50, pageY: 10 }]})

      AceApp.EventHandler.trigger(document, 'touchmove', {changedTouches: [{ pageX: 5, pageY: 10 }]})

      AceApp.EventHandler.trigger(document, 'touchend', {changedTouches: [{ pageX: 5, pageY: 10 }]})

      assert.notOk(sidebar.hasClass('sidebar-visible'), 'sidebar is hidden')

      done()
      viewport.reset()
    })
  })

  
  

  QUnit.test('`data-dismiss=true` should hide sidebar when clicked outside of sidebar area', function (assert) {
    viewport.set(320, 480)

    var done = assert.async()
    assert.expect(2)

    // trigger `mouseup` inside sidebar area
    var sidebar = $('<div id="sidebar" class="sidebar" data-dismiss="true"><div class="sidebar-inner"><div class="ace-scroll"></div></div></div>').appendTo('#qunit-fixture')
    
    sidebar.aceSidebarNC('show')

    sidebar.get(0).addEventListener('shown.ace.sidebar', function() {

      AceApp.EventHandler.trigger(sidebar.find('.sidebar-inner').get(0), 'mouseup')

      assert.ok(sidebar.hasClass('sidebar-visible'), 'sidebar is visible')

      // trigger `mouseup` outside sidebar area
      AceApp.EventHandler.trigger(document, 'mouseup')
      AceApp.EventHandler.trigger(document.body, 'mouseup')
      

      assert.notOk(sidebar.hasClass('sidebar-visible'), 'sidebar is hidden')

      done()
      viewport.reset()

    })
  })


  QUnit.test('should expand/collapse sidebar', function (assert) {
    viewport.set(1320, 1480)

    assert.expect(3)
    var done = assert.async()

    var btn = $('<button type="button" data-toggle="sidebar" data-target="#sidebar3"></button>').appendTo('#qunit-fixture')
    var sidebar = $('<div id="sidebar3" class="sidebar"><div class="sidebar-inner"><div class="ace-scroll"></div></div></div>').appendTo('#qunit-fixture')
    sidebar.aceSidebarNC()

    AceApp.EventHandler.trigger(btn.get(0), 'click')
    assert.ok(sidebar.hasClass('collapsed'), 'sidebar is collapsed')

    sidebar.get(0).addEventListener('collapsed.ace.sidebar', function () {
      assert.notOk(sidebar.hasClass('toggling'))
      AceApp.EventHandler.trigger(btn.get(0), 'click')
      assert.notOk(sidebar.hasClass('collapsed'), 'sidebar is being expanded')
      done()

      viewport.reset()
    })
  })

  


  QUnit.test('should show/hide sidebar', function (assert) {
    viewport.set(320, 480)
    assert.expect(2)
    var done = assert.async()

    var btn = $('<button type="button" data-toggle-mobile="sidebar" data-target="#sidebar4"></button>').appendTo('#qunit-fixture')
    var sidebar = $('<div id="sidebar4" class="sidebar"><div class="sidebar-inner"><div class="ace-scroll"></div></div></div>').appendTo('#qunit-fixture')
    sidebar.aceSidebarNC()

    AceApp.EventHandler.trigger(btn.get(0), 'click')
    assert.ok(sidebar.hasClass('sidebar-visible'), 'sidebar is being shown')

    sidebar.get(0).addEventListener('shown.ace.sidebar', function () {
      AceApp.EventHandler.trigger(btn.get(0), 'click')
      assert.notOk(sidebar.hasClass('sidebar-visible'), 'sidebar is being hidden')
      done()

      viewport.reset()
    })
  })

  

  QUnit.test('should prevent expanding/collapsing sidebar', function (assert) {
    assert.expect(1)
    viewport.set(1320, 1480)

    var btn = $('<button type="button" data-toggle="sidebar" data-target="#sidebar3"></button>').appendTo('#qunit-fixture')
    var sidebar = $('<div id="sidebar3" class="sidebar"><div class="sidebar-inner"><div class="ace-scroll"></div></div></div>').appendTo('#qunit-fixture')

    sidebar.aceSidebarNC().get(0).addEventListener('collapse.ace.sidebar', function (e) {
      e.preventDefault()
      viewport.reset()
    })

    AceApp.EventHandler.trigger(btn.get(0), 'click')
    sidebar.aceSidebarNC('collapse')

    assert.notOk(sidebar.hasClass('collapsed toggling'), 'sidebar collapse is prevented')
  })

  

  QUnit.test('should prevent hiding/showing sidebar', function (assert) {
    assert.expect(1)
    viewport.set(320, 480)

    var btn = $('<button type="button" data-toggle-mobile="sidebar" data-target="#sidebar4"></button>').appendTo('#qunit-fixture')
    var sidebar = $('<div id="sidebar4" class="sidebar"><div class="sidebar-inner"><div class="ace-scroll"></div></div></div>').appendTo('#qunit-fixture')

    sidebar.aceSidebarNC().get(0).addEventListener('show.ace.sidebar', function (e) {
      e.preventDefault()
    })

    AceApp.EventHandler.trigger(btn.get(0), 'click')
    sidebar.aceSidebarNC('show')

    assert.notOk(sidebar.hasClass('sidebar-visible'), 'mobile sidebar showing is prevented')

    viewport.reset()
  })



  QUnit.test('should return sidebar version', function (assert) {
    assert.expect(1)

    if (typeof AceApp.Sidebar !== 'undefined') {
      assert.ok(typeof AceApp.Sidebar.VERSION === 'string')
    } else {
      assert.notOk()
    }
  })
})
