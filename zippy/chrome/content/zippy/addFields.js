Zotero.ZippyFields = {

	addFields: function(){
		var items = ZoteroPane.getSelectedItems();
		window.openDialog("chrome://zippy/content/addFields.xul","addNewFileds", "chrome", items);
	}

}