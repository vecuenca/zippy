Zotero.ZippyEditTagsWindow = {

	EditTagsWin: function(tags) {
		var tagIDs = [];
		var checklist = document.getElementById('tagsList');
    	for (var key in tags) {
        var tagadd = tags[key]['_id'];
        var checked = document.getElementById(tagadd).checked;
        if (checked){
          tagIDs.push(tagadd);
          var checkbox = document.getElementById(tagadd);
          var garbage = checklist.removeChild(checkbox);
        }
    }
    Zotero.DB.beginTransaction();
    Zotero.Tags.erase(tagIDs);
	Zotero.Tags.purge(tagIDs);
	Zotero.DB.commitTransaction();

	}

}