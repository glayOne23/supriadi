/**
 * --------------------------------------------------------------------------
 * Ace (v4.0.0): card.js
   Cards based on Bootstrap's cards
*/

import Util from './util'
import EventHandler from './event-handler'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'aceCard'
const VERSION = '4.0.0'
const DATA_KEY = 'ace.card'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const Event = {
  SHOW: `show${EVENT_KEY}`,
  HIDE: `hide${EVENT_KEY}`,
  SHOWN: `shown${EVENT_KEY}`,
  HIDDEN: `hidden${EVENT_KEY}`,
  CLOSE: `close${EVENT_KEY}`,
  CLOSED: `closed${EVENT_KEY}`,
  EXPAND: `expand${EVENT_KEY}`,
  EXPANDED: `expanded${EVENT_KEY}`,
  RESTORE: `restore${EVENT_KEY}`,
  RESTORED: `restored${EVENT_KEY}`,
  RELOAD: `reload${EVENT_KEY}`,
  RELOADED: `reloaded${EVENT_KEY}`,
  CLICK_DATA_API: `click${EVENT_KEY}${DATA_API_KEY}`
}

const Selector = {
  DATA_ACTION: '.card [data-action]'
}

const DefaultType = {
  toggle: 'boolean'
}

const Default = {
  toggle: true
}

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class Card {
  constructor (element, config) {
    this._config = this._getConfig(config)

    this.element = element
    Util.reflow(this.element) // force reflow, so that if we instantly call 'close' etc, transition effect takes place

    this.isTransitioning = false

    this.loader = null
    this._jQueryBS = typeof window.jQuery !== 'undefined' && typeof window.jQuery.fn.collapse !== 'undefined'
  }

  static get VERSION () {
    return VERSION
  }

  static get DefaultType () {
    return DefaultType
  }

  static get Default () {
    return Default
  }

  reload () {
    const ev = EventHandler.trigger(this.element, Event.RELOAD)
    if (ev.defaultPrevented) return

    this.startLoading()
  }

  startLoading (loadingHtml = '<i class="bs-card-loading-icon fa fa-spinner fa-spin fa-2x text-white"></i>') {
    this.loader = Util.append(this.element, `<div class="bs-card-loading-overlay">${loadingHtml}</div>`)
  }

  stopLoading () {
    if (this.loader === null) return
    Util.remove(this.loader)
    this.loader = null

    EventHandler.trigger(this.element, Event.RELOADED)
  }

  closeFast () {
    const ev = EventHandler.trigger(this.element, Event.CLOSE)
    if (ev.defaultPrevented) return

    Util.remove(this.element)
    EventHandler.trigger(this.element, Event.CLOSED)
  }

  close () {
    const ev = EventHandler.trigger(this.element, Event.CLOSE)
    if (ev.defaultPrevented || this.isTransitioning) return

    this.isTransitioning = true
    if (this.isFullscreen()) Util.remove(Util.next(this.element, '.card-expanded-placeholder'))// remove the placeholder

    const _closeComplete = () => {
      this.isTransitioning = false
      Util.remove(this.element)
      EventHandler.trigger(this.element, Event.CLOSED)
    }

    if (Util.isReducedMotion()) _closeComplete()
    else {
      this.element.classList.add('fade')

      this.element.addEventListener('transitionend', (e) => {
        if (e.target !== this.element) return// because transitionend might fire for children elements (like animated toolbar buttons)
        _closeComplete()
      })
    }
  }

  toggle (type) {
    if (!this._config.toggle) return

    const body = this.element.querySelector('.card-body')
    if (body === null) return

    const action = (type && typeof type === 'string' && type.match(/show|hide/)[0]) || (body.offsetParent !== null ? 'hide' : 'show')

    const eventName = action === 'hide' ? 'hide' : 'show'
    const ev = EventHandler.trigger(this.element, eventName + EVENT_KEY)
    if (ev.defaultPrevented || this.isTransitioning) return

    this.isTransitioning = true

    this._toggleIcon(type && typeof type === 'object' && type instanceof window.HTMLElement ? type : null, action)

    ///

    const eventCompleteName = action === 'hide' ? 'hidden' : 'shown'

    if (this._jQueryBS) {
      if (action === 'hide') body.classList.add('show')// .show class required for bs collapse plugin

      window.jQuery(body).collapse(action).one(eventCompleteName + '.bs.collapse', () => {
        this.isTransitioning = false
        EventHandler.trigger(this.element, eventCompleteName + EVENT_KEY)
      })
    } else {
      if (action === 'hide') body.classList.remove('show')
      else body.classList.add('show')
      this.isTransitioning = false
      EventHandler.trigger(this.element, eventCompleteName + EVENT_KEY)
    }
  }

  hide () {
    this.toggle('hide')
  }

  show () {
    this.toggle('show')
  }

  toggleFast (type) {
    if (!this._config.toggle) return

    const body = this.element.querySelector('.card-body')
    if (body === null) return

    const action = (type && typeof type === 'string' && type.match(/show|hide/)[0]) || (body.offsetParent !== null ? 'hide' : 'show')

    const eventName = action === 'hide' ? 'hide' : 'show'
    const ev = EventHandler.trigger(this.element, eventName + EVENT_KEY)
    if (ev.defaultPrevented) return

    body.classList.add('collapse')
    if (action === 'hide') body.classList.remove('show')
    else body.classList.add('show')

    this._toggleIcon(type && typeof type === 'object' && type instanceof window.HTMLElement ? type : null, action)

    const eventCompleteName = action === 'hide' ? 'hidden' : 'shown'
    EventHandler.trigger(this.element, eventCompleteName + EVENT_KEY)
  }

  hideFast () {
    this.toggleFast('hide')
  }

  showFast () {
    this.toggleFast('show')
  }

  _toggleIcon (button, action) {
    if (!button) {
      button = this.element.querySelector('a[data-action=toggle]')
    }

    //
    if (button) {
      if (action === 'show') {
        button.classList.remove('collapsed')
      } else {
        button.classList.add('collapsed')
      }
    }
  }

  // fullscreen
  expand (expand, animate) {
    const button = this.element.querySelector('* > .card-header [data-action=expand]')

    const _fullscreen = this.isFullscreen()

    const $expand = expand === true || !_fullscreen
    animate = !((animate === false || Util.isReducedMotion()))// default is true

    const params = ['left', 'top', 'width', 'height']

    if ($expand) {
      if (_fullscreen) return false// return if already fullscreen

      const ev = EventHandler.trigger(this.element, Event.EXPAND)
      if (ev.defaultPrevented || this.isTransitioning) return false

      if (button) button.classList.add('active')

      if (animate) {
        this.isTransitioning = true

        const rect = this.element.getBoundingClientRect()
        params.forEach((param) => { this.element.style[param] = parseInt(rect[param]) + 'px' })

        this.element.classList.add('card-expanding')

        const transitionFn = (e) => {
          if (e.target !== this.element) return// because transitionend might fire for children elements (like animated icons of toolbar)

          this.element.removeEventListener('transitionend', transitionFn)
          this.element.classList.remove('card-expanding')

          this.isTransitioning = false
          EventHandler.trigger(this.element, Event.EXPANDED)
        }
        this.element.addEventListener('transitionend', transitionFn)

        Util.after(this.element, `<div class='card-expanded-placeholder' style='width: ${parseInt(rect.width)}px; height: ${parseInt(rect.height)}px;'></div>`)

        Util.reflow(this.element)// to force browser apply css/dom changes
        params.forEach((param) => { this.element.style[param] = '' })
      }

      this.element.classList.add('card-expand')
      if (!animate) {
        EventHandler.trigger(this.element, Event.EXPANDED)
      }
    } else { // restore
      if (!_fullscreen) return false// return if already not fullscreen

      const ev = EventHandler.trigger(this.element, Event.RESTORE)
      if (ev.defaultPrevented || this.isTransitioning) return false

      if (button) button.classList.remove('active')

      animate = animate && this.element.nextElementSibling !== null && this.element.nextElementSibling.classList.contains('card-expanded-placeholder')
      if (animate) {
        this.isTransitioning = true

        const rect = this.element.nextElementSibling.getBoundingClientRect()

        this.element.classList.add('card-expanding')
        params.forEach((param) => { this.element.style[param] = parseInt(rect[param]) + 'px' })

        const transitionFn = (e) => {
          if (e.target !== this.element) return// because transitionend might fire for children elements (like animated icons of toolbar)

          this.element.removeEventListener('transitionend', transitionFn)
          this.element.classList.remove('card-expanding')
          params.forEach((param) => { this.element.style[param] = '' })

          Util.remove(this.element.nextElementSibling)

          this.isTransitioning = false
          EventHandler.trigger(this.element, Event.RESTORED)
        }
        this.element.addEventListener('transitionend', transitionFn)
      }

      this.element.classList.remove('card-expand')
      if (!animate) {
        EventHandler.trigger(this.element, Event.RESTORED)
      }
    }

    return true
  }// function expand

  expandFast () {
    return this.expand(true, false)
  }

  restore () {
    return this.expand(false)
  }

  restoreFast () {
    return this.expand(false, false)
  }

  isFullscreen () {
    return this.element.classList.contains('card-expand')
  }

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
    if (!element) throw new Error('element for Card is null')

    const name = `__${NAME}__`
    if (typeof element[name] !== 'undefined') return element[name]

    element[name] = new Card(element, config)
    return element[name]
  }

  static _jQueryInterface (config, value) {
    return this.each(function () {
      const $this = window.jQuery(this)
      let data = $this.data(DATA_KEY)

      const _config = {
        // ...Default,
        ...$this.data(),
        ...typeof config && typeof config === 'object' ? config : {}
      }

      if (!data) {
        data = Card.getInstance(this, _config)
        $this.data(DATA_KEY, data)
      }

      if (typeof config === 'string') {
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`)
        }
        data[config](value)
      }
    })
  }
}

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
*/

if (typeof jQuery !== 'undefined') {
  const $ = window.jQuery

  EventHandler.on(document, Event.CLICK_DATA_API, Selector.DATA_ACTION, function (event) {
    const actionBtn = event.delegateTarget
    if (actionBtn.tagName === 'A') {
      event.preventDefault()
    }

    const card = Util.closest(actionBtn, '.card')
    if (card === null) return

    const action = actionBtn.getAttribute('data-action')
    const ev = EventHandler.trigger(card, action + EVENT_KEY)
    if (ev.defaultPrevented) return

    try {
      $(card)[NAME](action, actionBtn)
    } catch (e) {}
  })

  const JQUERY_NO_CONFLICT = $.fn[NAME]
  $.fn[NAME] = Card._jQueryInterface
  $.fn[NAME].Constructor = Card
  $.fn[NAME].noConflict = () => {
    $.fn[NAME] = JQUERY_NO_CONFLICT
    return Card._jQueryInterface
  }
}

export default Card
