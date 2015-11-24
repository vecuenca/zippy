Zotero.ZippyRefresh = {

	Refresh: function(id){
		alert("refresh");
		var win = Components.classes["@mozilla.org/appshell/window-mediator;1"]
						.getService(Components.interfaces.nsIWindowMediator)
						.getMostRecentWindow("navigator:browser");
		var tree = win.ZoteroPane.document.getElementById('dynamic-fields');
		alert(tree);
		alert("aaaaaaaaaaaaaaaaa");
		var sql = "SELECT field, content FROM fields WHERE id=?";
		var items = Zotero.ZippyAddField.DB.query(sql, id);
		for (var i = 0; i < items.length; i++) {
			Zotero.ZippyAddField.FreshContent(items[i].field, tree, items[i].content);
		}
	}
}