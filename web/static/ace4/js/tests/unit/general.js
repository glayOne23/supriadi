$(function () {
  'use strict'
  /* global QUnit */
  /* global viewport */
  /* global $ */

  QUnit.module('general functions')

  QUnit.module('aceGeneral', {
    afterEach: function () {
      $('#qunit-fixture').html('')
    }
  })

  QUnit.test('should collapse alert', function (assert) {
    assert.expect(2)
    var done = assert.async()

    var alert = $('<div class="alert alert-collapse"><button type="button" data-dismiss="alert">x</button></div>').appendTo('#qunit-fixture')
    setTimeout(function () {
      alert.parent().one('hidden.bs.collapse', function () {
        setTimeout(function () {
          assert.equal(alert.parent().get(0).parentNode, null)
          done()
        }, 0)
      })
    }, 100)

    alert.find('button').trigger('click')
    assert.ok(alert.parent().is('.collapsing'))
  })

  QUnit.test('should not hide/close dropdown when .dropdown-clickable is clicked ... should hide it when data-dismiss="dropdown" button is clicked', function (assert) {
    assert.expect(3)
    var done = assert.async()

    var dropdown =
    $(`<div class="dropdown">
        <a href="#" class="dropdown-toggle" id="toggle" data-toggle="dropdown">Dropdown</a>
        <div class="dropdown-menu">
          <div class="dropdown-clickable">
            <button type="button" data-dismiss="dropdown">close</button>
          </div>
        </div>
       </div>`)
      .appendTo('#qunit-fixture')

    var toggle = dropdown.find('[data-toggle=dropdown]')
    var menu = dropdown.find('.dropdown-menu')

    dropdown
      .on('shown.bs.dropdown', function () {
        assert.ok(menu.hasClass('show'))

        menu.find('.dropdown-clickable').trigger('click')
        setTimeout(function () {
          assert.ok(menu.hasClass('show'))
          menu.find('button').trigger('click')
        }, 100)
      })
      .on('hidden.bs.dropdown', function () {
        assert.notOk(menu.hasClass('show'))
        done()
      })

    toggle.dropdown('show')
  })

  QUnit.test('should hide navbar when clicked on its backdrop in mobile view', function (assert) {
    viewport.set(320, 480)
    assert.expect(2)

    var done = assert.async()

    var navbar = $('<div class="navbar-menu collapse navbar-collapse navbar-backdrop" id="navbarMenu"></div>').appendTo('#qunit-fixture')
    var button = $('<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarMenu"></button>').appendTo('#qunit-fixture')

    navbar.on('shown.bs.collapse', function () {
      assert.ok(navbar.hasClass('show'))
      navbar.trigger('click')
    })
      .on('hidden.bs.collapse', function () {
        assert.notOk(navbar.hasClass('show'))
        done()

        viewport.reset()
      })

    button.trigger('click')
  })

  QUnit.test('should hide one navbar when another is shown in mobile view', function (assert) {
    viewport.set(320, 480)
    assert.expect(3)

    var done = assert.async()

    var navbar1 = $('<div class="navbar-menu collapse navbar-collapse" id="navbarMenu1"></div>').appendTo('#qunit-fixture')
    var button1 = $('<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarMenu1"></button>').appendTo('#qunit-fixture')

    var navbar2 = $('<div class="navbar-menu collapse navbar-collapse" id="navbarMenu2"></div>').appendTo('#qunit-fixture')
    var button2 = $('<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarMenu2"></button>').appendTo('#qunit-fixture')

    navbar1.on('shown.bs.collapse', function () {
      assert.ok(navbar1.hasClass('show'))
      button2.trigger('click')
    })
      .on('hidden.bs.collapse', function () {
        assert.notOk(navbar1.hasClass('show'))
      })

    navbar2.on('shown.bs.collapse', function () {
      assert.ok(navbar2.hasClass('show'))
      done()
      viewport.reset()
    })

    button1.trigger('click')
  })

  QUnit.test('should adjust navbar dropdown position so that it moves back inside visible window area', function (assert) {
    assert.expect(1)
    var done = assert.async()

    var navbar =
    $(`<div class="navbar">
        <div class="dropdown dropdown-mega">
          <a href="#" class="dropdown-toggle" id="toggle" data-toggle="dropdown">Toggle</a>
          <div class="dropdown-menu" style="left: -50%;" data-display="static"></div>
        </div>
       </div>`)
      .appendTo('#qunit-fixture')

    var dropdown = navbar.find('.dropdown')
    var toggle = dropdown.find('.dropdown-toggle')
    var menu = dropdown.find('.dropdown-menu')

    dropdown.on('shown.bs.dropdown', function () {
      setTimeout(function () {
        assert.ok(parseInt(menu.css('margin-left')) > menu.width() / 2)
        done()
      }, 0)
    })

    toggle.trigger('click')
  })
})
