/* jshint shadow:true */
"use strict";
Zotero.ZippyZotero = {
	DB: null,

	init: function() {
		// Connect to (and create, if necessary) zippy.sqlite in the Zotero directory
		this.DB = new Zotero.DBConnection("zippy");

		if (!this.DB.tableExists("links")) {
			this.DB.query("CREATE TABLE links (id varchar(255), link varchar(255), data varchar(255), PRIMARY KEY(id, link))");
		}

		// Register the callback in Zotero as an item and tag observer
		var notifierID = Zotero.Notifier.registerObserver(this.notifierCallback, ["item", "tag"]);

		// Unregister callback when the window closes (important to avoid a memory leak)
		window.addEventListener("unload", function(e) {
			Zotero.Notifier.unregisterObserver(notifierID);
		}, false);
	},

	/**
	 * Called when the user selects 'Move and Sync' from an item context menu.
	 * Moves the selected item to the selected group, and sets up the link in our local DB.
	 *(Find a werid bug, when we move and sync a item/collection, the new item we created comes with a tag, 
	 *which we deleted before.)
	 */
	moveAndSync: function() {
		var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
			.getService(Components.interfaces.nsIPromptService);


		var groupObjs = Zotero.Groups.getAll();
		var groups = [];

		for (var i = 0; i < groupObjs.length; i++) {
			groups.push(groupObjs[i].name);
		}

		var selected = {};

		var result = prompts.select(null, "Move and Sync Item", "Which group would you like to move and sync to?",
			groups.length, groups, selected);

		// The user did in fact select a group to move & sync to
		if (result) {
			var items = ZoteroPane.getSelectedItems();

			for (i = 0; i < items.length; i++) {
				var item = items[i];
				var newId = this.copyItem(item, groupObjs[selected.value].libraryID);
				this.DB.query("INSERT INTO links (id, link) VALUES (" + item.id + "," + newId + ")");
			}
		}
	},

	// Callback implementing the notify() method to pass to the Notifier.
	notifierCallback: {
		/**
		 * This callback propagates changes to linked items when items are modified,
		 * and updates links when items are deleted.
		 * TODO: This is really ugly. stick some of this code in helper methods?
		 */
		notify: function(event, type, ids, extraData) {
			if (event == "modify" && type == "item") {
				// Retrieve the added/modified items as Item objects
				var items = Zotero.Items.get(ids);
				if (items.length) {
					// Retrieve the items with that this object is linked to, if any
					for (var i = 0; i < items.length; i++) {
						var linkedItems = Zotero.ZippyZotero.DB.query("SELECT link FROM links WHERE	id='" + items[i].id + "';");
						if (linkedItems.length) {
							// Go through linked items, propagate each changed field to the linked item
							if (Zotero.Items.get(items[i].id).deleted) {
								Zotero.ZippyZotero.DB.query("DELETE FROM links WHERE id='" + items[i].id + "'");
							}
							else {
								for (var j = 0; j < linkedItems.length; j++) {
									var linkedItem = Zotero.Items.get(linkedItems[j].link);
									for (var id in extraData) {
<<<<<<< HEAD
										var syncfields = JSON.parse(Zotero.ZippyZotero.DB.query("SELECT data FROM links WHERE id='" + items[i].id + "' and link='" + linkedItem.id +'";'));
=======
										var syncfields = Zotero.ZippyZotero.DB.query("SELECT data FROM links WHERE	id='" + items[i].id + "';");;
>>>>>>> 442237152b94349e1271a3996394ea40f5da89e9
										for (var field in extraData[id].changed) {
											if (extraData[id].changed.hasOwnProperty(field)) {
												// I don;t know if getting this is necessary.. just to be safe perhaps?
												var mappedFieldID = Zotero.ItemFields.getFieldIDFromTypeAndBase(linkedItem.itemTypeID, field);
												var fieldID = Zotero.ItemFields.getID(field);
												if (syncfields == null) {
													linkedItem.setField(mappedFieldID ? mappedFieldID : field, items[i].getField(field));
													linkedItem.save();
												}
												else {
													for (var inc=0; inc < syncfields.length; inc++) {
														if (syncfields[inc] == fieldID && items[i].getField(field) != linkedItem.getField(field)) {
															linkedItem.setField(mappedFieldID ? mappedFieldID : field, items[i].getField(field));
															linkedItem.save();
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			} else if (event == "add" && type == "tag") {
				for (var i = 0; i < ids.length; i++) {
					var newTag = Zotero.Tags.get(ids[i]);
					var tagItems = Zotero.Tags.getTagItems(ids[i]); // array of item ids
					for (var j = 0; j < tagItems.length; j++) {
						var linkedItems = Zotero.ZippyZotero.DB.query("SELECT link FROM links WHERE	id='" +
							tagItems[j] + "';");
						for (var k = 0; k < linkedItems.length; k++) {
							var linkedItem = Zotero.Items.get(linkedItems[k].link);
							var dupTag = new Zotero.Tag();
							dupTag.libraryID = linkedItem.libraryID;
							dupTag.name = newTag.name;
							dupTag.save();
							// No save is necessary for tag operations
							linkedItem.addTagByID(dupTag.id);
						}
					}
				}
			} else if (event == "modify" && type == "tag") {
				// When a tag is modified, a new tag is created to replace it
				// extraData[0] contains the old tag id, extraData[1] has the new one
				var oldTag = Zotero.Tags.get(ids[0]);
				var modifiedTag = Zotero.Tags.get(ids[1]);

				// Grab all the items the new tag belongs to
				var tagItems = Zotero.Tags.getTagItems(modifiedTag.id);

				for (var i = 0; i < tagItems.length; i++) {
					var linkedItems = Zotero.ZippyZotero.DB.query("SELECT link FROM links WHERE	id='" +
						tagItems[i] + "';");
					if (linkedItems.length) {
						for (var j = 0; j < linkedItems.length; j++) {
							var linkedItem = Zotero.Items.get(linkedItems[j].link);
							var linkedItemTags = linkedItem.getTags(); // returns array of tags
							for (var k = 0; k < linkedItemTags.length; k++) {
								if (linkedItemTags[k].name === oldTag.name) {
									Zotero.Tags.rename(linkedItemTags[k].id, modifiedTag.name);
								}
							}
						}
					}
				}
			} 
		}
	},

	// This is literally the same function from Zotero's collectionTreeView.js
	// TODO: Clean up, see if we need all ~150 lines of this
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
				} else {
					if (!copyChildFileAttachments || !itemGroup.filesEditable) {
						Zotero.debug("Skipping child file attachment on drag");
						continue;
					}
				}

				Zotero.Attachments.copyAttachmentToLibrary(attachment, targetLibraryID, newItem.id);
			}
		}

		return newID;
	}
}

// Initialize the utility
window.addEventListener("load", function(e) {
	Zotero.ZippyZotero.init();
}, false);
