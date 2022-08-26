'use strict'

const resolve = require('./app-resolve');
const constants = require('./constants');

const SPLIT_REGEX = /\s*[;+|&\s]\s*/

module.exports = class AssetFinder {
	
	//get file receives a name, and returns the relevant CSS or JS file path for it, whether it requires a glob search, etc
	static GetFile(name, type='js') {
		let parts = name.match(/([^\@]+)\@(.+)/);
		//a wildcard search maybe or looking for a file in a specified package
		//the '@' character shouldn't be the first character, because some packages like @fortawesome start with @
		if(parts && parts[1] && parts[2]) {
			let pkg = parts[2] || null;
			if( parts[1].match(/\*/)) return resolve.Glob(parts[1] , pkg);
			else return resolve.File(parts[1] , pkg);//get a specific file
		}
		return type == 'js' ? resolve.Js(name) : resolve.Css(name);
	}
	
	static GetJs(name) {
		return this.GetFile(name, 'js');
	}
	static GetCss(name) {
		return this.GetFile(name, 'css');
	}
	
	///////////////
	
	//names is a list of package names like "bootstrap + jquery"
	static GetFiles(names, type='js') {
		let resultFiles = [];
		
		let files = names.split(SPLIT_REGEX);
		for(let file of files) {
			let res = this.GetFile(file, type);
			if(res == null)continue;
			
			if(Array.isArray(res)) 
				resultFiles = resultFiles.concat(res);
			else resultFiles.push(res);
		}

		
		return resultFiles;
	}
	
	static GetJsFiles(names) {
		return this.GetFiles(names, 'js');
	}
	static GetCssFiles(names) {
		return this.GetFiles(names, 'css');
	}
	
	///////////////
	//convert local file's path to CDN(jsdelivr.com) path
	static _localToCDN(fileName, pkgName, min, version) {
		let rx = new RegExp('.*node_modules/' + pkgName.replace('.', '\\.'));//escape '.' in package name
		let replacement = constants.CDN == 'unpkg' ? `${pkgName}` : (`npm/${pkgName}` + (version ? `@${version}` : '')); 
		let cdnFile = fileName.replace(rx , replacement);
		if(min) cdnFile = cdnFile.replace( /(\.min)?\.(js|css)$/ , '.min.$2' );
		
		return cdnFile;
	}

	static GetCdnFiles(names, type='js', min=true) {
		let resultFiles = [];
		
		let files = names.split(SPLIT_REGEX);
		for(let name of files) {
			let res = this.GetFile(name, type);

			if(res == null) continue;
			else if(Array.isArray(res)) {//it was a glob, so we have a list of files
				let parts = name.split('@', 1);
				let pkgName = parts[1] || '';
				
				if(pkgName) {
				  let version = resolve.PkgVer(pkgName);
				  for(let _res of res) if(_res != null) {
					let cdnFile = this._localToCDN(_res, pkgName, min, version);					
					resultFiles.push({file: cdnFile, pkg: pkgName});
				  }
				}
			}
			else {
				let parts = name.match(/([^\@]+)\@(.+)/);
				let pkgName = parts && parts[2] ? parts[2] : name;

				let version = resolve.PkgVer(pkgName);
				let cdnFile = this._localToCDN(res, pkgName, min, version);
				resultFiles.push({file: cdnFile, pkg: pkgName});
			}
		}
		
		return resultFiles;
	}


	
	
	static _addCdnPrefix(result) {
		return constants.CDN == 'unpkg' ? `https://unpkg.com/${result}` : `https://cdn.jsdelivr.net/${result}`;
	}	
	static _combinedCdnFile(result) {
		var files = [];
		for(let _file of result) {
			files.push(_file.file);
		}
		return [{pkg: null, file: 'combine/'+files.join(',')}]
	}

	static GetCdnJsFiles(files, min=true, combine=false) {
		var result = this.GetCdnFiles(files, 'js', min);
		combine = combine && constants.CDN_COMBINE && result.length > 1 && constants.CDN == 'jsdelivr';
		result = combine ? this._combinedCdnFile(result) : result;

		let _files = [];
		for(let f = 0 ; f < result.length; f++) {
			_files.push( result[f].pkg == 'ace' ? result[f].file : this._addCdnPrefix(result[f].file));
		}

		return _files;
	}

	static GetCdnCssFiles(files, min=true, combine=false) {
		var result = this.GetCdnFiles(files, 'css', min);
		combine = combine && constants.CDN_COMBINE && result.length > 1 && constants.CDN == 'jsdelivr';
		result = combine ? this._combinedCdnFile(result) : result;
		
		let _files = [];
		for(let f = 0 ; f < result.length; f++) {
			_files.push( result[f].pkg == 'ace' ? result[f].file : this._addCdnPrefix(result[f].file));
		}

		return _files;
	}
	
	/////
	
	/**
	static GetDistFiles(files, dist='cdn', type='js', min=true) {
		if(dist == 'cdn') {
			return this.GetCdnFiles(files, type, min);
		}
		
		else if(dist == 'bundle') {
			//to be done later
			//let resultFiles = [];
			//files = files.split(SPLIT_REGEX);
		}
		else if(dist.match(/(js|css)$/i)) {
			//dist is a file?
			var res = resolve.relativePath(resolve.AppDir() + '/' + dist);
			if(min) res = res.replace( /(\.min)?\.(js|css)$/ , '.min.$2' );
			return [res];
		}
		
		return [];
	}
	*/
	
}
