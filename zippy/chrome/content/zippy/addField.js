Zotero.ZippyAddField = {

	DB: null,

	init: function() {
		// Connect to (and create, if necessary) zippy.sqlite in the Zotero directory
		this.DB = new Zotero.DBConnection("zippy");

		if (!this.DB.tableExists("fields")) {
			this.DB.query("CREATE TABLE fields (id varchar(255), field varchar(255), content varchar(255))");
		}
	},


	AddField: function(items) {
		this.DB = new Zotero.DBConnection("zippy");
		for (i = 0; i < items.length; i++) {
				var item = items[i];
				alert(item.id);
				var fieldname = document.getElementById("enter-name");
				var content = document.getElementById("enter-content");
				this.DB.query("INSERT INTO fields (id, field, content) VALUES (" + item.id + "," + fieldname +  "," + content + ")";

			}
	}

}

window.addEventListener("load", function(e) {
	Zotero.ZippyAddField.init();
}, false);