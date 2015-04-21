/* 
 * File: setup.js
 * Author: UP608985
 * This file adds any necessary event listeners when the page is loaded
 */

window.ecoCart = window.ecoCart || {}; // Check the object exists, if not instantiate it as an empty object
window.ecoCart.currentView = "home";
window.ecoCart.name = "ecoCart";

window.ecoCart.ui = (function () {
    var
            uiLogger = {},
            loadError = function (evt) {
                // <editor-fold defaultstate="collapsed" desc="loadError">
                uiLogger.log("failed to load " + evt);
                // </editor-fold>
            },
            createItemGrid = function (data, gridElem) {
                // <editor-fold defaultstate="collapsed" desc="createItemGrid">
                for (var key in data) {
                    if (data.hasOwnProperty(key)) { // Loop through the object
                        var item = data[key];
                        var gridItem = document.createElement("section");
                        var itemImage = document.createElement("img");
                        var itemName = document.createElement("header");
                        var itemPrice = document.createElement("div");

                        gridItem.setAttribute("draggable", true); // Allow the entire item to be draggable
                        gridItem.setAttribute("class", "grid-item");
                        gridItem.setAttribute("data-item-id", item.id);
                        gridItem.setAttribute("data-item-name", item.name);
                        gridItem.setAttribute("data-item-price", item.price);
                        gridItem.setAttribute("data-item-weight", item.weight);
                        itemImage.setAttribute("alt", item.name);
                        itemImage.setAttribute("draggable", false); // Don't allow the image to be draggable
                        itemName.setAttribute("class", "item-link link");
                        itemName.setAttribute("data-item", item.id);
                        itemImage.setAttribute("class", "item-link link");
                        itemImage.setAttribute("data-item", item.id);
                        itemPrice.setAttribute("class", "price");

                        itemImage.setAttribute("src", window.ecoCart.imgDir + item.image);
                        itemName.innerHTML = item.name;
                        itemPrice.innerHTML = "&pound;" + item.price;
                        gridItem.appendChild(itemImage);
                        gridItem.appendChild(itemName);
                        gridItem.appendChild(itemPrice);
                        gridElem.appendChild(gridItem);
                        gridItem.addEventListener("dragstart", itemDragStarted);
                        gridItem.addEventListener("dragend", itemDragEnded);
                    }
                }
                // </editor-fold>
            },
            populateLeftNav = function () {
                // <editor-fold defaultstate="collapsed" desc="populateLeftNav">
                uiLogger.log("populating left nav");

                return function (xhr) {
                    var resp = JSON.parse(xhr.target.responseText).data;
                    var catNav = document.querySelector("aside#catNav");
                    var newNav = document.createElement("nav");
                    var newUL = document.createElement("ul");

                    var i = 0;
                    for (var key in resp) {
                        if (resp.hasOwnProperty(key)) { // Loop through the object
                            var navObj = resp[key];

                            var li = document.createElement("li");

                            li.innerHTML = "<a href=\"#\" class=\"cat-link link\" data-cat=\"" + navObj.id + "\">" + navObj.name + "</a>";

                            newUL.appendChild(li);
                        }
                        i++;
                    }

                    if (i === 0) { // If there are no categories to display
                        // Output a message explaining that there's no more categories to display
                        var elemLi = document.createElement("li");
                        elemLi.innerHTML = "No further categories";
                        newUL.appendChild(elemLi);
                    }

                    newNav.appendChild(newUL);

                    catNav.removeChild(document.querySelector("aside#catNav>nav")); // Remove the old nav
                    catNav.appendChild(newNav); // Append the new nav

                    window.ecoCart.shared.addClassEvents("click", "cat-link", categoryLinkClicked);
                    document.dispatchEvent(new CustomEvent("ecoCartLoaded")); // The application has finished loading once navigation has been populated
                };
                // </editor-fold>
            },
            populateFeaturedProducts = function () {
                // <editor-fold defaultstate="collapsed" desc="populateFeaturedProducts">
                uiLogger.log("populating featured products");
                var grid = document.querySelector("main>section#featured>div.grid");

                if (grid === null) { // If the grid doesn't exist, create it
                    var featured = document.createElement("section");
                    featured.setAttribute("id", "featured");
                    var featuredHeader = document.createElement("header");
                    featuredHeader.innerHTML = "Featured Products";
                    var grid = document.createElement("div");
                    grid.setAttribute("class", "grid");

                    featured.appendChild(featuredHeader);
                    featured.appendChild(grid);
                    document.querySelector("main").appendChild(featured);
                }

                return function (xhr) {
                    var resp = JSON.parse(xhr.target.responseText).data;
                    grid.innerHTML = ""; // Remove the old featured items content

                    createItemGrid(resp, grid);

                    window.ecoCart.shared.addClassEvents("click", "item-link", itemLinkClicked);
                };
                // </editor-fold>
            },
            populateItem = function () {
                // <editor-fold defaultstate="collapsed" desc="populateItem">
                uiLogger.log("populating item");

                return function (xhr) {
                    var resp = JSON.parse(xhr.target.responseText).data;

                    var itemSection = document.createElement("section");
                    var itemImg = document.createElement("img");
                    var productInfo = document.createElement("div");
                    var itemName = document.createElement("header");
                    var itemDesc = document.createElement("div");
                    var itemPrice = document.createElement("div");
                    var itemAddBasketButton = document.createElement("button");

                    productInfo.setAttribute("id", "productInfo");
                    itemSection.setAttribute("id", "item");
                    itemImg.setAttribute("id", "main");
                    itemDesc.setAttribute("id", "desc");
                    itemPrice.setAttribute("class", "price");
                    itemAddBasketButton.setAttribute("class", "add-to-basket");
                    itemAddBasketButton.innerHTML = "Add to Basket";

                    for (var key in resp) {
                        if (resp.hasOwnProperty(key)) { // Loop through the object, should only be one element
                            var obj = resp[key];

                            itemImg.setAttribute("src", window.ecoCart.imgDir + obj.image);
                            itemImg.setAttribute("alt", obj.name);
                            itemName.innerHTML = obj.name;
                            itemDesc.innerHTML = obj.description;
                            itemPrice.innerHTML = "&pound;" + obj.price + " ea";
                            itemAddBasketButton.setAttribute("data-item-id", obj.id);
                            itemAddBasketButton.setAttribute("data-item-name", obj.name);
                            itemAddBasketButton.setAttribute("data-item-price", obj.price);
                            itemAddBasketButton.setAttribute("data-item-weight", obj.weight);

                            itemSection.appendChild(itemImg);
                            productInfo.appendChild(itemName);
                            productInfo.appendChild(itemDesc);
                            productInfo.appendChild(itemPrice);
                            itemSection.appendChild(productInfo);
                            itemSection.appendChild(itemAddBasketButton);

                            // Populate left nav
                            window.ecoCart.xhr.sendRequest({
                                url: window.ecoCart.apiURL + "categories/parent/" + obj.cat,
                                callback: {
                                    load: populateLeftNav(),
                                    error: loadError
                                }
                            });

                            populateNavCatHierarchy(obj.cat);
                        }
                    }

                    window.ecoCart.mainElem.appendChild(itemSection);
                    window.ecoCart.shared.addClassEvents("click", "add-to-basket", addToBasketClicked);
                };
                // </editor-fold>
            },
            populateCategory = function (thisCat) {
                // <editor-fold defaultstate="collapsed" desc="populateCategory">
                uiLogger.log("populating category view");
                var grid = document.querySelector("main>section#products>div.grid");
                var catHeader = document.querySelector("section#products>header");

                if (grid === null) { // If the grid doesn't exist, create it
                    var prods = document.createElement("section");
                    prods.setAttribute("id", "products");
                    catHeader = document.createElement("header");
                    var grid = document.createElement("div");
                    grid.setAttribute("class", "grid");

                    prods.appendChild(catHeader);
                    prods.appendChild(grid);
                    window.ecoCart.mainElem.appendChild(prods);
                }

                return function (xhr) {
                    var resp = JSON.parse(xhr.target.responseText).data;
                    grid.innerHTML = ""; // Remove the old items content

                    window.ecoCart.xhr.sendRequest({
                        url: window.ecoCart.apiURL + "categories/" + thisCat,
                        callback: {
                            load: function (xhr) {
                                var resp = JSON.parse(xhr.target.responseText).data;

                                var i = 0;
                                for (var key in resp) {
                                    if (resp.hasOwnProperty(key)) { // Loop through the object
                                        var obj = resp[key];
                                        catHeader.innerHTML = obj.name + " Products";
                                    }
                                    i++;
                                }
                            },
                            error: loadError
                        }});

                    createItemGrid(resp, grid);

                    window.ecoCart.shared.addClassEvents("click", "item-link", itemLinkClicked);
                };
                // </editor-fold>
            },
            populateSearch = function (searchVal) {
                // <editor-fold defaultstate="collapsed" desc="populateSearch">
                uiLogger.log("populating search view");
                var grid = document.querySelector("main>section#products>div.grid");
                var searchHeader = document.querySelector("section#products>header");

                if (grid === null) { // If the grid doesn't exist, create it
                    var prods = document.createElement("section");
                    prods.setAttribute("id", "products");
                    searchHeader = document.createElement("header");
                    var grid = document.createElement("div");
                    grid.setAttribute("class", "grid");

                    prods.appendChild(searchHeader);
                    prods.appendChild(grid);
                    window.ecoCart.mainElem.appendChild(prods);
                }

                return function (xhr) {
                    var resp = JSON.parse(xhr.target.responseText).data;
                    grid.innerHTML = ""; // Remove the old items content
                    searchHeader.innerHTML = "\"" + searchVal + "\" Search Results";

                    if (resp.length > 0) { // If there's at least one result returned
                        createItemGrid(resp, grid);
                    } else { // If there were no search results
                        grid.innerHTML = "No matches were returned.";
                    }

                    window.ecoCart.shared.addClassEvents("click", "item-link", itemLinkClicked);
                };
                // </editor-fold>
            },
            loadView = function (id, showLoading) {
                // <editor-fold defaultstate="collapsed" desc="loadView">
                uiLogger.log("attempting to load " + window.ecoCart.currentView + " view");
                var searchElem = document.querySelector("div#headerSearch>form>input");
                searchElem.value = ""; // Clear the search input

                if ((showLoading === undefined) || (showLoading === true)) { // Default behaviour is to show the loading screen
                    window.ecoCart.animations.showLoading(); // Start the loading screen
                }

                window.ecoCart.mainElem.innerHTML = ""; // Clear the current content of main

                switch (window.ecoCart.currentView) { // Switch on the application's current view
                    case "home":
                        loadViewHome();
                        break;

                    case "item":
                        loadViewItem(id);
                        break;

                    case "cat":
                        loadViewCategory(id);
                        break;

                    case "search":
                        loadViewSearch(id);
                        break;

                    case "basket":
                        loadViewBasket();
                        break;

                    case "order":
                        loadViewOrder();
                        break;

                    case "confirm":
                        loadViewConfirm(id);
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

                // Populate navigation
                window.ecoCart.xhr.sendRequest({
                    url: window.ecoCart.apiURL + "categories/parent/0",
                    callback: {
                        load: populateLeftNav(),
                        error: loadError
                    }
                });

                // Populate featured products (only for when the page is on the home page)
                window.ecoCart.xhr.sendRequest({
                    url: window.ecoCart.apiURL + "item/featured",
                    callback: {
                        load: populateFeaturedProducts(),
                        error: loadError
                    }
                });
                // </editor-fold>
            },
            loadViewItem = function (id) {
                // <editor-fold defaultstate="collapsed" desc="loadViewItem">
                // Populate the specific item's page
                window.ecoCart.xhr.sendRequest({
                    url: window.ecoCart.apiURL + "item/" + id,
                    callback: {
                        load: populateItem(),
                        error: loadError
                    }
                });
                // </editor-fold>
            },
            loadViewCategory = function (id) {
                // <editor-fold defaultstate="collapsed" desc="loadViewCategory">
                // Populate products within this category
                window.ecoCart.xhr.sendRequest({
                    url: window.ecoCart.apiURL + "item/category/" + id,
                    callback: {
                        load: populateCategory(id),
                        error: loadError
                    }
                });

                // Populate navigation
                window.ecoCart.xhr.sendRequest({
                    url: window.ecoCart.apiURL + "categories/parent/" + id,
                    callback: {
                        load: populateLeftNav(),
                        error: loadError
                    }
                });
                // </editor-fold>
            },
            loadViewSearch = function (search) {
                // <editor-fold defaultstate="collapsed" desc="loadViewSearch">
                if (localStorage) { // If local storage is available
                    var searchElem = document.querySelector("div#headerSearch>form>input");
                    
                    if (localStorage.getItem("searchMethod") === "keyup") { // If the last search was using the keyup (more responsive) method
                        searchElem.value = localStorage.getItem("lastSearch"); // Set the search's value
                    }
                }
                
                // Populate products within this category
                window.ecoCart.xhr.sendRequest({
                    url: window.ecoCart.apiURL + "item/search/" + search,
                    callback: {
                        load: populateSearch(search),
                        error: loadError
                    }
                });

                // Populate navigation
                window.ecoCart.xhr.sendRequest({
                    url: window.ecoCart.apiURL + "categories/parent/0",
                    callback: {
                        load: populateLeftNav(),
                        error: loadError
                    }
                });
                // </editor-fold>
            },
            loadViewBasket = function () {
                // <editor-fold defaultstate="collapsed" desc="loadViewBasket">
                uiLogger.log("populating basket view");
                window.ecoCart.mainElem.innerHTML = ""; // Clear the main element

                var disableButtons = false; // Whether or not to disable the basket buttons
                var basketSection = document.createElement("section");
                var basketTitle = document.createElement("header");
                var updateBasketButton = document.createElement("button");
                updateBasketButton.setAttribute("id", "update-basket");
                updateBasketButton.innerHTML = "Update Basket";
                var clearBasketButton = document.createElement("button");
                clearBasketButton.setAttribute("id", "clear-basket");
                clearBasketButton.innerHTML = "Clear Basket";
                var orderButton = document.createElement("button");
                orderButton.setAttribute("id", "place-order");
                orderButton.innerHTML = "Place Order";

                basketSection.setAttribute("id", "basket");
                basketTitle.innerHTML = "Your Basket";
                basketSection.appendChild(basketTitle);
                var basketContents = document.createElement("table");
                basketContents.setAttribute("id", "basket");
                basketContents.innerHTML += "<tr><td>Your basket is empty.</td></tr>";

                if (localStorage) { // If localStorage is available
                    var basket = localStorage.getItem("ecoCartBasket");
                    if (basket !== null) { // If the basket exists
                        basket = JSON.parse(basket); // Put the basket into a JSON object
                        var totalPrice = 0;

                        basketContents.innerHTML = ""; // Clear the contents of the basket (ensures that "Your basket is empty" doesn't appear above a non-empty basket
                        var headingRow = document.createElement("tr");
                        headingRow.setAttribute("id", "heading");
                        headingRow.innerHTML = "<td>Item</td><td>Price</td><td>Quantity</td><td>Sub Total</td><td>Options</td>";
                        basketContents.appendChild(headingRow);

                        for (var i = 0; i < basket.length; i++) { // Loop through the basket
                            if (basket[i] === null) { // If this element is null, skip this iteration
                                continue;
                            }
                            
                            var row = document.createElement("tr");
                            var nameCell = document.createElement("td");
                            var priceCell = document.createElement("td");
                            var quantityCell = document.createElement("td");
                            var subTotPriceCell = document.createElement("td");
                            var optionsCell = document.createElement("td");
                            
                            var quantityInput = document.createElement("input");
                            quantityInput.dataset.item = basket[i].id;
                            quantityInput.setAttribute("class", "quantity-input");
                            quantityInput.setAttribute("type", "number");
                            quantityInput.setAttribute("min", 1);
                            quantityInput.setAttribute("value", basket[i].qty);
                            quantityInput.setAttribute("size", 3);
                            quantityInput.setAttribute("maxlength", 3);
                            quantityCell.appendChild(quantityInput);

                            if (i % 2 === 1) {
                                row.setAttribute("class", "otherRow");
                            }

                            var subTotPrice = basket[i].price * basket[i].qty;
                            totalPrice += subTotPrice;

                            nameCell.innerHTML = "<a class=\"item-link link\" data-item=" + basket[i].id + ">" + basket[i].name + "</a>";
                            priceCell.innerHTML = "&pound;" + basket[i].price;
                            subTotPriceCell.innerHTML = "&pound;" + (subTotPrice).toFixed(2); // Format to 2 decimal places
                            
                            var removeButton = document.createElement("button");
                            removeButton.setAttribute("class", "remove-item");
                            removeButton.dataset.item = basket[i].id;
                            removeButton.innerHTML = "Remove";
                            optionsCell.appendChild(removeButton);

                            row.appendChild(nameCell);
                            row.appendChild(priceCell);
                            row.appendChild(quantityCell);
                            row.appendChild(subTotPriceCell);
                            row.appendChild(optionsCell);
                            basketContents.appendChild(row); // Add this row to the basket contents
                        }

                        // Add the row to hold the total price of the basket
                        var totalRow = document.createElement("tr");
                        var totalTextCell = document.createElement("td");
                        totalRow.setAttribute("id", "total");
                        totalTextCell.innerHTML = "Total:";
                        var totalPriceCell = document.createElement("td");
                        totalPriceCell.innerHTML = "&pound;" + (totalPrice).toFixed(2); // Format to 2 decimal places
                        totalRow.appendChild(totalTextCell);
                        totalRow.appendChild(totalPriceCell);
                        basketContents.appendChild(totalRow);
                    } else {
                        disableButtons = true;
                    }
                } else {
                    disableButtons = true;
                }
                
                if (disableButtons) { // If we're disabling the basket buttons
                    updateBasketButton.disabled = true;
                    clearBasketButton.disabled = true;
                    orderButton.disabled = true;
                }

                basketSection.appendChild(basketContents);
                basketSection.appendChild(updateBasketButton);
                basketSection.appendChild(clearBasketButton);
                basketSection.appendChild(orderButton);
                window.ecoCart.mainElem.appendChild(basketSection);
                
                window.ecoCart.shared.addClassEvents("click", "item-link", itemLinkClicked);
                document.getElementById("update-basket").addEventListener("click", updateBasketClicked);
                document.getElementById("clear-basket").addEventListener("click", clearBasketClicked);
                document.getElementById("place-order").addEventListener("click", placeOrderClicked);
                window.ecoCart.shared.addClassEvents("click", "remove-item", removeItemClicked);

                // Populate navigation
                window.ecoCart.xhr.sendRequest({
                    url: window.ecoCart.apiURL + "categories/parent/0",
                    callback: {
                        load: populateLeftNav(),
                        error: loadError
                    }
                });
                // </editor-fold>
            },
            loadViewOrder = function () {
                // <editor-fold defaultstate="collapsed" desc="loadViewOrder">
				var basket = getBasket();
				
				if (basket && (basket !== null) && basket.length > 0) { // If the basket exists and isn't empty
					uiLogger.log("populating order view");
					var orderSection = document.createElement("section");
					var orderSectionText = document.createElement("div");
					var orderTitle = document.createElement("header");
					var deliverySelect = document.createElement("select");
					var completeButton = document.createElement("button");
					var orderTotalDiv = document.createElement("div");
					var orderTotalAmount = document.createElement("span");
					var form = document.createElement("form");
					form.setAttribute("id", "place-order-form");
					form.setAttribute("method", "post");
					form.setAttribute("action", "#");
					deliverySelect.setAttribute("id", "order-delivery-option");
					deliverySelect.required = true;
					window.ecoCart.mainElem.innerHTML = ""; // Clear the main element

					orderTitle.innerHTML = "Place Order";
					orderSection.setAttribute("id", "order");
					orderSection.appendChild(orderTitle);

					var totalPrice = 0;
					var totalWeight = 0;

					for (var i = 0; i < basket.length; i++) { // Loop through the basket
                        if (basket[i] === null) { // If this element is null, skip this iteration
                            continue;
                        }
						var subTotPrice = basket[i].price * basket[i].qty;
						totalPrice += subTotPrice;
						totalWeight += parseFloat(basket[i].weight);
					}

					orderSectionText.innerHTML = "<div id=\"orderSubTotal\">Order Sub-Total: &pound;" + (totalPrice).toFixed(2) + "</span>";

					// Create relevant form fields
					var detailsTable = document.createElement("table");
					detailsTable.setAttribute("id", "order-details");
					var row = document.createElement("tr");
					var cell1 = document.createElement("td");
					var cell2 = document.createElement("td");

					// Title
					cell1.setAttribute("class", "label");
					cell1.innerHTML = "Title:";
					var titleSelect = document.createElement("select");
					titleSelect.setAttribute("id", "order-title");
					titleSelect.required = true; // Required field
					titleSelect.innerHTML = "<option value=\"Mr\">Mr</option>\n\
										 <option value=\"Mrs\">Mrs</option>\n\
										 <option value=\"Miss\">Miss</option>\n\
										 <option value=\"Ms\">Ms</option>\n\
										 <option value=\"Dr\">Dr</option>";
					cell2.appendChild(titleSelect);
					row.appendChild(cell1);
					row.appendChild(cell2);
					detailsTable.appendChild(row);

					// First Name
					row = document.createElement("tr");
					cell1 = document.createElement("td");
					cell1.setAttribute("class", "label");
					cell2 = document.createElement("td");
					var fName = document.createElement("input");
					fName.setAttribute("id", "order-fname");
					fName.required = true; // Required field
					fName.setAttribute("pattern", "[a-zA-Z]+");
					fName.setAttribute("title", "First Name");
					cell1.innerHTML = "First Name:";
					cell2.appendChild(fName);
					row.appendChild(cell1);
					row.appendChild(cell2);
					detailsTable.appendChild(row);

					// Last Name
					row = document.createElement("tr");
					cell1 = document.createElement("td");
					cell1.setAttribute("class", "label");
					cell2 = document.createElement("td");
					var lName = document.createElement("input");
					lName.setAttribute("id", "order-lname");
					lName.required = true; // Required field
					lName.setAttribute("pattern", "[a-zA-Z]+");
					cell1.innerHTML = "Last Name:";
					cell2.appendChild(lName);
					row.appendChild(cell1);
					row.appendChild(cell2);
					detailsTable.appendChild(row);

					// Address 1
					row = document.createElement("tr");
					cell1 = document.createElement("td");
					cell1.setAttribute("class", "label");
					cell2 = document.createElement("td");
					var address1 = document.createElement("input");
					address1.setAttribute("id", "order-address1");
					address1.required = true; // Required field
					cell1.innerHTML = "Address (line 1):";
					cell2.appendChild(address1);
					row.appendChild(cell1);
					row.appendChild(cell2);
					detailsTable.appendChild(row);

					// Address 2
					row = document.createElement("tr");
					cell1 = document.createElement("td");
					cell1.setAttribute("class", "label");
					cell2 = document.createElement("td");
					var address2 = document.createElement("input");
					address2.setAttribute("id", "order-address2");
					cell1.innerHTML = "Address (line 2):";
					cell2.appendChild(address2);
					row.appendChild(cell1);
					row.appendChild(cell2);
					detailsTable.appendChild(row);

					// Postcode
					row = document.createElement("tr");
					cell1 = document.createElement("td");
					cell1.setAttribute("class", "label");
					cell2 = document.createElement("td");
					var postCode = document.createElement("input");
					postCode.setAttribute("id", "order-postcode");
					postCode.required = true; // Required field
					postCode.setAttribute("size", 8);
					postCode.setAttribute("maxlength", 8);
					cell1.innerHTML = "Postcode:";
					cell2.appendChild(postCode);
					row.appendChild(cell1);
					row.appendChild(cell2);
					detailsTable.appendChild(row);

					// Populate delivery options
					window.ecoCart.xhr.sendRequest({
						url: window.ecoCart.apiURL + "delivery/max-weight/" + totalWeight,
						callback: {
							load: function (xhr) {
								var resp = JSON.parse(xhr.target.responseText).data;

								var i = 0;
								for (var key in resp) {
									if (resp.hasOwnProperty(key)) { // Loop through the object
										var obj = resp[key];
										var option = document.createElement("option");
										option.setAttribute("value", obj.id);
										option.setAttribute("data-cost", obj.cost);
										option.innerHTML = obj.name + " - &pound;" + obj.cost;

										deliverySelect.appendChild(option);
									}
									i++;
								}
								var delRow = document.createElement("tr");
								var delCell1 = document.createElement("td");
								var delCell2 = document.createElement("td");
								delCell1.setAttribute("class", "label");
								delCell1.innerHTML = "Delivery option:";
								delCell2.appendChild(deliverySelect);
								delRow.appendChild(delCell1);
								delRow.appendChild(delCell2);
								detailsTable.appendChild(delRow);

								orderTotalDiv.setAttribute("id", "order-total");
								orderTotalAmount.setAttribute("id", "order-total-amount");
								orderTotalAmount.setAttribute("data-sub", totalPrice);
								orderTotalDiv.innerHTML = "Total to pay: ";
								orderTotalAmount.innerHTML = "&pound;" + (totalPrice + parseFloat(deliverySelect.options[deliverySelect.selectedIndex].dataset.cost)).toFixed(2);
								orderTotalDiv.appendChild(orderTotalAmount);
							},
							error: loadError
						}
					});

					completeButton.setAttribute("id", "complete-order");
					completeButton.setAttribute("type", "submit");
					completeButton.innerHTML = "Pay and Complete";
					form.appendChild(detailsTable);
					form.appendChild(completeButton);
					form.appendChild(orderTotalDiv);
					orderSectionText.appendChild(form);
					orderSection.appendChild(orderSectionText);
					window.ecoCart.mainElem.appendChild(orderSection);

					deliverySelect.addEventListener("change", updateOrderTotal); // Event listener to change the order total based on the delivery option chosen
					form.addEventListener("submit", completeOrderEvent); // Event listener to handle the complete order form being submitt

					// Populate navigation
					window.ecoCart.xhr.sendRequest({
						url: window.ecoCart.apiURL + "categories/parent/0",
						callback: {
							load: populateLeftNav(),
							error: loadError
						}
					});
				} else { // If the basket isn't populated
					window.ecoCart.animations.hideLoading();
					window.ecoCart.currentView = "basket"; // Redirect to basket
					loadView();
				}
                // </editor-fold>
            },
            loadViewConfirm = function (orderNum) {
                // <editor-fold defaultstate="collapsed" desc="loadViewConfirm">
                uiLogger.log("populating confirm view");
                window.ecoCart.mainElem.innerHTML = ""; // Clear the main element

                var confirmSection = document.createElement("section");
                var confirmTitle = document.createElement("header");
                var confirmText = document.createElement("p");
                confirmText.innerHTML = "Thank you for your order. Your order number is: <span id=\"orderID\">" + orderNum + "</span>";

                confirmSection.setAttribute("id", "confirm");
                confirmTitle.innerHTML = "Confirmation";
                confirmSection.appendChild(confirmTitle);
                confirmSection.appendChild(confirmText);

                window.ecoCart.mainElem.appendChild(confirmSection);

                // Populate navigation
                window.ecoCart.xhr.sendRequest({
                    url: window.ecoCart.apiURL + "categories/parent/0",
                    callback: {
                        load: populateLeftNav(),
                        error: loadError
                    }
                });
                // </editor-fold>
            },
            searchPerformed = function (evt) {
                // <editor-fold defaultstate="collapsed" desc="searchPerformed">
                evt.preventDefault(); // Prevent the form actually submitting (its default action)
                var searchInput = document.querySelector("div#headerSearch>form>input").value;
                if (searchInput.length > 0) { // If there's some search input
                    window.ecoCart.currentView = "search";
                    if (localStorage) { // If local storage is available
                        localStorage.setItem("searchMethod", "submit");
                        localStorage.setItem("lastSearch", searchInput);
                    }
                    
                    loadView(searchInput); // Load the item view
                }
                // </editor-fold>
            },
            searchTyped = function (evt) {
                // <editor-fold defaultstate="collapsed" desc="searchTyped">
                var searchInput = evt.target.value;
                if ((searchInput.length > 2) && window.ecoCart.shared.isCharacterKeyPress(evt)) { // If there's some search input and it's valid
                    window.ecoCart.currentView = "search";
                    if (localStorage) { // If local storage is available
                        localStorage.setItem("searchMethod", "keyup");
                        localStorage.setItem("lastSearch", searchInput);
                    }
                    
                    loadView(searchInput, false); // Load the item view
                }
                // </editor-fold>
            },
            itemLinkClicked = function (evt) {
                // <editor-fold defaultstate="collapsed" desc="itemLinkClicked">
                var id = evt.target.dataset.item;

                window.ecoCart.currentView = "item";
                loadView(id); // Load the item view
                // </editor-fold>
            },
            categoryLinkClicked = function (evt) {
                // <editor-fold defaultstate="collapsed" desc="categoryLinkClicked">
                evt.preventDefault(); // Prevent default action, e.g. changing the URL in the address bar if it's an <a> element
                var id = evt.target.dataset.cat;

                window.ecoCart.currentView = "cat";
                loadView(id); // Load the item view
                // </editor-fold>
            },
            basketLinkClicked = function (evt) {
                // <editor-fold defaultstate="collapsed" desc="basketLinkClicked">
                evt.preventDefault(); // Prevent default action, e.g. changing the URL in the address bar if it's an <a> element
                window.ecoCart.currentView = "basket";
                loadView(); // Load the basket view
                // </editor-fold>
            },
            headerClicked = function () {
                // <editor-fold defaultstate="collapsed" desc="headerClicked">
                window.ecoCart.currentView = "home";
                loadView(); // Load the home view
                // </editor-fold>
            },
            addToBasketClicked = function (evt) {
                // <editor-fold defaultstate="collapsed" desc="addToBasketClicked">
                // Digital Plane. (2012). Is there any way of passing additional data via custom events? Retrieved from http://stackoverflow.com/questions/9417121/is-there-any-way-of-passing-additional-data-via-custom-events on 25/01/2015
                var customEvt = document.createEvent("CustomEvent");
                customEvt.initCustomEvent("ecoCartAddToBasket", true, true, {id: evt.target.dataset.itemId, name: evt.target.dataset.itemName, price: evt.target.dataset.itemPrice, weight: evt.target.dataset.itemWeight, target: evt.target});
                document.dispatchEvent(customEvt);
                // </editor-fold>
            },
            updateBasketClicked = function () {
                // <editor-fold defaultstate="collapsed" desc="updateBasketClicked">
                if (localStorage) { // If localStorage is available                    
                    var classes = document.getElementsByClassName("quantity-input");
                    for (var i = 0; i < classes.length; i++) { // For each item
                        var item = classes[i].dataset.item;
                        var qty = classes[i].value;
                        
                        updateBasketItemQty(item, qty); // Update the quantity of this item
                    }
                    
                    loadView(); // Reload the basket view
                }
                // </editor-fold>
            },
            clearBasketClicked = function () {
                // <editor-fold defaultstate="collapsed" desc="clearBasketClicked">
                if (localStorage) { // If localStorage is available
                    localStorage.removeItem("ecoCartBasket");
                    loadView(); // Reload the basket view
                }
                // </editor-fold>
            },
            placeOrderClicked = function () {
                // <editor-fold defaultstate="collapsed" desc="placeOrderClicked">
                window.ecoCart.currentView = "order";
                loadView(); // Reload the basket view
                // </editor-fold>
            },
            removeItemClicked = function (evt) {
                // <editor-fold defaultstate="collapsed" desc="removeItemClicked">
                evt.preventDefault(); // Prevent default action, e.g. the form submitting and the page changing
                evt.target.disabled = true; // Disable this button

                var itemToRemove = evt.target.dataset.item;
                if (localStorage) { // If local storage is available
                    var basket = localStorage.getItem("ecoCartBasket");
                    if (basket !== null) { // If the basket exists
                        basket = JSON.parse(basket); // Put the basket into a JSON object

                        for (var i = 0; i < basket.length; i++) { // Loop through the basket
                            if (basket[i].id === itemToRemove) { // If this item already exists in the basket
                                console.log("Found this element at: " + i);
                                delete basket[i];
                                console.log("New array: ", basket);
                                break; // Break out of the loop
                            }
                        }
                    }

                    localStorage.setItem("ecoCartBasket", JSON.stringify(basket)); // Store the basket as a string
                }
                loadView(); // Reload the view
                // </editor-fold>
            },
            updateOrderTotal = function () {
                // <editor-fold defaultstate="collapsed" desc="updateOrderTotal">
                var orderTotalAmount = document.getElementById("order-total-amount");
                var subTotal = orderTotalAmount.dataset.sub;
                orderTotalAmount.innerHTML = "&pound;" + (parseFloat(subTotal) + parseFloat(this.options[this.selectedIndex].dataset.cost)).toFixed(2);
                // </editor-fold>
            },
            completeOrderEvent = function (evt) {
                // <editor-fold defaultstate="collapsed" desc="completeOrderEvent">
                evt.preventDefault(); // Prevent default action i.e. the form submitting and refreshing the page
                document.getElementById("complete-order").disabled = true; // Set the button to be disabled
                
                // Format the order details to be interpreted by the API				
                var orderDetails = {
                    title: document.getElementById("order-title").value,
                    fName: document.getElementById("order-fname").value,
                    lName: document.getElementById("order-lname").value,
                    address1: document.getElementById("order-address1").value,
                    address2: document.getElementById("order-address2").value,
                    postCode: document.getElementById("order-postcode").value,
                    deliveryOption: document.getElementById("order-delivery-option").options[document.getElementById("order-delivery-option").selectedIndex].value
                };

                var orderID = null;

				// Send this order to the API to store it in the database
				window.ecoCart.xhr.sendRequest({
					url: window.ecoCart.apiURL + "order",
					method: "POST",
					data: orderDetails,
					callback: {
						load: function (xhr) {
							var resp = parseInt(JSON.parse(xhr.target.responseText).data);
							orderID = resp;
							var basket = JSON.parse(localStorage.getItem("ecoCartBasket"));

							// Add basket items
							for (var key in basket) {
								if (basket.hasOwnProperty(key)) {
                                    if (basket[key] !== null) { // If this element isn't null
                                        window.ecoCart.xhr.sendRequest({
                                            url: window.ecoCart.apiURL + "orderItem/" + orderID,
                                            method: "POST",
                                            data: basket[key],
                                            callback: {
                                                error: loadError
                                        }});
                                    }
								}
							}

							localStorage.removeItem("ecoCartBasket"); // Clear basket
							window.ecoCart.currentView = "confirm";
							loadView(orderID);
						},
						error: loadError
					}});
                // </editor-fold>
            },
            addItemToBasket = function (evt) {
                // <editor-fold defaultstate="collapsed" desc="addItemToBasket">
                // Use evt.detail.id for ID, evt.detail.name for name
                if (localStorage) { // If local storage is available
                    var basket = localStorage.getItem("ecoCartBasket");
                    if (basket !== null) { // If the basket exists
                        basket = JSON.parse(basket); // Put the basket into a JSON object

                        var found = false;
                        for (var i = 0; i < basket.length; i++) { // Loop through the basket
                            if (basket[i].id === evt.detail.id) { // If this item already exists in the basket
                                basket[i].qty++; // Increment the quantity of this item in the basket
                                found = true;
                                break; // Break out of the loop
                            }
                        }

                        if (!found) { // If we didn't find the item in the basket, we need to add it
                            basket.push({id: evt.detail.id, name: evt.detail.name, qty: 1, price: evt.detail.price, weight: evt.detail.weight}); // Push the new item object onto the basket
                        }
                    } else { // If the basket doesn't exist, create it
                        basket = [{id: evt.detail.id, name: evt.detail.name, qty: 1, price: evt.detail.price, weight: evt.detail.weight}];
                    }

                    if (evt.detail.target) {
                        window.ecoCart.animations.showAddToBasketConfirm(evt.detail.target);
                    }
                    localStorage.setItem("ecoCartBasket", JSON.stringify(basket)); // Store the basket as a string
                    setTimeout(function () {
                        window.ecoCart.currentView = "basket";
                        loadView();
                    }, 2000); // Wait 2 seconds then take the user to the basket view
                }
                // </editor-fold>
            },
            updateBasketItemQty = function (item, quantity) {
                // <editor-fold defaultstate="collapsed" desc="updateBasketItemQty">
                if (localStorage) { // If local storage is available
                    var basket = localStorage.getItem("ecoCartBasket");
                    if (basket !== null) { // If the basket exists
                        basket = JSON.parse(basket); // Put the basket into a JSON object

                        for (var i = 0; i < basket.length; i++) { // Loop through the basket
                            if (basket[i].id === item) { // If this item already exists in the basket
                                basket[i].qty = quantity; // Set the quantity of this item in the basket
                                break; // Break out of the loop
                            }
                        }
                    }

                    localStorage.setItem("ecoCartBasket", JSON.stringify(basket)); // Store the basket as a string
                }
                // </editor-fold>
            },
			getBasket = function () {
				// <editor-fold defaultstate="collapsed" desc="getBasket">
				if (localStorage) { // If local storage is available
                    var basket = localStorage.getItem("ecoCartBasket");
                    if (basket !== null) { // If the basket exists
                        basket = JSON.parse(basket); // Put the basket into a JSON object
                    } else { // If the basket doesn't exist, create it
                        basket = [];
                    }

                    return basket;
                } else { // If local storage is not available
					return false;
				}
				// </editor-fold>
			},
            populateNavCatHierarchy = function (startCat) {
                // <editor-fold defaultstate="collapsed" desc="populateNavCatHierarchy">
                // TODO: Finish category hiearchy nav
                window.ecoCart.xhr.sendRequest({
                    url: window.ecoCart.apiURL + "categories/" + startCat,
                    callback: {
                        load: function (xhr) {
                            var resp = JSON.parse(xhr.target.responseText).data;
                            var main = document.querySelector("main");
                            var nav = document.createElement("nav");
                            nav.setAttribute("id", "catHierarchy");

                            var i = 0;
                            for (var key in resp) {
                                if (resp.hasOwnProperty(key)) { // Loop through the object
                                    var obj = resp[key];
                                    nav.innerHTML = obj.name;
                                }
                                i++;
                            }

                            main.insertBefore(nav, main.childNodes[0]); // Insert this nav before the item content
                        },
                        error: loadError
                    }
                });
                // </editor-fold>
            },
            checkViewToLoad = function () {
                // <editor-fold defaultstate="collapsed" desc="checkViewToLoad">
                uiLogger.log("Checking if there's a specific view to load..");

                if (localStorage) { // If local storage is available
                    if ((localStorage.getItem("viewToLoad") !== null) && (localStorage.getItem("viewToLoad") !== undefined)) {
                        var view = localStorage.getItem("viewToLoad");
                        localStorage.removeItem("viewToLoad");

                        if ((localStorage.getItem("idForView") !== null) && (localStorage.getItem("idForView") !== undefined)) { // If an id is available
                            var id = localStorage.getItem("idForView");
                        } else {
                            var id = null;
                        }

                        switch (view) {
                            case "item":
                                loadViewItem(id);
                                break;

                            case "cat":
                                window.ecoCart.currentView = "cat";
                                break;

                            case "search":
                                window.ecoCart.currentView = "search";
                                break;

                            case "basket":
                                window.ecoCart.currentView = "basket";
                                break;

                            case "order":
                                window.ecoCart.currentView = "order";
                                break;

                            case "confirm":
                                window.ecoCart.currentView = "confirm";
                                break;
                            
                            case "home":
                                window.ecoCart.currentView = "home";
                                break;

                            default:
                                window.ecoCart.currentView = "home";
                                break;
                        }

                        loadView(id);
                        return true;
                    }
                }

                return false;
                // </editor-fold>
            },
            // Dragging functions
            // Dr Rich Boakes, RB. (2015). Retrieved 20/04/2015, from https://github.com/portsoc/dragacat/blob/master/src/app.js
            itemDragStarted = function (evt) {
                // <editor-fold defaultstate="collapsed" desc="itemDragStarted">
                window.ecoCart.shared.addClass(document.getElementById("basket-link"), "highlight");
                var data = {id: evt.target.dataset.itemId, name: evt.target.dataset.itemName, price: evt.target.dataset.itemPrice, weight: evt.target.dataset.itemWeight};
                evt.dataTransfer.setData("application/json", JSON.stringify(data));
                event.dataTransfer.effectAllowed = "move";
                // </editor-fold>
            },
            itemDragEnded = function (evt) {
                window.ecoCart.shared.removeClass(document.getElementById("basket-link"), "highlight");
            },
            // Dr Rich Boakes, RB. (2015). Retrieved 20/04/2015, from https://github.com/portsoc/dragacat/blob/master/src/app.js
            itemDropped = function (evt) {
                // <editor-fold defaultstate="collapsed" desc="itemDropped">
                evt.preventDefault(); // Prevent default action
                var item,
                    received = evt.dataTransfer.getData("application/json");
                if (received) { // If we've received a valid dropped item
                    item = JSON.parse(received);
                    uiLogger.log(item.name + " dropped into basket");
                    // Digital Plane. (2012). Is there any way of passing additional data via custom events? Retrieved from http://stackoverflow.com/questions/9417121/is-there-any-way-of-passing-additional-data-via-custom-events on 25/01/2015
                    var customEvt = document.createEvent("CustomEvent");
                    customEvt.initCustomEvent("ecoCartAddToBasket", true, true, item);
                    document.dispatchEvent(customEvt);
                }
                // </editor-fold>
            },
            setup = function () {
                // <editor-fold defaultstate="collapsed" desc="setup">
                uiLogger = new Logger("UI", "script", 1); // Create a new logger object to keep track of this script
                uiLogger.log("loaded"); // Log that this script has been loaded

                window.ecoCart.xhr.xhrLogger = new Logger("xhr", "script", 1); // Create a new logger object to keep track of the XHR script
                window.ecoCart.mainElem = document.querySelector("main");
                
                // Set the title tag
                window.ecoCart.xhr.sendRequest({
                    url: window.ecoCart.apiURL + "settings/name",
                    callback: {
                        load: function (xhr) {
                            var resp = JSON.parse(xhr.target.responseText).data;

                            for (var key in resp) {
                                if (resp.hasOwnProperty(key)) { // Loop through the object
                                    var obj = resp[key];
                                    window.ecoCart.name = obj.value;
                                    document.querySelector("title").innerHTML = window.ecoCart.name;
                                }
                            }
                        },
                        error: loadError
                    }
                });

                /* Static event listeners */
                document.addEventListener("ecoCartLoaded", window.ecoCart.animations.hideLoading); // Event listener to close the modal loading screen when the application has loaded
                document.addEventListener("ecoCartAddToBasket", addItemToBasket);

                document.querySelector("#headerLogo").addEventListener("click", headerClicked); // Event listener to handle the header logo being clicked
                document.querySelector("div#headerSearch>form").addEventListener("submit", searchPerformed); // Event listener to handle search form submission
                document.querySelector("div#headerSearch>form>input").addEventListener("keyup", searchTyped); // Event listener to handle search input keyup
                
                var basket = document.getElementById("basket-link");
                basket.addEventListener("click", basketLinkClicked); // Event listener to handle basket links being clicked
                basket.addEventListener("drop", itemDropped);
                basket.addEventListener("dragover", window.ecoCart.shared.dragHandler);

                window.ecoCart.animations.setup(); // Call the animations setup

                // Check if there's a specific view which needs to be loaded
                if (!checkViewToLoad()) { // If checkViewToLoad didn't set the view up
                    loadView(); // Load the default view
                }
                // </editor-fold>
            };
    return {
        "setup": setup
    };
}());

window.addEventListener("load", window.ecoCart.ui.setup); // Load event listener - Starts the setup script