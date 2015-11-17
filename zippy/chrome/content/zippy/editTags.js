Zotero.ZippyOpenDialogs = {

	EditMultipleTags: function() {
		var somefile = document.getElementById('zippy-zotero-strings').value;
		var all_tags = Zotero.Tags.getAll();
		window.openDialog("chrome://zippy/content/editTags.xul","editAllTags", "chrome",somefile, all_tags);
	},

	OpenItemLinksDiag: function() {
		var somefile = document.getElementById('zippy-zotero-strings').value;
		var linksTable = Zotero.ZippyZotero.DB.query("SELECT * from links;");

		var linkedItems = [];
	    for (var i = 0; i < linksTable.length; i++) {
	        var srcItem = Zotero.Items.get(linksTable[i].id);
	        var linkItem = Zotero.Items.get(linksTable[i].link);
	        linkedItems.push({srcTitle: srcItem.getField("title"),
	        	linkTitle: Zotero.Groups.getByLibraryID(linkItem.libraryID).name,
	        	srcId: srcItem.id,
	        	linkId: linkItem.id});
	    }

		window.openDialog("chrome://zippy/content/editLinks.xul", "editItemLinks",
			"chrome", somefile, linkedItems);
	}

}