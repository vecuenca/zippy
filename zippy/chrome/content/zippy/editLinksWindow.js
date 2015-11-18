Zotero.ZippyEditLinksWindow = {

	deleteLink: function() {
		var itemList = document.getElementById("linkList");
		var items = document.getElementsByClassName("listItem");

		for (var i=0; i<items.length; i++) {
			if (items[i].selected) {
				var result = window.confirm("Are you sure you want to delete this link?");
				if (result) {
					//run the query to delete the link
					Zotero.ZippyZotero.DB.query("DELETE FROM links WHERE id='"
						+ items[i].firstChild.getAttribute("srcId") + "' AND link='"
						+ items[i].lastChild.getAttribute("linkId") + "';");

					//remove row from the DOM
					itemList.removeChild(items[i]);
				}
			}
		}
	}
}