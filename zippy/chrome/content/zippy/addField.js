/* jshint shadow:true */
"use strict";
Zotero.ZippyAddField = {

	DB: null,


	init: function() {
		this.DB = new Zotero.DBConnection("zippy");

		if (!this.DB.tableExists("fields")) {
			this.DB.query("CREATE TABLE fields (id varchar(255), field varchar(255),content varchar(255))");
		}
	},


	AddField: function(items, tree) {
		for (var i = 0; i < items.length; i++) {
				var item = items[i];
				var fieldname = document.getElementById('enter-name').value;
				var content = document.getElementById('enter-content').value;
				alert(this.DB);
				var sql = "INSERT INTO fields VALUES (?,?,?)";
				Zotero.ZippyAddField.DB.query(sql, [item.id,fieldname,content]);
				alert('sadsa');
				Zotero.ZippyAddField.FreshContent(fieldname, tree, item.id);
				
			}
	},

	FreshContent: function(fieldname, tree, id) {
		alert(tree.childNodes.toSource());
		var row = document.createElement("row");
		var label = document.createElement("label");
		label.setAttribute('value', '-------');
		label.setAttribute('fieldname', fieldname);
		row.appendChild(label);
		alert("xxxxxxx");
		tree.appendChild(row);
	}
}

// Initialize the utility
window.addEventListener("load", function(e) {
	Zotero.ZippyAddField.init();
}, false);