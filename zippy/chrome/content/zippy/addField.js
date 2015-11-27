/* jshint shadow:true */
"use strict";
Zotero.ZippyAddField = {

	DB: null,
	tree: null,
	win: null,

	/* initalize */
	init: function() {
		this.DB = new Zotero.DBConnection("zippy");
		this.win = Components.classes["@mozilla.org/appshell/window-mediator;1"]
						.getService(Components.interfaces.nsIWindowMediator)
						.getMostRecentWindow("navigator:browser");
		this.tree = this.win.ZoteroPane.document.getElementById('dynamic-fields');
		if (!this.DB.tableExists("fields")) {
			this.DB.query("CREATE TABLE fields (id varchar(255), field varchar(255),content varchar(255))");
		}
	},

	/* Add, and name new input field and its' content */
	AddField: function(items) {
		for (var i = 0; i < items.length; i++) {
				var item = items[i];
				var fieldname = document.getElementById('enter-name').value;
				var content = document.getElementById('enter-content').value;

				var selectSql = "SELECT field, content FROM fields WHERE id=?";
				var checkItems = Zotero.ZippyAddField.DB.query(selectSql, item.id);
				var pn = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                        .getService(Components.interfaces.nsIPromptService);

				var ItemExist = false;
				if(checkItems){
					for (var i = 0; i < checkItems.length; i++) {
						if((checkItems[i].field == fieldname) && (checkItems[i].content == content)){
							ItemExist = true;
							pn.alert(null, null, "Input field exists.");
						}
					}
				}
				if(!ItemExist){
				/* submit into sql databases */
				var sql = "INSERT INTO fields VALUES (?,?,?)";
				Zotero.ZippyAddField.DB.query(sql, [item.id,fieldname,content]);
				Zotero.ZippyAddField.FreshContent(fieldname, content, item.id);
				pn.alert(null, "Congratulation", "New Field added successfully!");
				}
			}
	},


	RemoveField: function(fieldname, content, id, rowid){
		var sql = "DELETE FROM fields WHERE id = ? AND field = ? AND content = ?";
		Zotero.ZippyAddField.DB.query(sql, [id, fieldname, content]);
		var row = this.win.ZoteroPane.document.getElementById(rowid);
		this.tree.removeChild(row);
	},

	/* Create new field and content in database */
	FreshContent: function(fieldname, content, id) {

		var row = document.createElement("row");
		var label = document.createElement("label");
		var label2 = document.createElement("label");
		var button = document.createElement("button");
		
		// insert into database
		row.setAttribute('id', id+":"+fieldname + ":" + content);
		label.setAttribute('value', fieldname+":");
		label2.setAttribute('value', content);
		button.setAttribute('label', "remove");

		row.appendChild(label);
		row.appendChild(label2);
		row.appendChild(button);
		
		this.tree.appendChild(row);

		button.addEventListener("click", function(event) {Zotero.ZippyAddField.RemoveField(fieldname,content,id, id+":"+fieldname + ":" + content);},false);
	},

}

// Initialize the utility
window.addEventListener("load", function(e) {
	Zotero.ZippyAddField.init();
}, false);
