const {classes: Cc, interfaces: Ci, utils: Cu} = Components;

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/AddonManager.jsm");

var self = this, icon;

function include(path) {
  Services.scriptloader.loadSubScript(addon.getResourceURI(path).spec, self);
}

var addon = {
  getResourceURI: function(filePath) ({
    spec: __SCRIPT_URI_SPEC__ + "/../" + filePath
  })
};

function $(node, childId) {
  if (node.getElementById) {
    return node.getElementById(childId);
  } else {
    return node.querySelector("#" + childId);
  }
}

function modify(window) {
  if (!window) return;
  
  let doc = window.document,
      win = doc.querySelector("window");
  
  // add button
  let button = doc.createElement("toolbarbutton");
  button.setAttribute("id", BUTTON_ID);
  button.setAttribute("label", _("label"));
  button.setAttribute("class", "toolbarbutton-1 chromeclass-toolbar-additional");
  button.setAttribute("tooltiptext", _("tooltip"));
  button.style.listStyleImage = "url(" + icon + ")";
  button.addEventListener("command", main.action, false);
  restorePosition(doc, button);
  
  // add hotkey
  let keyset = doc.createElement("keyset");
  keyset.setAttribute("id", KEYSET_ID);
  let replaceKey = doc.createElement("key");
  replaceKey.setAttribute("key", "D");
  replaceKey.setAttribute("modifiers", "accel,alt");
  replaceKey.setAttribute("oncommand", "void(0);");
  replaceKey.addEventListener("command", main.action, true);
  keyset.appendChild(replaceKey);
  win.appendChild(keyset);
  
  unload(function() {
    button.parentNode.removeChild(button);
    keyset.parentNode.removeChild(keyset);
  }, window);
}

function startup(data, reason) {
  include("content/main.js");
  include("content/bookmarks.js");
  include("includes/utils.js");
  include("includes/l10n.js");
  include("includes/buttons.js");
  icon = addon.getResourceURI("content/icon.png").spec;
  
  l10n(addon, "bmr.properties");
  unload(l10n.unload);
  
  if (ADDON_INSTALL == reason) {
    setDefaultPosition(BUTTON_ID, "nav-bar", "bookmarks-menu-button-container");
  };
  
  if (ADDON_UPGRADE == reason) {
    upgrade(data.version);
  }
  
  watchWindows(modify, "navigator:browser");
};

function shutdown(data, reason) unload();

function upgrade(version) {
  let lastVersion = main.getLastVersion();
  
  if (lastVersion < "1.2") {
    Services.prefs.deleteBranch("extensions.bmreplace.button-position.");
  }
  
  main.setLastVersion(version);
}
