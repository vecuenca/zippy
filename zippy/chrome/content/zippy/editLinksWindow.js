Zotero.ZippyEditLinksWindow = {

	deleteLink: function() {
		var itemList = document.getElementById("linkList");
		var items = document.getElementsByClassName("listItem");

		for (var i=0; i<items.length; i++) {
			var tableRow = items[i];
			if (tableRow.selected) {
				var result = window.confirm("Are you sure you want to delete this link?");
				if (result) {
					Zotero.ZippyZotero.DB.query("DELETE FROM links WHERE id='"
						+ tableRow.firstChild.getAttribute("srcId") + "' AND link='"
						+ tableRow.lastChild.getAttribute("linkId") + "';");

					itemList.removeChild(tableRow);
				}
			}
		}
	}
}