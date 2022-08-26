'use strict'
var path = require('path')
var fs = require('fs')
var archiver = require('archiver')

const isForOnlineDemo = process.env.PACKAGE === 'demo'

var base = process.cwd() === __dirname ? '../' : ''
const pkg = require(path.join(__dirname, '/../package.json'))

var packageName = `${base}${isForOnlineDemo ? 'demo' : 'ace'}-v${pkg.version}`
var output = fs.createWriteStream(`${packageName}.zip`)
var _htmlPrefix = isForOnlineDemo ? '' : 'ace'
var _docPrefix = isForOnlineDemo ? '' : 'docs'
var _angularPrefix = isForOnlineDemo ? '' : 'ace-angular'


var archive = archiver('zip')

output.on('end', function () {
  console.log('Data has been drained')
})

// good practice to catch warnings (ie stat failures and other non-blocking errors)
archive.on('warning', function (err) {
  if (err.code === 'ENOENT') {
    // log warning
  } else {
    // throw error
    throw err
  }
})

// good practice to catch this error explicitly
archive.on('error', function (err) {
  throw err
})

archive.pipe(output)

var list = []

if (isForOnlineDemo) {
  list = [
    'app/browser/demo.min.js',
    'assets/image',
    'assets/favicon.png',
    'dist/**/**/*.min.js',    
    'dist/**/**/*.min.css',
    'dist/**/**/*.map',
    'html'
  ]
} else {
  list = [
    'assets',
    'build',
    'dist',
    'html',
    'js',
    'scss',
    'app',
    'views',

    'index.js',
    'package.json',
    'package-lock.json',
    'npm-shrinkwrap.json',
    '.gitignore',
    '.env',
    '.babelrc',
    '.browserslistrc',
    'changelog.md',
    'README.md' 
  ]
}

for (var item of list) {
  if (item.indexOf('*') >= 0) {
    archive.glob(`${base}${item}`, {}, {prefix: _htmlPrefix})
    continue
  }
  if (!fs.existsSync(`${base}${item}`)) continue

  if (fs.lstatSync(`${base}${item}`).isDirectory()) {
    archive.directory(`${base}${item}`, _htmlPrefix + '/' + item)
  } else {
    archive.file(`${base}${item}`, {name: item , prefix: _htmlPrefix})
  }
}



if (!isForOnlineDemo) {
  // add documentation files
  var docFiles = {
    'assets/style.css' : '../ace-docs/assets/style.css',
    'assets/favicon.png' : '../ace-docs/assets/favicon.png',
    'assets/docs.js': '../ace-docs/assets/docs.js',
    'assets/search.js': '../ace-docs/assets/search.js',
    'assets/search-index.js': '../ace-docs/assets/search-index.js',
    'images' : '../ace-docs/images',
    '' : 'docs'
  }

  for (var name in docFiles) {
    var item = docFiles[name];
    if (item.indexOf('*') >= 0) {
      archive.glob(`${base}${item}`, {}, {prefix: _docPrefix})
      continue
    }
    if (!fs.existsSync(`${base}${item}`)) continue

    if (fs.lstatSync(`${base}${item}`).isDirectory()) {
      archive.directory(`${base}${item}`,  _docPrefix + '/' + name)
    } else {
      archive.file(`${base}${item}`, { name: name , prefix: _docPrefix })
    }
  }


  var angularFiles = {
    'projects' : '../ace-angular/projects',
    '.editorconfig' : '../ace-angular/.editorconfig',
    '.gitignore': '../ace-angular/.gitignore',
    'angular.json': '../ace-angular/angular.json',
    'package.json': '../ace-angular/package.json',
    'package-lock.json' : '../ace-angular/package-lock.json',
    'README.md' : '../ace-angular/README.md',
    'tsconfig.json' : '../ace-angular/tsconfig.json',
    'tslint.json' : '../ace-angular/tslint.json'
  }

  for (var name in angularFiles) {
    var item = angularFiles[name];
    if (item.indexOf('*') >= 0) {
      archive.glob(`${base}${item}`, {}, {prefix: _angularPrefix})
      continue
    }
    if (!fs.existsSync(`${base}${item}`)) continue

    if (fs.lstatSync(`${base}${item}`).isDirectory()) {
      archive.directory(`${base}${item}`,  _angularPrefix + '/' + name)
    } else {
      archive.file(`${base}${item}`, { name: name , prefix: _angularPrefix })
    }
  }

  // add required node_modules files
  try {
    var assetsList = fs.existsSync('required-assets.txt') ? fs.readFileSync('required-assets.txt') : "[]"
    // if (fs.existsSync('required-assets.txt')) fs.unlinkSync('required-assets.txt')

    assetsList = JSON.parse(assetsList)

    assetsList.push('node_modules/@fortawesome/fontawesome-free/webfonts')
    assetsList.push('node_modules/jam-icons/fonts')
    assetsList.push('node_modules/eva-icons/style/fonts')
    assetsList.push('node_modules/photoswipe/dist/default-skin/default-skin.png')
    assetsList.push('node_modules/photoswipe/dist/default-skin/default-skin.svg')
    assetsList.push('node_modules/photoswipe/dist/default-skin/preloader.gif')

    //assets required for documentation
    assetsList.push('../ace-docs/node_modules/bootstrap/dist/css/bootstrap-reboot.css')
    assetsList.push('../ace-docs/node_modules/prism-themes/themes/prism-material-light.css')
    assetsList.push('../ace-docs/node_modules/prismjs/plugins/line-highlight/prism-line-highlight.css')
    assetsList.push('../ace-docs/node_modules/prismjs/prism.js')
    assetsList.push('../ace-docs/node_modules/prismjs/plugins/line-highlight/prism-line-highlight.js')
    assetsList.push('../ace-docs/node_modules/mark.js/dist/jquery.mark.js')
    assetsList.push('../ace-docs/node_modules/lunr/lunr.js')

    for (var item of assetsList) {
      if (!fs.existsSync(`${base}${item}`)) continue

      if (fs.lstatSync(`${base}${item}`).isFile()) {    
        archive.file(`${base}${item}`, { name: item.replace('../ace-docs/', '') , prefix: _htmlPrefix })
      }
      else {
        archive.directory(`${base}${item}`, _htmlPrefix + '/' + item)
      }
    }
  } 
  catch(e) {
    console.log(e)
  }

  archive.append("<html><head><meta charset='utf-8' /><meta http-equiv='refresh' content='0; url=./html/dashboard.html' /></head></html>", { name: 'index.html' , prefix: _htmlPrefix })
}

else {
  archive.append("<html><head><meta charset='utf-8' /><meta http-equiv='refresh' content='0; url=./html/dashboard.html' /></head></html>", { name: 'index.html' , prefix: _htmlPrefix })
}



archive.finalize()
