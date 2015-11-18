Zotero.ZippyAddField = {

	AddField: function(items) {
		alert(items.toSource()); 
		for (i = 0; i < items.length; i++) {
				var item = items[i];
				alert(item.id);
				// use item.id to do the query
			}
	}

}