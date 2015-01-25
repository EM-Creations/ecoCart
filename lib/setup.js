/* 
 * File: setup.js
 * Author: UP608985
 * This file adds any necessary event listeners when the page is loaded
 */

window.ecoCart = window.ecoCart || {}; // Check the object exists, if not instantiate it as an empty object
window.ecoCart.apiVersion = 2; // Set the API version to use
window.ecoCart.apiURL = "./api/" + window.ecoCart.apiVersion + "/";

window.ecoCart.imgDir = "./images/products/";
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
		
		addClassEvents = function (event, className, callback) {
			// <editor-fold defaultstate="collapsed" desc="addClassEvents">
			var classes = document.getElementsByClassName(className);
			for (var i = 0; i < classes.length; i++) {
				classes[i].addEventListener(event, callback); // Event listener declaration
			}
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

					gridItem.setAttribute("class", "grid-item");
					itemImage.setAttribute("alt", item.name);
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
				
				var i = 0;
				for (var key in resp) {
					if (resp.hasOwnProperty(key)) { // Loop through the object
						var navObj = resp[key];
						var thisElem = document.createElement("ul");
						var li = document.createElement("li");
						
						li.innerHTML = "<a href=\"#\" class=\"cat-link link\" data-cat=\"" + navObj.id + "\">" + navObj.name + "</a>";
						
						thisElem.appendChild(li);
						newNav.appendChild(thisElem);
					}
					i++;
				}
				
				if (i === 0) { // If there are no categories to display
					// Output a message explaining that there's no more categories to display
					var elem = document.createElement("ul");
					var elemLi = document.createElement("li");
					elemLi.innerHTML = "No further categories";
					elem.appendChild(elemLi);
					newNav.appendChild(elem);
				}
				
				catNav.removeChild(document.querySelector("aside#catNav>nav")); // Remove the old nav
				catNav.appendChild(newNav); // Append the new nav
				
				addClassEvents("click", "cat-link", categoryLinkClicked);
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
				
				addClassEvents("click", "item-link", itemLinkClicked);
			};
			// </editor-fold>
		},
		
		populateItem = function () {
			// <editor-fold defaultstate="collapsed" desc="populateItem">
			uiLogger.log("populating item");
			var main = document.querySelector("main");
			
			return function (xhr) {
				var resp = JSON.parse(xhr.target.responseText).data;
				
				var itemSection = document.createElement("section");
				var itemImg = document.createElement("img");
				var itemName = document.createElement("header");
				var itemDesc = document.createElement("div");
				var itemPrice = document.createElement("div");
				var itemAddBasketButton = document.createElement("button");
				
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
						itemPrice.innerHTML = "&pound;" + obj.price;
						itemAddBasketButton.setAttribute("data-item-id", obj.id);
						itemAddBasketButton.setAttribute("data-item-name", obj.name);
						itemAddBasketButton.setAttribute("data-item-price", obj.price);
						
						itemSection.appendChild(itemImg);
						itemSection.appendChild(itemName);
						itemSection.appendChild(itemDesc);
						itemSection.appendChild(itemPrice);
						itemSection.appendChild(itemAddBasketButton);
												
						// Populate left nav
						window.ecoCart.xhr.sendRequest({
							url: window.ecoCart.apiURL + "categories/parent/" + obj.cat,
							callback: {
								load: populateLeftNav(),
								error: loadError
							}
						});
						
						// TODO: Populate category hierarchy
						populateNavCatHierarchy(obj.cat);
					}
				}
				
				main.appendChild(itemSection);
				addClassEvents("click", "add-to-basket", addToBasketClicked);
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
				document.querySelector("main").appendChild(prods);
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
				
				addClassEvents("click", "item-link", itemLinkClicked);
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
				document.querySelector("main").appendChild(prods);
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
				
				addClassEvents("click", "item-link", itemLinkClicked);
			};
			// </editor-fold>
		},
		
		setFooterDate = function () {
			// <editor-fold defaultstate="collapsed" desc="setFooterDate">
			uiLogger.log("setting footer date");
			
			return function (xhr) {
				var resp = JSON.parse(xhr.target.responseText).data;
				document.querySelector("footer>span#date").innerHTML = resp;
			};
			// </editor-fold>
		},
		
		loadView = function (id) {
			// <editor-fold defaultstate="collapsed" desc="loadView">
			uiLogger.log("attempting to load " + window.ecoCart.currentView + " view");
			
			window.ecoCart.animations.showLoading(); // Start the loading screen
			
			var main = document.querySelector("main");
			main.innerHTML = ""; // Clear the current content of main
			
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
					load: setFooterDate(),
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
			var main = document.querySelector("main");
			main.innerHTML = ""; // Clear the main element
			
			var basketSection = document.createElement("section");
			var basketTitle = document.createElement("header");
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
					headingRow.innerHTML = "<td>Item</td><td>Price</td><td>Quantity</td><td>Sub Total</td>";
					basketContents.appendChild(headingRow);
					
					for (var i = 0; i < basket.length; i++) { // Loop through the basket
						var row = document.createElement("tr");
						var nameCell = document.createElement("td");
						var priceCell = document.createElement("td");
						var quantityCell = document.createElement("td");
						var subTotPriceCell = document.createElement("td");
						
						if (i % 2 === 1) {
							row.setAttribute("class", "otherRow");
						}

						var subTotPrice = basket[i].price * basket[i].qty;
						totalPrice += subTotPrice;
						
						nameCell.innerHTML = "<a class=\"item-link link\" data-item=" + basket[i].id + ">" + basket[i].name + "</a>";
						priceCell.innerHTML = "&pound;" + basket[i].price;
						quantityCell.innerHTML = basket[i].qty;
						subTotPriceCell.innerHTML = "&pound;" + (subTotPrice).toFixed(2); // Format to 2 decimal places
						
						row.appendChild(nameCell);
						row.appendChild(priceCell);
						row.appendChild(quantityCell);
						row.appendChild(subTotPriceCell);
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
				}
			}
			
			basketSection.appendChild(basketContents);
			basketSection.appendChild(clearBasketButton);
			basketSection.appendChild(orderButton);
			main.appendChild(basketSection);
			addClassEvents("click", "item-link", itemLinkClicked);
			document.getElementById("clear-basket").addEventListener("click", clearBasketClicked); // Event listener declaration	
			
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
			var searchInput = document.querySelector("div#headerSearch>form>input");
			
			window.ecoCart.currentView = "search";
			loadView(searchInput.value); // Load the item view
			searchInput.value = ""; // Reset the input field
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
			customEvt.initCustomEvent("ecoCartAddToBasket", true, true, {id: evt.target.dataset.itemId, name: evt.target.dataset.itemName, price: evt.target.dataset.itemPrice, target: evt.target});
			document.dispatchEvent(customEvt);
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
						basket.push({id: evt.detail.id, name: evt.detail.name, qty: 1, price: evt.detail.price}); // Push the new item object onto the basket
					}
				} else { // If the basket doesn't exist, create it
					basket = [{id: evt.detail.id, name: evt.detail.name, qty: 1, price: evt.detail.price}];
				}
				
				window.ecoCart.animations.showAddToBasketConfirm(evt.detail.target);
				localStorage.setItem("ecoCartBasket", JSON.stringify(basket)); // Store the basket as a string
			}
			// </editor-fold>
		},
		
		populateNavCatHierarchy = function(startCat) {
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
		
		// kirupa. (2012). Get an Element's Position Using JavaScript. Retrieved from http://www.kirupa.com/html5/get_element_position_using_javascript.htm on 25/01/2015
		getPosition = function (element) {
			// <editor-fold defaultstate="collapsed" desc="getPosition">
			var xPosition = 0;
			var yPosition = 0;

			while(element) {
				xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
				yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
				element = element.offsetParent;
			}
			return { x: xPosition, y: yPosition };
			// </editor-fold>
		},
		
		setup = function () {
			// <editor-fold defaultstate="collapsed" desc="setup">
			uiLogger = new Logger("UI", "script", 1); // Create a new logger object to keep track of this script
			uiLogger.log("loaded"); // Log that this script has been loaded
			
			window.ecoCart.xhr.xhrLogger = new Logger("xhr", "script", 1); // Create a new logger object to keep track of the XHR script

			/* Static event listeners */
			document.addEventListener("ecoCartLoaded", window.ecoCart.animations.hideLoading); // Event listener to close the modal loading screen when the application has loaded
			document.addEventListener("ecoCartAddToBasket", addItemToBasket);
			
			document.querySelector("#headerLogo").addEventListener("click", headerClicked); // Event listener to handle the header logo being clicked
			document.querySelector("div#headerSearch>form").addEventListener("submit", searchPerformed); // Event listener to handle searches
			document.querySelector(".basket-link").addEventListener("click", basketLinkClicked); // Event listener to handle basket links being clicked
						
			window.ecoCart.animations.setup(); // Call the animations setup
			
			loadView(); // Load the default view
			// </editor-fold>
		};
		
		return {
			"setup": setup,
			"getPosition": getPosition
		};
}());

window.addEventListener("load", window.ecoCart.ui.setup);