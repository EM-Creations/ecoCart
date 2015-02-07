/* 
 * File: admin_setup.js
 * Author: UP608985
 */

window.ecoCart = window.ecoCart || {}; // Check the object exists, if not instantiate it as an empty object
window.ecoCart.admin.currentView = "home";
window.ecoCart.admin.name = "ecoCart";

window.ecoCart.admin.ui = (function () {
    var
        uiLogger = {},
        setup = function () {
            // <editor-fold defaultstate="collapsed" desc="setup">
            uiLogger = new Logger("Admin UI", "script", 1); // Create a new logger object to keep track of this script
            uiLogger.log("loaded"); // Log that this script has been loaded

            window.ecoCart.xhr.xhrLogger = new Logger("xhr", "script", 1); // Create a new logger object to keep track of the XHR script

            /* Static event listeners */
            document.addEventListener("ecoCartLoaded", window.ecoCart.animations.hideLoading); // Event listener to close the modal loading screen when the application has loaded

            //loadView(); // Load the default view
            // </editor-fold>
        };

    return {
        "setup": setup
    };
}());

window.addEventListener("load", window.ecoCart.admin.ui.setup);