/*
    ***** BEGIN LICENSE BLOCK *****
    
    Copyright © 2009 Center for History and New Media
                     George Mason University, Fairfax, Virginia, USA
                     http://zotero.org
    
    This file is part of Zotero.
    
    Zotero is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    
    Zotero is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.
    
    You should have received a copy of the GNU Affero General Public License
    along with Zotero.  If not, see <http://www.gnu.org/licenses/>.
    
	
	Utilities based in part on code taken from Piggy Bank 2.1.1 (BSD-licensed)
	
    ***** END LICENSE BLOCK *****
*/

/**
 * @class Utility functions not made available to translators
 */
Zotero.Utilities.Internal = {
	
	/**
	 * Unicode normalization
	 */
	"copyTextToClipboard":function(str) {
		Components.classes["@mozilla.org/widget/clipboardhelper;1"]
			.getService(Components.interfaces.nsIClipboardHelper)
			.copyString(str);
	},
	
	 /*
	 * Adapted from http://developer.mozilla.org/en/docs/nsICryptoHash
	 *
	 * @param	{String|nsIFile}	strOrFile
	 * @param	{Boolean}			[base64=false]	Return as base-64-encoded string rather than hex string
	 * @return	{String}
	 */
	"md5":function(strOrFile, base64) {
		if (typeof strOrFile == 'string') {
			var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
				createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
			converter.charset = "UTF-8";
			var result = {};
			var data = converter.convertToByteArray(strOrFile, result);
			var ch = Components.classes["@mozilla.org/security/hash;1"]
				.createInstance(Components.interfaces.nsICryptoHash);
			ch.init(ch.MD5);
			ch.update(data, data.length);
		}
		else if (strOrFile instanceof Components.interfaces.nsIFile) {
			// Otherwise throws (NS_ERROR_NOT_AVAILABLE) [nsICryptoHash.updateFromStream]
			if (!strOrFile.fileSize) {
				// MD5 for empty string
				return "d41d8cd98f00b204e9800998ecf8427e";
			}
			
			var istream = Components.classes["@mozilla.org/network/file-input-stream;1"]
							.createInstance(Components.interfaces.nsIFileInputStream);
			// open for reading
			istream.init(strOrFile, 0x01, 0444, 0);
			var ch = Components.classes["@mozilla.org/security/hash;1"]
						   .createInstance(Components.interfaces.nsICryptoHash);
			// we want to use the MD5 algorithm
			ch.init(ch.MD5);
			// this tells updateFromStream to read the entire file
			const PR_UINT32_MAX = 0xffffffff;
			ch.updateFromStream(istream, PR_UINT32_MAX);
		}
		
		// pass false here to get binary data back
		var hash = ch.finish(base64);
		
		if (istream) {
			istream.close();
		}
		
		if (base64) {
			return hash;
		}
		
		// return the two-digit hexadecimal code for a byte
		function toHexString(charCode) {
			return ("0" + charCode.toString(16)).slice(-2);
		}
		
		// convert the binary hash data to a hex string.
		return [toHexString(hash.charCodeAt(i)) for (i in hash)].join("");
	},
	
	
	/**
	 * @param {OS.File|nsIFile|String} file  File or file path
	 * @param {Boolean} [base64=FALSE]  Return as base-64-encoded string
	 *                                  rather than hex string
	 */
	"md5Async": function (file, base64) {
		Components.utils.import("resource://gre/modules/osfile.jsm");
		const CHUNK_SIZE = 16384;
		
		var deferred = Q.defer();
		
		function toHexString(charCode) {
			return ("0" + charCode.toString(16)).slice(-2);
		}
		
		var ch = Components.classes["@mozilla.org/security/hash;1"]
				   .createInstance(Components.interfaces.nsICryptoHash);
		ch.init(ch.MD5);
		
		// Recursively read chunks of the file, and resolve the promise
		// with the hash when done
		let readChunk = function readChunk(file) {
			file.read(CHUNK_SIZE)
			.then(
				function readSuccess(data) {
					ch.update(data, data.length);
					if (data.length == CHUNK_SIZE) {
						readChunk(file);
					}
					else {
						let hash = ch.finish(base64);
						
						// Base64
						if (base64) {
							deferred.resolve(hash);
						}
						// Hex string
						else {
							deferred.resolve(
								[toHexString(hash.charCodeAt(i))
									for (i in hash)].join("")
							);
						}
					}
				},
				function (e) {
					try {
						ch.finish(false);
					}
					catch (e) {}
					
					deferred.reject(e);
				}
			)
			.then(
				null,
				function (e) {
					try {
						ch.finish(false);
					}
					catch (e) {}
					
					deferred.reject(e);
				}
			);
		}
		
		if (file instanceof OS.File) {
			readChunk(file);
		}
		else {
			if (file instanceof Components.interfaces.nsIFile) {
				var path = file.path;
			}
			else {
				var path = file;
			}
			OS.File.open(path)
			.then(
				function opened(file) {
					readChunk(file);
				},
				function (e) {
					deferred.reject(e);
				}
			);
		}
		
		return deferred.promise;
	},
	
	
	/**
	 * Unicode normalization
	 */
	"normalize":function(str) {
		var normalizer = Components.classes["@mozilla.org/intl/unicodenormalizer;1"]
							.getService(Components.interfaces.nsIUnicodeNormalizer);
		var obj = {};
		str = normalizer.NormalizeUnicodeNFC(str, obj);
		return obj.value;
	},
	
	
	/**
	 * Return the byte length of a UTF-8 string
	 *
	 * http://stackoverflow.com/a/23329386
	 */
	byteLength: function (str) {
		var s = str.length;
		for (var i=str.length-1; i>=0; i--) {
			var code = str.charCodeAt(i);
			if (code > 0x7f && code <= 0x7ff) s++;
			else if (code > 0x7ff && code <= 0xffff) s+=2;
			if (code >= 0xDC00 && code <= 0xDFFF) i--; //trail surrogate
		}
		return s;
	},
	
	/**
	 * Display a prompt from an error with custom buttons and a callback
	 */
	"errorPrompt":function(title, e) {
		var ps = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
					.getService(Components.interfaces.nsIPromptService);
		var message, buttonText, buttonCallback;
		
		if (e.data) {
			if (e.data.dialogText) {
				message = e.data.dialogText;
			}
			if (typeof e.data.dialogButtonText != 'undefined') {
				buttonText = e.data.dialogButtonText;
				buttonCallback = e.data.dialogButtonCallback;
			}
		}
		if (!message) {
			if (e.message) {
				message = e.message;
			}
			else {
				message = e;
			}
		}
		
		if (typeof buttonText == 'undefined') {
			buttonText = Zotero.getString('errorReport.reportError');
			buttonCallback = function () {
				win.ZoteroPane.reportErrors();
			}
		}
		// If secondary button is explicitly null, just use an alert
		else if (buttonText === null) {
			ps.alert(null, title, message);
			return;
		}
		
		var buttonFlags = ps.BUTTON_POS_0 * ps.BUTTON_TITLE_OK
							+ ps.BUTTON_POS_1 * ps.BUTTON_TITLE_IS_STRING;
		var index = ps.confirmEx(
			null,
			title,
			message,
			buttonFlags,
			"",
			buttonText,
			"", null, {}
		);
		
		if (index == 1) {
			setTimeout(function () { buttonCallback(); }, 1);
		}
	},
	
	
	/**
	 * saveURI wrapper function
	 * @param {nsIWebBrowserPersist} nsIWebBrowserPersist
	 * @param {nsIURI} source URL
	 * @param {nsISupports} target file
	 */
	saveURI: function (wbp, source, target) {
		// Handle gzip encoding
		wbp.persistFlags |= Ci.nsIWebBrowserPersist.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;
		
		// Firefox 35 and below
		try {
			wbp.saveURI(source, null, null, null, null, target, null);
		}
		// Firefox 36+ needs one more parameter
		catch (e if e.name === "NS_ERROR_XPC_NOT_ENOUGH_ARGS") {
			wbp.saveURI(source, null, null, null, null, null, target, null);
		}
	},
	
	
	/**
	 * Launch a process
	 * @param {nsIFile|String} cmd Path to command to launch
	 * @param {String[]} args Arguments given
	 * @return {Promise} Promise resolved to true if command succeeds, or an error otherwise
	 */
	"exec":function(cmd, args) {
		if (typeof cmd == 'string') {
			Components.utils.import("resource://gre/modules/FileUtils.jsm");
			cmd = new FileUtils.File(cmd);
		}
		
		if(!cmd.isExecutable()) {
			return Q.reject(cmd.path+" is not an executable");
		}
		
		var proc = Components.classes["@mozilla.org/process/util;1"].
				createInstance(Components.interfaces.nsIProcess);
		proc.init(cmd);
		
		var deferred = Q.defer();
		proc.runwAsync(args, args.length, {"observe":function(subject, topic) {
			if(topic !== "process-finished") {
				deferred.reject(new Error(cmd.path+" failed"));
			} else if(proc.exitValue != 0) {
				deferred.reject(new Error(cmd.path+" returned exit status "+proc.exitValue));
			} else {
				deferred.resolve(true);
			}
		}});
		
		return deferred.promise;
	},

	/**
	 * Get string data from the clipboard
	 * @param {String[]} mimeType MIME type of data to get
	 * @return {String|null} Clipboard data, or null if none was available
	 */
	"getClipboard":function(mimeType) {
		var clip = Services.clipboard;
		if (!clip.hasDataMatchingFlavors([mimeType], 1, clip.kGlobalClipboard)) {
			return null;
		}
		var trans = Components.classes["@mozilla.org/widget/transferable;1"]
						.createInstance(Components.interfaces.nsITransferable);
		trans.addDataFlavor(mimeType);
		clip.getData(trans, clip.kGlobalClipboard);
		var str = {};
		try {
			trans.getTransferData(mimeType, str, {});
			str = str.value.QueryInterface(Components.interfaces.nsISupportsString).data;
		}
		catch (e) {
			return null;
		}
		return str;
	},
	
	/**
	 * Determine if one Window is a descendant of another Window
	 * @param {DOMWindow} suspected child window
	 * @param {DOMWindow} suspected parent window
	 * @return {boolean}
	 */
	"isIframeOf":function isIframeOf(childWindow, parentWindow) {
		while(childWindow.parent !== childWindow) {
			childWindow = childWindow.parent;
			if(childWindow === parentWindow) return true;
		}
	},
	
	/**
	 * Converts Zotero.Item to a format expected by translators
	 * This is mostly the Zotero web API item JSON format, but with an attachments
	 * and notes arrays and optional compatibility mappings for older translators.
	 * 
	 * @param {Zotero.Item} zoteroItem
	 * @param {Boolean} legacy Add mappings for legacy (pre-4.0.27) translators
	 * @return {Object}
	 */
	"itemToExportFormat": new function() {
		return function(zoteroItem, legacy) {
			var item = zoteroItem.toJSON();
			item.uri = Zotero.URI.getItemURI(zoteroItem);
			delete item.key;
			
			if (!zoteroItem.isAttachment() && !zoteroItem.isNote()) {
				// Include attachments
				item.attachments = [];
				let attachments = zoteroItem.getAttachments();
				for (let i=0; i<attachments.length; i++) {
					let zoteroAttachment = Zotero.Items.get(attachments[i]),
						attachment = zoteroAttachment.toJSON();
					if (legacy) addCompatibilityMappings(attachment, zoteroAttachment);
					
					item.attachments.push(attachment);
				}
				
				// Include notes
				item.notes = [];
				let notes = zoteroItem.getNotes();
				for (let i=0; i<notes.length; i++) {
					let zoteroNote = Zotero.Items.get(notes[i]),
						note = zoteroNote.toJSON();
					if (legacy) addCompatibilityMappings(note, zoteroNote);
					
					item.notes.push(note);
				}
			}
			
			if (legacy) addCompatibilityMappings(item, zoteroItem);
			
			return item;
		}
		
		function addCompatibilityMappings(item, zoteroItem) {
			item.uniqueFields = {};
			
			// Meaningless local item ID, but some older export translators depend on it
			item.itemID = zoteroItem.id;
			item.key = zoteroItem.key; // CSV translator exports this
			
			// "version" is expected to be a field for "computerProgram", which is now
			// called "versionNumber"
			delete item.version;
			if (item.versionNumber) {
				item.version = item.uniqueFields.version = item.versionNumber;
				delete item.versionNumber;
			}
			
			// SQL instead of ISO-8601
			item.dateAdded = zoteroItem.dateAdded;
			item.dateModified = zoteroItem.dateModified;
			if (item.accessDate) {
				item.accessDate = zoteroItem.getField('accessDate');
			}
			
			// Map base fields
			for (let field in item) {
				let id = Zotero.ItemFields.getID(field);
				if (!id || !Zotero.ItemFields.isValidForType(id, zoteroItem.itemTypeID)) {
					 continue;
				}
				
				let baseField = Zotero.ItemFields.getName(
					Zotero.ItemFields.getBaseIDFromTypeAndField(item.itemType, field)
				);
				
				if (!baseField || baseField == field) {
					item.uniqueFields[field] = item[field];
				} else {
					item[baseField] = item[field];
					item.uniqueFields[baseField] = item[field];
				}
			}
			
			// Add various fields for compatibility with translators pre-4.0.27
			item.itemID = zoteroItem.id;
			item.libraryID = zoteroItem.libraryID;
			
			// Creators
			if (item.creators) {
				for (let i=0; i<item.creators.length; i++) {
					let creator = item.creators[i];
					
					if (creator.name) {
						creator.fieldMode = 1;
						creator.lastName = creator.name;
						delete creator.name;
					}
					
					// Old format used to supply creatorID (the database ID), but no
					// translator ever used it
				}
			}
			
			if (!zoteroItem.isRegularItem()) {
				item.sourceItemKey = item.parentItem;
			}
			
			// Tags
			for (let i=0; i<item.tags.length; i++) {
				if (!item.tags[i].type) {
					item.tags[i].type = 0;
				}
				// No translator ever used "primary", "fields", or "linkedItems" objects
			}
			
			// "related" was never used (array of itemIDs)
			
			// seeAlso was always present, but it was always an empty array.
			// Zotero RDF translator pretended to use it
			item.seeAlso = [];
			
			// Fix linkMode
			if (zoteroItem.isAttachment()) {
				item.linkMode = zoteroItem.attachmentLinkMode;
				item.mimeType = item.contentType;
			}
			
			return item;
		}
	},
	
	/**
	 * Hyphenate an ISBN based on the registrant table available from
	 * https://www.isbn-international.org/range_file_generation
	 * See isbn.js
	 *
	 * @param {String} isbn ISBN-10 or ISBN-13
	 * @param {Boolean} dontValidate Do not attempt to validate check digit
	 * @return {String} Hyphenated ISBN or empty string if invalid ISBN is supplied
	 */
	"hyphenateISBN": function(isbn, dontValidate) {
		isbn = Zotero.Utilities.cleanISBN(isbn, dontValidate);
		if (!isbn) return '';
		
		var ranges = Zotero.ISBN.ranges,
			parts = [],
			uccPref,
			i = 0;
		if (isbn.length == 10) {
			uccPref = '978';
		} else {
			uccPref = isbn.substr(0,3);
			if (!ranges[uccPref]) return ''; // Probably invalid ISBN, but the checksum is OK
			parts.push(uccPref);
			i = 3; // Skip ahead
		}
		
		var group = '',
			found = false;
		while (i < isbn.length-3 /* check digit, publication, registrant */) {
			group += isbn.charAt(i);
			if (ranges[uccPref][group]) {
				parts.push(group);
				found = true;
				break;
			}
			i++;
		}
		
		if (!found) return ''; // Did not find a valid group
		
		// Array of registrant ranges that are valid for a group
		// Array always contains an even number of values (as string)
		// From left to right, the values are paired so that the first indicates a
		// lower bound of the range and the right indicates an upper bound
		// The ranges are sorted by increasing number of characters
		var regRanges = ranges[uccPref][group];
		
		var registrant = '';
		found = false;
		i++; // Previous loop 'break'ed early
		while (!found && i < isbn.length-2 /* check digit, publication */) {
			registrant += isbn.charAt(i);
			
			for(let j=0; j < regRanges.length && registrant.length >= regRanges[j].length; j+=2) {
				if(registrant.length == regRanges[j].length
					&& registrant >= regRanges[j] && registrant <= regRanges[j+1] // Falls within the range
				) {
					parts.push(registrant);
					found = true;
					break;
				}
			}
			
			i++;
		}
		
		if (!found) return ''; // Outside of valid range, but maybe we need to update our data
		
		parts.push(isbn.substring(i,isbn.length-1)); // Publication is the remainder up to last digit
		parts.push(isbn.charAt(isbn.length-1)); // Check digit
		
		return parts.join('-');
	}
}

/**
 *  Base64 encode / decode
 *  From http://www.webtoolkit.info/
 */
Zotero.Utilities.Internal.Base64 = {
	 // private property
	 _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
	 
	 // public method for encoding
	 encode : function (input) {
		 var output = "";
		 var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		 var i = 0;
		 
		 input = this._utf8_encode(input);
		 
		 while (i < input.length) {
			 
			 chr1 = input.charCodeAt(i++);
			 chr2 = input.charCodeAt(i++);
			 chr3 = input.charCodeAt(i++);
			 
			 enc1 = chr1 >> 2;
			 enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			 enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			 enc4 = chr3 & 63;
			 
			 if (isNaN(chr2)) {
				 enc3 = enc4 = 64;
			 } else if (isNaN(chr3)) {
				 enc4 = 64;
			 }
			 
			 output = output +
			 this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
			 this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
			 
		 }
		 
		 return output;
	 },
	 
	 // public method for decoding
	 decode : function (input) {
		 var output = "";
		 var chr1, chr2, chr3;
		 var enc1, enc2, enc3, enc4;
		 var i = 0;
		 
		 input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		 
		 while (i < input.length) {
			 
			 enc1 = this._keyStr.indexOf(input.charAt(i++));
			 enc2 = this._keyStr.indexOf(input.charAt(i++));
			 enc3 = this._keyStr.indexOf(input.charAt(i++));
			 enc4 = this._keyStr.indexOf(input.charAt(i++));
			 
			 chr1 = (enc1 << 2) | (enc2 >> 4);
			 chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			 chr3 = ((enc3 & 3) << 6) | enc4;
			 
			 output = output + String.fromCharCode(chr1);
			 
			 if (enc3 != 64) {
				 output = output + String.fromCharCode(chr2);
			 }
			 if (enc4 != 64) {
				 output = output + String.fromCharCode(chr3);
			 }
			 
		 }
		 
		 output = this._utf8_decode(output);
		 
		 return output;
		 
	 },
	 
	 // private method for UTF-8 encoding
	 _utf8_encode : function (string) {
		 string = string.replace(/\r\n/g,"\n");
		 var utftext = "";
		 
		 for (var n = 0; n < string.length; n++) {
			 
			 var c = string.charCodeAt(n);
			 
			 if (c < 128) {
				 utftext += String.fromCharCode(c);
			 }
			 else if((c > 127) && (c < 2048)) {
				 utftext += String.fromCharCode((c >> 6) | 192);
				 utftext += String.fromCharCode((c & 63) | 128);
			 }
			 else {
				 utftext += String.fromCharCode((c >> 12) | 224);
				 utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				 utftext += String.fromCharCode((c & 63) | 128);
			 }
			 
		 }
		 
		 return utftext;
	 },
	 
	 // private method for UTF-8 decoding
	 _utf8_decode : function (utftext) {
		 var string = "";
		 var i = 0;
		 var c = c1 = c2 = 0;
		 
		 while ( i < utftext.length ) {
			 
			 c = utftext.charCodeAt(i);
			 
			 if (c < 128) {
				 string += String.fromCharCode(c);
				 i++;
			 }
			 else if((c > 191) && (c < 224)) {
				 c2 = utftext.charCodeAt(i+1);
				 string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				 i += 2;
			 }
			 else {
				 c2 = utftext.charCodeAt(i+1);
				 c3 = utftext.charCodeAt(i+2);
				 string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				 i += 3;
			 }
			 
		 }
		 
		 return string;
	 }
 }
