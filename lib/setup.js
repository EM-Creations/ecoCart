/* 
 * File: setup.js
 * Author: Edward McKnight (UP608985)
 * This file adds any necessary event listeners when the page is loaded
 */

window.ecoCart = window.ecoCart || {}; // Check the object exists, if not instantiate it as an empty object
window.ecoCart.apiVersion = 1; // Set the API version to use
window.ecoCart.name = "ecoCart";
window.ecoCart.ui = (function () {
	var
		setupLogger = {},
		setup = function () {
			// <editor-fold defaultstate="collapsed" desc="setup">
			setupLogger = new Logger("setup", "script", 1); // Create a new logger object to keep track of this script
			setupLogger.log("loaded"); // Log that this script has been loaded

			document.addEventListener("ecoCartLoaded", window.ecoCart.animations.hideLoading); // Event listener to close the modal loading screen when the application has loaded
			window.ecoCart.animations.setup(); // Call the animations setup
			// </editor-fold>
		};
		
		return {
			"setup": setup
		};
}());

window.addEventListener("load", window.ecoCart.ui.setup);