/* 
 * File: reporting_setup.js
 * Author: UP608985
 */

window.ecoCart = window.ecoCart || {}; // Check the object exists, if not instantiate it as an empty object
window.ecoCart.reporting = window.ecoCart.reporting || {}; // Check the admin object exists, if not instantiate it as an empty object
window.ecoCart.reporting.currentView = "home";
window.ecoCart.apiURL = "." + window.ecoCart.apiURL; // Prepend "." to the API URL so it goes to the parent directory (neccessary for the reporting area)

window.ecoCart.reporting.warningStockLimit = 10; // Number of stock remaining before

window.ecoCart.reporting.ui = (function () {
    var
        uiLogger = {},
        loadError = function (evt) {
            // <editor-fold defaultstate="collapsed" desc="loadError">
            uiLogger.log("failed to load " + evt);
            // </editor-fold>
        },
        loadView = function (id) {
            // <editor-fold defaultstate="collapsed" desc="loadView">
            uiLogger.log("attempting to load " + window.ecoCart.reporting.currentView + " view");

            window.ecoCart.animations.showLoading(); // Start the loading screen

            var main = document.querySelector("main");
            main.innerHTML = ""; // Clear the current content of main

            switch (window.ecoCart.reporting.currentView) { // Switch on the application's current view
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
            
            var section = document.createElement("section");
            section.setAttribute("id", "options");
            var sectionHeader = document.createElement("header");
            sectionHeader.innerHTML = "Options";
            section.appendChild(sectionHeader);
            var grid = document.createElement("div");
            grid.setAttribute("class", "reporting-grid");
            
            var options = {
                            'Stock Warnings': 
                                    {
                                        'name': "Stock Warnings",
                                        'link': "warnings"
                                    },
                            'Orders':
                                    {
                                        'name': "Orders",
                                        'link': "orders"
                                    }
                        };
            
            for (var key in options) {
                if (options.hasOwnProperty(key)) {
                    var optionSection = document.createElement("section");
                    optionSection.setAttribute("class", "grid-item");
                    var optionHeader = document.createElement("header");
                    optionHeader.setAttribute("class", "link");
                    var link = document.createElement("a");
                    link.setAttribute("class", "options-link");
                    link.setAttribute("href", "#");
                    link.dataset.view = options[key].link;
                    link.innerHTML = options[key].name;
                    optionHeader.appendChild(link);
                    optionSection.appendChild(optionHeader);
                    grid.appendChild(optionSection);
                }
            }
            
            section.appendChild(grid); // Add the grid to the options section
            window.ecoCart.mainElem.appendChild(section); // Add the options section to the main element
            
            window.ecoCart.shared.addClassEvents("click", "options-link", optionsLinkClicked); // Event listener to handle category option links being clicked
            
            window.ecoCart.animations.hideLoading(); // Hide the loading screen
            // </editor-fold>
        },
        headerClicked = function () {
            // <editor-fold defaultstate="collapsed" desc="headerClicked">
            window.ecoCart.reporting.currentView = "home";
            loadView(); // Reload the view
            // </editor-fold>
        },
        optionsLinkClicked = function (evt) {
            // <editor-fold defaultstate="collapsed" desc="categoryOptionsLinkClicked">
            evt.preventDefault(); // Prevent default action, e.g. changing the URL in the address bar if it's an <a> element
            var view = evt.target.dataset.view;
            window.ecoCart.reporting.currentView = view;
            loadView(); // Load the relevant view
            // </editor-fold>
        },
        setup = function () {
            // <editor-fold defaultstate="collapsed" desc="setup">
            uiLogger = new Logger("Reporting UI", "script", 1); // Create a new logger object to keep track of this script
            uiLogger.log("loaded"); // Log that this script has been loaded

            window.ecoCart.xhr.xhrLogger = new Logger("xhr", "script", 1); // Create a new logger object to keep track of the XHR script
            
            window.ecoCart.mainElem = document.querySelector("main");

            /* Static event listeners */
            document.addEventListener("ecoCartLoaded", window.ecoCart.animations.hideLoading); // Event listener to close the modal loading screen when the application has loaded
            document.getElementById("headerText").addEventListener("click", headerClicked);
            
            loadView(); // Load the default view
            // </editor-fold>
        };
    return {
        "setup": setup
    };
}());

window.addEventListener("load", window.ecoCart.reporting.ui.setup);