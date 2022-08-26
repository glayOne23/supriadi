/**
 * --------------------------------------------------------------------------
 * Ace (v4.0.0): wysiwyg.js
   Wrapper for Bootstrap wyswiwyg plugin
*/

import $ from 'jquery'
import bootstrap from 'bootstrap'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'aceWysiwyg'
const VERSION = '4.0.0'
const DATA_KEY = 'ace.wysiwyg'

const DefaultType = {
  wysiwyg: 'object',
  colors: 'array',
  // speech: 'boolean',
  toolbar: 'array',
  toolbarPlacement: '(function|null)',
  toolbarStyle: '(string|number)'
}

const Default = {
  wysiwyg: {},
  // speech: true,
  toolbarPlacement: null,
  toolbarStyle: '',

  colors: ['#000000', '#424242', '#636363', '#9c9c94', '#cec6ce', '#efefef', '#f7f7f7', '#ffffff',
    '#ff0000', '#ff9c00', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#9c00ff', '#ff00ff',
    '#f7c6ce', '#ffe7ce', '#ffefc6', '#d6efd6', '#cedee7', '#cee7f7', '#d6d6e7', '#e7d6de',
    '#e79c9c', '#ffc69c', '#ffe79c', '#b5d6a5', '#a5c6ce', '#9cc6ef', '#b5a5d6', '#d6a5bd',
    '#e76363', '#f7ad6b', '#ffd663', '#94bd7b', '#73a5ad', '#6badde', '#8c7bc6', '#c67ba5',
    '#ce0000', '#e79439', '#efc631', '#6ba54a', '#4a7b8c', '#3984c6', '#634aa5', '#a54a7b',
    '#9c0000', '#b56308', '#bd9400', '#397b21', '#104a5a', '#085294', '#311873', '#731842',
    '#630000', '#7b3900', '#846300', '#295218', '#083139', '#003163', '#21104a', '#4a1031'],

  toolbar: ['font', null, 'fontSize', null, 'bold', 'italic', 'strikethrough', 'underline', null, 'insertunorderedlist', 'insertorderedlist',
    'outdent', 'indent', null, 'justifyleft', 'justifycenter', 'justifyright', 'justifyfull', null, 'createLink', 'unlink', null,
    'insertImage', null, 'foreColor', null, 'undo', 'redo', null, 'viewSource']
}

class Wysiwyg {
  constructor (element, config) {
    this._element	= element
    this._config = this._getConfig(config)

    this.initEditor()
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

  initEditor () {
    const toolbarHtml = this._createToolbarHtml()
    let toolbar
    // if we have a function to decide where to put the toolbar, then call that
    if (this._config.toolbarPlacement) toolbar = this._config.toolbarPlacement.call(this._element, toolbarHtml)
    else toolbar = $(this._element).before(toolbarHtml).prev()// otherwise put it just before our DIV

    if (this._config.toolbarStyle) toolbar.addClass('bsw-toolbar-style-' + this._config.toolbarStyle)

    // enable tooltips
    if ($.fn.tooltip) toolbar.find('a[title]').tooltip({ animation: false, container: 'body' })

    toolbar.find('.dropdown-menu input[type=text]').on('click', function () { return false })
      .on('change', function () { $(this).closest('.dropdown-menu').siblings('.dropdown-toggle').dropdown('toggle') })
      .on('keydown', function (e) {
        if (e.which === 27) {
          this.value = ''
          // $(this).change()
        } else if (e.which === 13) {
          e.preventDefault()
          e.stopPropagation()
          // $(this).change()
        }
      })

    toolbar.find('input[type=file]').prev().on('click', function (e) {
      // $(this).next().click()
    })

    const self = $(this._element)
    // view source
    let viewSource = false
    toolbar.find('a[data-toggle=source]').on('click', function (e) {
      e.preventDefault()

      if (!viewSource) {
        $('<textarea />')
          .css({ width: self.outerWidth(), height: self.outerHeight() })
          .val(self.html())
          .insertAfter(self)
        self.addClass('d-none')

        $(this).addClass('active')
      } else {
        const textarea = self.next()
        self.html(textarea.val()).removeClass('d-none')
        textarea.remove()

        $(this).removeClass('active')
      }

      viewSource = !viewSource
    })

    // initiate wysiwyg plugin
    const $options = $.extend({}, { activeToolbarClass: 'active', toolbarSelector: toolbar }, this._config.wysiwyg || {})
    $(this._element).wysiwyg($options)

    this._handleImages()
  }

  _createToolbarHtml () {
    const _buttonDefaults =	{
      font: {
        values: ['Arial', 'Courier', 'Comic Sans MS', 'Helvetica', 'Open Sans', 'Tahoma', 'Verdana'],
        icon: 'fa fa-font text-secondary',
        title: 'Font'
      },
      fontSize: {
        values: { 5: 'Huge', 3: 'Normal', 1: 'Small' },
        icon: 'fa fa-text-height text-secondary',
        title: 'Font Size'
      },
      bold: {
        icon: 'fa fa-bold text-secondary',
        title: 'Bold (Ctrl/Cmd+B)'
      },
      italic: {
        icon: 'fa fa-italic text-secondary',
        title: 'Italic (Ctrl/Cmd+I)'
      },
      strikethrough: {
        icon: 'fa fa-strikethrough text-secondary',
        title: 'Strikethrough'
      },
      underline: {
        icon: 'fa fa-underline text-secondary',
        title: 'Underline'
      },
      insertunorderedlist: {
        icon: 'fa fa-list-ul text-secondary',
        title: 'Bullet list'
      },
      insertorderedlist: {
        icon: 'fa fa-list-ol text-secondary',
        title: 'Number list'
      },
      outdent: {
        icon: 'fa fa-outdent text-secondary',
        title: 'Reduce indent (Shift+Tab)'
      },
      indent: {
        icon: 'fa fa-indent text-secondary',
        title: 'Indent (Tab)'
      },
      justifyleft: {
        icon: 'fa fa-align-left text-secondary',
        title: 'Align Left (Ctrl/Cmd+L)'
      },
      justifycenter: {
        icon: 'fa fa-align-center text-secondary',
        title: 'Center (Ctrl/Cmd+E)'
      },
      justifyright: {
        icon: 'fa fa-align-right text-secondary',
        title: 'Align Right (Ctrl/Cmd+R)'
      },
      justifyfull: {
        icon: 'fa fa-align-justify text-secondary',
        title: 'Justify (Ctrl/Cmd+J)'
      },
      createLink: {
        icon: 'fa fa-link text-secondary',
        title: 'Hyperlink',
        button_text: 'Add',
        placeholder: 'URL',
        button_class: 'btn-light-primary'
      },
      unlink: {
        icon: 'fa fa-unlink text-secondary',
        title: 'Remove Hyperlink'
      },
      insertImage: {
        icon: 'fa fa-image text-secondary',
        title: 'Insert picture',
        button_text: '<i class="far fa-file mr-1"></i> Choose an Image &hellip;',
        placeholder: 'Remote Image URL',
        button_insert: 'Insert',
        button_class: 'btn-light-success',
        button_insert_class: 'btn-light-primary',
        choose_file: true // show the choose file button?
      },
      foreColor: {
        icon: 'fas fa-eye-dropper text-pink-m1',
        values: this._config.colors,
        title: 'Foreground Color'
      },
      backColor: {
        icon: 'fas fa-fill-drip text-secondary',
        values: this._config.colors,
        title: 'Background Color'
      },
      removeFormat: {
        icon: 'fa fa-eraser text-secondary',
        title: 'Remove Format'
      },
      undo: {
        icon: 'fa fa-undo text-secondary',
        title: 'Undo (Ctrl/Cmd+Z)'
      },
      redo: {
        icon: 'fa fa-redo text-secondary',
        title: 'Redo (Ctrl/Cmd+Y)'
      },
      viewSource: {
        icon: 'fa fa-code text-secondary',
        title: 'View Source'
      }
    }

    const toolbarButtons = this._config.toolbar
    let toolbarHtml = ' <div class="bootstrap-wysiwyg-toolbar btn-toolbar text-center"> <div class="btn-group mb-2px"> '

    for (const tb in toolbarButtons) {
      if (Object.prototype.hasOwnProperty.call(toolbarButtons, tb)) {
        let button = toolbarButtons[tb]
        if (button === null) {
          toolbarHtml += ' </div> <div class="btn-group mb-2px"> '
          continue
        }

        if (typeof button === 'string' && button in _buttonDefaults) {
          button = _buttonDefaults[button]
          button.name = toolbarButtons[tb]
        } else if (typeof button === 'object' && button.name in _buttonDefaults) {
          button = $.extend(_buttonDefaults[button.name], button)
        } else continue

        const className = 'className' in button ? button.className : 'btn-sm btn-outline-secondary btn-h-light-dark btn-a-light-dark'
        switch (button.name) {
          case 'font':
            toolbarHtml += ` <a class="btn btn-sm ${className} dropdown-toggle" data-toggle="dropdown" title="${button.title}"><i class="${button.icon}">${button.iconText || ''}</i><i class="fa fa-angle-down ml-1 text-secondary-m2"></i></a> `
            toolbarHtml += ' <div class="dropdown-menu radius-1 brc-secondary-m4">'
            for (const font in button.values) {
              if (Object.prototype.hasOwnProperty.call(button.values, font)) {
                toolbarHtml += ` <div class="dropdown-item"><a data-edit="fontName ${button.values[font]}" style="font-family:'${button.values[font]}'">${button.values[font]}</a></div> `
              }
            }
            toolbarHtml += ' </div>'
            break

          case 'fontSize':
            toolbarHtml += ` <a class="btn btn-sm ${className} dropdown-toggle" data-toggle="dropdown" title="${button.title}"><i class="${button.icon}">${button.iconText || ''}</i>&nbsp;<i class="fa fa-angle-down ml-1 text-secondary-m2"></i></a> `
            toolbarHtml += ' <div class="dropdown-menu radius-1 brc-secondary-m4"> '
            for (const size in button.values) {
              if (Object.prototype.hasOwnProperty.call(button.values, size)) {
                toolbarHtml += ` <div class="dropdown-item"><a data-edit="fontSize ${size}"><font size="${size}">${button.values[size]}</font></a></div> `
              }
            }
            toolbarHtml += ' </div> '
            break

          case 'createLink':
            toolbarHtml += ` <div class="btn-group"> <a class="btn btn-sm ${className} dropdown-toggle" data-toggle="dropdown" title="${button.title}"><i class="${button.icon}">${button.iconText || ''}</i></a> `
            toolbarHtml += ` <div class="dropdown-menu py-1 px-3 brc-default-m3 border-2 radius-1 shadow-sm" style="min-width: 300px;">
						 <div class="input-group my-3">
							<input class="form-control" placeholder="${button.placeholder}" type="text" data-edit="${button.name}" />
							<div class="input-group-append">
								<button class="btn btn-sm ${button.button_class}" type="button">${button.button_text}</button>
							</div>
						 </div>
					</div> </div>`
            break

          case 'insertImage':
            toolbarHtml += ` <div class="btn-group"> <a class="btn btn-sm ${className} dropdown-toggle" data-toggle="dropdown" title="${button.title}"><i class="${button.icon}">${button.iconText || ''}</i></a> `
            toolbarHtml += ' <div class="dropdown-menu p-3 brc-default-m3 border-2 radius-1 shadow-sm" style="min-width: 300px;">'
            if (button.choose_file && 'FileReader' in window) {
              toolbarHtml +=
              `<div class="text-secondary-d1">Drag &amp; drop images into editor or</div>
						   <label class="text-center d-block mt-3 mb-0">
							<button class="btn btn-sm ${button.button_class} wysiwyg-choose-file" type="button">${button.button_text}</button>
							<input type="file" class="file-input-invisible" data-edit="${button.name}" />
						   </label><hr /> `
            }

            toolbarHtml += `<div class="input-group my-3">
							<input class="form-control" placeholder="${button.placeholder}" type="text" data-edit="${button.name}" />
							<div class="input-group-append">
								<button class="btn btn-sm ${button.button_insert_class}" type="button">${button.button_insert}</button>
							</div>
						 </div>`
            toolbarHtml += ' </div> </div>'

            break

          case 'foreColor':
          case 'backColor':
            toolbarHtml += `<div class="mr-1px"><a class="btn btn-sm ${className} dropdown-toggle" data-toggle="dropdown" title="${button.title}"><i class="${button.icon}">${button.iconText || ''}</i></a> `
            toolbarHtml += ' <div class="dropdown-menu p-1 brc-secondary-m4 border-1 radius-1" style="min-width:auto;width:10.66rem;"><div class="d-flex flex-wrap">'
            for (const color in button.values) {
              if (Object.prototype.hasOwnProperty.call(button.values, color)) {
                toolbarHtml += ` <div class="dropdown-item m-0 p-0 d-inline-block w-auto"><a class="p-0 dh-zoom-3" role="button" data-edit="${button.name} ${button.values[color]}" style="width:1.25rem;height:1.25rem;background-color:${button.values[color]};"></a></div> `
              }
            }
            toolbarHtml += ' </div></div></div>'
            break

          case 'viewSource':
            toolbarHtml += ` <a class="btn btn-sm ${className}" data-toggle="source" title="${button.title}"><i class="${button.icon}">${button.iconText || ''}</i></a> `
            break
          default:
            toolbarHtml += ` <a class="btn btn-sm ${className}" data-edit="${button.name}" title="${button.title}"><i class="${button.icon}">${button.iconText || ''}</i></a> `
            break
        }
      }
    }
    toolbarHtml += ' </div> '// for .btn-group

    // var speech_input;
    // if (this._config.speech && 'onwebkitspeechchange' in (speech_input = document.createElement('input'))) {
    // toolbarHtml += ' <input class="wysiwyg-speech-input" type="text" data-edit="inserttext" x-webkit-speech />';
    // }
    // speech_input = null;
    /// /////////
    toolbarHtml += ' </div> '// for .btn-toolbar

    return toolbarHtml
  }

  _handleImages () {
    // option for resizing an image
    let currentImg = null
    $(this._element).on('click', 'img', function (ev) {
      if (currentImg) $(currentImg).popover('dispose')

      currentImg = this
      if (!$(currentImg).data('original-width')) $(currentImg).data('original-width', currentImg.width)

      $(currentImg).popover({
        container: 'body',
        html: true,
        placement: function (popover) {
          const offset = currentImg.getBoundingClientRect()
          const scrollTop = document.scrollTop || document.documentElement.scrollTop || document.body.scrollTop
          $(popover).addClass('popover-wysiwyg-image shadow brc-secondary-m4').css({ 'margin-left': (offset.left + 4) + 'px', 'margin-top': (offset.top + scrollTop + 4) + 'px' })

          return 'auto'
        },
        title: 'Image Size & Position',
        trigger: 'manual',
        content: function () {
          return $(`<div class='btn-group'>
								<button type='button' class='btn btn-xs btn-outline-default' data-action='resize' data-value='0.25'>25%</button>
								<button type='button' class='btn btn-xs btn-outline-default' data-action='resize' data-value='0.50'>50%</button>
								<button type='button' class='btn btn-xs btn-outline-default' data-action='resize' data-value='1'>100%</button>
							  </div>
							  <input type='number' class='form-control d-inline-block form-control-sm' data-action='resize' style='max-width: 96px;' placeholder='specify width' value='${currentImg.width}' />
							  <hr class='my-2' />
							  <div class='btn-group'>
								<button type='button' class='btn btn-xs btn-outline-secondary' data-action='align' data-value='left'>left</button>
								<button type='button' class='btn btn-xs btn-outline-secondary' data-action='align' data-value='right'>right</button>
								<button type='button' class='btn btn-xs btn-outline-secondary' data-action='align' data-value='none'>none</button>
							 </div>
							 <div class='btn-group float-right'>
								<button type='button' tooltip='Remove image' class='btn btn-sm btn-danger border-2 radius-round' data-action='remove'><i class='fa fa-trash-alt text-red'></i></button>
							 </div>`)
        }
      }).popover('show')

      $(document).on('click.popover-wysiwyg-image', function (ev) {
        if (ev.target === currentImg) return

        if ($(ev.target).closest('.popover-wysiwyg-image').length > 0) {
          return
        }

        if (currentImg) $(currentImg).popover('hide')

        currentImg = null
        $(document).off('click.popover-wysiwyg-image')
      })
    })

    $(document).on('click', '.popover-wysiwyg-image button.btn', function () {
      if (!currentImg) return
      const action = $(this).data('action')
      const value = $(this).data('value')

      if (action === 'resize') {
        const width = parseInt($(currentImg).data('original-width') * value)
        $(currentImg).css({ width: width })
        $('.popover-wysiwyg-image input[type=number]').val(width)
      }
      if (action === 'align') $(currentImg).attr('class', 'float-' + value)
      else if (action === 'remove') {
        $(currentImg).popover('dispose').remove()// fadeOut(200, function() { $(this).remove() });
        currentImg = null
      }
    })

    $(document).on('change', '.popover-wysiwyg-image input[type=number]', function () {
      if (currentImg) $(currentImg).css({ width: $(this).val() + 'px' })
    })
    /// //////////////
  }

  _getConfig (config) {
    config = {
      ...Default,
      ...typeof config === 'object' && config ? config : {}
    }

    if (typeof bootstrap !== 'undefined') {
      bootstrap.Util.typeCheckConfig(
        NAME,
        config,
        this.constructor.DefaultType
      )
    }

    return config
  }

  // Static methods
  static getInstance (element, config = null) {
    if (!element) throw new Error('element for Wysiwyg is null')

    const name = `__${NAME}__`
    if (typeof element[name] !== 'undefined') return element[name]

    element[name] = new Wysiwyg(element, config)
    return element[name]
  }

  static _jQueryInterface (config) {
    return this.each(function () {
      const $this = $(this)
      let data = $this.data(DATA_KEY)
      const _config = {
        ...Default,
        ...$this.data(),
        ...typeof config === 'object' && config ? config : {}
      }

      if (!data) {
        data = Wysiwyg.getInstance(this, _config)
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

if (typeof $ !== 'undefined') {
  const JQUERY_NO_CONFLICT = $.fn[NAME]
  $.fn[NAME] = Wysiwyg._jQueryInterface
  $.fn[NAME].Constructor = Wysiwyg
  $.fn[NAME].noConflict = () => {
    $.fn[NAME] = JQUERY_NO_CONFLICT
    return Wysiwyg._jQueryInterface
  }
}

export default Wysiwyg
