// Only create main object once in zippy
if (!Zotero.ZippyZotero) {
    let loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
                    .getService(Components.interfaces.mozIJSSubScriptLoader);
    loader.loadSubScript("chrome://zippy/content/zippy.js");
}
