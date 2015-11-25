/* 
* Functionality for tag editing feature in zippy, through Zotero's javascript API.
*/
Zotero.ZippyEditTagsWindow = {

  EditTagsWin: function() {
    var tags = Zotero.Tags.getAll();
    var tagIDs = [];
    var checklist = document.getElementById('tagsList');

    // initalization of tag list checkboxes and check box status
    for (var key in tags) {
      var tagadd = tags[key]['_id'];
      var checked = document.getElementById(tagadd).checked;

      if (checked){
        tagIDs.push(tagadd);
        var checkbox = document.getElementById(tagadd);
        var garbage = checklist.removeChild(checkbox);
      }
    }

    // Zotero database handling
    Zotero.DB.beginTransaction();
    Zotero.Tags.erase(tagIDs);
    Zotero.Tags.purge(tagIDs);
    Zotero.DB.commitTransaction();
  }
}