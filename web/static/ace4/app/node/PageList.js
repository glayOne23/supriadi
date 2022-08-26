'use strict';

const fs = require('fs');

module.exports = class PageList {

	constructor() {
		this._sidebarList = null;
		this._sidebarID_Map = null;
		this._sidebarItemTree = null;
		this._breadcrumbsList = null;
		
		this._dataPath = null;
		
		this._selectedPageID = null;
		this._lastActiveID = null;
	}
	
	
	//read data json file which includes page info (sidebar items)
	_readDataFile(path) {
		if(path == null) return null;
	
		var data = null;
		
		try {
		  data = JSON.parse(fs.readFileSync(path, 'utf-8'));
		}
		catch(err) {
			//if (!(err instanceof Error) || err.code !== 'MODULE_NOT_FOUND') throw err;
		}
		
		return data;
	}
	
	//sidebar map is a key/val object which is used to lookup nodes. {page_id: page_data_object}
	_makeSidebarMap() {
		this._sidebarList = this._readDataFile(this._dataPath);
		if( this._sidebarList == null ) throw 'Sidebar data not available';
		
		this._sidebarID_Map = {};
		
		for (let item of this._sidebarList) {
			if(item.id) {
				this._sidebarID_Map[item.id] = item;
			}
		}
	}
	
	//a hierarchical tree
	_makeSidebarTree() {
		this._makeSidebarMap();
		
		this._sidebarItemTree = [];		
		//append each item to its parent element
		for (let item of this._sidebarList) {
			if( !item.parent ) {
				item.toplevel = true;//it's a root (toplevel) node. has no parent
				this._sidebarItemTree.push(item);
				continue;
			}
			
			var parentId = item.parent;
			if( this._sidebarID_Map[parentId] ) {
				if( !Array.isArray(this._sidebarID_Map[parentId].children) ) this._sidebarID_Map[parentId].children = [];//create the children array if not already
				this._sidebarID_Map[parentId].children.push(item);
			}
		}
	}

	
	//mark active(selected) item by adding necessary class names to them, and updating breadcrumbs
	_markSelectedItems(activePageID) {
		if( activePageID == null ) return;
		if( this._sidebarItemTree == null ) this._makeSidebarTree();
		
		this._clearPreviousMarks();
		
		this._breadcrumbsList = [];
		
		var currentPageID = activePageID;
		while( currentPageID != false ) {
			var page = this._sidebarID_Map[currentPageID];
			if(!page) break;
			
			this._breadcrumbsList.push(page);
			
			page['className'] = 'active';
			if(currentPageID != activePageID) {
				page['className'] += ' open';//for parent items, add "open" class as well
				page['submenuClassName'] = 'show';
			}
			
			currentPageID = page.parent || false;
		}
		
		this._breadcrumbsList = this._breadcrumbsList.reverse();//so that it's displayed like this : root > parent > current node , etc
		
		this._lastActiveID = activePageID;
	}
	
	
	//unmark previously marked active item
	_clearPreviousMarks() {
		if( this._lastActiveID == null ) return;
		
		var currentID = this._lastActiveID;		
		while( currentID != false ) {
			var page = this._sidebarID_Map[currentID];
			if(!page) break;
			
			page['className'] = false;	
			
			currentID = page.parent || false;
		}
	}
	
	
	
	//////////////
	initSidebarTree() {
		this._makeSidebarTree();
	}
	
	getSidebarTree() {
		if( this._sidebarItemTree == null ) this.initSidebarTree();
		return this._sidebarItemTree || [];
	}
	
	getBreadcrumbs() {
		return this._breadcrumbsList || [];
	}	
	
	setSelectedPage(id, mark=false) {
		this._selectedPageID = id;
		if(mark) this._markSelectedItems(this._selectedPageID);
	}
	updateSelectedPage(id) {
		this.setSelectedPage(id, true);
	}
	setDataFile(path) {
		this._dataPath = path;
	}
	
	getTitle(_id=null) {
		let id = _id ? _id : this._lastActiveID;
		return this._sidebarID_Map[id] ? this._sidebarID_Map[id].title : '';
	}
	getDescription(_id=null) {
		let id = _id ? _id : this._lastActiveID;
		return this._sidebarID_Map[id] ? (this._sidebarID_Map[id].description ? this._sidebarID_Map[id].description : '') : '';
	}

	getLayoutInfo(_id=null) {
		let id = _id ? _id : this._lastActiveID;
		return this._sidebarID_Map[id] ? this._sidebarID_Map[id].layout : null;
	}
}
