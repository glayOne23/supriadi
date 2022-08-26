'use strict'

const path = require('path');
const resolve = require('resolve');
const resolvePkg = require('resolve-pkg');
const pkgDir = require('pkg-dir');
const relative = require('relative');
const glob = require('glob');
const fs = require('fs');

const constants = require('./constants');

module.exports = class AppResolve {

 static relativePath(path, to=null) {
 	return relative(!to ? process.cwd() + '/' : to, path)
		  .replace(/[\\\/]+/g, '/')
		  .replace(/^([^../|./])/ , './$1');//if relative path doesn't start with './' or '../' prepend it for node to be able to locate/access files correctly
 }

 static HomeDir() {
   return this.relativePath(pkgDir.sync());
 }
 static AppDir() {
   return this.HomeDir() + '/' + constants.APP_FOLDER;
 }
 static AppDirAbs() {
	return pkgDir.sync() + '/' + constants.APP_FOLDER;
 }

 static Js(name) {
  var path = null;
  try {
	path = resolve.sync(name);
  }
  catch(e) {}

  return path ? this.relativePath(path) : null;
 }


 static Css(name) {
  var path = null;
  try {
	  path = resolve.sync(name, {packageFilter: function(pkg, root) {
	  pkg.main = pkg.style
		? pkg.style
		: /\.css$/.test(pkg.main)
		? pkg.main
		: pkg.main.replace(/(\W)(js)(\W|$)/g , '$1css$3')//replace "js" with "css"

	  return pkg
	 }});
  }
  catch(e) {}
 
  return path ? this.relativePath(path) : null;
 }



 static Glob(pattern, pkgName=null) {
  var pkgDir = null;
  
  if(pkgName) {
    if(pkgName == 'app') {
      pkgDir = this.AppDir();
    }
    else if(pkgName == 'ace') {
      pkgDir = this.HomeDir();
    }
    else {
      var isJS = !pattern.match(/\.css$/i);
      pkgDir = isJS ? this.JsDir(pkgName) : this.CssDir(pkgName);
      if(!pkgDir) pkgDir = this.relativePath(pkgName);//if no such node package, use pkgDir as the starting folder to perform the glob search
    }
  }
  
  var findPattern = pkgDir ? `${pkgDir}/${pattern}` : pattern;  
  var files = glob.sync(findPattern, {});
  
  if(!files || files.length == 0) return null;
  return files;
 }


 //get a specific file
 static File(file, pkgName=null) {
  var pkgDir = null;

  if(pkgName) {
    if(pkgName == 'app') {
      pkgDir = this.AppDir();
    }
    else if(pkgName == 'ace') {
      pkgDir = this.HomeDir();
    }
    else pkgDir = this.PkgDir(pkgName);
  }
  
  var file = pkgDir ? `${pkgDir}/${file}` : file;  
  return file;
 }
 

 static JsDir(name) {
  var file = this.Js(name);
  return file ? path.dirname(file) : null;
 }
 static CssDir(name) {
  var file = this.Css(name);
  return file ? path.dirname(file) : null;
 }

 static PkgDir(name) {
  var folder = resolvePkg(name);
  return folder ? this.relativePath(folder) : null;
 }

 static PkgVer(name) {
  var folder = this.PkgDir(name);
  if(folder == null) return false;
  //folder = this.relativePath(folder, __dirname);//require is called from this file's __dirname


  var pkgInfo = {};
  try {
    pkgInfo = JSON.parse(fs.readFileSync(folder + '/package.json', 'utf-8'));
  }
  catch(e) {}

  return pkgInfo.version || false;
 }
  
}
