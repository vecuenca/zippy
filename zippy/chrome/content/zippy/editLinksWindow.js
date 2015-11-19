Zotero.ZippyEditLinksWindow = {

	deleteLink: function() {
		var linkTree = document.getElementById("linkTree");
		var selection = linkTree.view.getItemAtIndex(linkTree.currentIndex);

		if (selection) {
			var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                        .getService(Components.interfaces.nsIPromptService);

			var result = prompts.confirm(null, "Delete Item Link", "Are you sure you want to delete this item link?");
			if (result) {
				Zotero.ZippyZotero.DB.query("DELETE FROM links WHERE id='"
					+ selection.firstChild.firstChild.getAttribute("srcId") + "' AND link='"
					+ selection.firstChild.lastChild.getAttribute("linkId") + "';");

				selection.remove();
			}
		}
	}
}