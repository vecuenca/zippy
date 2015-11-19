Zotero.ZippyEditLinksWindow = {

	deleteLink: function() {
		var linkTree = document.getElementById("linkTree");
		var selection = linkTree.view.getItemAtIndex(linkTree.currentIndex);

		if (selection) {
			var result = window.confirm("Are you sure you want to delete this link?");
			if (result) {
				var cellText = linkTree.view.getCellText(linkTree.currentIndex, linkTree.columns.getColumnAt(0));
				Zotero.ZippyZotero.DB.query("DELETE FROM links WHERE id='"
					+ selection.firstChild.firstChild.getAttribute("srcId") + "' AND link='"
					+ selection.firstChild.lastChild.getAttribute("linkId") + "';");

				selection.remove();
			}
		}
	}
}