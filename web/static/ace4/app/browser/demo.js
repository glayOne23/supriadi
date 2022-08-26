/**
 * This file is ONLY provided for the demo of Ace Admin Template.
 * You **should NOT** include it in your app.
 * For more information regarding how to apply various settings in your app, please refer to the documentation.
 */

// First we check if jQuery and other libraries are installed
if (location.protocol == 'file:' && (!window.jQuery || !window.bootstrap)) {
	alert("jQuery, Bootstrap and other libraries are not available!\n\nPlease run `npm install` to install them first.")
}

window.currentLayout = 1;
(function($ , undefined) {

	$(document).on('click', 'a[href="#"]', function(e) {
		// because in demo we have a `BASE` tag and clicking `a[href="#"]` elements will redirect us to homepage, which is not what we want
		e.preventDefault()
	})

    ///////// sidebar tooltip
    $('.sidebar .badge[title]').tooltip({
        template: '<div class="tooltip" role="tooltip"><div class="arrow brc-primary-d2"></div><div class="bgc-primary-d2 tooltip-inner font-bolder p-2"></div></div>',
        placement: 'right',
        boundary: 'viewport'
	})

	$('.sidebar:not(.sidebar-h) .btn[title]').tooltip({
        template: '<div class="tooltip" role="tooltip"><div class="arrow brc-default-d2"></div><div class="bgc-default-d2 tooltip-inner text-110 font-bolder p-2"></div></div>',
        placement: 'top',
        boundary: 'viewport'
	})

	$('.sidebar.sidebar-h .btn[title]').tooltip({
        template: '<div class="tooltip" role="tooltip"><div class="arrow brc-dark"></div><div class="bgc-dark tooltip-inner text-110 font-bolder p-2"></div></div>',
        placement: 'bottom',
        boundary: 'viewport'
	})

    ////////handle widgets reload button for demo
	AceApp.EventHandler.on(document, 'reload.ace.card', '.card', function (ev) {
		var card = ev.delegateTarget
        setTimeout(function() {
           $(card).aceCard('stopLoading')
        }, 500 + parseInt(Math.random() * 500) )
	})



	////////enable/disable sidebar submenu pull when it is in 'popup/hoverable' mode
    $(document)
    .on('expanded.ace.sidebar', '.sidebar.hoverable', function(ev) {
        $(this).aceSidebar('disableSubmenuPullup')
	})
	.on('collapsed.ace.sidebar', '.sidebar.hoverable', function(ev) {
        $(this).aceSidebar('enableSubmenuPullup')
    })


	////////////////////
	// Handling settings box and theme changes

	var lastLightTheme = 'white';
	var lastDarkTheme = 'dark';

	var lastNavbarDarkTheme = 'blue';
	var lastNavbarLightTheme = 'white';

	var currentBoxedLayout = 'only-content';
	var currentBodyTheme = 'auto';

	//zoom in/out by increasing/decreasing html font-size
	$('input[name=zoom-level]').on('change', function() {
		HtmlZoom(this.value);
	});


	//select sidebar theme
	$('input[name=sidebar-theme]').on('change', function() {
		SidebarTheme(this.value);
	});
	$('input[name=sidebar-dark]').on('change', function() {
		lastDarkTheme = this.value;//save it so that when we choose "dark", last used dark theme gets selected
		applySidebarTheme(this.value);
	});
	$('input[name=sidebar-light]').on('change', function() {
		lastLightTheme = this.value;//save it so that when we choose "light", last used light theme gets selected
		applySidebarTheme(this.value);
	});
	$('#id-dropdown-select-light-theme').on('click', function() {
	   $(this).button('toggle');
	});

	//change sidebar collapsed style
	$('input[name=sidebar-collapsed]').on('change', function() {
		var sidebar = $('.sidebar');
		sidebar.removeClass('expandable hoverable hideable').addClass(this.value);
		if( this.value == 'hoverable' && sidebar.is('.sidebar-fixed.collapsed') ) {
			sidebar.aceSidebar('enableSubmenuPullup');
		}
		else {
			sidebar.aceSidebar('disableSubmenuPullup');
		}
	});


	//select navbar theme
	$('input[name=navbar-theme]').on('change', function() {
		NavbarTheme(this.value);
	});
	$('input[name=navbar-dark]').on('change', function() {
		lastNavbarDarkTheme = this.value;//save it so that when we choose "dark", last used dark theme gets selected
		applyNavbarTheme(this.value);
	});
	$('input[name=navbar-light]').on('change', function() {
		lastNavbarLightTheme = this.value;//save it so that when we choose "light", last used light theme gets selected
		applyNavbarTheme(this.value);
	});

	//select body theme
	$('input[name=body-theme]').on('change', function() {
		BodyTheme(this.value);
	});


	//fixed navbar
	$('#id-navbar-fixed').on('change', function() {
		document.querySelector('.navbar').classList.toggle('navbar-fixed', this.checked);
	});
	//fixed sidebar
	$('#id-sidebar-fixed').on('change', function() {
		document.querySelector('.sidebar').classList.toggle('sidebar-fixed', this.checked);
	});
	//fixed footer
	$('#id-footer-fixed').on('change', function() {
		var checked = this.checked;
		$('.footer').each(function() {
			this.classList.toggle('footer-fixed', checked);
		});
	});
	//sidebar push content
	$('#id-push-content').on('change', function() {
		document.querySelector('.sidebar').classList.toggle('sidebar-push', this.checked);
	});

	//display submenu on hover
	$('#id-sidebar-hover').on('change', function() {
		var sidebar = document.querySelector('#sidebar');
		sidebar.classList.toggle('sidebar-hover', this.checked);

		if(this.checked) {
			$(sidebar)
			.aceSidebar('enableSubmenuPullup')
			.find('.nav-item.open').removeClass('open')
   			.find('.submenu.show').removeClass('show')
		}
		else {
			$(sidebar).aceSidebar('disableSubmenuPullup');
		}
	});


	//boxed layout
	$('input[name=boxed-layout]').on('change', function() {
		BoxedLayout(this.value);
	});


	//RTL
	$('#id-rtl').on('change', function() {
		RTLLayout(this.checked);
	});

	//Change Fonts
	$('#id-change-font').on('change', function() {
		ChangeFont(this.value);
	});


	//an animation for settings button icon when hovered
	var styleEl = document.createElement('style');
	styleEl.innerHTML = ".flex-equal-sm > * {flex: 0 1 1% !important;}\
						 @media print {#id-ace-settings-modal {display: none !important;}}\
						 @media (hover: hover) { #id-ace-settings-modal:not(.show) .aside-header > .btn:hover > .fa { animation: 0.6s fa-spin ease-in-out; }}\
						 @media screen and (prefers-reduced-motion: reduce) { #id-ace-settings-modal:not(.show) .aside-header > .btn:hover > .fa { animation: none; } }";
	document.head.appendChild(styleEl);

	




	var HtmlZoom = function(zoom) {
		var zoom = zoom || 'none';
		if( zoom == 'none' ) $('html').css('font-size', '');
		else {
			var sizes = {'90': '0.925rem', '110': '1.0625rem', '120': '1.125rem'};
			$('html').css('font-size', sizes[zoom]);
		}
	}


	function SidebarTheme(theme) {
		loadThemesFile();

		var theme = theme || 'light';
		$('#id-sidebar-themes-light , #id-sidebar-themes-dark').addClass('d-none');
	 
		switch(theme) {
			case 'light':
				$('#id-sidebar-themes-light').removeClass('d-none');
			break;

			case 'dark':
				$('#id-sidebar-themes-dark').removeClass('d-none');
			break;
		}

		applySidebarTheme(theme);
	}

	function applySidebarTheme(theme) {
		var $sidebar = $('.sidebar');
		
		resetSidebarColors($sidebar);


		switch(theme) {
			case 'light':
				applySidebarMatchingChanges($sidebar, lastLightTheme);
			break;
			case 'dark':
				applySidebarMatchingChanges($sidebar, lastDarkTheme);
			break;

			default:
				applySidebarMatchingChanges($sidebar, theme);
			break;
		}//switch
		
	}


	function resetSidebarColors($sidebar) {
		$sidebar.removeClass(function(index, className) {
			var  matchedClasses = className.match(/(^|\s)sidebar-\S+/g);
			if(matchedClasses) matchedClasses = matchedClasses.filter(function(str) {
				return !(/sidebar-fixed|sidebar-visible|sidebar-backdrop|sidebar-top|sidebar-h|sidebar-push/.test(str));
			});
			return (matchedClasses || []).join('')
		}).find('.sidebar-inner').attr('class', 'sidebar-inner');
		$sidebar.find('.nav').removeClass('has-active-border active-on-top active-on-right has-active-arrow');

		if(currentBodyTheme == 'auto') $('body').removeClass(function(index, className) {
			var  matchedClasses = className.match(/(^|\s)body-\S+/g);
			return (matchedClasses || []).join('')
		});


		$sidebar.find('.sidebar-shortcuts-mini').parent().find('.btn').removeClass(function(index, className) {
			var  matchedClasses = className.match(/(^|\s)(btn-|radius-|border-|brc-|text-|opacity-)\S+/g);
			if(matchedClasses) matchedClasses = matchedClasses.filter(function(str) {
				return !(/btn-sm|btn-smd/.test(str));
			});
			return (matchedClasses || []).join('')
		});


		$sidebar.find('.fa-exclamation-triangle, .fa.fa-search , .fa.fa-microphone').removeClass(function(index, className) {
			var  matchedClasses = className.match(/(^|\s)(text-(\D)|opacity-)\S+/g);
			return (matchedClasses || []).join('')
		}).end().find('.badge').removeClass(function(index, className) {
			var  matchedClasses = className.match(/(^|\s)(border-|badge-|bgc-|text-(\D))\S+/g);
			return (matchedClasses || []).join('')
		});

		
		$('#sidebar-footer-bg').removeClass(function(index, className) {
			var  matchedClasses = className.match(/(^|\s)(bgc-|brc-)\S+/g);
			return (matchedClasses || []).join('')
		});

		$('#sidebar-footer .btn').removeClass(function(index, className) {
			var  matchedClasses = className.match(/(^|\s)(btn-)\S+/g);
			return (matchedClasses || []).join('')
		});


		if( window.currentLayout == 2) {
			$sidebar.find('.navbar-brand, .navbar-brand span:last, .fa-leaf, img, #id-user-info a, #id-user-info div').removeClass(function(index, className) {
				var  matchedClasses = className.match(/(^|\s)(bgc-|brc-|text-|opacity-)\S+/g);
				return (matchedClasses || []).join('')
			});

			$sidebar.find('#id-user-menu a, #id-user-menu a i').removeClass(function(index, className) {
				var  matchedClasses = className.match(/(^|\s)(btn-|bgc-|brc-|text-|opacity-|shadow-|border-|radius-)\S+/g);
				return (matchedClasses || []).join('')
			});
		}
	}


	var sidebarMatchings = {};
	sidebarMatchings.light = {
		'sidebar': 'sidebar-light',
		'nav': ' has-active-border active-on-right',
		'navbar': 'blue',

		'exclamation': 'text-danger-m3',
		'badge': 'badge-primary badge-sm py-1',

		'search-icon': 'text-info',
		'mic-icon': 'text-muted',

		'brand': 'text-140 text-dark-m3',
		'brand-icon': 'text-success-m1',

		'user-img': 'brc-primary-tp2',
		'user-info': 'text-blue-d2 bgc-h-secondary-l1',
		'user-desc': 'text-dark-m3 text-85',

		'footer': 'bgc-white brc-primary-m3',

		'layout2-sidebar-header': 'brc-secondary-l2',
		'layout2-sidebar-footer': 'sidebar-light brc-grey-l2',

		'content-white': true,
		'alert-2': 'This sidebar theme is more suitable for <a href="'+$('.sidebar .nav-link[href*="dashboard"]').attr('href')+'" class="btn btn-xs btn-outline-white px-1 border-0">Dashboard 1</a>',

		'user-menu': 'btn-light-blue btn-brc-white btn-h-blue btn-a-blue radius-round border-2 shadow-sm',
		'user-menu-icons': 'opacity-1'
	};

	sidebarMatchings.lightblue = jQuery.extend({}, sidebarMatchings.light,
		{
			'sidebar': 'sidebar-lightblue sidebar-spaced',
			'nav': '',
			'shortcuts': ['btn btn-outline-primary btn-bgc-white border-2 btn-text-success btn-h-success btn-a-success' , 'btn btn-outline-primary btn-bgc-white border-2 btn-text-info btn-h-info btn-a-info', 'btn btn-outline-primary btn-bgc-white border-2 btn-text-orange btn-h-orange btn-a-orange', 'btn btn-outline-primary btn-bgc-white border-2 btn-text-danger btn-h-danger btn-a-danger'],

			'layout2-sidebar-header': 'brc-default-l1',
			'layout2-sidebar-footer': 'sidebar-lightblue brc-secondary-l1'
		}
	);
	sidebarMatchings.lightblue2 = jQuery.extend({}, sidebarMatchings.light,
		{
			'sidebar': 'sidebar-lightblue2 sidebar-spaced',
			'nav': '',
			'shortcuts': ['btn btn-outline-primary btn-bgc-white border-2 btn-text-success btn-h-success btn-a-success' , 'btn btn-outline-primary btn-bgc-white border-2 btn-text-info btn-h-info btn-a-info', 'btn btn-outline-primary btn-bgc-white border-2 btn-text-orange btn-h-orange btn-a-orange', 'btn btn-outline-primary btn-bgc-white border-2 btn-text-danger btn-h-danger btn-a-danger'],
			
			'layout2-sidebar-header': 'brc-default-l1',
			'layout2-sidebar-footer': 'sidebar-lightblue2 brc-secondary-l1'
		}
	);
	sidebarMatchings.lightpurple = jQuery.extend({}, sidebarMatchings.light,
		{
			'navbar': 'purple',
			
			'sidebar': 'sidebar-lightpurple sidebar-spaced',
			'nav': '',
			'shortcuts': ['btn btn-outline-purple btn-bgc-white btn-h-success btn-a-success border-2 radius-2 btn-text-success' , 'btn btn-outline-purple btn-bgc-white btn-h-purple btn-a-purple border-2 radius-2 btn-text-purple', 'btn btn-outline-purple btn-bgc-white btn-h-info btn-a-info border-2 radius-2 btn-text-info', 'btn btn-outline-purple btn-bgc-white btn-h-orange btn-a-orange border-2 radius-2 btn-text-orange'],

			'brand': 'text-140 text-dark-tp3',
			'brand-icon': 'text-success',
		
			'user-img': 'brc-purple-tp2',
			'user-info': 'text-purple light-1 text-center',
			'user-desc': 'text-muted text-80',
			
			'layout2-sidebar-header': 'brc-purple-l2',
			'layout2-sidebar-footer': 'sidebar-lightpurple brc-purple-l2',

			'layout2-sidebar-footer-btn': 'btn-purple btn-bold'
		}
	);
	sidebarMatchings.white = jQuery.extend({}, sidebarMatchings.light,
		{
			'sidebar': 'sidebar-white',
			'sidebar-inner': 'shadow-sm',
			'navbar-inner': 'shadow-md',

			'layout2-sidebar-header': 'brc-secondary-l2',
			'layout2-sidebar-footer': 'brc-secondary-l2',
			'shortcuts': ['btn btn-outline-primary btn-bgc-white border-2 btn-text-success btn-h-success btn-a-success' , 'btn btn-outline-primary btn-bgc-white border-2 btn-text-info btn-h-info btn-a-info', 'btn btn-outline-primary btn-bgc-white border-2 btn-text-orange btn-h-orange btn-a-orange', 'btn btn-outline-primary btn-bgc-white border-2 btn-text-danger btn-h-danger btn-a-danger'],

			'content-white': false,
			'alert-2': false
		}
	);
	
	sidebarMatchings.white2 = jQuery.extend({}, sidebarMatchings.light,
		{
			'navbar': 'white',
			'sidebar': 'sidebar-white2',
			'nav': 'has-active-border active-on-right active-on-top',
			'shortcuts': ['btn btn-outline-primary btn-bgc-white border-2 btn-text-success btn-h-success btn-a-success' , 'btn btn-outline-primary btn-bgc-white border-2 btn-text-info btn-h-info btn-a-info', 'btn btn-outline-primary btn-bgc-white border-2 btn-text-orange btn-h-orange btn-a-orange', 'btn btn-outline-primary btn-bgc-white border-2 btn-text-danger btn-h-danger btn-a-danger'],

			'layout2-sidebar-header': 'brc-secondary-l2',
			'layout2-sidebar-footer': 'brc-secondary-l2',

			'content-white': false,
			'alert-2': false
		}
	);
	
	sidebarMatchings.white3 = jQuery.extend({}, sidebarMatchings.light,
		{
			'navbar': 'white',
			'sidebar': 'sidebar-white3',
			'nav': 'has-active-border active-on-top',

			'navbar-inner': 'shadow-md',

			'layout2-sidebar-header': 'brc-secondary-l2',
			'layout2-sidebar-footer': 'brc-secondary-l2',

			'content-white': false,
			'alert-2': false
		}
	);


	sidebarMatchings.white4 = jQuery.extend({}, sidebarMatchings.light,
		{
			'navbar': 'lightblue',
			'sidebar': 'sidebar-white4',
			'sidebar-inner': 'shadow-sm',
			'nav': 'has-active-border active-on-right',
			'shortcuts': ['btn btn-outline-success border-b-2 radius-round' , 'btn btn-outline-info border-b-2 radius-round', 'btn btn-outline-warning border-b-2 radius-round', 'btn btn-outline-danger border-b-2 radius-round'],

			'layout2-sidebar-header': 'brc-secondary-l2',
			'layout2-sidebar-footer': 'brc-secondary-l2',

			'navbar-inner': 'shadow-md',

			'content-white': false,
			'alert-2': false
		}
	);

	sidebarMatchings.dark = jQuery.extend({}, sidebarMatchings.light,
		{
			'body': 'body-darkblue3',
			'navbar': 'darkblue',
			'navbar-inner': 'shadow-md',

			'sidebar': 'sidebar-color sidebar-dark',
			'nav': ' has-active-border active-on-top',

			'shortcuts': ['btn btn-outline-success border-b-2 btn-text-white' , 'btn btn-outline-info border-b-2 btn-text-white', 'btn btn-outline-warning border-b-2 btn-text-white', 'btn btn-outline-danger border-b-2 btn-text-white'],


			'search-icon': 'text-info-l2',
			'mic-icon': 'text-brown-l3 opacity-1',

			'brand': 'text-white-tp1 text-140',
			'brand-icon': 'text-success-l3',

			'user-img': 'brc-primary-m2',
			'user-info': 'text-orange-l2 bgc-h-white-tp9',
			'user-desc': 'text-white text-85',

			'exclamation': 'text-yellow-m3',
			'badge': 'bgc-success-m1 text-dark-d2 badge-sm',

			'footer': 'bgc-white brc-transparent',

			'layout2-sidebar-header': 'brc-white-tp9',
			'layout2-sidebar-footer': 'brc-white-tp10',

			'content-white': false,
			'alert-2': false,

			'user-menu': ['bgc-black-tp8 btn-h-outline-blue', 'bgc-black-tp8 btn-h-outline-purple', 'bgc-black-tp8 btn-h-outline-orange'],
			'user-menu-icons': ['text-blue-m2', 'text-purple-m2', 'text-orange-m2']
		}
	);
	sidebarMatchings.dark2 = jQuery.extend({}, sidebarMatchings.dark,
		{
			'sidebar': 'sidebar-color sidebar-dark2',
			'nav': ' has-active-border active-on-top has-active-arrow',
		}
	);

	sidebarMatchings.steelblue = {
		'body': 'body-darkblue',
		'navbar': 'lightblue',

		'sidebar': 'sidebar-color sidebar-steelblue',
		'nav': ' has-active-border active-on-top has-active-arrow',

		'shortcuts': 'btn-outline-white border-2 radius-2',

		'exclamation': 'text-yellow-l1',
		'badge': 'bgc-primary text-white-tp1 badge-sm border-1 brc-white-tp2',

		'search-icon': 'text-orange-l2',
		'mic-icon': 'text-white-tp3',

		'brand': 'text-white-tp1 text-140',
		'brand-icon': 'text-success-l3',

		'user-img': 'brc-white-tp3',
		'user-info': 'text-white bgc-h-white-tp9',
		'user-desc': 'text-white-tp1 text-85',

		'user-menu': ['bgc-black-tp8 btn-h-light-blue', 'bgc-black-tp8 btn-h-light-purple', 'bgc-black-tp8 btn-h-light-orange'],
		'user-menu-icons': ['text-blue-l1', 'text-purple-l1', 'text-orange-l1'],

		'footer': 'bgc-white brc-transparent',

		'layout2-sidebar-header': 'brc-white-tp9',
		'layout2-sidebar-footer': 'brc-white-tp10',

		'layout2-sidebar-footer-btn': 'btn-outline-white btn-bold',


		'content-white': false,
		'alert-2': false
	};


	sidebarMatchings.green = jQuery.extend({}, sidebarMatchings.steelblue,
		{
			'body': 'body-darkgreen',
			'navbar': 'darkgreen',

			'sidebar': 'sidebar-color sidebar-green',
			'shortcuts': 'btn-outline-yellow border-2 btn-text-white radius-round',

			'badge': 'border-0 bgc-white text-dark-tp1',

			'search-icon': 'text-white-tp2',
		}
	);
	sidebarMatchings.blue = jQuery.extend({}, sidebarMatchings.steelblue,
		{
			'body': 'body-darkblue',
			'sidebar': 'sidebar-color sidebar-blue',
			'nav': ' has-active-border has-active-arrow active-on-top',

			'navbar': 'orange',

			'exclamation': 'text-orange-l2',
			'badge': 'border-1 badge-warning brc-white-tp3',
		}
	);

	/**
	sidebarMatchings.teal = jQuery.extend({}, sidebarMatchings.green,
		{
			'body': 'body-darkslategrey',
			'navbar': 'green',
			'sidebar': 'sidebar-color sidebar-teal',
		}
	);
	*/


	sidebarMatchings.plum = jQuery.extend({}, sidebarMatchings.steelblue,
		{
			'body': 'body-lightplum',
			'navbar': 'lightpurple',

			'sidebar': 'sidebar-color sidebar-plum',
			//'shortcuts': ['btn text-dark-tp3 btn-warning', 'btn text-dark-tp3 btn-primary', 'btn text-dark-tp3 btn-purple', 'btn text-dark-tp3 btn-success'],//'btn text-white light-3 opacity-1 btn-outline-white brc-yellow-tp3 btn-h-dark border-2 radius-round',

			'shortcuts': 'btn-outline-purple border-2 text-white radius-2',
			'badge': 'bgc-white text-dark-tp3 badge-sm',
			'exclamation': 'text-orange-l2',

			'search-icon': 'text-orange-l2 opacity-2',
		}
	);
	sidebarMatchings.purple = jQuery.extend({}, sidebarMatchings.plum,
		{
			'body': 'body-img1',
			'navbar': 'brown',

			'sidebar': 'sidebar-color sidebar-purple',
			'shortcuts': 'btn text-white btn-outline-success border-2 radius-round',

			'exclamation': 'text-yellow-m2',
			'badge': 'badge-success badge-sm border-1 brc-white-tp2',

			'search-icon': 'text-white-tp2',
			'mic-icon': 'text-white-tp3',
		}
	);



	sidebarMatchings.darkblue = jQuery.extend({}, sidebarMatchings.steelblue,
		{
			'body': 'body-lightblue',
			'navbar': 'skyblue',
			'sidebar': 'sidebar-color sidebar-darkblue',
			'nav': ' has-active-border active-on-right active-on-top',

			'exclamation': 'text-orange-l1',
		}
	);

	sidebarMatchings.darkslategrey = jQuery.extend({}, sidebarMatchings.steelblue,
		{
			'body': 'body-darkslategrey',
			'navbar': 'lightgrey',
			'sidebar': 'sidebar-color sidebar-darkslategrey',

			'shortcuts': 'btn-outline-warning btn-text-white border-2 radius-2',

			'exclamation': 'text-orange-l2',
		}
	);

	sidebarMatchings.darkslateblue = jQuery.extend({}, sidebarMatchings.steelblue,
		{
			'body': 'body-img1',
			'navbar': 'lightpurple',
			'sidebar': 'sidebar-color sidebar-darkslateblue',
			'nav': 'has-active-border active-on-right',

			'shortcuts': 'btn-purple btn-h-warning border-2 radius-2',

			'search-icon': 'text-white-tp3',

			'badge': 'bgc-yellow-d1 text-dark-tp2 badge-sm border-1 brc-white-tp2',

			'exclamation': 'text-yellow-l2',
		}
	);

	sidebarMatchings.cadetblue = jQuery.extend({}, sidebarMatchings.steelblue,
		{
			'body': 'body-darkslategrey',
			'navbar': 'lightgrey',

			'sidebar': 'sidebar-color sidebar-cadetblue',
			'shortcuts': 'btn-bgc-white btn-h-outline-success btn-text-success btn-h-text-white border-2 radius-2',

			'badge': 'bgc-yellow-d1 text-dark-tp2 badge-sm border-1 brc-white-tp2',
			'exclamation': 'text-yellow-l2'
		}
	);

	sidebarMatchings.darkcrimson = jQuery.extend({}, sidebarMatchings.plum,
		{
			'body': 'body-darkplum',
			'navbar': 'darkgreen',

			'sidebar': 'sidebar-color sidebar-darkcrimson',
			'nav': ' has-active-border has-active-arrow active-on-top',

			'shortcuts': 'btn text-dark-tp3 btn-warning',

		}
	);

	sidebarMatchings.gradient1 = jQuery.extend({}, sidebarMatchings.green,
		{
			'body': 'body-darkblue2',
			'navbar': 'lightgrey',
			

			'sidebar': 'sidebar-color sidebar-gradient1',

		}
	);
	sidebarMatchings.gradient2 = jQuery.extend({}, sidebarMatchings.green,
		{
			'body': '',
			'navbar': 'green',

			'sidebar': 'sidebar-color sidebar-gradient2',

			'shortcuts': 'btn-outline-purple border-2 btn-text-white radius-round',

		}
	);
	sidebarMatchings.gradient3 = jQuery.extend({}, sidebarMatchings.steelblue,
		{
			'body': 'body-lightblue3',
			'navbar': 'cadetblue',

			'sidebar': 'sidebar-color sidebar-gradient3',
			'shortcuts': 'btn-outline-green border-2 text-white radius-round',

			'badge': 'badge-danger badge-sm border-1 brc-white-tp2',
		
			'search-icon': 'text-success-l3',
			'mic-icon': 'text-white-tp2'

		}
	);
	sidebarMatchings.gradient4 = jQuery.extend({}, sidebarMatchings.steelblue,
		{
			'body': 'body-darkblue3',
			'navbar': 'skyblue',

			'sidebar': 'sidebar-color sidebar-gradient4',
		}
	);
	/**
	sidebarMatchings.gradient5 = jQuery.extend({}, sidebarMatchings.steelblue,
		{
			'body': 'body-img1',
			'navbar': 'burlywood',

			'sidebar': 'sidebar-color sidebar-gradient5',
			'shortcuts': 'btn-outline-warning border-2 btn-text-white radius-1',

			'exclamation': 'text-yellow-l3',
		}
	);
	*/




	//btn btn-outline-info border-0 btn-bgc-white radius-1

	var _allowAutoMatchSidebar = true;
	var _allowAutoMatchNavbar = true;

	function applySidebarMatchingChanges($sidebar, theme) {
		var changes = sidebarMatchings[theme];
		if (!changes) changes = sidebarMatchings['light'];

		if(currentBodyTheme == 'auto' && (currentBoxedLayout == 'all' || currentBoxedLayout == 'not-navbar')) $(document.body).addClass( changes['body'] );
		if( changes['navbar'] && _allowAutoMatchNavbar && $('#id-auto-match').prop('checked') ) {
			_allowAutoMatchSidebar = false;//don't automatically change sidebar
			applyNavbarTheme(changes['navbar']);
		}
		_allowAutoMatchNavbar = true;


		if( changes['sidebar'] ) $sidebar.addClass( changes['sidebar'] );
		if( changes['sidebar-inner'] ) $sidebar.find('.sidebar-inner').addClass( changes['sidebar-inner'] );
		if( changes['nav'] ) {
			$sidebar.find('.nav').addClass( changes['nav'] );
			if($sidebar.hasClass('sidebar-h')){
				$sidebar.find('.nav').addClass('active-on-top');
				if(theme != 'light')	{
					$('#id-full-height').prop('checked', true)
					$sidebar.find('.container').removeClass('align-items-xl-end');
					$sidebar.find('.nav').removeClass('nav-link-rounded');
				}				

				if(theme == 'light' || theme.indexOf('white') >= 0) {
					$sidebar.find('.sidebar-inner').addClass( 'border-b-1 brc-grey-l1' );
				}
			}
		}

		var shortcuts = changes['shortcuts'] || ['btn-success opacity-2' , 'btn-info opacity-2', 'btn-orange opacity-2', 'btn-danger opacity-2'];
		if( !Array.isArray(shortcuts) || shortcuts.length == 1 ) $sidebar.find('.sidebar-shortcuts-mini').parent().find('.btn').addClass( !Array.isArray(shortcuts) ? shortcuts : shortcuts[0] );
		else {
			var p =  $sidebar.find('.sidebar-shortcuts-mini').parent();
			for(var i = 0; i < 4; i++) {
				p.find('.btn:nth-child('+(i+1)+')').addClass( shortcuts.length > i ? shortcuts[i] : shortcuts[i - shortcuts.length] );
			}            
		}

		if( changes['exclamation'] ) $sidebar.find('.fa-exclamation-triangle').addClass( changes['exclamation'] );
		if( changes['badge'] )  $sidebar.find('.badge:last').addClass( changes['badge'] );
		if( changes['search-icon'] ) $sidebar.find('.fa.fa-search').addClass( changes['search-icon'] );
		if( changes['mic-icon'] ) $sidebar.find('.fa.fa-microphone').addClass( changes['mic-icon'] );

		//
		if( changes['footer'] && !window.isAceLayout4 ) {
			$('#sidebar-footer-bg').addClass( changes['footer'] );
		}

		//
		if( window.currentLayout == 2 ) {
			if( changes['brand'] ) $sidebar.find('.navbar-brand').addClass(changes['brand']);
			if( changes['brand-icon'] ) $sidebar.find('.fa-leaf').addClass(changes['brand-icon']);

			if( changes['user-img'] ) $sidebar.find('img').addClass(changes['user-img']);
			if( changes['user-info'] ) $('#id-user-info a').addClass(changes['user-info']);
			if( changes['user-desc'] ) $('#id-user-info div').addClass(changes['user-desc']);

			var usermenu = changes['user-menu'];
			var usermenu_icons = changes['user-menu-icons'];
			if( !Array.isArray(usermenu) || usermenu.length == 1 ) {
				$('#id-user-menu .btn')
				.addClass( !Array.isArray(usermenu) ? usermenu : usermenu[0] )
				.find('.fa').addClass( !Array.isArray(usermenu_icons) ? usermenu_icons : usermenu_icons[0] );
			}
			else {
				for(var i = 0; i < 3; i++) {
					$('#id-user-menu .btn:nth-child('+(i+1)+')')
					.addClass( usermenu.length > i ? usermenu[i] : usermenu[i - usermenu.length] )
					.find('.fa').addClass( usermenu_icons.length > i ? usermenu_icons[i] : usermenu_icons[i - usermenu_icons.length] )
				} 
			}

			
			var header = $('#sidebar-header-brand1, #sidebar-header-brand2');
			header.removeClass(function(index, className) {
				var  matchedClasses = className.match(/(^|\s)(sidebar-|bgc-|bg-|brc-)\S*/g);
				return (matchedClasses || []).join('')
			});

			var footer = $('#sidebar-footer');
			footer.removeClass(function(index, className) {
				var  matchedClasses = className.match(/(^|\s)(sidebar-|bgc-|bg-|brc-)\S*/g);
				return (matchedClasses || []).join('')
			});

			if (changes['layout2-sidebar-header']) {
				header.addClass( changes['layout2-sidebar-header'] );
			}

			if (changes['layout2-sidebar-footer']) {
				footer.addClass( changes['layout2-sidebar-footer'] );
				footer.find('.btn').addClass( changes['layout2-sidebar-footer-btn'] || 'btn-blue btn-bold');
			}
			
			if (changes['sidebar'].indexOf('sidebar-color') >= 0) {
				// footer.addClass( changes['sidebar'] );
				//if( changes['sidebar'].indexOf('sidebar-gradient') >= 0 ) {
					//footer.css('background-image', 'none');
				//}
			}

			///////////////

			$('.navbar-inner').addClass('shadow-md');
			if (theme == 'white3') {
				$('.navbar-inner').removeClass('shadow-md');
			}
			else if (theme == 'lightblue') {
				$('.sidebar-inner').addClass('border-r-1 brc-default-l1');
			}
			else if (theme == 'lightblue2') {
				$('.sidebar-inner').addClass('border-r-1 brc-primary-l2');
			}
			else if (theme == 'lightpurple') {
				$('.sidebar-inner').addClass('border-r-1 brc-purple-l2');
			}
		}
		
		$.aceToaster.removeAll(null, true)//true means instantly remove (don't fade)
		if (changes['alert-'+ window.currentLayout]) {
			window.hideAlert = window.hideAlert || function() {
				$.aceToaster.removeAll('tc')
				window.alertHidden = true;
			}

			if(!window.alertHidden) $.aceToaster.add({
				placement: 'tc',
				title: 'Note',
				body: 
					'<div class="position-tr w-100 h-100 bgc-black-tp8" style="z-index: -1;"></div> ' +
					changes['alert-'+ window.currentLayout] +
					'<label class="d-block mt-3 mb-0 bgc-white-tp9 bgc-h-black-tp9 p-1 radius-2px"><input onchange="window.hideAlert()" id="hide-alert-'+window.currentLayout+'" type="checkbox" class="text-dark brc-dark border-2" /> Don\'t show this again</label>' ,
	
				width: 480,
				closeClass: 'btn btn-xs btn-link no-underline bgc-h-black-tp8 text-white text-150 position-tr mr-n2',
				//delay: 8,
				sticky: true,

				icon: '<i class="fa fa-exclamation-triangle text-white fa-2x"></i>',
				imageClass: 'mt-2 mx-15',
	
				className: 'bgc-red-tp2 border-0 px-2 shadow',
				headerClass: 'bg-transparent border-0 text-white text-120 pt-3',
				bodyClass: 'text-white pt-0 pb-3 text-110'
			});
		}
	}


	////////////////////////////////////

	var navbarMatchings = {};
	navbarMatchings.blue = {
		'sidebar': 'light',
		'brand': 'text-white',

		'search-icon': 'text-white mr-0',
		'navbar-input': 'py-15',
		
		'nav-item-bell': 'nav-link pl-lg-3 pr-lg-4',
		'badge-bell': 'badge-sm bgc-warning-d2 text-white text-80 border-1 brc-white-tp5',

		'nav-item-flask': 'nav-link pl-lg-3 pr-lg-4',
		'badge-flask': 'badge-sm text-90 text-success-l5',

		'bell-icon': 'mr-2 text-110',
		'flask-icon': 'mr-1 text-110',

		'toggler': ['' , ''],

		'user-image': 'brc-white-tp1 border-2',
		'user-welcome': 'text-90',

		'button': 'btn-outline-default btn-h-white btn-a-white brc-white-tp3 btn-text-white',
	};
	navbarMatchings.darkblue = jQuery.extend({}, navbarMatchings.blue,
		{
			// 'boxed': 'all',
			'sidebar': 'dark',

			'badge-bell': 'badge-sm bgc-white text-orange-d2 text-80 border-0'
		}   
	);
	navbarMatchings.purple = jQuery.extend({}, navbarMatchings.blue,
		{
			'sidebar': 'lightpurple',
			'badge-bell': 'badge-sm btn-yellow text-80 border-1 brc-white',
			'badge-flask': 'badge-sm text-90 text-yellow-l4 mt-lg-n1 mr-lg-n1',
		}   
	);
	navbarMatchings.plum = jQuery.extend({}, navbarMatchings.blue,
		{
			'sidebar': 'lightpurple',

			'nav': 'nav-compact has-active-border',
			'badge-bell': 'badge-sm badge-warning mt-lg-n1 text-80 border-1 brc-white',

			'nav-item-flask': 'nav-link pl-lg-3 pr-lg-4',
			'badge-flask': 'badge-sm text-90 text-yellow-l4 mt-lg-n1 mr-lg-n1',

			'user-welcome': 'opacity-1',
			'user-name': 'mt-n1',
		}   
	);


	navbarMatchings.orange = jQuery.extend({}, navbarMatchings.blue,
		{
			'sidebar': 'cadetblue',

			'badge-bell': 'bgc-dark text-80 border-0',
			'badge-flask': 'badge-sm text-dark-tp3 text-95',
		}   
	);
	navbarMatchings.brown = jQuery.extend({}, navbarMatchings.blue,
		{
			'sidebar': 'gradient5',

			'nav': 'nav-compact has-active-border mr-1',
			'badge-bell': 'bgc-white text-dark-tp2 text-85 border-0 mt-lg-n1',
			'badge-flask': 'text-yellow-l4 text-95 text-600 mt-lg-n2 mr-lg-n1',
		}   
	);
	navbarMatchings.darkgreen = jQuery.extend({}, navbarMatchings.blue,
		{
			'sidebar': 'dark2',

			'nav': 'nav-compact has-active-border mr-1',
			'nav-item': 'mr-lg-1',

			'badge-bell': 'btn-yellow text-80 mt-lg-n1 mr-lg-n1 border-0',
			'nav-item-flask': 'nav-link pl-lg-3 pr-lg-3',
			
			'badge-flask': 'badge-sm text-white text-90 mt-lg-n2 mr-lg-n2',
			'bell-icon': 'text-white mr-lg-1 text-110'
		}   
	);
	navbarMatchings.skyblue = jQuery.extend({}, navbarMatchings.blue,
		{
			// 'boxed': 'all',
			'sidebar': 'darkblue',

			'nav': 'border-0 has-active-border',
			'nav-item':'mr-lg-2px',

			'navbar-input': 'radius-1 border-1 py-2',

			'badge-bell': 'badge-sm badge-warning border-1 brc-white text-80',
			'badge-flask': 'badge-sm text-90',
		}
	);
	navbarMatchings.secondary = jQuery.extend({}, navbarMatchings.blue,
		{
			'badge-flask': 'badge-sm text-white text-90',
		}   
	);
	navbarMatchings.green = jQuery.extend({}, navbarMatchings.blue,
		{
			'sidebar': 'darkblue',
			'badge-bell': 'bgc-orange-m3 text-80 text-dark-tp2',
			'badge-flask': 'bgc-orange-m3 text-80 text-dark-tp2 px-15 radius-round',
		}   
	);
	navbarMatchings.teal = jQuery.extend({}, navbarMatchings.blue,
		{
			// 'boxed': 'all',
			'sidebar': 'cadetblue'
		}
	);


	navbarMatchings.cadetblue = jQuery.extend({}, navbarMatchings.blue,
		{
			'sidebar': 'purple',

			'nav': 'has-active-border',
			'nav-item-flask': 'btn btn-orange bgc-orange-tp3 pl-lg-3 pr-lg-4',

			'badge-bell': 'badge-sm bgc-dark border-0 text-80',
			'badge-flask': 'text-white-tp1 text-90',

			'user-image': 'brc-white-tp3 border-2',
		}   
	);


	navbarMatchings.white = jQuery.extend({}, navbarMatchings.blue,
		{
			// 'boxed': 'all',
			'sidebar': 'white2',
			
			'nav': 'has-active-border',
			'brand': 'text-grey',
			'brand-icon': 'text-success',
		
			'toggler': ['btn-h-white' , 'bgc-dark-tp3'],
			'search': 'px-2',
			'search-icon': 'text-primary-m1',
		
			'badge-bell': 'badge-info border-0 badge-sm text-80',
			'badge-flask': 'text-danger text-80',
		
			'user-image': 'brc-primary-m2 border-2 p-1px',
		
			'mega': 'mt-1px',

			'button': 'btn-outline-primary',
		}   
	);
	navbarMatchings.white2 = jQuery.extend({}, navbarMatchings.white,
		{
			// 'boxed': 'all',
			'navbar-input': 'border-1 radius-1 py-2'
		}
	);


	navbarMatchings.lightblue = {
		'sidebar': 'steelblue',
		// 'boxed': 'all',
		
		'nav': 'nav-compact-2 mr-1 has-active-border',
		'nav-item': 'mr-1',
		'brand': 'text-dark-tp2',
		'brand-icon': 'text-success-m2',
		'brand-subtext': 'text-orange-d3 text-90',

		'toggler': ['btn-h-lighter-blue' , 'bgc-primary'],
		'search': 'px-2',
		'search-icon': 'text-primary-m2',

		'nav-item-bell': 'btn btn-orange text-white px-lg-3 opacity-1',
		'badge-bell': 'badge-danger badge-dot border-0',
		'nav-item-flask': 'btn btn-success px-lg-3 opacity-1',
		'badge-flask': 'badge-tr p-lg-1 text-75',
		'bell-icon': 'text-110',
		'flask-icon': 'text-110',

		'user-image': 'brc-primary-m2 border-1 p-1px',
		'user-name': 'mt-n2',
		'user-welcome': 'opacity-1 text-85',

		'mega': 'mt-1px',
		'button': 'btn-outline-primary',
	};


	navbarMatchings.lightpurple = {
		'sidebar': 'darkslateblue',
		// 'boxed': 'all',
		
		'nav': 'nav-compact-2 mr-1 has-active-border',
		'nav-item': 'mr-1',
		'brand': 'text-dark-tp3',
		'brand-icon': 'text-purple-d1',

		'toggler': ['btn-h-lighter-purple' , 'bgc-dark-tp3'],
		'search-icon': 'text-dark-tp3',

		'nav-item-bell': 'btn btn-purple px-lg-3',
		'badge-bell': 'btn-yellow badge-dot p-0 mr-lg-2 mt-lg-2',
		'nav-item-flask': 'btn btn-grey px-lg-3',
		'badge-flask': 'badge-tr p-lg-1 text-75',
		'bell-icon': 'text-110',
		'flask-icon': 'text-110',

		'user-image': 'brc-grey-tp3 border-1 p-1px',
		'user-name': 'mt-n2 font-bolder',
		'user-welcome': 'opacity-1 text-85',

		'mega': 'mt-1px',
		'button': 'btn-outline-purple',
	};
	
	navbarMatchings.lightgreen = {
		'sidebar': 'green',
		// 'boxed': 'all',
		
		'nav': 'nav-compact-2 mr-1 has-active-border',
		'nav-item': 'mr-1',
		'brand': 'text-dark-tp2',
		'brand-icon': 'text-success-m1',

		'toggler': ['btn-h-white' , 'bgc-dark-tp3'],
		'search-icon': 'text-orange-d2',

		'nav-item-bell': 'btn btn-orange opacity-1 px-lg-3',
		'badge-bell': 'bgc-white badge-dot p-0 mr-lg-2 mt-lg-2',
		'nav-item-flask': 'btn btn-outline-red px-lg-3',
		'badge-flask': 'badge-tr p-lg-1 text-75 text-600',
		'bell-icon': 'text-110',
		'flask-icon': 'text-110',

		'user-image': 'brc-grey-tp3 border-1 p-1px',
		'user-name': 'mt-lg-n2 font-bolder',
		'user-welcome': 'opacity-1',

		'mega': 'mt-0',
		'button': 'btn-outline-success',
	};
	navbarMatchings.lightgrey = {
		'sidebar': 'cadetblue',
		// 'boxed': 'all',
		
		'intro': 'bgc-green-d2',
		'nav': 'nav-compact-2 mr-1 has-active-border',
		'nav-item': 'mr-1',
		'brand': 'text-white-tp1',

		'toggler': ['' , 'text-white-tp1'],
		'search-icon': 'text-orange-d2',

		'nav-item-bell': 'btn btn-purple px-lg-3',
		'badge-bell': 'bgc-white badge-dot p-0 mr-lg-2 mt-lg-2',
		'nav-item-flask': 'btn btn-outline-grey px-lg-3',
		'badge-flask': 'badge-tr p-lg-1 text-75',
		'bell-icon': 'text-110',
		'flask-icon': 'text-110',

		'user-image': 'brc-grey-tp3 border-1 p-1px',
		'user-name': 'mt-lg-n2 text-600',
		'user-welcome': 'opacity-1',

		'mega': 'mt-0',
		'button': 'btn-outline-default',
	};

	/**
	navbarMatchings.lightyellow = {
		'sidebar': 'cadetblue',
		// 'boxed': 'all',
		
		'nav': 'has-active-border',
		'nav-item': 'mr-1px',
		'brand': 'text-dark-tp2',
		'brand-icon': 'text-success',

		'toggler': ['btn-h-light-yellow' , 'bgc-dark-tp3'],
		'search-icon': 'text-brown-m2',

		'nav-item-bell': 'btn btn-outline-purple pl-lg-3 pr-lg-4',
		'badge-bell': 'badge-white text-75 brc-dark-tp3 border-1 badge-sm',
		'nav-item-flask': 'btn btn-outline-success pl-lg-3 pr-lg-4',
		'badge-flask': 'p-lg-1 text-85',

		'bell-icon': 'text-110 mr-lg-2',
		'flask-icon': 'text-110 mr-lg-1',

		'user-image': 'brc-grey-tp3 border-1 p-1px',
		'user-name': 'mt-n1',
		'user-welcome': 'opacity-2',

		'mega': 'mt-1px',
		'button': 'btn-outline-success',
	};
	navbarMatchings.khaki = {
		'sidebar': 'gradient5',
		// 'boxed': 'all',
		
		'nav': 'has-active-border',
		'nav-item': 'mr-1px',
		'brand': 'text-dark-tp2',
		'brand-icon': 'text-dark-tp4',
		'brand-subtext': 'text-85 ml-n1',

		'toggler': ['btn-h-light-yellow' , 'bgc-dark-tp3'],
		'search-icon': 'text-brown-m2',

		'nav-item-bell': 'nav-link px-lg-3',
		'badge-bell': 'text-85 border-0 badge-sm',
		'nav-item-flask': 'nav-link px-lg-3',
		'badge-flask': 'p-lg-1 text-85 badge-sm',

		'bell-icon': 'text-110 mr-lg-2',
		'flask-icon': 'text-110 mr-lg-2',

		'user-image': 'brc-grey-tp3 border-1 p-1px',
		'user-name': 'mt-n1',
		'user-welcome': 'opacity-1 text-85',

		'mega': 'mt-1px',
		'button': 'btn-outline-dark',
	};
	*/



	function NavbarTheme(theme) {
		loadThemesFile();

		var theme = theme || 'blue';
		$('#id-navbar-themes-light , #id-navbar-themes-dark').addClass('d-none');
	 

		switch(theme) {
			case 'light':
				 $('#id-navbar-themes-light').removeClass('d-none');
			break;

			case 'dark':
				$('#id-navbar-themes-dark').removeClass('d-none');
			break;
		}

		applyNavbarTheme(theme);
	}

	function applyNavbarTheme(theme) {
		var theme = theme || 'blue';
	 
		var $navbar = $('.navbar');
		resetNavbarColors($navbar);


		switch(theme) {
			case 'light':
				$navbar.addClass('navbar-'+lastNavbarLightTheme);
				applyNavbarMatchingChanges($navbar, lastNavbarLightTheme);
			break;
			case 'dark':
				$navbar.addClass('navbar-'+lastNavbarDarkTheme);
				applyNavbarMatchingChanges($navbar, lastNavbarDarkTheme);
			break;
		   
			default:
				$navbar.addClass('navbar-'+theme);
				applyNavbarMatchingChanges($navbar, theme);
			break;
		}
	}



	function resetNavbarColors($navbar) {
		$navbar.removeClass(function(index, className) {
			var matchedClasses = className.match(/(^|\s)navbar-\S+/g);
			if(matchedClasses) matchedClasses = matchedClasses.filter(function(str) {
				return !(/navbar-fixed|navbar-sm|navbar-expand-lg/.test(str));
			});
			return (matchedClasses || []).join('')
		});

		$navbar.find('.navbar-intro').removeClass(function(index, className) {
			var  matchedClasses = className.match(/(^|\s)(text-|bgc-|bg-)\S+/g);
			return (matchedClasses || []).join('')
		});


		$navbar.find('#navbarMenu .navbar-nav > .nav').removeClass(function(index, className) {
			var  matchedClasses = className.match(/(^|\s)(nav-compact|border-0|has-active-border|mr-|m-|ml-|mx-)\S*/g);
			return (matchedClasses || []).join('')
		}).find('> .nav-item').removeClass(function(index, className) {
			var  matchedClasses = className.match(/(^|\s)(mr-|m-|ml-|mx-)\S*/g);
			return (matchedClasses || []).join('')
		}).find('> a > .dropdown-caret').removeClass('d-none');


		$navbar.find('.navbar-brand, .navbar-brand span:last, .fa-leaf, .fa-search, .fa-flask, .fa-bell, #id-navbar-badge1, #id-navbar-badge2, .nav-user-name, #id-user-welcome, #navbarMenu .navbar-nav > .nav > .nav-item > .nav-link,  #navbarMenu .navbar-nav > .nav > .nav-item > .btn').removeClass(function(index, className) {
			var  matchedClasses = className.match(/(^|\s)(btn-|bgc-|brc-|border-|text-|opacity-|m-|mx-|ml-|mr-|mt-|mb-|pl-|pr-|px-|p-|badge-)\S+/g);
			return (matchedClasses || []).join('')
		});

		$navbar.find('.navbar-input').removeClass(function(index, className) {
			var  matchedClasses = className.match(/(^|\s)(radius-|border-|py-)\S+/g);
			return (matchedClasses || []).join('')
		});

		//////////
		$navbar.find('[data-toggle="sidebar"] , [data-toggle-mobile="sidebar"]').add($navbar.find('.fa-flask, .fa-bell').parent()).removeClass(function(index, className) {
			var  matchedClasses = className.match(/(^|\s)(btn|btn-|brc-|text-|border-|(d-style))\S+/g);
			return (matchedClasses || []).join('')
		}).find('.bars').removeClass(function(index, className) {
			var  matchedClasses = className.match(/(^|\s)(text-|bgc-|bg-)\S+/g);
			return (matchedClasses || []).join('')
		});

		$navbar.find('.fa-flask, .fa-bell').parent().removeClass(function(index, className) {
			var  matchedClasses = className.match(/(^|\s)(d-)\S+/g);
			return (matchedClasses || []).join('')
		});

		$navbar.find('#id-navbar-user-image , .navbar-toggler img').removeClass(function(index, className) {
			var  matchedClasses = className.match(/(^|\s)(brc-|border-|p-)\S+/g);
			return (matchedClasses || []).join('')
		});

		$navbar.find('.tmp--cloned').remove();

		//////////
		$navbar.find('.dropdown-mega > .dropdown-menu').removeClass('mt-1px mt-0 border-t-0');

		//
		if( window.isAceLayout2 ) {
			$('#id-nav-post-btn').removeClass(function(index, className) {
				var  matchedClasses = className.match(/(^|\s)(btn-|brc-)\S*/g);
				return (matchedClasses || []).join('')
			});
		}
	}


	function applyNavbarMatchingChanges($navbar, theme) {
		var changes = navbarMatchings[theme];
		if (!changes) changes = navbarMatchings['blue'];

		if( _allowAutoMatchSidebar && $('#id-auto-match').prop('checked') && changes['sidebar'] ) {
			_allowAutoMatchNavbar = false;
			//$('label.sidebar-' + changes['sidebar']).trigger('click');
			applySidebarTheme(changes['sidebar']);   
		}
		_allowAutoMatchSidebar = true;

		//if( changes['boxed'] && currentBoxedLayout == 'not-navbar' ) $('[name=boxed-layout][value='+changes['boxed']+']').parent().trigger('click');

		if (changes['intro']) {
			$('.navbar-intro').addClass(changes['intro'])
		}

		var nav = $navbar.find('#navbarMenu .navbar-nav > .nav');
		if( changes['nav'] ) nav.addClass( changes.nav );
		if( changes['nav-item'] ) nav.find('> .nav-item').addClass( changes['nav-item'] );
		//if( changes['hide-caret '] ) .find('> a > .dropdown-caret').addClass('d-none');

		var brand = $navbar.find('.navbar-brand');
		if( changes['brand'] ) brand.addClass( changes['brand'] );
		if( changes['brand-icon'] ) brand.find('.fa-leaf').addClass( changes['brand-icon'] );
		if( changes['brand-subtext'] ) brand.find('span:last').addClass( changes['brand-subtext'] );

		if( changes['toggler'] ) {
			var toggler = $navbar.find('[data-toggle="sidebar"] , [data-toggle-mobile="sidebar"]');
			toggler.addClass( Array.isArray( changes['toggler'] ) ? changes['toggler'][0] : changes['toggler'] ).addClass('btn-burger');
			if( typeof Array.isArray( changes['toggler'] ) && changes['toggler'][1] ) toggler.find('.bars').addClass( changes['toggler'][1] );
		}

		if( changes['search'] ) $navbar.find('[data-target="#navbarSearch"]').addClass( changes['search'] );
		if( changes['navbar-input'] ) $navbar.find('.navbar-input').addClass( changes['navbar-input'] );
		if( changes['search-icon'] ) $navbar.find('.fa.fa-search').addClass( changes['search-icon'] );

	   
		if( changes['nav-item-flask'] ) {
			var btn = $navbar.find('.fa-flask').parent();


			var btnClass = changes['nav-item-flask'].match(/btn-(\w|\-)+/);
			if ( btnClass ) {
				//make a copy of this button to be displayed on mobile view, without btn-* colors
				var clone = btn.clone().insertAfter(btn).addClass('d-lg-none tmp--cloned');
				clone.addClass('nav-link');
				btn.addClass('d-none d-lg-flex');

				//but still match the btn-* color for the icon
				clone.find('.fa').eq(0).addClass( btnClass[0].replace('outline-', '') +' radius-round w-4 h-4 text-center pt-2');
			}
			btn.removeClass('nav-link').addClass( changes['nav-item-flask'] );
		}
		if( changes['nav-item-bell'] ) {
			var btn = $navbar.find('.fa-bell').parent();
			
			var btnClass = changes['nav-item-bell'].match(/btn-(\w|\-)+/);
			if ( btnClass ) {
				//make a copy of this button to be displayed on mobile view, without btn-* colors
				var clone = btn.clone().insertAfter(btn).addClass('d-lg-none tmp--cloned');
				clone.addClass('nav-link');
				btn.addClass('d-none d-lg-flex');

				//but still match the btn-* color for the icon
				clone.find('.fa').eq(0).addClass( btnClass[0].replace('outline-', '') +' radius-round w-4 h-4 text-center pt-2');
			}
			btn.removeClass('nav-link').addClass( changes['nav-item-bell'] );
		}


		if( changes['badge-bell'] ) $navbar.find('#id-navbar-badge1').addClass( changes['badge-bell'] );
		if( changes['badge-flask'] ) $navbar.find('#id-navbar-badge2').addClass( changes['badge-flask'] );

		if( changes['bell-icon'] ) $navbar.find('.fa-bell').addClass( changes['bell-icon'] );
		if( changes['flask-icon'] ) $navbar.find('.fa-flask').addClass( changes['flask-icon'] );

		if( changes['user-image'] ) {
			$navbar.find('#id-navbar-user-image , .navbar-toggler img').addClass( changes['user-image'] )//.find('.badge').removeClass('border-1');
		}      

		if( changes['user-name'] ) $navbar.find('.nav-user-name').addClass( changes['user-name'] );
		if( changes['user-welcome'] ) $navbar.find('#id-user-welcome').addClass( changes['user-welcome'] );

		if( changes['mega'] ) $navbar.find('.dropdown-mega > .dropdown-menu').addClass( changes['mega'] );


		////////////////
		if (theme == 'lightgrey') {
			//in lightgrey navbar, .navbar-intro (& .navbar-brand) has green background
			//but in mobile mode it becomes transparent
			//so we insert a cloned .navbar-brand with dark colors for mobile view only
			//these are optional, and only for Ace's demo

			var navbrand = $navbar.find('.navbar-brand').removeClass('d-none d-lg-block');
			var cloned = navbrand.clone();
			cloned.removeClass('text-white-tp1').addClass('text-dark-tp4 d-lg-none tmp--cloned').find('.fa-leaf').addClass('text-success-m1');
			navbrand.addClass('d-none d-lg-block');//hide it in mobile view
			navbrand.after(cloned);

			var toggle = $navbar.find('.btn-burger[data-toggle-mobile=sidebar]');
			var bars = toggle.find('.bars');
			cloned = bars.clone().removeClass('text-white-tp1 d-none').addClass('text-dark-tp4 d-lg-none tmp--cloned');
			bars.addClass('d-none d-lg-block').after(cloned);

			if( window.isAceLayout2 ) {
				$navbar.find('.btn-burger[data-toggle=sidebar]').addClass('btn-light-success btn-bold').find('.bars').removeClass('text-white-tp1').addClass('text-dark-tp4');
			}
		}
		else {
			$navbar.find('.navbar-brand , .btn-burger[data-toggle-mobile=sidebar] .bars').removeClass('d-none d-lg-block');
		}

		//
		if( window.isAceLayout2 && changes['button'] ) {
			$('#id-nav-post-btn').addClass( changes['button'] + ' btn-bold btn-sm' );
		}

	}



	function BodyTheme(theme) {
		loadThemesFile();

		theme = theme || 'auto';
		currentBodyTheme = theme;		

		var $body = $('body');
		$body.removeClass(function(index, className) {
			var  matchedClasses = className.match(/(^|\s)body-\S+/g);
			return (matchedClasses || []).join('')
		}).css('background-image', '')

		if (this.value != 'auto') {
			$body.addClass('body-' + theme);

			// this is for 'demo' and correct asset paths
			if (theme == 'img1') {
				$body.css('background-image', "url('assets/image/body-bg-1.jpg')")
			}
			else if (theme == 'img2') {
				$body.css('background-image', "url('assets/image/body-bg-2.jpg')")
			}

			return;
		}

		//auto apply body color according to sidebar color
		
	}




	function BoxedLayout(box) {
		box = box || 'none';
		currentBoxedLayout = box;

		if(box == 'none') {
			$('.body-container, .navbar-inner, .page-content').removeClass('container container-plus');
			$('.navbar-inner > .container').contents().unwrap();
		}
		else if(box == 'all') {
			$('.page-content').removeClass('container container-plus');
			$('.body-container, .navbar-inner').addClass('container container-plus');
			if( !window.isAceLayout2 ) {
				$('.navbar-inner > .container').contents().unwrap();
			}
			else {
			   if( $('.navbar-inner > .container').length == 0 ) $('.navbar-inner').wrapInner('<div class="container container-plus" />');    
			}
		}
		else if(box == 'not-navbar') {
			if( window.currentLayout == 2 ) return;//not applicable to second layout
			$('.navbar-inner, .page-content').removeClass('container container-plus');
			$('.body-container').addClass('container container-plus');        
			$('.navbar-inner').wrapInner('<div class="container container-plus" />');
		}
		else if(box == 'only-content') {
			BoxedLayout('none');
			$('.page-content').addClass('container container-plus');
		}

		if (box == 'all' || box == 'not-navbar') {
			$('#id-body-bg').collapse('show');
		}
		else {
			$('#id-body-bg').collapse('hide');
		}

	}//BoxedLayout

	
	//set rtl path for bootstrap css
	var bootstrapStylesheet = '';
	$('link[rel=stylesheet][href*="/bootstrap.css"], link[rel=stylesheet][href*="/bootstrap.min.css"]').each(function() {
		var href = $(this).attr('href');
		$(this).attr('data-rtl', href.indexOf('.min.css') == -1 ? './dist/css/rtl/bootstrap.css' : './dist/css/rtl/bootstrap.min.css');

		bootstrapStylesheet = $(this).attr('href');
	});

	function ajaxGet(url) {
		return new Promise(function(resolve, reject) {
		  var xhr = new XMLHttpRequest();
		  xhr.open("GET", url);
		  xhr.onload = function() {resolve(xhr.responseText)}
		  xhr.onerror = function() {reject(xhr.statusText)}
		  xhr.send();
		});
	}

	var _alreadyLoaded = {};
	function loadCSS(href, message) {
		return new Promise(function(resolve, reject) {

			//because when running the static html demo, no waiting is required and also ajaxGet will fail
			if(location.protocol == 'file:') {
				resolve();
			}
			else if (!_alreadyLoaded[href]) {
				var overlay = document.createElement('DIV')
				overlay.innerHTML = '<div style="position: fixed !important; z-index: 2000; padding-top: 10rem;"\
						class="bgc-white position-tl w-100 h-100 text-center text-150 text-primary-m1">'+message+'</div>';
				document.body.appendChild(overlay)

				ajaxGet(href)
				.then(function() {
					_alreadyLoaded[href] = true
					overlay.parentNode.removeChild(overlay)
					resolve()
				}).catch(function() {
					overlay.parentNode.removeChild(overlay)
					reject()
				})
			}
			else {
				resolve()
			}
		})
	}

	function RTLLayout(rtl) {
		if(rtl) {
			$('html').addClass('rtl').attr('dir', 'rtl');
			$('link[rel=stylesheet][href*="/bootstrap.css"],link[rel=stylesheet][href*="/bootstrap.min.css"],link[rel=stylesheet][href*="/ace.css"],link[rel=stylesheet][href*="/ace.min.css"],link[rel=stylesheet][href*="/ace-themes.css"],link[rel=stylesheet][href*="/ace-themes.min.css"]')
			.each(function() {
				var href = $(this).attr('data-rtl') || $(this).attr('href').replace(/\/([^\/]+)$/, '/rtl/$1');
				var link = this;

				try {
				  loadCSS(href, 'Loading RTL stylesheets ... please wait ...').then(function() {
					$(link).attr('href', href);
				  })
				}
				catch(e) {
				  //for IE
				  $(link).attr('href', href);
				}
			});

			//mirror popovers
			$(document).on('shown.bs.popover.rtl', function(e, e2) {
				$('.bs-popover-right, .bs-popover-left').each(function() {
					var placement = this.className.indexOf('-right') >= 0 ? 'right' : 'left';
					if(placement == 'right') {
						this.setAttribute('x-placement', 'left');
						this.className = this.className.replace('-right', '-left');
					}
					else {
						this.setAttribute('x-placement', 'right');
						this.className = this.className.replace('-left', '-right');
					}
				});
			});
		}
		else {
			$('html').removeClass('rtl').attr('dir', 'ltr');
			$('link[rel=stylesheet][href*="/bootstrap.css"], link[rel=stylesheet][href*="/bootstrap.min.css"]').attr('href', bootstrapStylesheet);
			$('link[rel=stylesheet][href*="/ace.css"],link[rel=stylesheet][href*="/ace.min.css"],link[rel=stylesheet][href*="/ace-themes.css"],link[rel=stylesheet][href*="/ace-themes.min.css"]').each(function() {
				$(this).attr('href', $(this).attr('href').replace(/\/rtl\/([^\/]+)$/, '/$1'));
			});

			$(document).off('shown.bs.popover.rtl');
		}
		
		//mirror Icons using js or you can also use CSS to flip icons by applying ``transform: scaleX(-1)``
		//which I don't use because some icons are also animated using transform and it will conflict with that
		$('.fa[class*="-right"],.fa[class*="-left"]').each(function() {
			this.className = this.className.replace('-right', '-temp111');
			this.className = this.className.replace('-left', '-right');
			this.className = this.className.replace('-temp111', '-left');
		});

		$('[data-placement="right"],[data-placement="left]').each(function() {
			var placement = this.getAttribute('data-placement');
			this.setAttribute('data-placement' , placement == 'right' ? 'left' : 'right');
		});
	}

	
	function loadThemesFile() {
		var href = '';
		$('link[rel=stylesheet][href*="/ace.css"],link[rel=stylesheet][href*="/ace.min.css"]').each(function() {
			href = $(this).attr('href').replace('ace.', 'ace-themes.');
		});
		if ($('link[rel=stylesheet][href*="'+href+'"]').length > 0) return;// return if already loaded

		var addStylesheet = function(href) {
			var linkEl = document.createElement('link');
			linkEl.setAttribute('rel', 'stylesheet');
			linkEl.setAttribute('type', 'text/css');
			linkEl.setAttribute('href', href);
			document.head.appendChild(linkEl);
		}

		try {
		  loadCSS(href, 'Loading themes stylesheet ... please wait ...').then(function() {
			addStylesheet(href);
		  })
		}
		catch(e) {
			//for IE
			addStylesheet(href);
		}
	}

	//ChangeFont
	var loadedFonts = {};
	function ChangeFont(font) {
		if( !font || font.length == 0 ) return;

		$('body,html').removeClass(function(index, className) {
			var  matchedClasses = className.match(/(^|\s)(font-)\S*/g);
			return (matchedClasses || []).join('')
		});

		if(font == 'open-sans') return;//this is default in Ace, so no need to load it!

		var fonts = {
			"lato": {
				name: "Lato",
				url: "https://fonts.googleapis.com/css?family=Lato:300,400,700,900&display=swap",
				rules: "body.font-lato { font-family: 'Lato'; letter-spacing: 0.5px; }",
			},
			"manrope": {
				name: "Manrope",
				url: "https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;600;700&display=swap",
				rules: "body.font-manrope { font-family: 'Manrope'; }",
			},
			"montserrat": {
				name: "Montserrat",
				url: "https://fonts.googleapis.com/css?family=Montserrat:300,400,500,600,700&display=swap",
				rules: "body.font-montserrat { font-family: 'Montserrat'; }",
			},
			"noto-sans": {
				name: "Noto Sans",
				url: "https://fonts.googleapis.com/css?family=Noto+Sans:400,700&display=swap",
				rules: "body.font-noto-sans { font-family: 'Noto Sans'; }",
			},
			"poppins": {
				name: "Poppins",
				url: "https://fonts.googleapis.com/css?family=Poppins:300,400,500,600,700&display=swap",
				rules: "body.font-poppins { font-family: 'Poppins'; }",
			},
			"raleway": {
				name: "Raleway",
				url: "https://fonts.googleapis.com/css?family=Raleway:300,400,500,600,700&display=swap",
				rules: "body.font-raleway { font-family: 'Raleway'; font-weight: 500; } .font-raleway .text-300, .font-raleway .font-light {font-weight: 400 !important;} .font-raleway .page-title {font-weight: 400 !important;}",
			},
			"roboto": {
				name: "Roboto",
				url: "https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap",
				rules: "body.font-roboto { font-family: 'Roboto'; letter-spacing: 0.5px; } body.font-roboto .text-600 , body.font-roboto .font-bolder, body.font-roboto .btn-bold, body.font-roboto .badge {font-weight: 500 !important;} body.font-roboto .sidebar .nav > .nav-item.active:not(.open) > .nav-link {font-weight: 500;}",
			},
			"markazi": {
				name: "Markazi Text",
				url: "https://fonts.googleapis.com/css?family=Markazi+Text:400,500,600,700&display=swap&subset=arabic",
				rules: "body.font-markazi { font-family: 'Markazi Text'; } html.font-markazi {font-size: 18px;}",
			},
		};

		if (!fonts[font]) return;

		
		if(!loadedFonts[font]) {
			var fontInfo = fonts[font];
			var linkEl = document.createElement('link');
			linkEl.setAttribute('rel', 'stylesheet');
			linkEl.setAttribute('type', 'text/css');
			linkEl.setAttribute('href', fontInfo.url);
			document.head.appendChild(linkEl);

			var styleEl = document.createElement('style');
			styleEl.innerHTML = fontInfo.rules;
			document.head.appendChild(styleEl);

			loadedFonts[font] = true;
		}

		$('body,html').addClass('font-'+font);
	}

})(window.jQuery);


// https://github.com/jedtrow/Chart.js-Rounded-Bar-Charts
/*
*   Rounded Rectangle Extension for Bar Charts and Horizontal Bar Charts
*   Tested with Charts.js 2.7.0
*/
if (window.Chart) window.Chart.elements.Rectangle.prototype.draw = function() {

    var ctx = this._chart.ctx;
    var vm = this._view;
    var left, right, top, bottom, signX, signY, borderSkipped, radius;
    var borderWidth = vm.borderWidth;

    // If radius is less than 0 or is large enough to cause drawing errors a max
    //      radius is imposed. If cornerRadius is not defined set it to 0.
    var cornerRadius = this._chart.config.options.cornerRadius;
    if(cornerRadius < 0){ cornerRadius = 0; }
    if(typeof cornerRadius == 'undefined'){ cornerRadius = 0; }

    if (!vm.horizontal) {
        // bar
        left = vm.x - vm.width / 2;
        right = vm.x + vm.width / 2;
        top = vm.y;
        bottom = vm.base;
        signX = 1;
        signY = bottom > top? 1: -1;
        borderSkipped = vm.borderSkipped || 'bottom';
    } else {
        // horizontal bar
        left = vm.base;
        right = vm.x;
        top = vm.y - vm.height / 2;
        bottom = vm.y + vm.height / 2;
        signX = right > left? 1: -1;
        signY = 1;
        borderSkipped = vm.borderSkipped || 'left';
    }

    // Canvas doesn't allow us to stroke inside the width so we can
    // adjust the sizes to fit if we're setting a stroke on the line
    if (borderWidth) {
        // borderWidth shold be less than bar width and bar height.
        var barSize = Math.min(Math.abs(left - right), Math.abs(top - bottom));
        borderWidth = borderWidth > barSize? barSize: borderWidth;
        var halfStroke = borderWidth / 2;
        // Adjust borderWidth when bar top position is near vm.base(zero).
        var borderLeft = left + (borderSkipped !== 'left'? halfStroke * signX: 0);
        var borderRight = right + (borderSkipped !== 'right'? -halfStroke * signX: 0);
        var borderTop = top + (borderSkipped !== 'top'? halfStroke * signY: 0);
        var borderBottom = bottom + (borderSkipped !== 'bottom'? -halfStroke * signY: 0);
        // not become a vertical line?
        if (borderLeft !== borderRight) {
            top = borderTop;
            bottom = borderBottom;
        }
        // not become a horizontal line?
        if (borderTop !== borderBottom) {
            left = borderLeft;
            right = borderRight;
        }
    }

    ctx.beginPath();
    ctx.fillStyle = vm.backgroundColor;
    ctx.strokeStyle = vm.borderColor;
    ctx.lineWidth = borderWidth;

    // Corner points, from bottom-left to bottom-right clockwise
    // | 1 2 |
    // | 0 3 |
    var corners = [
        [left, bottom],
        [left, top],
        [right, top],
        [right, bottom]
    ];

    // Find first (starting) corner with fallback to 'bottom'
    var borders = ['bottom', 'left', 'top', 'right'];
    var startCorner = borders.indexOf(borderSkipped, 0);
    if (startCorner === -1) {
        startCorner = 0;
    }

    function cornerAt(index) {
        return corners[(startCorner + index) % 4];
    }

    // Draw rectangle from 'startCorner'
    var corner = cornerAt(0);
    ctx.moveTo(corner[0], corner[1]);

    for (var i = 1; i < 4; i++) {
        corner = cornerAt(i);
        nextCornerId = i+1;
        if(nextCornerId == 4){
            nextCornerId = 0
        }

        nextCorner = cornerAt(nextCornerId);

        width = corners[2][0] - corners[1][0];
        height = corners[0][1] - corners[1][1];
        x = corners[1][0];
        y = corners[1][1];

        var radius = cornerRadius;
        // Fix radius being too large
        if(radius > Math.abs(height)/2){
            radius = Math.floor(Math.abs(height)/2);
        }
        if(radius > Math.abs(width)/2){
            radius = Math.floor(Math.abs(width)/2);
        }

        if(height < 0){
            // Negative values in a standard bar chart
            x_tl = x;           x_tr = x+width;
            y_tl = y+height;    y_tr = y+height;

            x_bl = x;           x_br = x+width;
            y_bl = y;           y_br = y;

            // Draw
            ctx.moveTo(x_bl+radius, y_bl);
            ctx.lineTo(x_br-radius, y_br);
            ctx.quadraticCurveTo(x_br, y_br, x_br, y_br-radius);
            ctx.lineTo(x_tr, y_tr+radius);
            ctx.quadraticCurveTo(x_tr, y_tr, x_tr-radius, y_tr);
            ctx.lineTo(x_tl+radius, y_tl);
            ctx.quadraticCurveTo(x_tl, y_tl, x_tl, y_tl+radius);
            ctx.lineTo(x_bl, y_bl-radius);
            ctx.quadraticCurveTo(x_bl, y_bl, x_bl+radius, y_bl);

        }else if(width < 0){
            // Negative values in a horizontal bar chart
            x_tl = x+width;     x_tr = x;
            y_tl= y;            y_tr = y;

            x_bl = x+width;     x_br = x;
            y_bl = y+height;    y_br = y+height;

            // Draw
            ctx.moveTo(x_bl+radius, y_bl);
            ctx.lineTo(x_br-radius, y_br);
            ctx.quadraticCurveTo(x_br, y_br, x_br, y_br-radius);
            ctx.lineTo(x_tr, y_tr+radius);
            ctx.quadraticCurveTo(x_tr, y_tr, x_tr-radius, y_tr);
            ctx.lineTo(x_tl+radius, y_tl);
            ctx.quadraticCurveTo(x_tl, y_tl, x_tl, y_tl+radius);
            ctx.lineTo(x_bl, y_bl-radius);
            ctx.quadraticCurveTo(x_bl, y_bl, x_bl+radius, y_bl);

        }else{
            //Positive Value
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - 0, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - 0);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
        }
    }

    ctx.fill();
    if (borderWidth) {
        ctx.stroke();
    }
};