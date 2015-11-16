Zotero.ZippyOpenDialogs = {

	EditMultipleTags: function() {
		var somefile=document.getElementById('zippy-zotero-strings').value;
		var all_tags = Zotero.Tags.getAll();
		window.openDialog("chrome://zippy/content/editTags.xul","editAllTags", "chrome",somefile, all_tags);
	}

}