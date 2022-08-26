/**
 * --------------------------------------------------------------------------
 * Ace (v4.0.0): sidebar.js
   Handling Sidebar
*/

import Util from './util'
import EventHandler from './event-handler'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'aceSidebar'
const VERSION = '4.0.0'
const DATA_KEY = 'ace.sidebar'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const Event = {
  SHOW: `show${EVENT_KEY}`,
  HIDE: `hide${EVENT_KEY}`,
  COLLAPSE: `collapse${EVENT_KEY}`,
  EXPAND: `expand${EVENT_KEY}`,
  SHOWN: `shown${EVENT_KEY}`,
  HIDDEN: `hidden${EVENT_KEY}`,
  COLLAPSED: `collapsed${EVENT_KEY}`,
  EXPANDED: `expanded${EVENT_KEY}`,
  LOAD_DATA_API: `load${EVENT_KEY}${DATA_API_KEY}`,
  CLICK_DATA_API: `click${EVENT_KEY}${DATA_API_KEY}`
}

const Selector = {
  SIDEBAR: '.sidebar',
  DATA_TOGGLE: '[data-toggle="sidebar"]',
  DATA_TOGGLE_MOBILE: '[data-toggle-mobile="sidebar"]'
}

const DefaultType = {
  swipe: 'boolean',
  dismiss: 'boolean',
  backdrop: 'boolean',

  gotoactive: 'boolean',
  subscroll: 'boolean',
  subtoggle: 'boolean',

  pullup: 'boolean'
}

const Default = {
  swipe: false,
  dismiss: false,
  backdrop: false,

  gotoactive: false,
  subscroll: true,
  subtoggle: true,

  pullup: false
}

const ClassName = {
  DESKTOP_HIDE: 'collapsed',
  MOBILE_SHOW: 'sidebar-visible',
  COLLAPSED:	'collapsed',

  TOGGLING: 'toggling',

  INNER_HOVER: 'is-hover',

  BACKDROP: 'sidebar-backdrop',

  HORIZONTAL: 'sidebar-h'
}

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class Sidebar {
  constructor (element, config) {
    this._config = this._getConfig(config)

    this._hasTransitionEvent = false
    this._hasTransitionEventMobile = false
    this._isTransitioning = false
    this._isTransitioningMobile = false

    this._sidebar = element

    Util.reflow(this._sidebar) // force reflow, so that if we instantly call 'collapse' or 'expand', transition effect takes place
    this._sidebar.classList.add('sidebar')
    this._inner = this._sidebar.querySelector('.sidebar-inner')
    this._scroller = this._sidebar.querySelector('[class*="ace-scroll"]')

    this._isSubOpening = false
    if (this._sidebar.querySelector('.submenu.show') !== null) this._sidebar.classList.add('has-open')

    this._pullupEnabled = false
    this._pullupCallback = null

    this._triggerArray = [].slice.call(document.querySelectorAll(
      `[data-toggle="sidebar"][href="#${element.id}"],` +
      `[data-toggle="sidebar"][data-target="#${element.id}"]`
    ))
    this._triggerArrayMobile = [].slice.call(document.querySelectorAll(
      `[data-toggle-mobile="sidebar"][href="#${element.id}"],` +
      `[data-toggle-mobile="sidebar"][data-target="#${element.id}"]`
    ))

    this._horizontal = this._sidebar.classList.contains(ClassName.HORIZONTAL)
    this._desktopCollapsedClass = this._triggerArray.length > 0 ? (this._triggerArray[0].getAttribute('data-toggle-class') || ClassName.DESKTOP_HIDE) : ClassName.DESKTOP_HIDE

    //
    this._collapsed = this._sidebar.classList.contains(this._desktopCollapsedClass)
    this._hidden = !this._sidebar.classList.contains(ClassName.MOBILE_SHOW)

    EventHandler.on(this._inner, 'focus', 'input', (e) => {
      if (!this._collapsed) return
      this._inner.classList.add('has-focus')
      EventHandler.one(e.delegateTarget, 'blur', () => {
        this._inner.classList.remove('has-focus')
      })
    })
    //

    this._handleTriggerEvents()

    if (this._config.subtoggle) this.enableSubmenuToggle()

    if (this._config.pullup) this.enableSubmenuPullup()
    if (this._config.gotoactive) this.scrollToActive()
    if (this._config.backdrop) {
      this._sidebar.classList.add(ClassName.BACKDROP)
    } else if (this._sidebar.classList.contains(ClassName.BACKDROP)) {
      this._config.backdrop = true
    }

    if (!this._horizontal && this._collapsed) {
      this._addTransitionEvent()
    }
  }

  // Getters
  static get VERSION () {
    return VERSION
  }

  static get Default () {
    return Default
  }

  static get DefaultType () {
    return DefaultType
  }

  _handleTriggerEvents () {
    this._triggerArray.forEach((el) => {
      el.addEventListener('click', () => this.toggle(el))
    })

    this._triggerArrayMobile.forEach((el) => {
      el.addEventListener('click', () => this.toggleMobile(el))
    })
  }

  toggle (btn = null) {
    if (this._sidebar.classList.contains(this._desktopCollapsedClass)) {
      this.expand(btn)
    } else {
      this.collapse(btn)
    }
  }

  toggleMobile (btn = null) {
    if (!this._sidebar.classList.contains(ClassName.MOBILE_SHOW)) {
      this.show(btn)
    } else {
      this.hide(btn)
    }
  }

  /// ////

  expand (btn = null) {
    if (!this._hasTransitionEvent) this._addTransitionEvent()
    if (this._isTransitioning || !this._collapsed) return

    const ev = EventHandler.trigger(this._sidebar, Event.EXPAND)
    if (ev.defaultPrevented) return

    this._isTransitioning = true
    this._collapsed = false

    this._sidebar.classList.add(ClassName.TOGGLING)
    this._sidebar.classList.remove(this._desktopCollapsedClass)

    this._updateTriggerBtns(this._triggerArray, true)

    /**
     * If no transition or horizontal or in mobile view (width == 0)
     */
    if (Util.isReducedMotion() || this._sidebar.classList.contains('no-transition') || this._horizontal || this._sidebar.offsetWidth === 0) this._toggleCompleted()// call completion now

    //
    if (this._pullupEnabled) this._resetPullUp()
  }

  collapse (btn = null) {
    if (!this._hasTransitionEvent) this._addTransitionEvent()
    if (this._isTransitioning || this._collapsed) return

    const ev = EventHandler.trigger(this._sidebar, Event.COLLAPSE)
    if (ev.defaultPrevented) return

    this._isTransitioning = true
    this._collapsed = true

    this._sidebar.classList.add(ClassName.TOGGLING)
    this._sidebar.classList.add(this._desktopCollapsedClass)

    this._updateTriggerBtns(this._triggerArray, false)

    /**
     * If no transition or horizontal or in mobile view (width == 0)
     */
    if (Util.isReducedMotion() || this._sidebar.classList.contains('no-transition') || this._horizontal || this._sidebar.offsetWidth === 0) this._toggleCompleted()// call completion now

    //
    if (this._pullupEnabled) this._resetPullUp()

    // if the triggering button is inside sidebar and we want it to remain expanded (.let-expanded), add .is-hover class as well
    if (btn !== null && this._sidebar.classList.contains('expandable') && this._sidebar.classList.contains('let-expanded') && this._inner.contains(btn)) {
      this._inner.classList.add(ClassName.INNER_HOVER)
    }
  }

  isCollapsed () {
    return this._collapsed
  }

  show (btn = null) {
    if (!this._hasTransitionEventMobile) this._addTransitionEventMobile()
    if (this._isTransitioningMobile || !this._hidden) return

    const ev = EventHandler.trigger(this._sidebar, Event.SHOW)
    if (ev.defaultPrevented) return

    this._isTransitioningMobile = true
    this._hidden = false

    this._sidebar.classList.add(ClassName.MOBILE_SHOW)
    this._updateTriggerBtns(this._triggerArrayMobile, true)

    // hide sidebar if clicked outside of it
    if (this._config.dismiss) {
      this._triggerArrayMobile.forEach((el) => { el.style.pointerEvents = 'none' }) // disable this button, because if we click on it, it will hide and then instantly show the sidebar again

      EventHandler.on(document, 'mouseup.sidebar-dismiss', (e) => {
        if (!this._inner.contains(e.target)) { // if clicked outside sidebar
          this.hide()
        }
      })
    }

    if (this._config.swipe) this.enableSwipeHide()

    if (Util.isReducedMotion()) this._toggleMobileCompleted()// call completion now

    // in some webkit mobile browsers, sidebar scrolling works but scrollbars are not visible, unless something like this forces it to become visible
    if (this._scroller && !this._scroller.classList.contains('overflow-hidden')) {
      this._scroller.classList.add('overflow-hidden')
      Util.reflow(this._scroller)// force redraw
      this._scroller.classList.remove('overflow-hidden')
    }

    // hide body scrollbars
    // if sidebar is fixed and has backdrop or is .sidebar-push
    const scrollbarInfo = Util.getScrollbarInfo()
    if (scrollbarInfo.width === 0 && this._sidebar.classList.contains('sidebar-fixed') && (this._config.backdrop || this._sidebar.classList.contains('sidebar-push'))) {
      document.body.classList.add('mob-sidebar-body')
    }
  }

  hide (btn = null) {
    if (!this._hasTransitionEventMobile) this._addTransitionEventMobile()
    if (this._isTransitioningMobile || this._hidden) return

    const ev = EventHandler.trigger(this._sidebar, Event.HIDE)
    if (ev.defaultPrevented) return

    this._isTransitioningMobile = true
    this._hidden = true

    this._sidebar.classList.remove(ClassName.MOBILE_SHOW)
    this._updateTriggerBtns(this._triggerArrayMobile, false)

    if (this._config.dismiss) {
      this._triggerArrayMobile.forEach((el) => { el.style.pointerEvents = '' })
      EventHandler.off(document, '.sidebar-dismiss')
    }
    if (this._config.swipe) {
      EventHandler.off(document, '.sidebar-swipe')
    }

    if (Util.isReducedMotion()) this._toggleMobileCompleted()// call completion now
  }

  isHidden () {
    return this._hidden
  }

  _updateTriggerBtns (btns, expanded = false) {
    for (let i = 0, len = btns.length; i < len; i++) {
      if (expanded) btns[i].classList.remove(ClassName.COLLAPSED)
      else btns[i].classList.add(ClassName.COLLAPSED)

      btns[i].setAttribute('aria-expanded', expanded)
    }
  }

  _toggleCompleted () {
    this._isTransitioning = false
    this._sidebar.classList.remove(ClassName.TOGGLING)

    const expanded = !this._sidebar.classList.contains(this._desktopCollapsedClass)
    if (expanded) {
      this._inner.classList.remove(ClassName.INNER_HOVER)
      EventHandler.trigger(this._sidebar, Event.EXPANDED)
    } else {
      EventHandler.trigger(this._sidebar, Event.COLLAPSED)
    }
  }

  _toggleMobileCompleted () {
    this._isTransitioningMobile = false
    const shown = this._sidebar.classList.contains(ClassName.MOBILE_SHOW)
    if (shown) EventHandler.trigger(this._sidebar, Event.SHOWN)
    else {
      document.body.classList.remove('mob-sidebar-body')
      if (this._config.swipe) {
        document.body.classList.remove('mob-sidebarswipe-body')
      }

      EventHandler.trigger(this._sidebar, Event.HIDDEN)
    }
  }

  _addTransitionEvent () {
    if (this._hasTransitionEvent) return
    this._hasTransitionEvent = true
    let counter = 0

    this._sidebar.addEventListener('transitionend', (e) => {
      if (e.target !== this._sidebar) return// make sure its not the children triggerring the event!

      this._toggleCompleted()

      counter = 0
    })

    // add 'is-hover' class to '.sidebar-inner' when it becomes expanded (i.e. when mouse hovers it)
    this._inner.addEventListener('transitionstart', (e) => {
      // skip on mobile (in which propertyName is `transform`)
      if (e.target !== this._inner || this._isTransitioning || e.propertyName !== 'width') return

      counter++
      if (counter === 1) this._inner.classList.add(ClassName.INNER_HOVER)
    })

    this._inner.addEventListener('transitionend', (e) => {
      // skip `transitionend` on mobile (in which propertyName is `transform`)
      if (e.target !== this._inner || e.propertyName !== 'width') return

      if (this._inner.clientWidth < 140) {
        // just to make sure we remove the extra class name when not needed
        this._inner.classList.remove(ClassName.INNER_HOVER)
        counter = 0
        // blur input element
        if (document.activeElement.tagName === 'INPUT' && this._inner.contains(document.activeElement)) document.activeElement.blur()
      }
    })
  }

  _addTransitionEventMobile () {
    if (this._hasTransitionEventMobile) return
    this._hasTransitionEventMobile = true

    this._inner.addEventListener('transitionstart', (e) => {
      if (e.target !== this._inner || e.propertyName !== 'transform') return

      this._toggleMobileCompleted()
    })
  }

  // swipe to hide sidebar
  enableSwipeHide () {
    let x1 = 0
    let y1 = 0
    let swipeDir = 0

    let isRTL = false
    let lastX = 0

    let pushContent = false
    let sidebarWidth = 0

    const touchMoveCallback = (ev) => {
      const touches = ev.changedTouches[0] || null
      if (!touches) return

      const newX = touches.pageX
      const newY = touches.pageY
      lastX = newX

      if (swipeDir === 0) {
        const diffY = Math.abs(y1 - newY)
        const diffX = Math.abs(x1 - newX)

        if (diffY > diffX) {
          swipeDir = 2// vertical i.e. scroll
          if (this._scroller) this._scroller.classList.remove('overflow-hidden')
          document.body.classList.remove('mob-sidebarswipe-body')

          EventHandler.off(document, 'touchmove.sidebar-swipe')
        } else if (diffX > 10) {
          swipeDir = 1// horizontal swipe
          this._inner.setAttribute('style', 'transition: none !important; touch-action: none;')
          if (this._scroller) this._scroller.classList.add('overflow-hidden')
          document.body.classList.add('mob-sidebarswipe-body')
        }
      }
      if (swipeDir !== 1) return

      const moveX = parseInt(x1 - newX)
      if ((!isRTL && moveX > 0) || (isRTL && moveX < 0)) { // move it outside of view
        this._inner.style.transform = 'translateX(' + (-1 * moveX) + 'px)'
        if (pushContent) this._sidebar.style.width = (sidebarWidth - (moveX > 0 ? moveX : -1 * moveX)) + 'px'
      } else {
        this._inner.style.transform = ''
        if (pushContent) this._sidebar.style.width = ''
      }
    }

    let t1 = 0
    EventHandler.on(document, 'touchstart.sidebar-swipe', (e) => {
      const touches = e.changedTouches[0] || null
      if (!touches) return

      x1 = touches.pageX
      y1 = touches.pageY

      t1 = Date.now()
      isRTL = Util.isRTL()

      pushContent = this._sidebar.classList.contains('sidebar-push')
      if (pushContent) {
        sidebarWidth = this._sidebar.clientWidth
        this._sidebar.style.minWidth = 'auto'
        this._sidebar.style.transition = 'none'
      }

      EventHandler.on(document, 'touchmove.sidebar-swipe', (e) => {
        touchMoveCallback(e)
      })
    })

    const touchEndHandler = (e) => {
      const touches = e.changedTouches[0] || null
      // if (!touches) return // in case we're coming from a `dismiss` mouseup event

      this._inner.setAttribute('style', '')
      if (pushContent) {
        this._sidebar.style.width = ''
        this._sidebar.style.minWidth = ''
        this._sidebar.style.transition = ''
      }

      const x2 = touches !== null ? touches.pageX : lastX
      const t2 = Date.now()

      if (swipeDir === 1 &&
          ( // dismiss if moved by more than 100px or moved more than 40px in a short time (less than 300ms)
            (!isRTL && (x1 - x2 > 100 || (x1 - x2 > 40 && t2 - t1 < 300))) || (isRTL && (x1 - x2 < -100 || (x1 - x2 < -40 && t2 - t1 < 300)))
          )
      ) { // if moved more than 100px or 40px in less than 300ms
        this.hide()
      } else {
        // remove '.mob-sidebarswipe-body' to bring back body scrollbars if sidebar isn't swiped to hide
        // but we probably won't have body scrollbars because of `.mob-sidebar-body`
        document.body.classList.remove('mob-sidebarswipe-body')
      }

      // bring back sidebar scrollbars
      if (this._scroller) this._scroller.classList.remove('overflow-hidden')

      swipeDir = 0
    }

    EventHandler.on(document, 'touchend.sidebar-swipe', touchEndHandler)
    EventHandler.on(document, 'touchcancel.sidebar-swipe', touchEndHandler)
  }

  enableSubmenuToggle () {
    this._isSubOpening = false
    const _jQueryBS = typeof jQuery !== 'undefined' && typeof bootstrap !== 'undefined'

    EventHandler.on(this._sidebar, 'click', '.dropdown-toggle', (ev) => {
      ev.preventDefault()
      if (this._isSubOpening) return

      const navItem = Util.closest(ev.delegateTarget, '.nav-item')// get the parent LI.nav-item
      const subMenu = navItem.querySelector('* > .submenu')// get the direct submenu (not the children)
      const navLink = navItem.querySelector('* > .nav-link')// get the parent LI.nav-item

      if (!subMenu || !navLink) return

      if ((this._collapsed && this._sidebar.classList.contains('hoverable')) || this._sidebar.classList.contains('sidebar-hover')) {
        // don't toggle submenu if submenu is supposed to be displayed as popup (this includes horizontal sidebar when it's `.sidebar-hover`)
        if (window.getComputedStyle(subMenu).position === 'absolute') return
      }

      if (subMenu.classList.contains('collapsing')) return// don't toggle in the middle of toggling

      // hide sibling submenus
      navItem.classList.add('is-toggling')
      navItem.parentNode.querySelectorAll('* > .nav-item.open').forEach((_item) => {
        if (_item === navItem) return
        _item.classList.add('is-toggling')

        _item.classList.remove('open')

        const sub = _item.querySelector('* > .submenu.show')
        if (sub) {
          if (_jQueryBS) window.jQuery(sub).collapse('hide')
          else sub.classList.remove('show')
        }
      })

      // toggle submenu
      if (navItem.classList.contains('open')) {
        navItem.classList.remove('open')
        navLink.classList.add('collapsed')

        this._sidebar.classList.remove('has-open')

        if (_jQueryBS) window.jQuery(subMenu).collapse('hide')
        else subMenu.classList.remove('show')
      } else {
        this._isSubOpening = true

        navItem.classList.add('open')
        navLink.classList.remove('collapsed')

        this._sidebar.classList.add('has-open')

        if (_jQueryBS) window.jQuery(subMenu).collapse('show')
        else subMenu.classList.add('show')
      }

      if (_jQueryBS) {
        if (!subMenu.getAttribute('data-sub-event')) {
          subMenu
            .setAttribute('data-sub-event', 'true')

          window.jQuery(subMenu).on('shown.bs.collapse.is-toggling hidden.bs.collapse.is-toggling', () => {
            this._submenuIsToggled()
          })
        }
      } else {
        this._submenuIsToggled()
      }

      if (navItem && navItem.classList.contains('open')) this._submenuScroll(subMenu)
    })
  }

  _submenuIsToggled () {
    this._isSubOpening = false

    this._sidebar.querySelectorAll('.is-toggling').forEach((el) => {
      el.classList.remove('is-toggling')
    })

    // firefox continues to disable scroll chaining when sidebar is not scrollable anymore, so a little fix around here
    if ('MozAppearance' in document.documentElement.style) {
      if (this._scroller === null) return
      if (this._scroller.scrollHeight <= this._scroller.clientHeight) {
        this._scroller.style.overscrollBehavior = 'auto'
      } else this._scroller.style.overscrollBehavior = ''
    }
  }

  // scroll submenu into view (only on modern browsers)
  _submenuScroll (subMenu, delay = 150) {
    if (subMenu && !Util.isReducedMotion() && 'scrollBehavior' in document.documentElement.style && this._config.subscroll && this._sidebar.classList.contains('sidebar-fixed')) {
      if (this._sidebar.classList.contains(ClassName.HORIZONTAL)) {
        if (window.getComputedStyle(subMenu).position === 'absolute') return // no scroll for desktop horizontal menu (when it's not `.sidebar-hover`)
      }

      setTimeout(() => {
        subMenu.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        })
      }, delay)
    }
  }

  enableSubmenuPullup () {
    if (this._pullupEnabled) return
    this._pullupEnabled = true

    const marginProp = 'margin-' + (!Util.isRTL() ? 'left' : 'right')

    if (this._pullupCallback === null) {
      this._pullupCallback = (ev) => {
        if (ev.target !== ev.delegateTarget || ev.propertyName !== marginProp || !(this._collapsed || this._sidebar.classList.contains('sidebar-hover'))) return

        const subMenu = ev.target
        const navItem = subMenu.parentNode

        const navText = navItem.querySelector('* > .nav-link > .nav-text.fadeable')// only first level nav-text items

        if (navItem) navItem.classList.remove('submenu-pullup')
        subMenu.style.transform = ''
        if (navText) navText.style.transform = ''

        /// ///////////////////////

        const rect = subMenu.getBoundingClientRect()
        const wh = window.innerHeight

        let diff = parseInt(rect.bottom - wh)

        if (diff > 0) { // if submenu bottom is below window area
          // check to see if submenu top will go out of window if we move it up by "diff" pixels
          // also consider that the first level item's .nav-text shouldn't go out of window's top
          const navTextHeight = navText ? navText.clientHeight : 0
          let navbarHeight = document.querySelector('.navbar')
          navbarHeight = navbarHeight ? navbarHeight.clientHeight : 0

          const diff2 = rect.top - navTextHeight - diff - navbarHeight// don't go above navbar
          if (diff2 < 0) diff = diff + diff2

          diff = parseInt(diff) + 1// so that submenu's border is visible
          if (this._collapsed) {
            if (navTextHeight && diff > navTextHeight / 2 && navItem) navItem.classList.add('submenu-pullup')// this class makes the .sub-arrow's color white, to match submenu color
          } else {
            if (navItem) navItem.classList.add('submenu-pullup')
          }

          subMenu.style.transform = `translateY(-${diff}px)`
          if (this._collapsed && navText) {
            navText.style.transform = `translateY(-${diff}px)`
          }
        }
      }
    }

    EventHandler.on(this._sidebar, 'transitionstart', '.submenu', this._pullupCallback)
  }

  disableSubmenuPullup () {
    this._pullupEnabled = false
    if (this._pullupCallback) EventHandler.off(this._sidebar, 'transitionstart', '.submenu', this._pullupCallback)
    this._resetPullUp()
  }

  _resetPullUp () {
    this._sidebar.querySelectorAll('.submenu-pullup').forEach((_item) => {
      _item.classList.remove('submenu-pullup')
      _item.querySelectorAll('.nav-text, .submenu').forEach((el) => {
        el.style.transform = ''
      })
    })
  }

  // scroll active item into view
  scrollToActive () {
    if (!this._sidebar.classList.contains('sidebar-fixed') || this._scroller === null) return

    const active = this._sidebar.querySelector('.nav-item.active:not(.open) > .nav-link')
    try {
      active.scrollIntoView({ behavior: 'auto', block: 'end' })// or block: "center"?
      this._scroller.scrollTop = this._scroller.scrollTop + 30
    } catch (e) {}
  }

  //
  _getConfig (config) {
    config = {
      ...Default,
      ...typeof config === 'object' && config ? config : {}
    }

    if (typeof window.bootstrap !== 'undefined') {
      window.bootstrap.Util.typeCheckConfig(
        NAME,
        config,
        this.constructor.DefaultType
      )
    }

    return config
  }

  // Static methods
  static getInstance (element, config = null) {
    if (!element) throw new Error('element for Sidebar is null')

    const name = `__${NAME}__`
    if (typeof element[name] !== 'undefined') return element[name]

    element[name] = new Sidebar(element, config)
    return element[name]
  }

  static _jQueryInterface (config) {
    return this.each(function () {
      const $this = window.jQuery(this)
      let data = $this.data(DATA_KEY)

      const _config = {
        ...Default,
        ...$this.data(),
        ...typeof config === 'object' && config ? config : {}
      }

      if (!data) {
        data = Sidebar.getInstance(this, _config)
        $this.data(DATA_KEY, data)
      }

      if (typeof config === 'string') {
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`)
        }
        data[config]()
      }
    })
  }
}

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
*/

if (typeof window.jQuery !== 'undefined') {
  const $ = window.jQuery
  $(window).on(Event.LOAD_DATA_API, () => {
    const sidebars = [].slice.call(document.querySelectorAll(Selector.SIDEBAR))

    for (let i = 0; i < sidebars.length; i++) {
      const $sidebar = $(sidebars[i])
      Sidebar._jQueryInterface.call($sidebar, $sidebar.data())
    }
  })

  const JQUERY_NO_CONFLICT = $.fn[NAME]
  $.fn[NAME] = Sidebar._jQueryInterface
  $.fn[NAME].Constructor = Sidebar
  $.fn[NAME].noConflict = () => {
    $.fn[NAME] = JQUERY_NO_CONFLICT
    return Sidebar._jQueryInterface
  }
}

export default Sidebar
