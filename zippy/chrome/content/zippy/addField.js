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
				alert(this.DB);
				var sql = "INSERT INTO fields VALUES (?,?,?)";
				Zotero.ZippyAddField.DB.query(sql, [item.id,fieldname,content]);
				alert('sadsa');
				Zotero.ZippyAddField.FreshContent(fieldname);
				
			}
	},

	FreshContent: function(fieldname) {
		alert("=====");
		var newRow = "<treecol id='fieldname' primary='true' label='fieldname' flex='4' persist='width ordinal hidden sortActive sortDirection'/><splitter class='tree-splitter'/>";
		alert("xxxxxxx");
		var tree = document.getElementById('zotero-items-columns-header');
		alert("gggg");
		tree.appendChild(newRow);
		alert("dasdasdasdas");

	}
}

// Initialize the utility
window.addEventListener("load", function(e) {
	Zotero.ZippyAddField.init();
}, false);