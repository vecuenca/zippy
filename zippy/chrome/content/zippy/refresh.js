Zotero.ZippyRefresh = {

	FindItem: function(){
		var win = Components.classes["@mozilla.org/appshell/window-mediator;1"]
						.getService(Components.interfaces.nsIWindowMediator)
						.getMostRecentWindow("navigator:browser");
		var items = win.ZoteroPane.getSelectedItems();
		for (var i = 0; i < items.length; i++) {
			var id = items[i].id;
			Zotero.ZippyRefresh.Refresh(id);
		}
	},


	Refresh: function(id){
		var sql = "SELECT field, content FROM fields WHERE id=?";
		var items = Zotero.ZippyAddField.DB.query(sql, id);
		for (var i = 0; i < items.length; i++) {
			Zotero.ZippyAddField.FreshContent(items[i].field, items[i].content);
		}
	}
}