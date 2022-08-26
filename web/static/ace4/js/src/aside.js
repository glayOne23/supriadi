/**
 * --------------------------------------------------------------------------
 * Ace (v4.0.0): aside.js
   Aside element based on Bootstrap's modal
*/

import Util from './util'
import EventHandler from './event-handler'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'aceAside'
const VERSION = '4.0.0'
const DATA_KEY = 'ace.aside'
const EVENT_KEY = `.${DATA_KEY}`

const Event = {
  SHOW: `show${EVENT_KEY}`,
  HIDE: `hide${EVENT_KEY}`
}

const DefaultType = {
  placement: 'string',
  // margin: 'number',

  fade: 'boolean',

  autohide: '(boolean|number)',
  dismiss: 'boolean',

  blocking: 'boolean',
  backdrop: '(boolean|string)',

  container: 'boolean',
  belowNav: 'boolean',
  aboveNav: 'boolean',

  width: '(boolean|number)',
  height: '(boolean|number)',

  scroll: '(boolean|string)'
}

const Default = {
  placement: 'center',
  // margin: 0,

  fade: false,

  autohide: false,
  dismiss: false,

  blocking: false,
  backdrop: false,

  container: false,
  belowNav: false,
  aboveNav: false,

  width: false,
  height: false,

  scroll: 'body'
}

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class Aside {
  constructor (element, config) {
    this._config = this._getConfig(config)
    this.element = element

    this._jQueryBS = typeof window.jQuery !== 'undefined' && typeof window.jQuery.fn.modal !== 'undefined'

    this._init(this._config)
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

  _init (config) {
    const $ = this._jQueryBS ? window.jQuery : null

    this._setPlacement(config.placement)

    this.element.classList.add('ace-aside')

    if (!config.blocking) {
      this.element.classList.add('modal-nb')
      this.element.setAttribute('data-backdrop', 'false')
      if ($) {
        $(this.element).data('backdrop', false)
      }
    } else {
      if (config.backdrop) {
        this.element.setAttribute('data-backdrop-bg', config.backdrop)
      }
      this.element.setAttribute('data-backdrop', 'true')
      if ($) {
        $(this.element).data('backdrop', true)
      }
    }

    if (config.dismiss) this.element.classList.add('modal-dismiss')

    if (config.fade) {
      this.element.classList.add('aside-fade')
      this.element.classList.add('fade')
    }

    if (config.belowNav) this.element.classList.add('aside-below-nav')
    if (config.aboveNav) this.element.classList.add('aside-above-nav')

    if (config.extraClass) this.element.className += ` ${config.extraClass}`

    if (config.container) {
      this.element.classList.add('container')
      const bdc = document.querySelector('.body-container')
      if (bdc !== null && bdc.classList.contains('container-plus')) {
        this.element.classList.add('container-plus')
      }
    }

    if (config.width) {
      const dialog = this.element.querySelector('.modal-dialog')
      if (dialog) {
        dialog.style.width = isNaN(config.width) ? config.width : this._config.width + 'px'
      }
    }

    if (config.height) {
      const dialog = this.element.querySelector('.modal-dialog')
      if (dialog) {
        dialog.style.height = isNaN(config.height) ? config.height : this._config.height + 'px'
      }
    }

    // if (/^(content|body)$/.test(config.scroll)) {
    // let content = this.element.querySelector('.modal-content')
    // if (content) content.classList.add('scroll-' + config.scroll)
    // }

    if (!$) return

    $(this.element).off('shown.bs.modal.autohide')
    if (config.autohide) {
      $(this.element).on('shown.bs.modal.autohide', () => {
        setTimeout(() => {
          this.hide()
        }, config.autohide)
      })
    }
  }

  _setPlacement (placement = 'center') {
    const placementMap = {
      t: 'aside-top',
      top: 'aside-top',
      tc: 'aside-top aside-c',
      tr: 'aside-top aside-r',
      tl: 'aside-top aside-l',

      b: 'aside-bottom',
      bottom: 'aside-bottom',
      bc: 'aside-bottom aside-c',
      br: 'aside-bottom aside-r',
      bl: 'aside-bottom aside-l',

      r: 'aside-right',
      right: 'aside-right',
      rc: 'aside-right aside-m',

      l: 'aside-left',
      left: 'aside-left',
      lc: 'aside-left aside-m',

      c: 'aside-center',
      center: 'aside-center'
    }

    placement = placement || 'c'
    const className = placementMap[placement] || 'aside-center'
    if (placement === 'c' || placement === 'center') {
      this._config.fade = true
      this.element.classList.remove('container')
    }

    this.element.className = this.element.className + ' ' + className
  }

  // Public methods
  show () {
    const event = EventHandler.trigger(this.element, Event.SHOW)
    if (event.defaultPrevented) {
      return
    }

    if (this._jQueryBS) {
      window.jQuery(this.element).modal('show')
    }
  }

  hide () {
    const event = EventHandler.trigger(this.element, Event.HIDE)
    if (event.defaultPrevented) {
      return
    }

    if (this._jQueryBS) {
      window.jQuery(this.element).modal('hide')
    }
  }

  // Private methods
  _getConfig (config) {
    config = {
      ...Default,
      ...typeof config === 'object' && config ? config : {}
    }

    if (this._jQueryBS) {
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
    if (!element) throw new Error('element for Aside is null')

    const name = `__${NAME}__`
    if (typeof element[name] !== 'undefined') return element[name]

    element[name] = new Aside(element, config)
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
        data = Aside.getInstance(this, _config)
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

  /// ///////////////////////
  /// ///////////////////////
  /// ///////////////////////////
  static _HandleAside () {
    const _jQueryBS = typeof window.jQuery !== 'undefined' && typeof window.jQuery.fn.modal !== 'undefined'
    if (!_jQueryBS) return
    const $ = window.jQuery

    const visibleModalSelector = '.modal.show:not(.modal-nb)'

    document.querySelectorAll('.ace-aside.modal-nb').forEach((el) => el.setAttribute('data-backdrop', 'false'))

    $('.ace-aside.modal-nb').data('backdrop', false)

    const onBeforeShow = (modal) => {
      if (modal.classList.contains('modal-nb')) {
        if (document.querySelector(visibleModalSelector) === null) { // if there are no normal modals open
          document.body.classList.add('modal-nb')// disable .modal-open effects for .modal-nb
        }
      } else {
        if (!modal.classList.contains('ace-aside')) {
          // check to see if we will have modal scrollbars
          modal.style.display = 'block'
          if (modal.scrollHeight > modal.clientHeight) document.body.classList.add('modal-scroll')
          const scrollbars = Util.getScrollbarInfo()
          if (scrollbars.width === 0) document.body.classList.add('scrollbar-w0')
          modal.style.display = ''
        }

        // set modal padding value (equal to scrollbar width)
        document.body.style.setProperty('--modal-padding', (window.innerWidth - document.body.scrollWidth) + 'px')

        const isModalOff = modal.className.match(/modal-off(?:(?:-([a-z]+))|\s|$)/i)

        const backdropBg = modal.getAttribute('data-backdrop-bg')
        if (backdropBg || isModalOff) {
          setTimeout(function () {
            const backdrops = document.querySelectorAll('.modal-backdrop')
            if (backdrops.length > 0) {
              const backdrop = backdrops[backdrops.length - 1]
              if (backdropBg) backdrop.classList.add(backdropBg)

              // add d-{sm|md|lg|xl}-none to backdrop
              if (isModalOff) {
                const modalOff = (isModalOff[1] && isModalOff[1].length > 0) ? `-${isModalOff[1]}` : ''
                backdrop.classList.add(`d${modalOff}-none`)
              }
            }
          }, 0)
        }

        const blur = modal.getAttribute('data-blur')
        if (blur !== null && window.CSS) {
          /**
           // using `backdrop-filter` is less intrusive but doesn't have the same blur effect
            if (window.CSS.supports("backdrop-filter", "none")) {
            setTimeout(function () {
              $('.modal-backdrop:last-child').addClass('modal-blur')
            }, 0)
          }
          else */
          if (window.CSS.supports('filter', 'none')) {
            const bodyContainer = document.querySelector('.body-container')
            if (bodyContainer !== null) {
              document.body.classList.add('modal-blur')
              bodyContainer.style.filter = 'blur(' + blur + ')'

              const modalParent = modal.parentNode
              const modalSibling = modal.nextSibling

              document.body.appendChild(modal)

              $(modal).one('hidden.bs.modal.blur', () => {
                modalParent.insertBefore(modal, modalSibling)
                document.body.classList.remove('modal-blur')
                bodyContainer.style.filter = ''
              })
            }
          }
        }
      }
    }

    /// /////////////////////////////
    const onAfterShow = (modal) => {
      if (modal.classList.contains('modal-nb')) {
        document.body.classList.remove('modal-nb')

        if (document.querySelector(visibleModalSelector) === null) { // if no blocking modals
          document.body.classList.remove('modal-open')// disable .modal-open effects
          document.body.style.paddingRight = ''// and remove paddingRight
        }

        if (modal.classList.contains('modal-dismiss') || modal.getAttribute('data-dismiss') === 'true') {
          modal._dismissAsideEvent = ($event) => {
            if (!modal.contains($event.target)) { // clicked outside modal
              // why timeout?
              // because if we click on the same button that triggers this modal, its 'hide' function will be called and instantly followed by 'show' function
              // so we first let 'show' be called and then we call 'hide'
              document.removeEventListener('mouseup', modal._dismissAsideEvent)
              modal._dismissAsideEvent = null

              setTimeout(() => {
                $(modal).modal('hide')
              }, 0)
            }
          }
          // why `mouseup`? because 'click' may get 'stopPropagated' in some plugins such as Bootstrap's dropdown
          document.addEventListener('mouseup', modal._dismissAsideEvent)
        }
      }
    }

    const onAfterHide = (modal) => {
      if (document.querySelector(visibleModalSelector) === null) document.body.style.paddingRight = ''// required for rare cases that body padding is still not cleared
      else document.body.classList.add('modal-open') // sometimes an aside is closed (so .modal-open is removed) but a .modal is still open (so we add .modal-open again)

      if (!modal.classList.contains('modal-nb')) {
        document.body.classList.remove('modal-scroll')
        document.body.classList.remove('scrollbar-w0')
      }

      if (typeof modal._dismissAsideEvent === 'function') {
        document.removeEventListener('mouseup', modal._dismissAsideEvent)
      }
    }

    /// //////////////////////////////////////
    $(document)
      .on('show.bs.modal', '.modal', (e) => {
        if (e.defaultPrevented || e.isDefaultPrevented()) return
        onBeforeShow(e.target)
      })
      .on('shown.bs.modal', '.modal', function (e) {
        onAfterShow(e.target)
      })
      .on('hidden.bs.modal', '.modal', function (e) {
        onAfterHide(e.target)
      })

    // enable modal functionality for modal boxes and asides that are shown (.show) by default
    $('.modal.show').modal('show')
  }// _HandleAside
}

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
*/

if (typeof jQuery !== 'undefined') {
  const $ = window.jQuery
  Aside._HandleAside()

  const JQUERY_NO_CONFLICT = $.fn[NAME]
  $.fn[NAME] = Aside._jQueryInterface
  $.fn[NAME].Constructor = Aside
  $.fn[NAME].noConflict = () => {
    $.fn[NAME] = JQUERY_NO_CONFLICT
    return Aside._jQueryInterface
  }
}

export default Aside
