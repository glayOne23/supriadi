'use strict';

const exphbs  = require('express-handlebars');
const fs  = require('fs');

const PageList = require('./PageList');
const resolve = require('./app-resolve');
const asset = require('./asset-finder');

const constants = require('./constants');


// in Layout we have a list of partials dir which is updated (the "dir" attr is updated) when we go to a new page
class Layout {
	constructor(base, dataPath) {
		this._base = base;
		this._dataPath = dataPath;

		this.layoutsDir = `${this._base}/layouts`;
		this.pagesDir = `${this._base}/pages`;

		this.defaultLayout = constants.DEFAULT_LAYOUT;
		this.partialsDir = [];
		this.partialsDir_KeyMap = {};

		this._setDefaultPartialsDir();
	}

	getBase() {
		return this._base;
	}

	getDataDir() {
		return `${this._dataPath}/layouts`;
	}

	updatePagePartialsDirFor(page) {
		this._updatePartialsDir('page', `${this.pagesDir}/${page}`);
		this._updatePartialsDir('include', `${this.pagesDir}/${page}`);
		this._updatePartialsDir('layout', this.layoutsDir);
	}

	getPagePartialsDir(page) {
		return `${this.pagesDir}/partials/${page}`;
	}

	_setDefaultPartialsDir() {
		this._updatePartialsDir('layout', `${this.layoutsDir}/partials`);
		this._updatePartialsDir('page', `${this.pagesDir}/partials`);
		this._updatePartialsDir('include', `${this.pagesDir}/partials`);
	}

	_updatePartialsDir(namespace, dir) {
		if( !(this.partialsDir_KeyMap[namespace] instanceof Object) ) {
			this.partialsDir_KeyMap[namespace] = {namespace, dir};
			this.partialsDir.push(this.partialsDir_KeyMap[namespace]);
		}
		else this.partialsDir_KeyMap[namespace].dir = dir;
	}
}



class Page {
	constructor(id, base, dataPath) {
		this.id = id;
		this._base = base;
		this._dataPath = dataPath;
		this._layout = null;

		this._pageList = new PageList();

		// there may be a different `pages.json` file for this page ... for example `horizontal` and `dashboard-2`
		var dataFileFolder = resolve.HomeDir() + '/views/data/layouts/';
		var dataFile = dataFileFolder + 'sidebar-' + id + '.json';
		if (!fs.existsSync(dataFile)) dataFile = dataFileFolder + 'sidebar.json';

		this._pageList.setDataFile(dataFile);
		this._pageList.initSidebarTree();
		this._pageList.updateSelectedPage(id);

		//var sidebar = this.getSidebar();
	}

	getTemplate() {
		return `${this._base}/pages/${this.id}/#index`;
	}

	getPartialsDir() {
		return `${this._base}/pages/${this.id}`;
	}
	getDataDir() {
		return `${this._dataPath}/pages/${this.id}`;
	}

	getSidebar() {
		return this._pageList.getSidebarTree();
	}
	getBreadcrumbs() {
		return this._pageList.getBreadcrumbs();
	}

	getTitle() {
		return this._pageList.getTitle(this.id);
	}
	getDescription() {
		return this._pageList.getDescription(this.id);
	}

	getLayoutInfo() {
		return this._pageList.getLayoutInfo(this.id);
	}

	setLayout(layout) {
		this._layout = layout;
	}
	getLayout() {
		return this._layout;
	}
}


class Display {
	constructor(base, data) {
		this.extname = '.hbs';
		this.app = null;
		this._base = base;
		this._data = data;
		this._layout = new Layout(base, data);
	}
	
	setLayout(layout) {
		this._layout = layout;
	}
	getLayout() {
		return this._layout;
	}
	setApp(app) {
		this.app = app;
	}
	
	updatePagePartialsDirFor(page) {
		if( !this._layout || !page ) return;
		this._layout.updatePagePartialsDirFor(page.id);
	}
	
	connect(app) {
		this.setApp(app);
		if( !this.app || !this._layout ) return this;

		this.app.engine('.hbs', exphbs({
											extname: this.extname,
											layoutsDir: this._layout.layoutsDir,
											defaultLayout: this._layout.defaultLayout,
											partialsDir: this._layout.partialsDir 
										})
						);
		
		this.app.set('views', '.');//in expressjs default views location is "path.resolve('views')"
		this.app.set('view engine', this.extname);
		return this;
	}
}


class HbsHelpers {
	
	static GetArgs(options) {
		var attrs = [];
		for (var prop in options.hash) {
			attrs[prop] = options.hash[prop];
		}
		return attrs;
	}
	
	static Include() {
		//var opts = GetArgs()
		/**
		if(process.env.BUILD == 'dist') {
			opts.dist;
		}
		else 
		*/
		
		//var files = GetFiles(opts.files, type,);
	}


	//we keep a list of required assets
	//so when building release package's zip file, we include those assets from node_modules folder
	static keepRequiredAssets(keep=true) {
		HbsHelpers._keepRequiredAssets = keep;
	}

	static getRequiredAssets() {
		return HbsHelpers._requireAssetsList;
	}
	
	static IncludeJS(options) {
		var attrs = this.GetArgs(options);

		var build = process.env.BUILD;
		var min = process.env.MINIFIED == 'true' || process.env.MIN == 'true' || false;
		
		var files = attrs['files'];
		var combine = attrs['combine'] == 'true' ? true : false;
		var resultFiles = build === 'dist' ? asset.GetCdnJsFiles(files, min, combine) : asset.GetJsFiles(files);

		let res = '';
		for(let file of resultFiles) {
			res += `<script src="${file}"></script>\n`;

			// add to list of required assets
			if (HbsHelpers._keepRequiredAssets) HbsHelpers._requireAssetsList.push(file)		
		}
		return res;
	}
	
	static IncludeCSS(options) {
		var attrs = this.GetArgs(options);

		var href = attrs['href'];
		if (href) {
			return `<link rel="stylesheet" type="text/css" href="${href}">\n`;
		}

		var build = process.env.BUILD;
		var min = process.env.MINIFIED == 'true' || process.env.MIN == 'true' || false;
		
		var files = attrs['files'];
		var combine = attrs['combine'] == 'true' ? true : false;
		var resultFiles =  build === 'dist' ? asset.GetCdnCssFiles(files, min, combine) : asset.GetCssFiles(files);
		
		var res = '';
		for(let file of resultFiles) {
			res += `<link rel="stylesheet" type="text/css" href="${file}">\n`;

			// add to list of required assets
			if (HbsHelpers._keepRequiredAssets) HbsHelpers._requireAssetsList.push(file)
		}
		return res;
	}
	
	static InlineJS(page) {
		if( !page || !(page instanceof Page) ) return '';
		var src = page.getPartialsDir() + '/@page-script.js';
		if ( fs.existsSync( src ) ) {
			var build = process.env.BUILD;

			if(build == 'dist') return '<script>\n' + fs.readFileSync(src, 'utf-8') + '\n</script>';//inline (inside HTML)

			return `<script src="${src}"></script>`;	
		}
		return '';
	}
	
	static InlineCSS(page) {
		if( !page || !(page instanceof Page) ) return '';
		var src = page.getPartialsDir() + '/@page-style.css';
		if ( fs.existsSync( src ) ) {
			var build = process.env.BUILD;

			if(build == 'dist') return '<style>\n' + fs.readFileSync(src, 'utf-8') + '\n</style>';

			return `<link rel="stylesheet" type="text/css" href="${src}">`;
		}
		return '';
	}

	static GetData(page, name) {
		if( !page || !(page instanceof Page) ) return {};

		let dataFile = '';

		let match = name.match(/layouts?\//);
		if( match ) {
			name = name.replace(match[0], '');
			let layout = page.getLayout();
			if( !layout || !(layout instanceof Layout) ) return {};

			dataFile = layout.getDataDir() + '/' + name;
		}
		else {
			dataFile = page.getDataDir() + '/' + name;
		}

		return HbsHelpers._readData(dataFile);
	}
	/**
	static GetLayoutData(page, name) {
		if( !page || !(page instanceof Page) ) return {};

		var layout = page.getLayout();
		if( !layout || !(layout instanceof Layout) ) return {};

		var dataFile = layout.getDataDir() + '/' + name;
		return HbsHelpers._readData(dataFile);
	}
	*/

	static _readData(dataFile) {		
		
		var data = [];
		try {
			if( fs.existsSync(dataFile + '.json') ) {
				data = JSON.parse(fs.readFileSync(dataFile + '.json' , 'utf-8'));
			}
			else if( fs.existsSync(dataFile + '.csv') ) {
				const csvjson = require('csvjson');
				data = fs.readFileSync(dataFile + '.csv' , 'utf-8');
				var options = {
					delimiter : ',',
					quote     : '"'
				};
				
				data = csvjson.toObject(data, options);

				for(let item of data) if('status' in item) {
					let status = item['status'].trim();
					item[status] = true;
				}
			}
		}
		catch(e) {}
		
		return data;
	}

	
	
	static Helpers(page) {
		var helpers = 
		{
			'get': function (name) {//this helper loads a specific piece of data for a page
				return HbsHelpers.GetData(page, name);
			},			
			'$$': function (name) {//this helper loads a specific piece of data for a page
				return HbsHelpers.GetData(page, name);
			},

			'include-js': function (options) {
				return HbsHelpers.IncludeJS(options);
			},
			'include-css': function (options) {
				return HbsHelpers.IncludeCSS(options);
			},
			'inline-js': function() {
				return HbsHelpers.InlineJS(page);
			},
			'inline-css': function() {
				return HbsHelpers.InlineCSS(page);				
			},
			'random': function(min, max) {
				return min + Math.floor(Math.random() * (max - min + 1));
			},
			'odd': function(conditional) {
				return conditional % 2;
			},
			'even': function(conditional) {
				return !(conditional % 2);
			},
			'eq': function (a, b, options) {
				if (a == b) { return options.fn(this); }
				return options.inverse(this);
			}
		}
		
		return helpers;
	}
	
}
HbsHelpers._keepRequiredAssets = false;
HbsHelpers._requireAssetsList = [];

//////////////
module.exports = { Page, Display, HbsHelpers }
