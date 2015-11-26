"use strict";
Zotero.ZippyUpdateFields = {
	init: function() {
		var win = Components.classes["@mozilla.org/appshell/window-mediator;1"]
						.getService(Components.interfaces.nsIWindowMediator)
						.getMostRecentWindow("navigator:browser");
		win.document.getElementById("zotero-items-tree").addEventListener("select", function(event) {Zotero.ZippyRefresh.FindItem();},false);

	}
}
// Initialize the utility
window.addEventListener("load", function(e) {
	Zotero.ZippyUpdateFields.init();
}, false);