/* 
 * File: setup.js
 * Author: Edward McKnight (UP608985)
 * This file adds any necessary event listeners when the page is loaded
 */

window.ecoCart = window.ecoCart || {}; // Check the object exists, if not instantiate it as an empty object
window.ecoCart.apiVersion = 1; // Set the API version to use
window.ecoCart.apiURL = "./api/" + window.ecoCart.apiVersion + "/";
window.ecoCart.name = "ecoCart";
window.ecoCart.ui = (function () {
	var
		uiLogger = {},
		
		loadError = function (evt) {
			// <editor-fold defaultstate="collapsed" desc="loadError">
			uiLogger.log("failed to load " + evt);
			// </editor-fold>
		},
		
		populateNavigation = function () {
			// <editor-fold defaultstate="collapsed" desc="populateNavigation">
			uiLogger.log("populating navigation");
			
			return function (xhr) {
				var resp = JSON.parse(xhr.target.responseText).resp;
				var catNav = document.querySelector("aside#catNav");
				var newNav = document.createElement("nav");
				
				for (var key in resp) {
					if (resp.hasOwnProperty(key)) { // Loop through the object
						var navObj = resp[key];
						var thisElem = document.createElement("ul");
						var li = document.createElement("li");
						
						li.innerHTML = navObj.name;
						
						thisElem.appendChild(li);
						newNav.appendChild(thisElem);
					}
				}
				
				catNav.removeChild(document.querySelector("aside#catNav>nav")); // Remove the old nav
				catNav.appendChild(newNav); // Append the new nav
			};
			// </editor-fold>
		},
		
		setFooterDate = function () {
			// <editor-fold defaultstate="collapsed" desc="setFooterDate">
			uiLogger.log("setting footer date");
			
			return function (xhr) {
				var resp = JSON.parse(xhr.target.responseText).resp;
				document.querySelector("footer>span#date").innerHTML = resp;
			};
			// </editor-fold>
		},
		
		setup = function () {
			// <editor-fold defaultstate="collapsed" desc="setup">
			uiLogger = new Logger("UI", "script", 1); // Create a new logger object to keep track of this script
			uiLogger.log("loaded"); // Log that this script has been loaded
			
			window.ecoCart.xhr.xhrLogger = new Logger("xhr", "script", 1); // Create a new logger object to keep track of the XHR script

			document.addEventListener("ecoCartLoaded", window.ecoCart.animations.hideLoading); // Event listener to close the modal loading screen when the application has loaded
			window.ecoCart.animations.setup(); // Call the animations setup
			
			// Populate navigation
			window.ecoCart.xhr.sendRequest({
				vars: {
					a: "categories",
					ssv: 0
				},
				callback: {
					load: populateNavigation(),
					error: loadError
				}
			});
			
			// Set the footer's date
			window.ecoCart.xhr.sendRequest({
				vars: {
					a: "time",
					ssv: "Y"
				},
				callback: {
					load: setFooterDate(),
					error: loadError
				}
			});
			// </editor-fold>
		};
		
		return {
			"setup": setup
		};
}());

window.addEventListener("load", window.ecoCart.ui.setup);