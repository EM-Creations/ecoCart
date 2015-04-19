/* 
 * File: reporting_setup.js
 * Author: UP608985
 */

window.ecoCart = window.ecoCart || {}; // Check the object exists, if not instantiate it as an empty object
window.ecoCart.reporting = window.ecoCart.reporting || {}; // Check the admin object exists, if not instantiate it as an empty object
window.ecoCart.reporting.currentView = "home";
window.ecoCart.apiURL = "." + window.ecoCart.apiURL; // Prepend "." to the API URL so it goes to the parent directory (neccessary for the reporting area)

window.ecoCart.reporting.markSentButtonActive = false;
window.ecoCart.reporting.viewOrderActive = false;
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
            window.ecoCart.reporting.markSentButtonActive = false;
            window.ecoCart.reporting.viewOrderActive = false;

            window.ecoCart.animations.showLoading(); // Start the loading screen

            var main = document.querySelector("main");
            main.innerHTML = ""; // Clear the current content of main

            switch (window.ecoCart.reporting.currentView) { // Switch on the application's current view
                case "home":
                    loadViewHome();
                    break;
                    
                case "warnings":
                    loadViewWarnings();
                    break;
                    
                case "orders":
                    loadViewOrders();
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
        loadViewWarnings = function () {
            // <editor-fold defaultstate="collapsed" desc="loadViewWarnings">            
            var section = document.createElement("section");
            section.setAttribute("id", "warnings");
            var sectionHeader = document.createElement("header");
            sectionHeader.innerHTML = "Stock Warnings";
            section.appendChild(sectionHeader);
            var warningLimit = document.createElement("div");
            warningLimit.innerHTML = "Showing all products with a stock level below " + window.ecoCart.reporting.warningStockLimit + ".";
            section.appendChild(warningLimit);
            
            var warnTable = getWarningTable();
            
            section.appendChild(warnTable);
            window.ecoCart.mainElem.appendChild(section); // Add the options section to the main element
            // </editor-fold>
        },
        loadViewOrders = function () {
            // <editor-fold defaultstate="collapsed" desc="loadViewOrders">            
            var section = document.createElement("section");
            section.setAttribute("id", "orders");
            var sectionHeader = document.createElement("header");
            sectionHeader.innerHTML = "Orders";
            section.appendChild(sectionHeader);

            // <editor-fold defaultstate="collapsed" desc="Time Options">
            var timeOptsGroup = document.createElement("fieldset");
            var timeOptsHeader = document.createElement("legend");
            timeOptsHeader.innerHTML = "Timescale";
            timeOptsGroup.appendChild(timeOptsHeader);
            var timeOptsForm = document.createElement("form");
            timeOptsForm.setAttribute("id", "time-opts");
            timeOptsForm.setAttribute("method", "post");
            timeOptsForm.setAttribute("action", "#");
            var startLabel = document.createElement("label");
            startLabel.setAttribute("for", "startDate");
            startLabel.innerHTML = "Start Date";
            var start = document.createElement("input");
            start.required = true; // Required field
            start.setAttribute("id", "startDate");
            start.setAttribute("type", "date");
            var endLabel = document.createElement("label");
            endLabel.setAttribute("for", "endDate");
            endLabel.innerHTML = "End Date";
            var end = document.createElement("input");
            end.required = true; // Required field
            end.setAttribute("id", "endDate");
            end.setAttribute("type", "date");
            var searchButton = document.createElement("button");
            searchButton.setAttribute("id", "search-button");
            searchButton.setAttribute("type", "submit");
            searchButton.innerHTML = "Search";
            
            timeOptsForm.appendChild(startLabel);
            timeOptsForm.appendChild(start);
            timeOptsForm.appendChild(endLabel);
            timeOptsForm.appendChild(end);
            timeOptsForm.appendChild(searchButton);
            timeOptsGroup.appendChild(timeOptsForm);
            // </editor-fold>
            
            // <editor-fold defaultstate="collapsed" desc="Results">
            var resultsGroup = document.createElement("fieldset");
            var resultsHeader = document.createElement("legend");
            resultsHeader.innerHTML = "Orders";
            var div = document.createElement("div");
            div.setAttribute("id", "resultsDiv");
            var infoText = document.createElement("span");
            infoText.setAttribute("id", "info-text");
            div.appendChild(infoText);
            var turnoverElem = document.createElement("div");
            turnoverElem.setAttribute("id", "turnover");
            
            var startDate, endDate = null;
            if (localStorage && (localStorage.getItem("reportingOrdersStart") !== undefined) && (localStorage.getItem("reportingOrdersStart") !== null) && (localStorage.getItem("reportingOrdersEnd") !== undefined) && (localStorage.getItem("reportingOrdersEnd") !== null)) {
                startDate = localStorage.getItem("reportingOrdersStart");
                endDate = localStorage.getItem("reportingOrdersEnd");
            }
            //uiLogger.log("Start: " + startDate + " End: " + endDate);
            var ordersTable = getOrdersTable(startDate, endDate, infoText, turnoverElem);
            
            resultsGroup.appendChild(resultsHeader);
            div.appendChild(ordersTable);
            resultsGroup.appendChild(div);
            resultsGroup.appendChild(turnoverElem);
            // </editor-fold>
            
            section.appendChild(timeOptsGroup);
            section.appendChild(resultsGroup);
            window.ecoCart.mainElem.appendChild(section); // Add the options section to the main element
            
            /* Event Listeners */
            timeOptsForm.addEventListener("submit", ordersFormSubmitted);
            // </editor-fold>
        },
        getWarningTable = function () {
            // <editor-fold defaultstate="collapsed" desc="getWarningTable">
            var warnTable = document.createElement("table");
            warnTable.setAttribute("id", "warnTable");
            var headerTR = document.createElement("tr");
            headerTR.setAttribute("class", "heading");
            
            var headers = ["Product", "Stock"];
            
            for (var i = 0; i < headers.length; i++) {
                var td = document.createElement("td");
                td.innerHTML = headers[i];
                headerTR.appendChild(td);
            }
            warnTable.appendChild(headerTR);
            
            // Populate stock warning products
            window.ecoCart.xhr.sendRequest({
                url: window.ecoCart.apiURL + "item/stock/" + window.ecoCart.reporting.warningStockLimit,
                callback: {
                    load: function (xhr) {
                        var resp = JSON.parse(xhr.target.responseText).data;

                        for (var key in resp) {
                            if (resp.hasOwnProperty(key)) { // Loop through the object
                                var obj = resp[key];
                                var tr = document.createElement("tr");
								tr.setAttribute("id", "prod-" + obj.id);
                                tr.dataset.prod = obj.id;
                                var td1 = document.createElement("td");
								td1.setAttribute("class", "name");
                                var td2 = document.createElement("td");
								td2.setAttribute("class", "stock");
                                var a = document.createElement("a");
                                a.innerHTML = obj.name;
                                a.setAttribute("href", "../admin");
                                a.setAttribute("class", "product-link link");
                                a.dataset.prod = obj.id;
                                td1.appendChild(a);
                                td2.innerHTML = obj.stock;

                                tr.appendChild(td1);
                                tr.appendChild(td2);
                                warnTable.appendChild(tr);
                            }
                        }
                        
                        window.ecoCart.shared.addClassEvents("click", "product-link", productLinkClicked);
                        window.ecoCart.animations.hideLoading(); // Hide the loading screen
                    },
                    error: loadError
                }
            });
            
            return warnTable;
            // </editor-fold>
        },
        getOrdersTable = function (dateStart, dateEnd, infoText, turnoverElem) {
            // <editor-fold defaultstate="collapsed" desc="getOrdersTable">
            var turnover = 0.00;
            window.ecoCart.reporting.turnover = 0.00;
            var ordersTable = document.createElement("table");
            ordersTable.setAttribute("id", "ordersTable");
            var headerTR = document.createElement("tr");
            headerTR.setAttribute("class", "heading");
            
            var headers = ["Title", "F. Name", "L. Name", "Address 1", "Address 2", "Post Code", "Delivery Option", "Total", "Created", "Sent?", "Options"];
            
            for (var i = 0; i < headers.length; i++) {
                var td = document.createElement("td");
                td.innerHTML = headers[i];
                headerTR.appendChild(td);
            }
            ordersTable.appendChild(headerTR);
            
			if ((dateStart !== null) && (dateEnd !== null)) { // If the date values aren't null
                infoText.innerHTML = "Showing orders between <span class=\"date\">" + dateStart + "</span> and <span class=\"date\">" + dateEnd + "</span>.";
				// Populate orders
				window.ecoCart.xhr.sendRequest({
					url: window.ecoCart.apiURL + "order/search/" + dateStart + "/" + dateEnd,
					callback: {
						load: function (xhr) {
							var resp = JSON.parse(xhr.target.responseText).data;

							for (var key in resp) {
								if (resp.hasOwnProperty(key)) { // Loop through the object
									var obj = resp[key];
									var tr = document.createElement("tr");
									tr.setAttribute("id", "order-" + obj.id);
									tr.dataset.order = obj.id;
									var td1 = document.createElement("td");
									td1.setAttribute("class", "title");
									var td2 = document.createElement("td");
									td2.setAttribute("class", "fname");
                                    var td3 = document.createElement("td");
									td3.setAttribute("class", "lname");
                                    var td4 = document.createElement("td");
									td4.setAttribute("class", "address1");
                                    var td5 = document.createElement("td");
									td5.setAttribute("class", "address2");
									var td6 = document.createElement("td");
									td6.setAttribute("class", "post-code");
                                    var td7 = document.createElement("td");
									td7.setAttribute("class", "delivery-option");
                                    var td8 = document.createElement("td");
									td8.setAttribute("class", "total");
                                    var td9 = document.createElement("td");
									td9.setAttribute("class", "created");
                                    var td10 = document.createElement("td");
									td10.setAttribute("class", "sent");
                                    var td11 = document.createElement("td");
									td11.setAttribute("class", "options");
                                    
									td1.innerHTML = obj.title;
                                    td2.innerHTML = obj.first_name;
                                    td3.innerHTML = obj.last_name;
                                    td4.innerHTML = obj.address_1;
                                    td5.innerHTML = obj.address_2;
                                    td6.innerHTML = obj.post_code;
                                    setDeliveryOption(obj.delivery, td7);
                                    td8.innerHTML = "&pound;" + obj.total;
                                    turnover += obj.total; // Add to the total turnover
                                    td9.innerHTML = window.ecoCart.shared.formatTimestamp(obj.created); // Format the timestamp
                                    
                                    var markButton = document.createElement("button");
									markButton.setAttribute("class", "mark-order");
                                    markButton.dataset.order = obj.id;
                                    
                                    if (obj.sent === "0") {
                                        td10.innerHTML = "No";
                                        markButton.dataset.setSent = 1;
                                        markButton.innerHTML = "Mark as Sent";
                                    } else {
                                        td10.innerHTML = "Yes";
                                        markButton.dataset.setSent = 0;
                                        markButton.innerHTML = "Mark as Not Sent";
                                    }
                                    
                                    var viewButton = document.createElement("button");
                                    viewButton.setAttribute("id", "view-order-button-" + obj.id);
                                    viewButton.setAttribute("class", "view-order-button");
                                    viewButton.dataset.order = obj.id;
                                    viewButton.innerHTML = "View";

                                    td11.appendChild(viewButton);
									td11.appendChild(markButton);

                                    var tds = [td1, td2, td3, td4, td5, td6, td7, td8, td9, td10, td11];
                                    for (var i = 0; i < tds.length; i++) { // Add these cells
                                        tr.appendChild(tds[i]);
                                    }
									ordersTable.appendChild(tr);
								}
							}
                            turnoverElem.innerHTML = "Turnover (this period): &pound;" + turnover.toFixed(2);
                            
                            window.ecoCart.shared.addClassEvents("click", "view-order-button", viewOrderClicked);
							window.ecoCart.shared.addClassEvents("click", "mark-order", markOrderClicked);
							window.ecoCart.animations.hideLoading(); // Hide the loading screen
						},
						error: loadError
					}
				});
			} else { // If the dateStart and dateEnd values are null
				var tr = document.createElement("tr");
				var td = document.createElement("td");
				td.setAttribute("colspan", headers.length);
				td.innerHTML = "Use the search form above to populate this table with orders.";
				
				tr.appendChild(td);
				ordersTable.appendChild(tr);
				window.ecoCart.animations.hideLoading(); // Hide the loading screen
			}
            
            return ordersTable;
            // </editor-fold>
        },
        getItemsTable = function (orderID) {
            // <editor-fold defaultstate="collapsed" desc="getItemsTable">
            var itemsTable = document.createElement("table");
            itemsTable.setAttribute("id", "items");
            var headerTR = document.createElement("tr");
            headerTR.setAttribute("class", "heading");
            
            var headers = ["Product", "Quantity", "Price"];
            
            for (var i = 0; i < headers.length; i++) {
                var td = document.createElement("td");
                td.innerHTML = headers[i];
                headerTR.appendChild(td);
            }
            itemsTable.appendChild(headerTR);
            
            // Populate items
            window.ecoCart.xhr.sendRequest({
                url: window.ecoCart.apiURL + "orderItem/order/" + orderID,
                callback: {
                    load: function (xhr) {
                        var resp = JSON.parse(xhr.target.responseText).data;

                        for (var key in resp) {
                            if (resp.hasOwnProperty(key)) { // Loop through the object
                                var obj = resp[key];
                                var tr = document.createElement("tr");
                                var td1 = document.createElement("td");
								td1.setAttribute("class", "name");
                                var td2 = document.createElement("td");
								td2.setAttribute("class", "quantity");
                                var td3 = document.createElement("td");
								td3.setAttribute("class", "price");
                                
                                td1.innerHTML = obj.name;
                                td2.innerHTML = obj.quantity;
                                td3.innerHTML = obj.price;

                                tr.appendChild(td1);
                                tr.appendChild(td2);
                                tr.appendChild(td3);
                                itemsTable.appendChild(tr);
                            }
                        }
                    },
                    error: loadError
                }
            });
            
            return itemsTable;
            // </editor-fold>
        },
        setDeliveryOption = function (delID, elemToSet) {
            // <editor-fold defaultstate="collapsed" desc="setDeliveryOption">
            // Set delivery option
            window.ecoCart.xhr.sendRequest({
                url: window.ecoCart.apiURL + "delivery/" + delID,
                callback: {
                    load: function (xhr) {
                        var resp = JSON.parse(xhr.target.responseText).data;

                        for (var key in resp) {
                            if (resp.hasOwnProperty(key)) { // Loop through the object
                                var obj = resp[key];
                                elemToSet.innerHTML = obj.name;
                            }
                        }
                    },
                    error: loadError
                }
            });
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
        productLinkClicked = function (evt) {
            // <editor-fold defaultstate="collapsed" desc="productLinkClicked">
            evt.preventDefault(); // Prevent default action, e.g. the form submitting and the page changing
            
            var product = evt.target.dataset.prod;
            
            if (localStorage) { // If localStorage is available
                localStorage.setItem("viewToLoad", "product");
                localStorage.setItem("idForView", product);
            }
            
            window.location = "../admin"; // Redirect to the admin area
            // </editor-fold>
        },
        viewOrderClicked = function (evt) {
            // <editor-fold defaultstate="collapsed" desc="viewOrderClicked">
            if (!window.ecoCart.reporting.viewOrderActive) {
                window.ecoCart.reporting.viewOrderActive = true; // Don't allow other view buttons to be clicked while processing this
                evt.target.disabled = true; // Disable this button
                var orderID = evt.target.dataset.order;
                
                var viewContainer = document.createElement("div");
                viewContainer.setAttribute("id", "view-order-container");
                var viewContent = document.createElement("div");
                viewContent.setAttribute("id", "view-order-content");
                var header = document.createElement("header");
                header.innerHTML = "Order (#" + orderID + ")";
                
                var itemsTable = getItemsTable(orderID);
                
                var closeButton = document.createElement("button");
                closeButton.dataset.order = orderID;
                closeButton.setAttribute("id", "close-order-button");
                closeButton.innerHTML = "Close";
                
                viewContent.appendChild(header);
                viewContent.appendChild(itemsTable);
                viewContent.appendChild(closeButton);
                viewContainer.appendChild(viewContent);
                window.ecoCart.mainElem.appendChild(viewContainer);
                
                /* Event Listeners */
                closeButton.addEventListener("click", closeButtonClicked);
                
                // Set this order as sent
//                window.ecoCart.xhr.sendRequest({
//                    url: window.ecoCart.apiURL + "order/markSent/" + orderID,
//                    method: "PUT",
//                    data: {sent: sentVal},
//                    callback: {
//                        load: function (xhr) {
//                            uiLogger.log("Order sent value updated (id: " + orderID + ")");
//                            loadView(); // Reload the view
//                        },
//                        error: loadError
//                }});
            }
            // </editor-fold>
        },
        markOrderClicked = function (evt) {
            // <editor-fold defaultstate="collapsed" desc="markOrderClicked">
            if (!window.ecoCart.reporting.markSentButtonActive) {
                window.ecoCart.reporting.markSentButtonActive = true; // Don't allow other buttons to be clicked while processing this
                evt.target.disabled = true; // Disable this button
                var orderID = evt.target.dataset.order;
                var sentVal = evt.target.dataset.setSent;
                
                // Set this order as sent
                window.ecoCart.xhr.sendRequest({
                    url: window.ecoCart.apiURL + "order/markSent/" + orderID,
                    method: "PUT",
                    data: {sent: sentVal},
                    callback: {
                        load: function (xhr) {
                            uiLogger.log("Order sent value updated (id: " + orderID + ")");
                            loadView(); // Reload the view
                        },
                        error: loadError
                }});
            }
            // </editor-fold>
        },
        ordersFormSubmitted = function (evt) {
            // <editor-fold defaultstate="collapsed" desc="ordersFormSubmitted">
            evt.preventDefault(); // Prevent default action, e.g. the form submitting
            
            if (localStorage) { // If local storage is available
                localStorage.setItem("reportingOrdersStart", document.getElementById("startDate").value);
                localStorage.setItem("reportingOrdersEnd", document.getElementById("endDate").value);
            }
            
            loadView(); // Reload the view
            // </editor-fold>
        },
        closeButtonClicked = function (evt) {
            // <editor-fold defaultstate="collapsed" desc="closeButtonClicked">
            var orderID = evt.target.dataset.order;
            window.ecoCart.mainElem.removeChild(document.getElementById("view-order-container"));
            document.getElementById("view-order-button-" + orderID).disabled = false; // Enable the button again
            window.ecoCart.reporting.viewOrderActive = false;
            // </editor-fold>
        },
        setup = function () {
            // <editor-fold defaultstate="collapsed" desc="setup">
            uiLogger = new Logger("Reporting UI", "script", 1); // Create a new logger object to keep track of this script
            uiLogger.log("loaded"); // Log that this script has been loaded

            window.ecoCart.xhr.xhrLogger = new Logger("xhr", "script", 1); // Create a new logger object to keep track of the XHR script
            
            // Get the stock warning level threshold setting
            window.ecoCart.xhr.sendRequest({
                url: window.ecoCart.apiURL + "settings/stock_level_warning_threshold",
                callback: {
                    load: function (xhr) {
                        var resp = JSON.parse(xhr.target.responseText).data;

                        for (var key in resp) {
                            if (resp.hasOwnProperty(key)) { // Loop through the object
                                var obj = resp[key];
                                window.ecoCart.reporting.warningStockLimit = parseInt(obj.value);
                            }
                        }
                    },
                    error: loadError
                }
            });
            
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