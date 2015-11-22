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


	AddField: function(items) {
		for (var i = 0; i < items.length; i++) {
				var item = items[i];
				var fieldname = document.getElementById('enter-name').value;
				var content = document.getElementById('enter-content').value;
				this.DB.query("INSERT INTO fields (id, field, content) VALUES (" + item.id + "," + fieldname +  "," + content + ")");
			}
	}
}

// Initialize the utility
window.addEventListener("load", function(e) {
	Zotero.ZippyAddField.init();
}, false);