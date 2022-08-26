// runs Ace's demo or builds the HTML static files
'use strict';

const express = require('express');
const extend = require('xtend');
const path = require('path');
const fs = require('fs');
const pretty = require('pretty');
 

const constants = require('./app/node/constants');
const { Page, Display, HbsHelpers } = require('./app/node/hbs-helpers');

let build = process.env.BUILD;
let htmlOutput = process.env.HTML == 'true';

let isForOnlineDemo = build === 'dist';

class App {
	
	constructor() {
		this.base = `./views`;
		this.data = `./views/data`;

		this.app = express();
		
		this.display = new Display(this.base, this.data);
		this.display.connect(this.app);
		
		this.baseHref = path.relative(constants.HTML_FOLDER, '.')
		if (this.baseHref == '') this.baseHref = './'
		else this.baseHref = this.baseHref.replace(/\\/g, '/')+'/'
		
		this.outputPath = constants.HTML_FOLDER;
		if (this.outputPath.length == 0) this.outputPath = '.'
	}

	runServer() {
		this.app
		.get('/', function (req, res) {
			res.redirect('/'+constants.DEFAULT_PAGE);
		})
		.get('/favicon.ico',  (req, res) => {
			res.redirect('/assets/favicon.png');
		})
		
		.get('/docs',  (req, res) => {
			res.redirect('/docs/index.html');
		})
		.get('/:page',  (req, res) => {
			let requestedPageId = req.params.page || 'page-error';
			this._renderPage(requestedPageId, res);
		})
		
		this.app.use('/node_modules', express.static(path.join(__dirname, './node_modules')));
		this.app.use('/assets', express.static(path.join(__dirname, './assets')));
		this.app.use('/dist', express.static(path.join(__dirname, './dist')));
		this.app.use('/docs', express.static(path.join(__dirname, './docs')));

		this.app.use(`/views`, express.static(path.join(__dirname, `./views`)));
		this.app.use(`/app/browser`, express.static(path.join(__dirname, `./app/browser`)));
		
		this.app.listen(process.env.PORT || constants.DEFAULT_PORT);
	}


	generateHTML() {
		let path = this.data + '/layouts/sidebar.json';
	
		let sidebarData = null;
		
		try {
			sidebarData = JSON.parse(fs.readFileSync(path, 'utf-8'));
		}
		catch(err) {
			//if (!(err instanceof Error) || err.code !== 'MODULE_NOT_FOUND') throw err;
			console.log("Unable to generate HTML files");
			return;
		}

		HbsHelpers.keepRequiredAssets(!isForOnlineDemo);

		for(let d in sidebarData) {
			let pageInfo = sidebarData[d];
			if(pageInfo.link != false && pageInfo.id != null) {
				this._renderPage(pageInfo.id, `${this.outputPath}/${pageInfo.id}.html`);
			}
		}
	}
	

	_renderPage(requestedPageId, outputStream) {
		let page = new Page(requestedPageId, this.base, this.data);
		page.setLayout(this.display.getLayout());

		let layoutInfo = page.getLayoutInfo() || constants.DEFAULT_LAYOUT;//which is 'main'
		layoutInfo = `${layoutInfo}/#index.hbs`

		this.display.updatePagePartialsDirFor(page);

		this.app.render(page.getTemplate(), {
			useCDN: isForOnlineDemo,
			staticHTML: htmlOutput,
			
			baseHref: this.baseHref,

			layout: layoutInfo,


			// assign the variables
			pageId: page.id,
			title: page.getTitle(),
			description: page.getDescription(),

			sidebarItems: page.getSidebar(),
			breadcrumbs: page.getBreadcrumbs(),

			appFolder: constants.APP_FOLDER,

			helpers: extend(
				HbsHelpers.Helpers(page),
				
				{
					getPageLink: (uri) => {
						return uri ? (htmlOutput ? `${this.outputPath}/${uri}.html` : uri) : '#';
					}
				}
			)
			
			}, (err, output) => {
				if(err) console.log(err);
				
				if( typeof outputStream === 'string' ) {	
					let prettyHtml = pretty(output);// , {ocd: true}
					fs.writeFileSync(outputStream, prettyHtml);//save to file
				}

				else outputStream.send(output);//send to browser
			}
		);
	}
	

}

let app = new App();

if (htmlOutput) {
	if( app.outputPath.length > 0 && !fs.existsSync(app.outputPath) ) fs.mkdirSync(app.outputPath, { recursive: true });
	app.generateHTML();

	if (!isForOnlineDemo) {
		// save the list of required assets to be put in final zip file
		// because 'render' function is async, we do this on 'exit'
		process.on('exit', () => {
			let requireDemoAssets = HbsHelpers.getRequiredAssets();
			requireDemoAssets = [...new Set(requireDemoAssets)]; //convert to `Set` to remove duplicates
			requireDemoAssets = requireDemoAssets.filter((item) => item.match(/node_modules/))
			requireDemoAssets = requireDemoAssets.map(item => {			
				return item.replace(/^(\W)*node_modules/ , 'node_modules')

				// or include the whole folder (but package size will be too much)
				// return item.replace(/^(?:\W)*(node_modules\/(?:[^\/]+)).*$/ , '$1')
			});
			fs.writeFileSync("required-assets.txt", JSON.stringify(requireDemoAssets, null, "  "))
		});
	}
}

else {
	app.runServer();
}

