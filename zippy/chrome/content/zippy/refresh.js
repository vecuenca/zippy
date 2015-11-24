Zotero.ZippyRefresh = {

	Refresh: function(id){
		var sql = "SELECT field, content FROM fields WHERE id=?";
		var win = Components.classes["@mozilla.org/appshell/window-mediator;1"]
						.getService(Components.interfaces.nsIWindowMediator)
						.getMostRecentWindow("navigator:browser");
		var items = win.Zotero.ZippyAddField.DB.query(sql, id);
		for (var i = 0; i < items.length; i++) {
			Zotero.ZippyAddField.FreshContent(items[i].field, items[i].content);
		}
	}
}