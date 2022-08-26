/**
 * --------------------------------------------------------------------------
 * Ace (v4.0.0): sticky.js
   Trigger an event for sticky elements when they become stuck/unstuck
*/

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'aceSticky'

const VERSION = '4.0.0'
const DATA_KEY = 'ace.sticky'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const Event = {
  LOAD_DATA_API: `load${EVENT_KEY}${DATA_API_KEY}`
}

const Selector = {
  STICKY: '[class*="sticky-nav"]'
}

/**
  * ------------------------------------------------------------------------
  * Class Definition
  * ------------------------------------------------------------------------
  */

class Sticky {
  constructor (element) {
    this._element = element
    this._init()
  }

  static get VERSION () {
    return VERSION
  }

  _init () {
    if (!window.IntersectionObserver) return
    this._initObserver()

    // add a dummy child to be observed
    // when it goes out of window it means .sticky-nav is sticky now
    // because dummy element is `top: -1px` or when below navbar it's `top : -1 * ($navbar-height + 1px)`;
    const observedChild = document.createElement(this._element.tagName === 'UL' ? 'LI' : 'DIV')
    observedChild.classList.add('sticky-trigger')
    this._element.insertBefore(observedChild, this._element.firstChild)

    Sticky._observer.observe(observedChild)

    setTimeout(() => {
      if (observedChild.getBoundingClientRect().bottom < 0) {
        let isSticky = true
        if (isSticky && !this._element.classList.contains('sticky-nav')) {
          const pos = window.getComputedStyle(this._element).position
          if (!(pos === 'sticky' || pos === '-webkit-sticky')) isSticky = false
        }
        const evt = new window.CustomEvent('sticky-change', { detail: { isSticky: isSticky, initialCheck: true } })
        this._element.dispatchEvent(evt)
      }
    }, 200)
  }

  /// /
  // we use it when a sticky element becomes stuck on top and 1 pixel of it goes out of view (because of top: -1px)
  // so IntersectionObserver is triggered with intersectionRatio < 1 and y < 0
  // then we trigger an event for it, so later we may for example change its classList to update styling

  _initObserver () {
    if (Sticky._observer !== null) return
    Sticky._observer = new window.IntersectionObserver(([entry]) => {
      let isSticky = entry.intersectionRatio < 1 && entry.boundingClientRect.bottom < 0

      // isSticky=true means we are at sticky position
      // so if our sticky element is for example 'sticky-nav-md' and we are at sticky position
      // but our window size is above 'md' and therefore CSS rule 'position: sticky' is not applied at all
      // so we check if we are really sticky or not
      const stickyNav = entry.target.parentElement// entry.target is the `.sticky-trigger` and parentElement is the `.sticky-nav` element

      // check if `position` is actually `sticky` ... for example if we have `.sticky-nav-md`, it will be sticky only on small (md) devices
      if (isSticky && !stickyNav.classList.contains('sticky-nav')) { // don't check `.sticky-nav` element because it's sticky regardless of window size
        const pos = window.getComputedStyle(stickyNav).position
        if (!(pos === 'sticky' || pos === '-webkit-sticky')) isSticky = false
      }

      const evt = new window.CustomEvent('sticky-change', { detail: { isSticky } })
      stickyNav.dispatchEvent(evt)
    },
    {
      threshold: [1.0],
      delay: 100
    }
    )
  }

  // Static methods
  static getInstance (element) {
    if (!element) throw new Error('element for Sticky is null')

    const name = `__${NAME}__`
    if (typeof element[name] !== 'undefined') return element[name]

    element[name] = new Sticky(element)
    return element[name]
  }

  static _jQueryInterface (config) {
    return this.each(function () {
      const $this = window.jQuery(this)
      let data = $this.data(DATA_KEY)

      if (!data) {
        data = Sticky.getInstance(this)
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

Sticky._observer = null// static property

/**
  * ------------------------------------------------------------------------
  * jQuery
  * ------------------------------------------------------------------------
 */

if (typeof window.jQuery !== 'undefined') {
  const $ = window.jQuery

  window.jQuery(window).on(Event.LOAD_DATA_API, () => {
    const stickyEl = document.querySelectorAll(Selector.STICKY)

    for (let i = 0; i < stickyEl.length; i++) {
      const $stickyEl = $(stickyEl[i])
      Sticky._jQueryInterface.call($stickyEl)
    }
  })

  const JQUERY_NO_CONFLICT1 = $.fn[NAME]
  $.fn[NAME] = Sticky._jQueryInterface
  $.fn[NAME].Constructor = Sticky
  $.fn[NAME].noConflict = () => {
    $.fn[NAME] = JQUERY_NO_CONFLICT1
    return Sticky._jQueryInterface
  }
}

export default Sticky
