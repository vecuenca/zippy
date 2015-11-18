/* 
* Functionality for merging tags in zippy, through Zotero's javascript API.
*/
Zotero.ZippyMergeTagsWindow = {

  MergeTagsWin: function(input) {
    var tags = Zotero.Tags.getAll();
    var tagIDs = [];
    var checklist = document.getElementById('tagsList');

    // get Zotero obj of selected tags
    for (var tag in tags) {
        var tagadd = tags[tag]['_id'];
        var checked = document.getElementById(tagadd).checked;
        if (checked){
          tagIDs.push(tagadd);
          var checkbox = document.getElementById(tagadd);
          var garbage = checklist.removeChild(checkbox);
        }
    }

    // rename selected tags to new merge tag name
    for (var key in input) {
      Zotero.DB.beginTransaction();

      for (var i=0; i<tagIDs.length; i++) {
        Zotero.Tags.rename(tagIDs[i], input[key]);
      }

      Zotero.DB.commitTransaction();
      Zotero.wait();
      var newTags = Zotero.Tags.getAll();
      
      for (var each in newTags) {
        if (newTags[each]['_name']==input[key]) {
          var newID=newTags[each]['_id']
        };
      }

      var addcheck = document.createElement('checkbox');
      addcheck.setAttribute('label', input[key]);
      addcheck.setAttribute('id', newID);
      checklist.appendChild(addcheck);
    }
  }
}