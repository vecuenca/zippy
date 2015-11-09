Zotero.ZippyMergeTagsWindow = {

	MergeTagsWin: function(tags, input) {
    var tagIDs = [];
    var checklist = document.getElementById('tagsList');
    for (var tag in tags) {
        var tagadd = tags[tag]['_id'];
        var checked = document.getElementById(tagadd).checked;
        if (checked){
          tagIDs.push(tagadd);
        }
    }
    alert(tagIDs);

    for (var key in input) {
      alert(input[key]);
      Zotero.DB.beginTransaction();
            
      for (var i=0; i<tagIDs.length; i++) {
        Zotero.Tags.rename(tagIDs[i], input[key]);
      }
            
      Zotero.DB.commitTransaction();

      for (var tag in tags) {
        var tagadd = tags[tag]['_id'];
        var checked = document.getElementById(tagadd).checked;
        if (checked){
          var checkbox = document.getElementById(tagadd);
          var garbage = checklist.removeChild(checkbox);
        }
      }

      var all_tags = Zotero.Tags.getAll();
      for (var ntag in all_tags) {
        var tagaddn = tags[ntag]['_id'];
        if (tagIDs.indexOf(tagaddn) == -1) {
                var newtagID = tagaddn;
                break;
      }
    }

      var addcheck = document.createElement('checkbox');
      addcheck.setAttribute('label', input[key] );
      addcheck.setAttribute('id', newtagID );
      checklist.appendChild(addcheck);
    
	}
}

}