/* jshint shadow:true */
"use strict";
Zotero.ZippyAddField = {

	DB: null,
	tree: null,

	/* initalize */
	init: function() {
		this.DB = new Zotero.DBConnection("zippy");
		var win = Components.classes["@mozilla.org/appshell/window-mediator;1"]
						.getService(Components.interfaces.nsIWindowMediator)
						.getMostRecentWindow("navigator:browser");
		this.tree = win.ZoteroPane.document.getElementById('dynamic-fields');
		if (!this.DB.tableExists("fields")) {
			this.DB.query("CREATE TABLE fields (id varchar(255), field varchar(255),content varchar(255))");
		}
		win.document.getElementById("zotero-pane").addEventListener("select", function(event) { Zotero.ZippyRefresh.Refresh();},false);
	},

	/* Add, and name new input field and its' content */
	AddField: function(items, tree) {
		for (var i = 0; i < items.length; i++) {
				var item = items[i];
				var fieldname = document.getElementById('enter-name').value;
				var content = document.getElementById('enter-content').value;

				var selectSql = "SELECT field, content FROM fields WHERE id=?";
				var checkItems = Zotero.ZippyAddField.DB.query(selectSql, item.id);

				var ItemExist = false;
				if(checkItems){
					for (var i = 0; i < checkItems.length; i++) {
						if((checkItems[i].field == fieldname) && (checkItems[i].content == content)){
							ItemExist = true;
							alert("Input field exists");
						}
					}
				}
				if(!ItemExist){
				/* submit into sql databases */
				var sql = "INSERT INTO fields VALUES (?,?,?)";
				Zotero.ZippyAddField.DB.query(sql, [item.id,fieldname,content]);
				Zotero.ZippyAddField.FreshContent(fieldname, content);
				}
			}
	},

	/* Create new field and content in database */
	FreshContent: function(fieldname, content) {

		var row = document.createElement("row");
		var label = document.createElement("label");
		var label2 = document.createElement("label");

		// insert into database
		label.setAttribute('value', fieldname+":");
		label2.setAttribute('value', content);
		row.appendChild(label);
		row.appendChild(label2);
		this.tree.appendChild(row);
	},

}

// Initialize the utility
window.addEventListener("load", function(e) {
	Zotero.ZippyAddField.init();
}, false);
