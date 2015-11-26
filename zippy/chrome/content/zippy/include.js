// Only create main object once
	let loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
					.getService(Components.interfaces.mozIJSSubScriptLoader);
	loader.loadSubScript("chrome://zippy/content/zippy.js");
	loader.loadSubScript("chrome://zippy/content/updateFields.js");
	loader.loadSubScript("chrome://zippy/content/addField.js");
