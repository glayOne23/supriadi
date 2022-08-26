/**
 * --------------------------------------------------------------------------
 * Ace (v4.0.0): fileinput.js
 * Custom styling for default browser file input
*/

import Util from './util'
import EventHandler from './event-handler'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
*/

const NAME = 'aceFileInput'
const VERSION = '4.0.0'
const DATA_KEY = 'ace.file'
const EVENT_KEY = `.${DATA_KEY}`

const Event = {
  CHANGED: `changed${EVENT_KEY}`,
  INVALID: `invalid${EVENT_KEY}`,
  CLEAR: `clear${EVENT_KEY}`,
  PREVIEW_FAILED: `preview_failed${EVENT_KEY}`
}

const Default = {
  style: false,
  persistent: false,

  container: 'border-1 brc-grey-l2 brc-h-warning-m1',

  btnChooseClass: 'bgc-default text-white px-2 pt-2 text-90 my-1px mr-1px',
  btnChangeClass: 'bgc-blue text-white px-2 pt-2 text-90 my-1px mr-1px',

  btnChooseText: 'Choose',
  btnChangeText: 'Change',

  placeholderClass: 'text-grey-m2 px-1',
  placeholderText: 'No file chosen',
  placeholderIcon: '<i class="fa fa-upload bgc-grey-m1 text-white w-4 py-2 text-center"></i>',

  iconClass: 'mx-2px',

  reset: '',
  resetText: '',
  resetIcon: '<i class="fa fa-times"></i>',

  droppable: false,
  thumbnail: false, // large, fit, small
  previewImage: true,

  allowExt: null,
  denyExt: null,
  allowMime: null,
  denyMime: null,
  maxSize: null,

  previewSize: false,
  previewWidth: false,
  previewHeight: false,

  // callbacks
  beforeChange: null,

  fileIcons: {
    file: '<i class="fa fa-file bgc-grey-m1 text-white w-4 py-2 text-center"></i>',
    image: '<i class="far fa-image bgc-purple-m1 text-white w-4 py-2 text-center"></i>',
    video: '<i class="fas fa-video bgc-success-m1 text-white w-4 py-2 text-center"></i>',
    audio: '<i class="fas fa-music bgc-pink-m1 text-white w-4 py-2 text-center"></i>',
    document: '<i class="far fa-file-alt bgc-default-d1 text-white w-4 py-2 text-center"></i>',
    archive: '<i class="far fa-file-archive bgc-warning text-white w-4 py-2 text-center"></i>',
    code: '<i class="fas fa-code file-code bgc-secondary text-white w-4 py-2 text-center"></i>'
  }
}

const DefaultType = {
  persistent: 'boolean',

  style: '(boolean|string)',

  btn: '(string|undefined)',
  container: '(string|undefined)',
  icon: '(string|undefined)',

  placeholderText: '(string|undefined)',
  placeholderIcon: '(string|undefined)',
  btnChooseText: '(string|undefined)',
  btnChangeText: '(string|undefined)',

  reset: '(string|undefined)',
  resetText: '(string|undefined)',
  resetIcon: '(string|undefined)',

  droppable: 'boolean',
  thumbnail: '(boolean|string)',
  previewImage: 'boolean',

  allowExt: '(string|null)',
  denyExt: '(string|null)',
  allowMime: '(string|null)',
  denyMime: '(string|null)',
  maxSize: '(number|null)',

  previewSize: '(boolean|number)',
  previewWidth: '(boolean|number)',
  previewHeight: '(boolean|number)',

  fileIcons: '(object|null)',

  // callbacks
  beforeChange: '(function|null)'
}

const PreviewError = {
  FILE_LOAD_FAILED: 1,
  IMAGE_LOAD_FAILED: 2,
  THUMBNAIL_FAILED: 3
}

class ImagePreviewError extends Error {
  constructor (message, code) {
    super(message)
    this.code = code
  }
}

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class FileInput {
  constructor (element, config) {
    this.settings = this._getConfig(config)

    this.settings.fileIcons = {
      ...Default.fileIcons,
      ...this.settings.fileIcons || {}
    }

    this.fileList = []
    this.selectMethod = ''

    this._hasMultiple = 'multiple' in document.createElement('INPUT')
    this._hasFileList = 'FileList' in window// file list enabled in modern browsers
    this._hasFileReader = 'FileReader' in window
    this._hasFile = 'File' in window

    this.element = element
    this.disabled = false
    this.canReset = true

    this._hasAcceptAttr = this.element.getAttribute('accept') !== null

    // if new files selected (via file dialog), handle them
    EventHandler.off(this.element, 'change.aceFileInput')
    EventHandler.on(this.element, 'change.aceFileInput', () => {
      if (this.disabled) return
      return this._handleOnChange()
    })

    // if a parent form is 'reset', reset UI as well
    const parentForm = Util.closest(this.element, 'form')
    if (parentForm) {
      EventHandler.off(parentForm, 'reset.aceFileInput')
      EventHandler.on(parentForm, 'reset.aceFileInput', () => {
        this.resetInputData()
        this.resetInputUI()
      })
    }

    const parentLabel = Util.closest(this.element, 'label')
    let tagName = 'label'
    if (parentLabel) {
      parentLabel.classList.add('d-block')
      tagName = 'span'// if not inside a "LABEL" tag, use "LABEL" tag, otherwise use "SPAN"
    }

    this._wrap = Util.wrap(this.element, `<${tagName} class="ace-file-input" />`)

    this._applySettings()
  }

  // Getters
  static get VERSION () {
    return VERSION
  }

  static get DefaultType () {
    return DefaultType
  }

  _getConfig (config) {
    config = {
      ...Default,
      ...config
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

  _applySettings () {
    this._jQueryBS = typeof window.jQuery !== 'undefined' && typeof window.bootstrap !== 'undefined'

    this._isMulti = this.element.getAttribute('multiple') && this._hasMultiple
    this._isDropStyle = this.settings.style === 'drop'

    if (this._isDropStyle) {
      if (!this.settings.thumbnail) this.settings.thumbnail = 'small'
      this._wrap.classList.add('ace-file-multiple')
    } else {
      this._wrap.classList.remove('ace-file-multiple')
    }

    this._wrap.querySelectorAll('*:not([type=file])').forEach((el) => Util.remove(el))// remove all except our input, good for when changing settings

    const placeholder = `<div class="ace-file-placeholder h-100">
<span class="ace-file-icon align-self-center ${this.settings.iconClass || ''}">
  ${this.settings.placeholderIcon || ''}
</span>
<span class="ace-file-name ${this.settings.placeholderClass || ''}">
  ${this.settings.placeholderText}
</span>` + (!this._isDropStyle ? `<span class="ace-file-btn ml-auto ${this.settings.btnChooseClass || ''}">${this.settings.btnChooseText}</span>` : '') + '</div>'

    Util.after(this.element, `<div class="ace-file-container d-flex flex-column ${this.settings.container || ''}">${placeholder}</div>`)

    this.container = this.element.nextElementSibling

    if (this.settings.reset !== false) {
      const remove = this.settings.reset.length > 0 ? this.settings.reset : (!this._isDropStyle ? 'position-rc text-danger mr-n25 w-3 radius-2 border-1 brc-h-danger-m4 text-center' : 'position-tr bgc-white text-danger mt-n25 mr-n25 w-4 h-4 text-center pt-2px radius-round border-2 brc-grey-m4 brc-h-danger-m3')

      const btn = Util.append(this._wrap, `<a title="${this.settings.resetText || ''}" class="remove ${remove}" href="#">${this.settings.resetIcon}</a>`)

      if (this.settings.resetText && this._jQueryBS && window.jQuery.fn.tooltip) window.jQuery(btn).tooltip({ container: 'body' })

      btn.addEventListener('click', (ev) => {
        ev.preventDefault()
        if (!this.canReset) return

        const event = EventHandler.trigger(this.element, Event.CLEAR)
        if (event.defaultPrevented) return

        this.resetInput()
      })
    }

    if (this.settings.droppable && this._hasFileList) {
      this._enableFileDrop()
    }

    // set 'accept' attribute if not set
    if (!this._hasAcceptAttr) {
      this._setAcceptAttr(this.settings.allowExt, this.settings.allowMime)
    }
  }

  showFileList ($files, innerCall) {
    const files = $files || this.fileList
    if (!files || !files.length) return

    /// //////////////////////////////////
    if (!this.settings.persistent) {
      this.resetInputUI()
    }

    this.container.classList.add('selected')
    this.container.querySelectorAll('.ace-file-placeholder').forEach((el) => el.classList.add('d-none'))

    for (let i = 0; i < files.length; i++) {
      let filename = ''
      let format = false

      if (typeof files[i] === 'string') filename = files[i]

      else if (this._hasFile && files[i] instanceof window.File) filename = files[i].name.trim()

      else if (files[i] instanceof Object && Object.prototype.hasOwnProperty.call(files[i], 'name')) {
        // format & name specified by user (pre-displaying name, etc)
        filename = files[i].name
        if (Object.prototype.hasOwnProperty.call(files[i], 'type')) format = files[i].type
        if (!Object.prototype.hasOwnProperty.call(files[i], 'path')) files[i].path = files[i].name
      } else continue

      let index = filename.lastIndexOf('\\') + 1
      if (index === 0) index = filename.lastIndexOf('/') + 1
      filename = filename.substr(index)

      if (!format) {
        if ((/\.(jpe?g|png|gif|svg|bmp|tiff?|webp)$/i).test(filename)) {
          format = 'image'
        } else if ((/\.(mpe?g|flv|mov|avi|swf|mp4|mkv|webm|wmv|3gp)$/i).test(filename)) {
          format = 'video'
        } else if ((/\.(mp3|ogg|wav|wma|amr|aac)$/i).test(filename)) {
          format = 'audio'
        } else if ((/\.(pdf|docx?|rtf|txt)$/i).test(filename)) {
          format = 'document'
        } else if ((/\.(zip|rar|tar)$/i).test(filename)) {
          format = 'archive'
        } else if ((/\.(html?|js|s?css|less|php|py|aspx?|rb|c|cpp|java|cs)$/i).test(filename)) {
          format = 'code'
        } else format = 'file'
      }

      const fileIcon = this.settings.fileIcons[format]

      let className = 'ace-file-item d-flex h-100'
      if (this.settings.thumbnail) className += ` ${this.settings.thumbnail !== 'small' ? 'flex-column my-2px py-2' : 'mx-1 py-1'} align-items-center`

      const label = Util.append(this.container, `<div class="${className}">
<span class="ace-file-icon align-self-center ${this.settings.iconClass || ''}">${fileIcon}</span>
<span class="ace-file-name ${this.settings.thumbnail && this.settings.thumbnail !== 'small' ? 'px-2' : 'px-1'}">${filename}</span>` +
      (!this._isDropStyle ? `<span class="ace-file-btn ml-auto ${this.settings.btnChangeClass || ''}">${this.settings.btnChangeText}</span>` : '') +
      '</div>')

      const type = (innerCall === true && this._hasFile && files[i] instanceof window.File) ? files[i].type.trim() : ''
      const canPreview = this.settings.previewImage !== false && this._hasFileReader && this.settings.thumbnail &&
					((type.length > 0 && type.match('image')) || (type.length === 0 && format === 'image'))// the second one is for older Android's default browser which gives an empty text for file.type
      if (canPreview) {
        try {
          this._previewImage(files[i], label)
            .catch((result) => {
              EventHandler.trigger(this.element, Event.PREVIEW_FAILED, { $_previewError: { filename: filename, code: result.code } })
            })
        } catch (e) {
          // for IE that doesn't support Promises
          EventHandler.trigger(this.element, Event.PREVIEW_FAILED, { $_previewError: { filename: filename, code: PreviewError.FILE_LOAD_FAILED } })
        }
      }
    }
  }

  resetInput () {
    this.resetInputUI()
    this.resetInputField()
    this.resetInputData()
  }

  resetInputUI () {
    this.container.querySelectorAll('div:not(.ace-file-placeholder)').forEach((el) => Util.remove(el))
    this.container.querySelectorAll('.ace-file-placeholder').forEach((el) => el.classList.remove('d-none'))

    this.container.classList.remove('selected') // hides 'close' button
    this.stopLoading()
  }

  resetInputField () {
    this.element.value = ''
    this.element.type = ''
    this.element.type = 'file'
  }

  resetInputData () {
    this.fileList = []
    this.selectMethod = ''

    if (this._jQueryBS && window.jQuery(this.element).data('ace_input_files')) {
      window.jQuery(this.element).removeData('ace_input_files')
      window.jQuery(this.element).removeData('ace_input_method')
    }
  }

  enableReset () {
    this.canReset = true
  }

  disableReset () {
    this.canReset = false
  }

  disable () {
    this.disabled = true
    this.element.setAttribute('disabled', 'disabled')
    this.element.classList.add('disabled')
  }

  enable () {
    this.disabled = false
    this.element.removeAttribute('disabled')
    this.element.classList.remove('disabled')
  }

  files () {
    return this.fileList.length > 0 ? this.fileList : null
  }

  method () {
    return this.selectMethod
  }

  updateSettings (newSettings) {
    this.settings = {
      ...this.settings,
      ...newSettings || {}
    }

    this.settings.fileIcons = {
      ...this.settings.fileIcons,
      ...newSettings.fileIcons || {}
    }

    this._applySettings()
  }

  startLoading (loadingHtml = '<i class="overlay-content fa fa-spin fa-spinner text-white fa-2x"></i>') {
    let loader = this._wrap.querySelector('.ace-file-overlay')
    if (loader === null) {
      loader = Util.append(this._wrap, '<div class="ace-file-overlay text-center"></div>')

      EventHandler.on(loader, 'click', (ev) => {
        ev.stopImmediatePropagation()
        ev.preventDefault()
      })

      this.element.setAttribute('readonly', 'true')// for IE
    }
    loader.innerHTML = loadingHtml
  }

  stopLoading () {
    const loader = this._wrap.querySelector('.ace-file-overlay')
    if (loader === null) {
      this.element.removeAttribute('readonly')
      return
    }
    EventHandler.off(loader, 'click')
    Util.remove(loader)
  }

  _enableFileDrop () {
    const dropbox = this.element.parentNode

    EventHandler.off(dropbox, 'dragenter')
    EventHandler.on(dropbox, 'dragenter', (e) => {
      e.preventDefault()
      e.stopPropagation()
    })

    EventHandler.off(dropbox, 'dragover')
    EventHandler.on(dropbox, 'dragover', (e) => {
      e.preventDefault()
      e.stopPropagation()
    })

    EventHandler.off(dropbox, 'drop')
    EventHandler.on(dropbox, 'drop', (e) => {
      e.preventDefault()
      e.stopPropagation()

      if (this.disabled) return

      const dt = e.dataTransfer
      let tmpFileList = dt.files
      if (!this._isMulti && tmpFileList.length > 1) { // single file upload, but dragged multiple files
        const tmpfiles = []
        tmpfiles.push(tmpFileList[0])
        tmpFileList = tmpfiles// keep only first file
      }

      tmpFileList = this._processFiles(tmpFileList, true)// true means files have been dropped
      if (tmpFileList === false) return false

      this.selectMethod = 'drop'

      // const fileArray = [...tmpFileList]
      const fileArray = []
      for (let f = 0; f < tmpFileList.length; f++) fileArray.push(tmpFileList[f])

      if (this.settings.persistent) {
        this.fileList = this.fileList.concat(fileArray)
      } else {
        this.fileList = fileArray
      }

      if (this._jQueryBS) {
        window.jQuery(this.element).data('ace_input_files', this.fileList)
        window.jQuery(this.element).data('ace_input_method', this.selectMethod)
      }

      this.showFileList(fileArray, true)

      EventHandler.trigger(this.element, Event.CHANGED, { $_selectedFiles: { list: this.fileList, method: this.selectMethod } })

      return true
    })
  }

  /// ///////////

  _handleOnChange () {
    let tmpFileList = this.element.files || [this.element.value]// make it an array

    tmpFileList = this._processFiles(tmpFileList, false)// false means files have been selected, not dropped
    if (tmpFileList === false) return false

    // const fileArray = [...tmpFileList];
    const fileArray = []
    for (let f = 0; f < tmpFileList.length; f++) fileArray.push(tmpFileList[f])

    this.selectMethod = 'select'

    if (this.settings.persistent) {
      this.fileList = this.fileList.concat(fileArray)
    } else {
      this.fileList = fileArray
    }

    if (this._jQueryBS) {
      window.jQuery(this.element).data('ace_input_files', this.fileList)
      window.jQuery(this.element).data('ace_input_method', this.selectMethod)
    }

    this.showFileList(fileArray, true)

    EventHandler.trigger(this.element, Event.CHANGED, { $_selectedFiles: { list: this.fileList, method: this.selectMethod } })

    return true
  }

  _previewImage (file, label) {
    return new Promise((resolve, reject) => {
      const icon = label.querySelector('.ace-file-icon')// it should be out of onload, otherwise all onloads may target the same $icon because of delays
      if (icon) Util.empty(icon)

      const getImage = function (src, $file) {
        const img = Util.prepend(icon, "<img style='display: none;' />")

        // no error/load event is triggered in some browsers such as firefox mobile
        // so we wait a while and then reject the promise
        let waitTimer = setTimeout(() => {
          waitTimer = null
          removeEvents()
          imgFailed(img)
        }, 6000)

        const onLoad = () => {
          removeEvents()
          imgLoaded(img, $file)
        }

        const onError = () => {
          removeEvents()
          imgFailed(img)
        }

        const removeEvents = () => {
          if (waitTimer) {
            clearTimeout(waitTimer)
            waitTimer = null
          }

          img.removeEventListener('load', onLoad) // call only once
          img.removeEventListener('error', onError) // remove the other one too
        }

        img.addEventListener('load', onLoad)
        img.addEventListener('error', onError)

        img.src = src
      }

      const imgLoaded = (img, $file) => { // if image loaded successfully
        let size = this.settings.previewSize

        if (!size) {
          if (this.settings.previewWidth || this.settings.previewHeight) {
            size = { previewWidth: this.settings.previewWidth, previewHeight: this.settings.previewHeight }
          } else {
            size = 50
            if (this.settings.thumbnail === 'large') size = 150
          }
        }
        if (this.settings.thumbnail === 'fit') size = icon.parentNode.offsetWidth
        else if (typeof size === 'number') size = parseInt(Math.min(size, icon.parentNode.offsetWidth))

        const svg = /svg/.test($file.type)
        const thumb = !svg ? this._getThumbnail(img, size, $file.type) : false//, file.type;
        if (thumb === null) {
          // if making thumbnail fails
          Util.remove(img)

          reject(new ImagePreviewError('Thumbnail Failed', PreviewError.THUMBNAIL_FAILED))
          return
        }

        const showPreview = true
        if (showPreview) {
          if (svg) {
            if (this.settings.thumbnail === 'small') {
              img.style.width = size + 'px'
            } else {
              if (img.width > img.height) {
                img.style.width = size + 'px'
              } else {
                img.style.height = size + 'px'
              }
            }
          } else {
            let w = thumb.previewWidth
            let h = thumb.previewHeight

            if (this.settings.thumbnail === 'small') {
              w = h = parseInt(Math.max(w, h))
            } else {
              icon.classList.add('thumbnail-large')
            }

            img.style.background = `url(${thumb.src}) center no-repeat`
            img.style.width = w + 'px'
            img.style.height = h + 'px'

            img.setAttribute('data-src', thumb.src)
            img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg=='
          }

          img.style.display = ''
        }

        /// ////////////////
        resolve()
      }
      const imgFailed = function (img) {
        // for example when a file has image extenstion, but format is something else
        Util.remove(img)
        reject(new ImagePreviewError('Image Load Failed', PreviewError.IMAGE_LOAD_FAILED))
      }

      if (this._hasFile && file instanceof window.File) {
        const reader = new window.FileReader()
        reader.onload = function (e) {
          getImage(e.target.result, file)
        }
        reader.onerror = function (e) {
          reject(new ImagePreviewError('File Load Failed', PreviewError.FILE_LOAD_FAILED))
        }
        reader.readAsDataURL(file)
      } else {
        if (file instanceof Object && Object.prototype.hasOwnProperty.call(file, 'path')) {
          getImage(file.path, file)// file is a file name (path) --- this is used to pre-show user-selected image
        }
      }
    })
  }

  /// //////////

  _getThumbnail (img, size, type) {
    let imgWidth = img.width
    let imgHeight = img.height

    //* *IE10** is not giving correct width using img.width
    imgWidth = imgWidth > 0 ? imgWidth : img.offsetWidth
    imgHeight = imgHeight > 0 ? imgHeight : img.offsetHeight

    let previewSize = false
    let previewHeight = false
    let previewWidth = false

    if (typeof size === 'number') previewSize = size
    else if (size instanceof Object) {
      if (size.previewWidth && !size.previewHeight) previewWidth = size.previewWidth
      else if (size.previewHeight && !size.previewWidth) previewHeight = size.previewHeight
      else if (size.previewWidth && size.previewHeight) {
        previewWidth = size.previewWidth
        previewHeight = size.previewHeight
      }
    }

    if (previewSize) {
      if (imgWidth > imgHeight) {
        previewWidth = previewSize
        previewHeight = parseInt(imgHeight / imgWidth * previewWidth)
      } else {
        previewHeight = previewSize
        previewWidth = parseInt(imgWidth / imgHeight * previewHeight)
      }
    } else {
      if (!previewHeight && previewWidth) {
        previewHeight = parseInt(imgHeight / imgWidth * previewWidth)
      } else if (previewHeight && !previewWidth) {
        previewWidth = parseInt(imgWidth / imgHeight * previewHeight)
      }
    }

    let dataURL
    try {
      const canvas = document.createElement('canvas')
      canvas.width = previewWidth
      canvas.height = previewHeight

      const context = canvas.getContext('2d')
      context.imageSmoothingQuality = 'medium'
      context.drawImage(img, 0, 0, imgWidth, imgHeight, 0, 0, previewWidth, previewHeight)
      dataURL = canvas.toDataURL(type, 0.8)
      // dataURL = canvas.toDataURL();
    } catch (e) {
      dataURL = null
    }
    if (!dataURL) return null

    // there was only one image that failed in firefox completely randomly! so let's double check things
    if (!(/^data:image\/(png|jpe?g|gif|svg);base64,[0-9A-Za-z+/=]+$/.test(dataURL))) dataURL = null
    if (!dataURL) return null

    return { src: dataURL, previewWidth: previewWidth, previewHeight: previewHeight, width: imgWidth, height: imgHeight }
  }

  _processFiles (tmpFileList, dropped) {
    let ret = this._checkFileList(tmpFileList, dropped)
    if (ret === -1) {
      this.resetInput()
      return false
    }
    if (!ret || ret.length === 0) {
      if (this.fileList.length === 0) this.resetInput()
      // if nothing selected before, reset because of the newly unacceptable (ret=false||length=0) selection
      // otherwise leave the previous selection intact?!!!
      return false
    }
    if (ret instanceof Array || (this._hasFileList && ret instanceof window.FileList)) tmpFileList = ret

    ret = true

    if (this.settings.beforeChange) ret = this.settings.beforeChange.call(this.element, tmpFileList, dropped)
    if (ret === -1) {
      this.resetInput()
      return false
    }
    if (!ret || ret.length === 0) {
      if (this.fileList.length === 0) this.resetInput()
      return false
    }

    // inside beforeChange you can return a modified File Array as result
    if (ret instanceof Array || (this._hasFileList && ret instanceof window.FileList)) tmpFileList = ret

    return tmpFileList
  }

  /// ///////

  _checkFileList (files, dropped) {
    const allowExt = this._getExtRegex(this.settings.allowExt)

    const denyExt = this._getExtRegex(this.settings.denyExt)

    const allowMime = this._getMimeRegex(this.settings.allowMime)

    const denyMime = this._getMimeRegex(this.settings.denyMime)

    const maxSize = this.settings.maxSize || false

    if (!(allowExt || denyExt || allowMime || denyMime || maxSize)) return true// no checking required

    const safeFiles = []
    const errorList = {}
    // for (const file of files) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      // file is either a string(file name) or a File object
      const filename = !this._hasFile ? file : file.name
      if (allowExt && !allowExt.test(filename)) {
        // extension not matching whitelist, so drop it
        if (!('ext' in errorList)) errorList.ext = []
        errorList.ext.push(filename)

        continue
      } else if (denyExt && denyExt.test(filename)) {
        // extension is matching blacklist, so drop it
        if (!('ext' in errorList)) errorList.ext = []
        errorList.ext.push(filename)

        continue
      }

      let type
      if (!this._hasFile) {
        // in browsers that don't support FileReader API
        safeFiles.push(file)
        continue
      } else if ((type = file.type.trim()).length > 0) {
        // there is a mimetype for file so let's check against are rules
        if (allowMime && !allowMime.test(type)) {
          // mimeType is not matching whitelist, so drop it
          if (!('mime' in errorList)) errorList.mime = []
          errorList.mime.push(filename)
          continue
        } else if (denyMime && denyMime.test(type)) {
          // mimeType is matching blacklist, so drop it
          if (!('mime' in errorList)) errorList.mime = []
          errorList.mime.push(filename)
          continue
        }
      }

      if (maxSize && file.size > maxSize) {
        // file size is not acceptable
        if (!('size' in errorList)) errorList.size = []
        errorList.size.push(filename)
        continue
      }

      safeFiles.push(file)
    }

    if (safeFiles.length === files.length) return files// return original file list if all are valid

    /// //////
    const errorCount = { ext: 0, mime: 0, size: 0 }
    if ('ext' in errorList) errorCount.ext = errorList.ext.length
    if ('mime' in errorList) errorCount.mime = errorList.mime.length
    if ('size' in errorList) errorCount.size = errorList.size.length

    const event = EventHandler.trigger(this.element, Event.INVALID,
      {
        $_fileErrors: {
          fileCount: files.length,
          invalidCount: files.length - safeFiles.length,
          errorList: errorList,
          errorCount: errorCount,
          dropped: dropped
        }
      }
    )
    if (event.defaultPrevented) return -1// it will reset input
    /// ///////

    return safeFiles// return safeFiles
  }

  _setAcceptAttr (ext = '', mime = '') {
    if (ext) {
      if (Array.isArray(ext)) ext = ext.join(',.')
      else ext = ext.replace(/\|/g, ',.')
      ext = '.' + ext
    }

    if (mime) {
      if (Array.isArray(mime)) mime = mime.join(',')
      // replace `/\w+` with `/*` ... for example, `image/\w+` becomes `image/*`
      else mime = mime.replace(/\|/g, ',').replace(/\/\\w+/g, '/*')
    }

    let accept = (ext || '') + (ext && mime ? ',' : '') + (mime || '')
    accept = accept.replace(/\s/g, '')
    if (accept) this.element.setAttribute('accept', accept)
  }

  _getExtRegex (ext) {
    if (!ext) return null
    if (Array.isArray(ext)) ext = ext.join('|')
    if (ext.length === 0) return null
    return new RegExp('\\.(?:' + ext + ')$', 'i')
  }

  _getMimeRegex (mime) {
    if (!mime) return null
    if (Array.isArray(mime)) mime = mime.join('|')
    if (mime.length === 0) return null
    // replace `/*` with `/\w+` ... for example, `image/*` becomes `image/\w+`
    return new RegExp('^(?:' + mime.replace(/\/\*/g, '/\\w+').replace(/\//g, '\\/') + ')$', 'i')
  }

  // Static methods
  static getInstance (element, config = null) {
    if (!element) throw new Error('element for Fileinput is null')

    const name = `__${NAME}__`
    if (typeof element[name] !== 'undefined') return element[name]

    element[name] = new FileInput(element, config)
    return element[name]
  }

  static _jQueryInterface (config, value) {
    let retval
    const reteach = this.each(function () {
      if (!Util.matches(this, 'input[type=file]')) return

      const $this = window.jQuery(this)
      let data = $this.data(DATA_KEY)
      const _config = {
        ...Default,
        ...$this.data(),
        ...typeof config === 'object' && config ? config : {}
      }

      if (!data) {
        data = FileInput.getInstance(this, _config)
        $this.data(DATA_KEY, data)
      }

      if (typeof config === 'string') {
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`)
        }
        retval = data[config](value)
      }
    })

    return (typeof retval !== 'undefined') ? retval : reteach
  }
}

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
*/

if (typeof jQuery !== 'undefined') {
  const $ = window.jQuery
  const JQUERY_NO_CONFLICT = $.fn[NAME]
  $.fn[NAME] = FileInput._jQueryInterface
  $.fn[NAME].Constructor = FileInput
  $.fn[NAME].noConflict = () => {
    $.fn[NAME] = JQUERY_NO_CONFLICT
    return FileInput._jQueryInterface
  }
}

export default FileInput
