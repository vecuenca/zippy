/* jshint shadow:true */
"use strict";
Zotero.ZippyAddField = {

	DB: null,
	tree: null,


	init: function() {
		this.DB = new Zotero.DBConnection("zippy");
		var win = Components.classes["@mozilla.org/appshell/window-mediator;1"]
						.getService(Components.interfaces.nsIWindowMediator)
						.getMostRecentWindow("navigator:browser");
		this.tree = win.ZoteroPane.document.getElementById('dynamic-fields');
		if (!this.DB.tableExists("fields")) {
			this.DB.query("CREATE TABLE fields (id varchar(255), field varchar(255),content varchar(255))");
		}
	},


	AddField: function(items, tree) {
		for (var i = 0; i < items.length; i++) {
				var item = items[i];
				var fieldname = document.getElementById('enter-name').value;
				var content = document.getElementById('enter-content').value;
				var sql = "INSERT INTO fields VALUES (?,?,?)";
				Zotero.ZippyAddField.DB.query(sql, [item.id,fieldname,content]);
				Zotero.ZippyAddField.FreshContent(fieldname, content);
				
			}
	},

	FreshContent: function(fieldname, content) {
		
		var row = document.createElement("row");
		var label = document.createElement("label");
		var label2 = document.createElement("label");
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