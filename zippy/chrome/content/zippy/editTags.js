Zotero.ZippyEditTags = {

	EditMultipleTags: function() {
		var all_tags = Zotero.Tags.getAll();
		window.openDialog("chrome://zippy/content/editTags.xul","editAllTags", "chrome", all_tags);
	}

}