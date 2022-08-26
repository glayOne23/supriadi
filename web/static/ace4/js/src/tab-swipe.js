/**
 * --------------------------------------------------------------------------
 * Ace (v4.0.0): tab-swipe.js
   Extra functionality for swiping tabs such
*/

import Util from './util'

import EventHandler from './event-handler'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'aceTabSwipe'
const VERSION = '4.0.0'
const DATA_KEY = 'ace.tabswipe'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const Event = {
  START: `start${EVENT_KEY}`,
  STARTED: `started${EVENT_KEY}`,
  END: `end${EVENT_KEY}`,
  LOAD_DATA_API: `load${EVENT_KEY}${DATA_API_KEY}`
}

const Selector = {
  TAB_SWIPE: '.tab-sliding:not([data-swipe="none"])',
  ACTIVE: '.active'
}

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class TabSwipe {
  constructor (element) {
    this._element = element

    this._firefox = 'MozAppearance' in document.documentElement.style
    this._jQueryBS = typeof window.jQuery !== 'undefined' && typeof window.bootstrap !== 'undefined'

    this._init()
  }

  static get VERSION () {
    return VERSION
  }

  _init () {
    this._element.addEventListener('touchstart', (ev) => {
      const pane = Util.closest(ev.target, '.tab-pane')
      if (!pane || !pane.classList.contains('active')) return

      const e = EventHandler.trigger(this._element, Event.START)
      if (e.defaultPrevented) return

      this._startPaneSwipe(ev, pane)
      EventHandler.trigger(this._element, Event.STARTED)
    })
  }

  _startPaneSwipe (ev, pane) {
    const curPane = pane
    const isRTL = Util.isRTL()
    const initialTransform = !isRTL ? 'translateX(100%)' : 'translateX(-100%)'

    const touches = ev.changedTouches[0]

    let swipeDir = 0
    const x1 = touches.pageX
    const y1 = touches.pageY
    const t1 = Date.now()

    let lastX = 0

    let curDir = 0

    const paneWidth = curPane.clientWidth
    let siblingPane = null

    const allowedDir = this._element.getAttribute('data-swipe') || null

    const paneTouchMoveCallback = (ev) => {
      const touches = ev.changedTouches[0]
      const newX = touches.pageX
      const newY = touches.pageY
      lastX = newX

      if (swipeDir === 0) {
        const diffY = Math.abs(y1 - newY)
        const diffX = Math.abs(x1 - newX)

        if (diffY > diffX) {
          swipeDir = 2// vertical i.e. scroll
          _dismiss()
        } else if (diffX > 10) {
          swipeDir = 1// horizontal swipe
        }
      }
      if (swipeDir !== 1) return // return if not horizontal swipe

      const moveX = parseInt(x1 - newX)
      let newDir = 0

      if ((allowedDir === null || (allowedDir === 'left')) && ((!isRTL && moveX > 0) || (isRTL && moveX < 0))) newDir = 1
      else if ((allowedDir === null || (allowedDir === 'right')) && ((!isRTL && moveX < 0) || (isRTL && moveX > 0))) newDir = -1

      if (newDir !== 0 && newDir !== curDir) {
        if (siblingPane !== null) _reset(siblingPane)// undo previous direction for when we change swipe direction before a touchend
        curDir = newDir

        let targetPane = curPane.getAttribute('data-swipe-' + (curDir === 1 ? 'next' : 'prev'))
        if (targetPane) targetPane = document.querySelector(targetPane)
        else {
          // this is set in angular directive, so we can specify custom next/prev swipe tabs from angular as well
          targetPane = curPane[`__ace_swipe_${curDir === 1 ? 'next' : 'prev'}_pane__`] || null
        }
        siblingPane = targetPane || (curDir === 1 ? curPane.nextElementSibling : curPane.previousElementSibling)

        if (siblingPane === null || siblingPane === curPane) {
          curDir = 0
        } else {
          curPane.classList.add('tab-swiping')
          siblingPane.classList.add('tab-swiping')
        }
      }

      const moveXabs = Math.abs(moveX)
      if (curDir !== 0 && moveXabs < paneWidth + 24) { // don't move more than 24px beyond its size
        curPane.style.transform = initialTransform + ' translateX(' + (-1 * moveX) + 'px)'
        siblingPane.style.transform = 'translateX(' + (-1 * moveX) + 'px)'
      } else if (curDir === 0 && moveXabs < 24) {
        curPane.style.transform = initialTransform + ' translateX(' + (-1 * moveX) + 'px)'
      }
    }

    const paneTouchEndCallback = (ev) => {
      const touches = ev.changedTouches[0] || null

      const x2 = touches !== null ? touches.pageX : lastX
      const t2 = Date.now()

      const diff = Math.abs(x2 - x1)

      _dismiss()

      if (curDir !== 0 && swipeDir === 1 &&
                                ((diff > paneWidth / 4 || diff > 100) || (diff > paneWidth / 6 && t2 - t1 < 300))
      ) { // if moved more than 1/4 of its width or 100px or 1/6 in less than 300ms
        EventHandler.trigger(this._element, Event.END, { swipeDirection: curDir })

        if (this._jQueryBS) {
          siblingPane.classList.add('active', 'show')
          curPane.classList.remove('active', 'show')

          const id1 = curPane.id
          const id2 = siblingPane.id
          document.querySelectorAll('[href="#' + id1 + '"],[data-target="#' + id1 + '"]').forEach((a) => {
            a.classList.remove('active')
            a.setAttribute('aria-selected', 'false')
          })

          const newActive = document.querySelectorAll('[href="#' + id2 + '"],[data-target="#' + id2 + '"]')
          newActive.forEach((a) => {
            a.classList.add('active')
            a.setAttribute('aria-selected', 'true')
          })

          if (newActive.length > 0) {
            try {
              /* global AceApp */
              const navLinkScroll = AceApp.NavLinkScroller.getInstance(newActive[0])
              navLinkScroll._scrollIntoView()
            } catch (err) {
            }
          }
        }
      }
    }

    const _dismiss = () => {
      curPane.removeEventListener('touchmove', paneTouchMoveCallback)
      curPane.removeEventListener('touchend', paneTouchEndCallback)
      curPane.removeEventListener('touchcancel', paneTouchEndCallback)

      curPane.style.transform = ''
      curPane.classList.remove('tab-swiping')

      if (siblingPane) {
        siblingPane.style.transform = ''
        siblingPane.classList.remove('tab-swiping')
      }
    }

    const _reset = (sibling) => {
      sibling.style.transform = ''
      sibling.style.transitionDuration = '0ms' // so when we quickly and frequently swipe left/right without a `touchend`, the other pane moves away (disappears) instantly
      sibling.classList.remove('tab-swiping')
      sibling.offsetHeight
      sibling.style.transitionDuration = ''
    }

    pane.addEventListener('touchmove', paneTouchMoveCallback)
    pane.addEventListener('touchend', paneTouchEndCallback)
    pane.addEventListener('touchcancel', paneTouchEndCallback)
  }

  // Static methods
  static getInstance (element) {
    if (!element) throw new Error('element for TabSwipe is null')

    const name = `__${NAME}__`
    if (typeof element[name] !== 'undefined') return element[name]

    element[name] = new TabSwipe(element)
    return element[name]
  }

  static _jQueryInterface (config) {
    return this.each(function () {
      const $this = window.jQuery(this)
      let data = $this.data(DATA_KEY)

      if (!data) {
        data = TabSwipe.getInstance(this)
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
    if (!('ontouchstart' in document.documentElement)) return
    const swipeablePanes = document.querySelectorAll(Selector.TAB_SWIPE)

    for (let i = 0; i < swipeablePanes.length; i++) {
      const $tabswipe = $(swipeablePanes[i])
      TabSwipe._jQueryInterface.call($tabswipe)
    }
  })

  const JQUERY_NO_CONFLICT = $.fn[NAME]
  $.fn[NAME] = TabSwipe._jQueryInterface
  $.fn[NAME].Constructor = TabSwipe
  $.fn[NAME].noConflict = () => {
    $.fn[NAME] = JQUERY_NO_CONFLICT
    return TabSwipe._jQueryInterface
  }
}

export default TabSwipe
