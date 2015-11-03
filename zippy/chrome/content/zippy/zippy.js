Zotero.ZippyZotero = {
	DB: null,
	
	init: function () {
		// Connect to (and create, if necessary) zippy.sqlite in the Zotero directory		
		this.DB = new Zotero.DBConnection('zippy');		
		
		if (!this.DB.tableExists('links')) {
			this.DB.query("CREATE TABLE links (num INT)");
			this.DB.query("INSERT INTO links VALUES (0)");
		}
		// Register the callback in Zotero as an item observer
		var notifierID = Zotero.Notifier.registerObserver(this.notifierCallback, ['item']);
		
		// Unregister callback when the window closes (important to avoid a memory leak)
		window.addEventListener('unload', function(e) {
				Zotero.Notifier.unregisterObserver(notifierID);
		}, false);
	},

	moveAndSync: function() {
		var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
					.getService(Components.interfaces.nsIPromptService);		

		var groupObjs = Zotero.Groups.getAll();
		var groups = [];
		
		for (i = 0; i < groupObjs.length; i++) {
			groups.push(groupObjs[i].name);
		}

		var selected = {};

		var result = prompts.select(null, "Move and Sync Item", "Which group would you like to move and sync to?",
			groups.length, groups, selected);
		
		// User selected a group to move & sync to
		if (result) {
			var items = ZoteroPane.getSelectedItems();
			Zotero.debug(groups);
			
			
			for (i = 0; i < items.length; i++) {
				// id of copied item is different
				var id = Zotero.ZippyZotero.copyItem(items[i], groupObjs[selected.value].libraryID);				
				Zotero.debug("Record: " + items[i].id + " " + id);
			}

			//Update DB to reflect new link
		}
	},

	// For now: sync personal -> group, figure out the other way later
	syncRecords: function(personalRecord, groupRecord) {
		
	},
	
	// This is literally the same function from Zotero's collectionTreeView.js
	copyItem: function(item, targetLibraryID) {
		// Check if there's already a copy of this item in the library
		var linkedItem = item.getLinkedItem(targetLibraryID);
		if (linkedItem) {
			// If linked item is in the trash, undelete it
			if (linkedItem.deleted) {
				// Remove from any existing collections, or else when it gets
				// undeleted it would reappear in those collections
				var collectionIDs = linkedItem.getCollections();
				for each(var collectionID in collectionIDs) {
					var col = Zotero.Collections.get(collectionID);
					col.removeItem(linkedItem.id);
				}
				linkedItem.deleted = false;
				linkedItem.save();
			}
			return linkedItem.id;
			
			/*
			// TODO: support tags, related, attachments, etc.
			
			// Overlay source item fields on unsaved clone of linked item
			var newItem = item.clone(false, linkedItem.clone(true));
			newItem.setField('dateAdded', item.dateAdded);
			newItem.setField('dateModified', item.dateModified);
			
			var diff = newItem.diff(linkedItem, false, ["dateAdded", "dateModified"]);
			if (!diff) {
				// Check if creators changed
				var creatorsChanged = false;
				
				var creators = item.getCreators();
				var linkedCreators = linkedItem.getCreators();
				if (creators.length != linkedCreators.length) {
					Zotero.debug('Creators have changed');
					creatorsChanged = true;
				}
				else {
					for (var i=0; i<creators.length; i++) {
						if (!creators[i].ref.equals(linkedCreators[i].ref)) {
							Zotero.debug('changed');
							creatorsChanged = true;
							break;
						}
					}
				}
				if (!creatorsChanged) {
					Zotero.debug("Linked item hasn't changed -- skipping conflict resolution");
					continue;
				}
			}
			toReconcile.push([newItem, linkedItem]);
			continue;
			*/
		}
		
		// Standalone attachment
		if (item.isAttachment()) {
			var linkMode = item.attachmentLinkMode;
			
			// Skip linked files
			if (linkMode == Zotero.Attachments.LINK_MODE_LINKED_FILE) {
				Zotero.debug("Skipping standalone linked file attachment on drag");
				return false;
			}
			
			if (!itemGroup.filesEditable) {
				Zotero.debug("Skipping standalone file attachment on drag");
				return false;
			}
			
			return Zotero.Attachments.copyAttachmentToLibrary(item, targetLibraryID);
		}
		
		// Create new unsaved clone item in target library
		var newItem = new Zotero.Item(item.itemTypeID);
		newItem.libraryID = targetLibraryID;
		// DEBUG: save here because clone() doesn't currently work on unsaved tagged items
		var id = newItem.save();
		newItem = Zotero.Items.get(id);
		item.clone(false, newItem, false, !Zotero.Prefs.get('groups.copyTags'));
		newItem.save();
		//var id = newItem.save();
		//var newItem = Zotero.Items.get(id);
		
		// Record link
		newItem.addLinkedItem(item);
		var newID = id;
		
		if (item.isNote()) {
			return newID;
		}
		
		// For regular items, add child items if prefs and permissions allow
		
		// Child notes
		if (Zotero.Prefs.get('groups.copyChildNotes')) {
			var noteIDs = item.getNotes();
			var notes = Zotero.Items.get(noteIDs);
			for each(var note in notes) {
				var newNote = new Zotero.Item('note');
				newNote.libraryID = targetLibraryID;
				// DEBUG: save here because clone() doesn't currently work on unsaved tagged items
				var id = newNote.save();
				newNote = Zotero.Items.get(id);
				note.clone(false, newNote);
				newNote.setSource(newItem.id);
				newNote.save();
				
				newNote.addLinkedItem(note);
			}
		}
		
		// Child attachments
		var copyChildLinks = Zotero.Prefs.get('groups.copyChildLinks');
		var copyChildFileAttachments = Zotero.Prefs.get('groups.copyChildFileAttachments');
		if (copyChildLinks || copyChildFileAttachments) {
			var attachmentIDs = item.getAttachments();
			var attachments = Zotero.Items.get(attachmentIDs);
			for each(var attachment in attachments) {
				var linkMode = attachment.attachmentLinkMode;
				
				// Skip linked files
				if (linkMode == Zotero.Attachments.LINK_MODE_LINKED_FILE) {
					Zotero.debug("Skipping child linked file attachment on drag");
					continue;
				}
				
				// Skip imported files if we don't have pref and permissions
				if (linkMode == Zotero.Attachments.LINK_MODE_LINKED_URL) {
					if (!copyChildLinks) {
						Zotero.debug("Skipping child link attachment on drag");
						continue;
					}
				}
				else {
					if (!copyChildFileAttachments || !itemGroup.filesEditable) {
						Zotero.debug("Skipping child file attachment on drag");
						continue;
					}
				}
				
				Zotero.Attachments.copyAttachmentToLibrary(attachment, targetLibraryID, newItem.id);
			}
		}
		
		return newID;
	},

	/*insertHello: function() {
		var data = {
			title: "Zotero",
			company: "Center for History and New Media",
			creators: [
				['Dan', 'Stillman', 'programmer'],
				['Simon', 'Kornblith', 'programmer']
			],
			version: '1.0.1',
			company: 'Center for History and New Media',
			place: 'Fairfax, VA',
			url: 'http://www.zotero.org'
		};
		Zotero.Items.add('computerProgram', data); // returns a Zotero.Item instance
	},*/
	

	//TODO: on event modification, check if it is linked, then propagate changes
	// Callback implementing the notify() method to pass to the Notifier
	notifierCallback: {
		notify: function(event, type, ids, extraData) {
			if (event == 'add' || event == 'modify' || event == 'delete'|| event == 'link') {
				// Increment a counter every time an item is changed
				Zotero.ZippyZotero.DB.query("UPDATE changes SET num = num + 1");
				
				if (event != 'delete') {
					// Retrieve the added/modified items as Item objects
					var items = Zotero.Items.get(ids);
				}
				else {
					var items = extraData;
				}
				
				// Loop through array of items and grab titles
				var titles = [];
				for each(var item in items) {
					// For deleted items, get title from passed data
					if (event == 'delete') {
						titles.push(item.old.title ? item.old.title : '[No title]');
					}
					else {
						titles.push(item.getField('title'));
					}
				}
				
				if (!titles.length) {
					return;
				}
				
				// Get the localized string for the notification message and
				// append the titles of the changed items
				var stringName = 'notification.item' + (titles.length==1 ? '' : 's');
				switch (event) {
					case 'add':
						stringName += "Added";
						break;
						
					case 'modify':
						stringName += "Modified";
						break;
						
					case 'delete':
						stringName += "Deleted";
						break;

					case 'linked':
						stringName += "Linked";
						break;
				}
				
				var str = document.getElementById('zippy-zotero-strings').
					getFormattedString(stringName, [titles.length]) + ":\n\n" +
					titles.join("\n");
			}
			
			/*var ps = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
					.getService(Components.interfaces.nsIPromptService);		

			var check = {value: true};                   // default the checkbox to true

			var result = ps.confirmCheck(null, "Confirm sync with folder", 
				"Do you want to sync %file% with %grouplibrary%?", null, check);*/
		}
	}
};

// Initialize the utility
window.addEventListener('load', function(e) { Zotero.ZippyZotero.init(); }, false);
