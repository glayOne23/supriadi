/**
 * --------------------------------------------------------------------------
 * Ace (v4.0.0): toaster.js
   Wrapper for Bootstrap's toast elements
*/

import Util from './util'
import EventHandler from './event-handler'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'aceToaster'
const VERSION = '4.0.0'
const DATA_KEY = 'ace.toaster'
const EVENT_KEY = `.${DATA_KEY}`

const Event = {
  CLEAR: `clear${EVENT_KEY}`,
  ADD: `add${EVENT_KEY}`,
  ADDED: `added${EVENT_KEY}`
}

const DefaultType = {
  placement: 'string',
  close: 'boolean',
  autoremove: 'boolean',
  delay: 'number',
  template: 'string',
  alert: 'boolean'
}

const Default = {
  placement: 'tr',
  close: true,
  autoremove: true,
  delay: 2500,
  template: '<div class="toast"><div class="d-flex"><div class="toast-image"></div><div class="toast-main"><div class="toast-header"></div><div class="toast-body"></div></div></div></div>',
  alert: true
}

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class Toaster {
  constructor () {
    this._lastToastId = 0
    this.element = null

    this._jQueryBS = typeof window.jQuery !== 'undefined' && typeof window.bootstrap !== 'undefined'
    this._tempParent = document.createElement('DIV')
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

  // Public methods
  add (config) {
    const _config = this._getConfig(config)

    const newToast = Util.append(this._tempParent, _config.template)

    this._lastToastId++
    newToast.classList.add('ace-toaster-item')
    newToast.id = `ace-toaster-item-${this._lastToastId}`
    newToast.setAttribute('aria-atomic', 'true')

    if (_config.alert) {
      newToast.setAttribute('role', 'alert')
      newToast.setAttribute('aria-live', 'assertive')
    } else {
      newToast.setAttribute('role', 'status')
      newToast.setAttribute('aria-live', 'polite')
    }

    const toastHeader = newToast.querySelector('.toast-header')
    if (_config.title && toastHeader) {
      const title = typeof _config.title === 'function' ? _config.title.call(this.element, _config) : _config.title

      Util.append(toastHeader, `<div class="toast-title ${_config.titleClass || ''}">${title}</div>`)
    }

    if (_config.close) {
      let close = newToast.querySelector('[data-dismiss="toast"]')
      if (close === null) {
        close = Util.append(toastHeader, '<button type="button" data-dismiss="toast" aria-label="Close"><span aria-hidden="true">&times;</span></button>')
      }

      close.className += ` ${_config.closeClass || 'close'}`
    }

    if (_config.body) {
      const body = newToast.querySelector('.toast-body')
      if (body !== null) {
        Util.append(body, typeof _config.body === 'function' ? _config.body.call(this.element, _config) : _config.body)
        if (_config.bodyClass) body.className += ` ${_config.bodyClass}`
      }
    }

    if (_config.image) {
      const image = newToast.querySelector('.toast-image')
      if (image !== null) {
        Util.append(image, `<img src="${_config.image}" class="${_config.imageClass || ''}" />`)
      }
    }

    if (_config.icon) {
      const image = newToast.querySelector('.toast-image')
      if (image !== null) {
        const icon = Util.append(image, _config.icon)
        if (!_config.image && _config.imageClass) {
          icon.className += ` ${_config.imageClass}`
        }
      }
    }

    if (!(_config.image || _config.icon)) newToast.querySelectorAll('.toast-image').forEach((el) => Util.remove(el))

    if (_config.className) {
      newToast.className += ` ${_config.className}`
    }
    if (_config.headerClass && toastHeader) {
      toastHeader.className += ` ${_config.headerClass}`
    }

    // if delay is below 30, we consider it as seconds, not milliseconds
    _config.delay = _config.delay > 30 ? _config.delay : _config.delay * 1000

    if (_config.progress && !_config.sticky && _config.autohide !== false) {
      const progress = Util.append(newToast, `<div class="toast-progress ${_config.progress}"></div>`)
      progress.style.transitionDuration = `${parseInt(_config.delay * 1.015)}ms`
      progress.style.width = _config.progressReverse ? 'calc(100% - 1px)' : 0
      // progress.offsetWidth
      setTimeout(() => {
        progress.style.width = _config.progressReverse ? 0 : 'calc(100% - 2px)'
      }, 0)
    }

    return this._addToContainer(newToast, _config)
  }

  // add an existing toast element to our container
  addEl (element, config) {
    const _config = this._getConfig(config)

    this.element = element
    this.element.classList.add('ace-toaster-item')
    if (!this.element.getAttribute('id')) this.element.setAttribute('id', `ace-toaster-item-${++this._lastToastId}`)

    this._addToContainer(this.element, _config, false)
  }

  // add toast element to container
  _addToContainer (toast, _config, isNewElement = true) {
    // trigger ADD event before adding it to our container

    const addEvent = EventHandler.trigger(document, Event.ADD, { target: toast })
    if (addEvent.defaultPrevented) {
      if (isNewElement) Util.remove(toast)
      return null
    }
    // end of trigger

    // add the toaster container to body
    let container = document.querySelector(`.ace-toaster-container.position-${_config.placement}`)
    if (container === null) {
      container = Util.append(document.body, `<div class="ace-toaster-container position-${_config.placement}"/>`)
    }
    if (_config.belowNav) {
      container.classList.add('toaster-below-nav')
    }

    // this last container should appear above other ones ?
    // let topContainer = document.querySelector('.ace-toaster-container-on-top')
    // if (topContainer !== null) topContainer.classList.remove('ace-toaster-container-on-top')
    // container.classList.add('ace-toaster-container-on-top')

    // add to container
    Util.append(container, toast)
    Util.wrap(toast, '<div class="toast-wrapper"></div>')

    // without having an initial .toast element, fade-in animation isn't taking place??!!
    let dummy = document.getElementById('ace-toaster-dummy-toast-1')
    if (dummy === null) dummy = Util.append(document.body, '<div id="ace-toaster-dummy-toast-1" class="toast d-none invisible"></div>')
    if (this._jQueryBS) {
      window.jQuery(dummy).toast('show')
    }
    /// ///////////////////////////////////////////////

    const _toastOptions = {}
    if (_config.sticky === true || _config.autohide === false) _toastOptions.autohide = false
    if (_config.animation === false) _toastOptions.animation = false
    _toastOptions.delay = _config.delay

    if (_config.width) toast.style.width = isNaN(_config.width) ? _config.width : _config.width + 'px'

    if (this._jQueryBS) {
      window.jQuery(toast)
        .toast(_toastOptions)
        .toast('show')
        .one('hidden.bs.toast.1', function () {
        // show it again (invisibly with opacity = 0) and use bootstrap Collapse plugin to hide it, so that other toasts stacked below it move up smoothly
          const $toast = window.jQuery(toast)
          $toast.removeClass('hide').parent().addClass('show').collapse('hide').one('hidden.bs.collapse', function () {
            $toast.toast('dispose')
            $toast.parent().collapse('dispose')

            if (_config.autoremove) {
              $toast.parent().remove()
            } else {
              if (!isNewElement) {
                $toast.unwrap() // remove the wrapper
              }
            }
          })
        })
    }

    // trigger ADDED event before adding it to DOM
    EventHandler.trigger(document, Event.ADDED, { target: toast })

    return toast
  }

  // hide toasts
  remove (id, instant = false) {
    this.hide(id, true, instant)
  }

  removeAll (placement = null, instant = false) {
    this.hideAll(placement, true, instant)
  }

  // remove toast by ID or element reference
  hide (id, remove = false, instant = false) {
    const selector = isNaN(id) ? id : '#ace-toaster-item-' + parseInt(id)
    this._hideBySelector(selector, remove, instant)
  }

  // remove ALL toasts
  hideAll (placement = null, remove = false, instant = false) {
    // trigger CLEAR event before removing ALL
    const clearEvent = EventHandler.trigger(document, Event.CLEAR, { detail: { placement: placement || 'all', remove: remove } })
    if (clearEvent.defaultPrevented) {
      return
    }
    // end of trigger

    let selector = '.toast.ace-toaster-item'
    if (placement) selector = `.ace-toaster-container.position-${placement} ${selector}`
    this._hideBySelector(selector, remove, instant)
  }

  _hideBySelector (selector, remove = false, instant = false) {
    if (!this._jQueryBS) return

    window.jQuery(selector).each(function () {
      const $toast = window.jQuery(this)
      if (!instant && $toast.is(':visible')) {
        // fade out and then remove
        $toast.toast('hide')
          .off('hidden.bs.toast.1')// remove the previous handler above (because it has autoremove)
          .one('hidden.bs.toast.2', function () {
            $toast.toast('dispose')
            if (remove) $toast.remove()
          })
      } else {
        $toast.toast('dispose')
        // instantly remove if not visible
        if (remove) $toast.remove()
      }
    })
  }

  // Private methods
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
  static _jQueryInterface (config) {
    return this.each(function () {
      config = {
        ...{ autoremove: false }, // don't autoremove it
        ...window.jQuery(this).data(),
        ...typeof config === 'object' && config ? config : {}
      }

      window.jQuery[NAME].addEl(this, config)
      // jQuery[NAME] is an instance of Toaster
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

  $[NAME] = new Toaster()
  const JQUERY_NO_CONFLICT = $.fn[NAME]
  $.fn[NAME] = Toaster._jQueryInterface
  $.fn[NAME].Constructor = Toaster
  $.fn[NAME].noConflict = () => {
    $.fn[NAME] = JQUERY_NO_CONFLICT
    return Toaster._jQueryInterface
  }
}

export default Toaster
