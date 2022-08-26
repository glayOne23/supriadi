/**
 * --------------------------------------------------------------------------
 * Ace (v4.0.0): util.js
   Some Utility Functions
*/

class Util {
  static isReducedMotion () {
    return window.matchMedia('(prefers-reduced-motion)').matches
  }

  static isRTL () {
    return document.documentElement.classList.contains('rtl') || document.documentElement.dir === 'rtl'
  }

  static closest (element, selector) {
    if (!element) return null
    if ('closest' in element) return element.closest(selector)

    try {
      for (let el = element; el !== null; el = el.parentNode) {
        if (Util.matches(el, selector)) {
          return el
        }
      }
    } catch (e) {}

    return null
  }

  static matches (element, selector) {
    if (!element || !selector) return false

    if (element === selector) {
      // for when selector is not a string, i.e selector is the element itself (needed for when we don't know the types)
      return true
    }

    try {
      if (Util._matches) {
        return element.matches(selector)
      } else if (Util._msMatches) {
        return element.msMatchesSelector(selector)
      }
    } catch (e) {}

    return false
  }

  static isValidSelector (selector) {
    if (typeof selector !== 'string') return false
    let isValid = true
    try {
      document.createDocumentFragment().querySelector(selector)
    } catch (e) {
      isValid = false
    }
    return isValid
  }

  static _insert (element, _elem, _pos = 'afterend') {
    if (typeof element === 'string') element = document.querySelector(element)
    if (element === null) return null

    // check to see it _elem is a 'selector'
    if (Util.isValidSelector(_elem)) {
      const tmp = document.querySelector(_elem)
      _elem = tmp !== null ? tmp : _elem
    }

    let currentElemAtPos = null
    switch (_pos) {
      case 'afterend':
        currentElemAtPos = element.nextElementSibling
        break

      case 'beforeend':
        currentElemAtPos = element.lastElementChild
        break

      case 'afterbegin':
        currentElemAtPos = element.firstElementChild
        break

      case 'beforebegin':
        currentElemAtPos = element.previousElementSibling
        break
    }

    if (typeof _elem === 'string') {
      element.insertAdjacentHTML(_pos, _elem)

      switch (_pos) {
        case 'afterend':
          _elem = element.nextElementSibling
          break

        case 'beforeend':
          _elem = element.lastElementChild
          break

        case 'afterbegin':
          _elem = element.firstElementChild
          break

        case 'beforebegin':
          _elem = element.previousElementSibling
          break
      }
    } else {
      _elem = element.insertAdjacentElement(_pos, _elem)
    }

    if (_elem === currentElemAtPos) return null // it means the new element has not been inserted
    return _elem
  }

  static after (element, _after) {
    return Util._insert(element, _after, 'afterend')
  }

  static before (element, _before) {
    return Util._insert(element, _before, 'beforebegin')
  }

  static append (element, _append) {
    return Util._insert(element, _append, 'beforeend')
  }

  static prepend (element, _prepend) {
    return Util._insert(element, _prepend, 'afterbegin')
  }

  static wrap (element, _wrap) {
    _wrap = Util._insert(element, _wrap, 'afterend')
    if (_wrap) _wrap.appendChild(element)
    return _wrap
  }

  static unwrap (element, remove = true) {
    const parent = element.parentNode
    Util.after(parent, element)
    if (remove) Util.remove(parent)
  }

  static empty (element) {
    // first remove all events
    // element.querySelectorAll('*').forEach((el) => EventHandler.off(el))
    element.innerHTML = ''
  }

  static remove (element) {
    if (typeof element === 'string') {
      document.querySelectorAll(element).forEach((el) => {
        Util.remove(el)
      })
      return
    }
    // first remove all events
    // EventHandler.off(element)
    return element && element.parentNode && element.parentNode.removeChild(element)
  }

  static updateClass (element, className, add = true) {
    if (typeof element === 'string') {
      document.querySelectorAll(element).forEach((el) => {
        Util.updateClass(el, className, add)
      })
      return
    }

    if (!element) return

    const _classes = className.split(/\s/)
    for (let _class of _classes) {
      _class = _class.trim()
      if (_class.length === 0) continue

      if (add) {
        element.classList.add(_class)
      } else {
        element.classList.remove(_class)
      }
    }
  }

  static addClass (element, className) {
    Util.updateClass(element, className, true)
  }

  static removeClass (element, className) {
    Util.updateClass(element, className, false)
  }

  static next (element, selector = null) {
    if (!selector) return element.nextElementSibling

    let _next = element
    while ((_next = _next.nextElementSibling) && !Util.matches(_next, selector));
    return _next
  }

  static prev (element, selector = null) {
    if (!selector) return element.previousElementSibling

    let _prev = element
    while ((_prev = _prev.previousElementSibling) && !Util.matches(_prev, selector));
    return _prev
  }

  static reflow (element) {
    return element.offsetTop
  }

  static css (element, property) {
    return window.getComputedStyle(element)[property]
  }

  static getScrollbarInfo (recalc = false) {
    if (recalc === false && Util._scrollbarInfo !== null) return Util._scrollbarInfo

    const scrollDiv = document.createElement('div')
    scrollDiv.style.overflow = 'scroll'
    scrollDiv.style.position = 'absolute'
    scrollDiv.style.width = '50px'
    scrollDiv.style.height = '50px'

    const scrollbar = {}

    document.body.appendChild(scrollDiv)
    scrollbar.width = parseInt(scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth)
    document.documentElement.style.setProperty('--scrollbar-width', scrollbar.width + 'px')

    let thinWidth = scrollbar.width
    if (window.CSS) {
      scrollbar.thin = window.CSS.supports('scrollbar-width', 'thin')// currently only firefox 64+ supports it
      if (scrollbar.thin) {
        scrollDiv.style['scrollbar-width'] = 'thin'
        thinWidth = parseInt(scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth)
      }

      scrollbar.overlay = window.CSS.supports('overflow', 'overlay')
    } else {
      scrollbar.thin = false

      scrollDiv.style.overflow = 'overlay'// Webkit/Chromium based browsers support it
      scrollbar.overlay = scrollbar.width > 0 && parseInt(scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth) === 0
    }
    document.documentElement.style.setProperty('--moz-scrollbar-thin', thinWidth + 'px')

    scrollDiv.style['-ms-overflow-style'] = '-ms-autohiding-scrollbar'// IE
    scrollbar.autohide = scrollbar.width > 0 && parseInt(scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth) === 0

    /// //////////////////////////////////
    document.body.removeChild(scrollDiv)
    Util._scrollbarInfo = scrollbar

    return Util._scrollbarInfo
  }
}
Util._supportsTransitionStart = null// static property
Util._scrollbarInfo = null// static property

Util._matches = typeof document.body.matches === 'function'
Util._msMatches = typeof document.body.msMatchesSelector === 'function'

/**
* ------------------------------------------------------------------------
* ------------------------------------------------------------------------
*/

export default Util
