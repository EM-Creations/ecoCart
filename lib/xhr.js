/* 
 * File: xhr.js
 * Author: UP608985
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
                    req.data = {}; // At least make sure it exists
                }

                xhr.open(req.method, req.url, true);

                switch (req.method) {
                    case "POST":
                        // Don't set content type (causes problems on back-end interpretation)
                        // Convert object into form data
                        var formData = new FormData();

                        for (var key in req.data) {
                            if (req.data.hasOwnProperty(key)) { // Loop through the object
                                var elem = req.data[key];
                                formData.append(key, elem);
                            }
                        }

                        req.data = formData;
                        break;

                    default:
                        xhr.setRequestHeader('Content-Type', 'application/json');
                }

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