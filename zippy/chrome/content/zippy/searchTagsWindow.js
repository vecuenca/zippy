Zotero.ZippySearchTagsWindow = {

	SearchTagsWin: function() {

    var tagvalue = document.getElementById('find-tag').value;

    alert(tagvalue);

    var tags = Zotero.Tags.getAll();

    for (var tag in tags) {
        var tagadd = tags[tag]['_id'];
        
        if (tagvalue != tags[tag]['_name']){
          var checkbox = document.getElementById(tagadd);
          var garbage = checklist.removeChild(checkbox);
        }
    }

	}

}