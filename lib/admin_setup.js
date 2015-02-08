/* 
 * File: admin_setup.js
 * Author: UP608985
 */

window.ecoCart = window.ecoCart || {}; // Check the object exists, if not instantiate it as an empty object
window.ecoCart.admin = window.ecoCart.admin || {}; // Check the admin object exists, if not instantiate it as an empty object
window.ecoCart.admin.currentView = "home";
window.ecoCart.apiURL = "." + window.ecoCart.apiURL; // Prepend "." to the API URL so it goes to the parent directory (neccessary for the admin area)

window.ecoCart.admin.ui = (function () {
    var
        uiLogger = {},
        loadError = function (evt) {
            // <editor-fold defaultstate="collapsed" desc="loadError">
            uiLogger.log("failed to load " + evt);
            // </editor-fold>
        },
        loadView = function (id) {
            // <editor-fold defaultstate="collapsed" desc="loadView">
            uiLogger.log("attempting to load " + window.ecoCart.admin.currentView + " view");

            window.ecoCart.animations.showLoading(); // Start the loading screen

            var main = document.querySelector("main");
            main.innerHTML = ""; // Clear the current content of main

            switch (window.ecoCart.admin.currentView) { // Switch on the application's current view
                case "home":
                    loadViewHome();
                    break;

                default: // Default to the home view
                    loadViewHome();
                    break;
            }
            // </editor-fold>
        },
        loadViewHome = function () {
            // <editor-fold defaultstate="collapsed" desc="loadViewHome">
            // Set the footer's date
            window.ecoCart.xhr.sendRequest({
                url: window.ecoCart.apiURL + "time/Y",
                callback: {
                    load: window.ecoCart.shared.setFooterDate(),
                    error: loadError
                }
            });
            
            var main = document.querySelector("main"); // Get a handle on main
            var section = document.createElement("section");
            section.setAttribute("id", "options");
            var sectionHeader = document.createElement("header");
            sectionHeader.innerHTML = "Options";
            section.appendChild(sectionHeader);
            var grid = document.createElement("div");
            grid.setAttribute("class", "admin-grid");
            
            var options = ["Categories", "Products", "Delivery Options", "Settings"];
            
            for (var i = 0; i < options.length; i++) { // For each option
                var optionSection = document.createElement("section");
                optionSection.setAttribute("class", "grid-item");
                var optionHeader = document.createElement("header");
                optionHeader.setAttribute("class", "link");
                optionHeader.innerHTML = options[i];
                optionSection.appendChild(optionHeader);
                grid.appendChild(optionSection);
            }
            
            section.appendChild(grid); // Add the grid to the options section
            main.appendChild(section); // Add the options section to the main element
            
            window.ecoCart.animations.hideLoading(); // Hide the loading screen
            // </editor-fold>
        },
        setup = function () {
            // <editor-fold defaultstate="collapsed" desc="setup">
            uiLogger = new Logger("Admin UI", "script", 1); // Create a new logger object to keep track of this script
            uiLogger.log("loaded"); // Log that this script has been loaded

            window.ecoCart.xhr.xhrLogger = new Logger("xhr", "script", 1); // Create a new logger object to keep track of the XHR script

            /* Static event listeners */
            document.addEventListener("ecoCartLoaded", window.ecoCart.animations.hideLoading); // Event listener to close the modal loading screen when the application has loaded

            loadView(); // Load the default view
            // </editor-fold>
        };

    return {
        "setup": setup
    };
}());

window.addEventListener("load", window.ecoCart.admin.ui.setup);