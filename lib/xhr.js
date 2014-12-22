/* 
 * File: xhr.js
 * Author: Edward McKnight (UP608985)
 * This file handles XHR requests
 */

window.ecoCart = window.ecoCart || {}; // Check the object exists, if not instantiate it as an empty object
window.ecoCart.xhr = (function () {
	var
		xhrLogger = {},
		
		sendRequest = function (req) {
			// <editor-fold defaultstate="collapsed" desc="sendRequest">
			var xhr = new XMLHttpRequest();
			
			if (!req.url) {
				req.url = window.ecoCart.apiURL;
			}
			
			if (!req.method) { // If the method isn't set
				req.method = "GET"; // Default method is GET
			}
			
			if (!req.data) { // If data isn't specified
				req.data = ""; // At least make sure it exists
			}
			
			if (req.vars) { // If there are variables specified, add it to the URL
				var i = 0;
				for (var key in req.vars) {
					if (req.vars.hasOwnProperty(key)) {
						if (i === 0) { // If this is the first variable
							req.url += "?";
							i++; // Increment i so it won't come back to this loop again
						} else {
							req.url += "&";
						}

						req.url += key + "=" + req.vars[key];
					}
				}
			}
			
			xhr.open(req.method, req.url, true);
			
			if (req.callback) { // If there's at least one callback set
				for (var key in req.callback) {
					if (req.callback.hasOwnProperty(key)) { // For each callback given
						xhr.addEventListener(key, req.callback[key]); // Add an event listener for the callback
					}
				}
			}
			
			xhr.send(req.data);
			window.ecoCart.xhr.xhrLogger.log("sent request to " + req.url); // Log that a request has been sent
			// </editor-fold>
		};
		
	return {
		"xhrLogger": xhrLogger,
		"sendRequest": sendRequest
	};
}());