/**
 * --------------------------------------------------------------------------
 * Ace (v4.0.0): scrollbar.js
*/

import Util from './util'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'aceScroll'
const VERSION = '4.0.0'
const DATA_KEY = 'ace.scroll'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const Event = {
  LOAD_DATA_API: `load${EVENT_KEY}${DATA_API_KEY}`
}

const Selector = {
  ACE_SCROLL: '[ace-scroll]',
  DATA_ACE_SCROLL: '[data-ace-scroll]'
}

const DefaultType = {
  type: 'string',
  smooth: 'boolean',

  height: '(number|null)',
  lock: 'boolean',

  ignore: '(string|null)',

  plugin: 'string',
  options: '(object|null)', // plugin settings

  color: '(string|null)',
  autohide: '(boolean|null)'
}

const Default = {
  type: 'native',
  smooth: false,

  height: null,
  lock: false,

  ignore: null,

  plugin: 'SimpleBar',
  options: null,

  color: null,
  autohide: true
}

class Scrollbar {
  constructor (element, config) {
    this._element	= element
    this._config = this._getConfig(config)

    this._scrollbarInfo = Util.getScrollbarInfo()

    this.enableScrollbars()
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

  enableScrollbars () {
    /**
    this._element.scrollTop = 0
    // For firefox. Because it has persistent scroll position on page reload
    // which doesn't look good when changing overflow: hidden to overflow: scroll on hover
    */

    // no scrollbars when specified
    if (this._config.ignore !== null) {
      if (this._config.ignore === 'mobile' && this._scrollbarInfo.width === 0 && 'ontouchstart' in window && window.matchMedia('(max-width: 840px)').matches) return
      else if (this._config.ignore === 'desktop' && this._scrollbarInfo.width > 0) return
    }

    this.update(this._config.height)
    this.lock(this._config.lock)

    this._element.classList.remove('ace-scroll', 'ace-scroll-mob', 'ace-scroll-wrap')
    if (this._config.type === 'native') {
      this._addNativeScrolls()
    } else if (this._config.type === 'auto') {
      this._preferNativeScrolls()
    } else if (this._config.type === 'plugin') {
      this._addPluginScrolls()
    }
  }

  update (_height) {
    if (!_height) return
    if (!isNaN(_height)) _height += 'px'
    this._element.style.maxHeight = _height
  }

  lock (_lock) {
    if (_lock) this._element.classList.add('ace-scroll-lock')
    else this._element.classList.remove('ace-scroll-lock')
  }

  _addNativeScrolls (smooth) {
    if (this._scrollbarInfo.width === 0) this._element.classList.add('ace-scroll-mob')// mobile device
    else {
      this._element.classList.add('ace-scroll')

      if (this._config.color !== null) this._element.classList.add('ace-scroll-' + this._config.color)
      if (this._config.autohide === false) this._element.classList.add('is-always-on')

      const _smooth = typeof smooth !== 'undefined' ? smooth : this._config.smooth
      if (_smooth) {
        // wrap children inside an .ace-scroll-inner
        const wrapper = document.createElement('div')
        wrapper.classList.add('ace-scroll-inner')
        wrapper.style.color = window.getComputedStyle(this._element).color

        while (this._element.firstChild) {
          wrapper.appendChild(this._element.firstChild)
        }
        this._element.appendChild(wrapper)

        /// ///////
        // disable the initial transition effects
        this._element.style.transition = 'none'

        this._element.classList.add('ace-scroll-wrap')
        this._element.offsetHeight// reflow
        this._element.style.transition = ''
      }
    }
  }

  _preferNativeScrolls () {
    if (this._scrollbarInfo.width === 0 || this._scrollbarInfo.overlay || this._scrollbarInfo.thin || !this._hasScrollbarPlugin()) {
      this._addNativeScrolls()
    } else {
      this._addPluginScrolls()
    }
  }

  _addPluginScrolls () {
    if (this._hasScrollbarPlugin()) {
      return new window[this._config.plugin](this._element, this._config.options)
    } else {
      this._addNativeScrolls()
    }
  }

  _hasScrollbarPlugin () {
    return !!window[this._config.plugin]
  }

  _getConfig (config) {
    let options = this._element.getAttribute('ace-scroll') || this._element.getAttribute('data-ace-scroll') || {}
    if (!isNaN(options)) options = { height: parseInt(options) }
    else if (options.length > 1) {
      try {
        options = JSON.parse(options)
      } catch (e) {}
    }

    config = {
      ...Default,
      ...typeof config === 'object' && config ? config : {},
      ...typeof options === 'object' && options ? options : {}
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
    if (!element) throw new Error('element for Scrollbar is null')

    const name = `__${NAME}__`
    if (typeof element[name] !== 'undefined') return element[name]

    element[name] = new Scrollbar(element, config)
    return element[name]
  }

  static _jQueryInterface (config) {
    return this.each(function () {
      const $this = window.jQuery(this)
      let data = $this.data(DATA_KEY)

      let options = this.getAttribute('ace-scroll') || this.getAttribute('data-ace-scroll') || {}
      if (!isNaN(options)) options = { height: parseInt(options) }
      else if (options.length > 1) {
        try {
          options = JSON.parse(options)
        } catch (e) {}
      }

      const _config = {
        ...Default,
        ...$this.data(),
        ...typeof config === 'object' && config ? config : {},
        ...typeof options === 'object' && options ? options : {}
      }

      if (!data) {
        data = Scrollbar.getInstance(this, _config)
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
    const scrollbars = ([].slice.call(document.querySelectorAll(Selector.ACE_SCROLL))).concat([].slice.call(document.querySelectorAll(Selector.DATA_ACE_SCROLL)))

    for (let i = 0; i < scrollbars.length; i++) {
      const $scrollbars = $(scrollbars[i])
      Scrollbar._jQueryInterface.call($scrollbars, $scrollbars.data())
    }
  })

  const JQUERY_NO_CONFLICT = $.fn[NAME]
  $.fn[NAME] = Scrollbar._jQueryInterface
  $.fn[NAME].Constructor = Scrollbar
  $.fn[NAME].noConflict = () => {
    $.fn[NAME] = JQUERY_NO_CONFLICT
    return Scrollbar._jQueryInterface
  }
}

export default Scrollbar
