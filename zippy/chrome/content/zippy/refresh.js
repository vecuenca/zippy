Zotero.ZippyRefresh = {

	Refresh: function(){
		var win = Components.classes["@mozilla.org/appshell/window-mediator;1"]
						.getService(Components.interfaces.nsIWindowMediator)
						.getMostRecentWindow("navigator:browser");
		var id = win.ZoteroPane.getSelectedItems()[0].id;
		var sql = "SELECT field, content FROM fields WHERE id=?";
		var items = Zotero.ZippyAddField.DB.query(sql, id);
		for (var i = 0; i < items.length; i++) {
			Zotero.ZippyAddField.FreshContent(items[i].field, items[i].content);
		}
	}
}