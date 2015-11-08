Zotero.ZippyEditTagsWindow = {

	EditTagsWin: function(tags) {
		var tagIDs = [];
    	for (var key in tags) {
        var tagadd = tags[key]['_id'];
        var checked = document.getElementById(tagadd).checked;
        if (checked){
          tagIDs.push(tagadd);
        }
    }
    alert(tagIDs);
    Zotero.DB.beginTransaction();
    Zotero.Tags.erase(tagIDs);
	Zotero.Tags.purge(tagIDs);
	Zotero.DB.commitTransaction()
	

	}

}