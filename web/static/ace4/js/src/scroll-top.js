/**
 * --------------------------------------------------------------------------
 * Ace (v4.0.0): scroll-top.js
   Scroll window to top
*/

import Util from './util'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'aceScrollTop'

const VERSION = '4.0.0'
const DATA_KEY = 'ace.scrolltop'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const Event = {
  LOAD_DATA_API: `load${EVENT_KEY}${DATA_API_KEY}`
}

const Selector = {
  SCROLL_TOP_BTN: '.btn-scroll-up'
}

const CLASS_NAME_SHOW = 'scroll-btn-visible'

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class ScrollTop {
  constructor (element) {
    this._element = element
    this._init()
  }

  static get VERSION () {
    return VERSION
  }

  _init () {
    const _modernBrowser = 'IntersectionObserver' in window

    this._element.addEventListener('click', (ev) => {
      ev.preventDefault()

      if (_modernBrowser) this.hide()
      ScrollTop.scrollToTop()
    })

    if (!_modernBrowser) {
      // if browser doesn't support `IntersectionObserver`, always show the scroll to top button
      this.show()
    } else {
      const _scrollBtnObserve = document.createElement('DIV')
      _scrollBtnObserve.classList.add('scroll-btn-observe')
      document.body.appendChild(_scrollBtnObserve)

      const observer = new window.IntersectionObserver(([entry]) => {
        const isObserverOut = entry.intersectionRatio < 1 && entry.boundingClientRect.bottom < 0
        if (isObserverOut) {
          this.show()
        } else {
          this.hide()
        }
      },
      {
        threshold: [1.0],
        delay: 100
      }
      )

      observer.observe(_scrollBtnObserve)
    }
  }

  show () {
    this._element.classList.add(CLASS_NAME_SHOW)
  }

  hide () {
    this._element.classList.remove(CLASS_NAME_SHOW)
  }

  static scrollToTop (smooth = true) {
    // ScrollToOptions parameter may not be supported on some older browsers
    // so we use try/catch block in case of an error
    try {
      smooth = !Util.isReducedMotion() && smooth === true
      window.scroll({
        top: 0,
        behavior: smooth ? 'smooth' : 'auto'
      })
    } catch (e) {
      window.scroll(0, 0)
    }
  }

  // Static methods
  static getInstance (element) {
    if (!element) throw new Error('element for ScrollTop is null')

    const name = `__${NAME}__`
    if (typeof element[name] !== 'undefined') return element[name]

    element[name] = new ScrollTop(element)
    return element[name]
  }

  static _jQueryInterface (config) {
    return this.each(function () {
      const $this = window.jQuery(this)
      let data = $this.data(DATA_KEY)

      if (!data) {
        data = ScrollTop.getInstance(this)
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
    const scrollTopTopBtn = document.querySelectorAll(Selector.SCROLL_TOP_BTN)

    for (let i = 0; i < scrollTopTopBtn.length; i++) {
      const $scrollTopBtn = $(scrollTopTopBtn[i])
      ScrollTop._jQueryInterface.call($scrollTopBtn)
    }
  })

  const JQUERY_NO_CONFLICT1 = $.fn[NAME]
  $.fn[NAME] = ScrollTop._jQueryInterface
  $.fn[NAME].Constructor = ScrollTop
  $.fn[NAME].noConflict = () => {
    $.fn[NAME] = JQUERY_NO_CONFLICT1
    return ScrollTop._jQueryInterface
  }
}

export default ScrollTop
