Zotero.ZippyFields = {

	addFields: function(){
		var items = ZoteroPane.getSelectedItems();
		var tree = ZoteroPane.document.getElementById('dynamic-fields');
		window.openDialog("chrome://zippy/content/addFields.xul","addNewFileds", "chrome", items, tree);
	}

}