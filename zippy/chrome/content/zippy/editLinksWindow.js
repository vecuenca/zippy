"use strict";
Zotero.ZippyEditLinksWindow = {

	/**
	 * Generate all the data required for the linked fields configuration dialog
	 * (the ids and names of the fields, as well as whether they're already synced or not)
	 * and opens the dialog.
	 */
	openConfigLinkFields: function() {
		var itemFields = [];
		var linkTree = document.getElementById("linkTree");
		var selection = linkTree.view.getItemAtIndex(linkTree.currentIndex);
		var srcItem = Zotero.Items.get(selection.firstChild.firstChild.getAttribute("srcId"));
		var linkItemId = selection.firstChild.lastChild.getAttribute("linkId");

		if (selection) {
			// get all fields of item, their ids, and if they are already synced

			var itemTypeFields = Zotero.ItemFields.getItemTypeFields(srcItem.itemTypeID);

			for (var i = 0; i < itemTypeFields.length; i++) {
				var syncedFields = JSON.parse(Zotero.ZippyZotero.DB.query("SELECT data FROM links WHERE id='" + srcItem.id + "' AND link='" + linkItemId + "';"));
				itemFields.push({fieldId: itemTypeFields[i],
					fieldName: Zotero.ItemFields.getName(itemTypeFields[i]),
					isSynced: syncedFields.indexOf(itemTypeFields[i]) > -1 ? true : false})
			}
		}
		window.openDialog("chrome://zippy/content/editLinkFields.xul", "editLinkFields", "chrome", itemFields, srcItem.id, linkItemId);
	},

	/**
	 * If an item is selected in this window, prompts the user to delete the
	 * link between items (and actually deletes it).
	 */
	deleteLink: function() {
		var linkTree = document.getElementById("linkTree");
		var selection = linkTree.view.getItemAtIndex(linkTree.currentIndex);

		if (selection) {
			var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                        .getService(Components.interfaces.nsIPromptService);

			var result = prompts.confirm(null, "Delete Item Link", "Are you sure you want to delete this item link?");
			if (result) {
				Zotero.ZippyZotero.DB.query("DELETE FROM links WHERE id='" +
					selection.firstChild.firstChild.getAttribute("srcId") + "' AND link='" +
					selection.firstChild.lastChild.getAttribute("linkId") + "';");

				selection.remove();
			}
		}
	}
}