/**
 * --------------------------------------------------------------------------
 * Ace (v4.0.0): tab-scroll.js
   Extra functionality for auto-scrolling tab buttons (in small devices)
*/

import Util from './util'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME1 = 'aceTabScroll'
const NAME2 = 'aceTabLinkScroll'

const VERSION = '4.0.0'
const DATA_KEY = 'ace.tabscroll'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const Event = {
  LOAD_DATA_API: `load${EVENT_KEY}${DATA_API_KEY}`
}

const Selector = {
  TAB_SCROLL: '.nav-tabs-scroll',
  ACTIVE: '.active'
}

/**
 * ------------------------------------------------------------------------
 * Class Definitions
 * ------------------------------------------------------------------------
 */

class NavTabScroller {
  constructor (element) {
    this._element = element

    this._firefox = 'MozAppearance' in document.documentElement.style

    this._init()
  }

  static get VERSION () {
    return VERSION
  }

  _init () {
    // scroll to active element on page load
    const active = this._element.querySelector(Selector.ACTIVE)
    if (active) {
      const navLinkScroll = NavLinkScroller.getInstance(active)
      if (!this._firefox) {
        navLinkScroll._scrollIntoView(false)
      } else { // still firefox doesn't scroll back to `zero` on page load!
        setTimeout(() => {
          this._element.scrollLeft = 1
          navLinkScroll._scrollIntoView(false)
        }, 500)
      }
    }

    this.enable()
  }

  enable () {
    this._element.addEventListener('click', (ev) => {
      const navLink = Util.closest(ev.target, 'a')
      if (!navLink) return

      NavLinkScroller.scrollIntoView(navLink)
    })
  }

  // Static methods
  static getInstance (element) {
    if (!element) throw new TypeError('element for NavTabScroller is null')

    const name = `__${NAME1}__`
    if (typeof element[name] !== 'undefined') return element[name]

    element[name] = new NavTabScroller(element)
    return element[name]
  }

  static _jQueryInterface (config) {
    return this.each(function () {
      const $this = window.jQuery(this)
      let data = $this.data(DATA_KEY)

      if (!data) {
        data = NavTabScroller.getInstance(this)
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

// scroll a link into view (horizontal tabs/links)
class NavLinkScroller {
  constructor (element) {
    this._element = element

    this._firefox = 'MozAppearance' in document.documentElement.style
  }

  static get VERSION () {
    return VERSION
  }

  // scroll tab button elements into view when clicked
  _scrollIntoView (smooth = true) {
    const li = this._element.parentNode
    const nav = li.parentNode

    const navClientWidth = nav.clientWidth
    const navScrollWidth = nav.scrollWidth
    if (navScrollWidth <= navClientWidth) return // don't scroll if not needed

    const isRTL = Util.isRTL()

    // scroll to this element (center it)
    let _scrollLeft
    if (!isRTL) {
      _scrollLeft = li.offsetLeft - (navClientWidth - li.clientWidth) / 2
    } else {
      // firefox and webkit have different ways of dealing with scrolling right/left and offsets in RTL mode
      if (!this._firefox) {
        _scrollLeft = (navScrollWidth - navClientWidth) + (li.offsetLeft) - ((navClientWidth - li.clientWidth) / 2)
      } else {
        _scrollLeft = li.offsetLeft - ((navClientWidth - li.clientWidth) / 2)
      }
    }
    _scrollLeft = _scrollLeft | 0 // convert FLOAT to INT

    smooth = !Util.isReducedMotion() && smooth === true
    try {
      nav.scrollTo({
        top: 0,
        left: _scrollLeft,
        behavior: smooth ? 'smooth' : 'auto'
      })

      // firefox needs extra push when scrolling back
      if (this._firefox && _scrollLeft < nav.scrollLeft) {
        setTimeout(function () {
          nav.scrollTo({
            top: 0,
            left: _scrollLeft,
            behavior: smooth ? 'smooth' : 'auto'
          })
        }, 0)
      }
    } catch (e) {
      nav.scrollLeft = _scrollLeft
    }
  }

  // Static methods
  static _jQueryInterface (config) {
    return this.each(function () {
      const $this = window.jQuery(this)
      let data = $this.data(DATA_KEY)

      if (!data) {
        data = NavLinkScroller.getInstance(this)
        $this.data(DATA_KEY, data)
        data._scrollIntoView()
      }

      if (typeof config === 'string') {
        if (typeof data[config] === 'undefined') {
          throw new Error(`No method named "${config}"`)
        }
        data[config]()
      }
    })
  }

  static getInstance (element) {
    if (!element) throw new Error('element for NavLinkScroller is null')

    const name = `__${NAME2}__`
    if (typeof element[name] !== 'undefined') return element[name]

    element[name] = new NavLinkScroller(element)
    return element[name]
  }

  static scrollIntoView (element) {
    const instance = NavLinkScroller.getInstance(element)
    if (instance) instance._scrollIntoView()
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
    const scrollableNavTabs = document.querySelectorAll(Selector.TAB_SCROLL)

    for (let i = 0; i < scrollableNavTabs.length; i++) {
      const $tabscroll = $(scrollableNavTabs[i])
      NavTabScroller._jQueryInterface.call($tabscroll)
    }
  })

  const JQUERY_NO_CONFLICT1 = $.fn[NAME1]
  $.fn[NAME1] = NavTabScroller._jQueryInterface
  $.fn[NAME1].Constructor = NavTabScroller
  $.fn[NAME1].noConflict = () => {
    $.fn[NAME1] = JQUERY_NO_CONFLICT1
    return NavTabScroller._jQueryInterface
  }

  const JQUERY_NO_CONFLICT2 = $.fn[NAME2]
  $.fn[NAME2] = NavLinkScroller._jQueryInterface
  $.fn[NAME2].Constructor = NavLinkScroller
  $.fn[NAME2].noConflict = () => {
    $.fn[NAME2] = JQUERY_NO_CONFLICT2
    return NavLinkScroller._jQueryInterface
  }
}

export {
  NavTabScroller,
  NavLinkScroller
}
