Zotero.ZippyEditTags = {

	MergeTags: function() {
		var somefile=document.getElementById('zippy-zotero-strings').value;
		window.openDialog("chrome://zippy/content/editTags.xul","editAllTags", "chrome",somefile);
	}

}