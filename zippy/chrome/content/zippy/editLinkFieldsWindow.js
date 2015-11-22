Zotero.ZippyEditLinkFieldsWindow = {

	/**
	 * Updates the linked fields for this item pair
	 * with the new configuration the user has checked.
	 * @param  {integer} srcId  the id of the source item
	 * @param  {inteer} linkId the id of the linked item
	 * @return {[type]}        [description]
	 */
	doSave: function(srcId, linkId) {
		var checkboxes = document.getElementsByTagName("checkbox");
		var newFields = [];
		for (var i = 0; i < checkboxes.length; i++) {
			if (checkboxes[i].hasAttribute("checked")) {
				newFields.push(checkboxes[i].getAttribute("id"));
			}
		}
		newFields = JSON.stringify(newFields);
		// overwrites the appropriate data column in the DB
		return Zotero.ZippyZotero.DB.query("UPDATE links SET data='" + newFields +
			"' WHERE id='" + srcId +"' AND link='" + linkId + "';")
	}
}