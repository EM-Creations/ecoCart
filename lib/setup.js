/* 
 * File: setup.js
 * Author: Edward McKnight (UP608985)
 * This file adds any necessary event listeners when the page is loaded
 */

window.ecoCart = window.ecoCart || {}; // Check the object exists, if not instantiate it as an empty object
window.ecoCart.apiVersion = 1; // Set the API version to use
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
		
		populateNavigation = function () {
			// <editor-fold defaultstate="collapsed" desc="populateNavigation">
			uiLogger.log("populating navigation");
			
			return function (xhr) {
				var resp = JSON.parse(xhr.target.responseText).resp;
				var catNav = document.querySelector("aside#catNav");
				var newNav = document.createElement("nav");
				
				var i = 0;
				for (var key in resp) {
					if (resp.hasOwnProperty(key)) { // Loop through the object
						var navObj = resp[key];
						var thisElem = document.createElement("ul");
						var li = document.createElement("li");
						
						li.innerHTML = navObj.name;
						
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
				var resp = JSON.parse(xhr.target.responseText).resp;
				grid.innerHTML = ""; // Remove the old featured items content
				
				for (var key in resp) {
					if (resp.hasOwnProperty(key)) { // Loop through the object
						var obj = resp[key];
						var gridItem = document.createElement("section");
						var itemImage = document.createElement("img");
						var itemName = document.createElement("header");
						var itemPrice = document.createElement("div");
						
						gridItem.setAttribute("class", "grid-item");
						itemImage.setAttribute("alt", obj.name);
						itemName.setAttribute("class", "item-link link");
						itemName.setAttribute("data-item", obj.id);
						itemImage.setAttribute("class", "item-link link");
						itemImage.setAttribute("data-item", obj.id);
						itemPrice.setAttribute("class", "price");
						
						itemImage.setAttribute("src", window.ecoCart.imgDir + obj.image);
						itemName.innerHTML = obj.name;
						itemPrice.innerHTML = "&pound;" + obj.price;
						gridItem.appendChild(itemImage);
						gridItem.appendChild(itemName);
						gridItem.appendChild(itemPrice);
						grid.appendChild(gridItem);
					}
				}
				
				var itemLinkClasses = document.getElementsByClassName("item-link");
				for (var i = 0; i < itemLinkClasses.length; i++) {
					itemLinkClasses[i].addEventListener("click", itemLinkClicked); // Event listener to handle item links being clicked
				}
			};
			// </editor-fold>
		},
		
		populateItem = function () {
			// <editor-fold defaultstate="collapsed" desc="populateItem">
			uiLogger.log("populating item");
			var main = document.querySelector("main");
			
			return function (xhr) {
				var resp = JSON.parse(xhr.target.responseText).resp;
				
				var itemSection = document.createElement("section");
				var itemImg = document.createElement("img");
				var itemName = document.createElement("header");
				var itemDesc = document.createElement("div");
				var itemPrice = document.createElement("div");
				
				itemSection.setAttribute("id", "item");
				itemImg.setAttribute("id", "main");
				itemDesc.setAttribute("id", "desc");
				itemPrice.setAttribute("class", "price");
				
				for (var key in resp) {
					if (resp.hasOwnProperty(key)) { // Loop through the object, should only be one element
						var obj = resp[key];
						
						itemImg.setAttribute("src", window.ecoCart.imgDir + obj.image);
						itemImg.setAttribute("alt", obj.name);
						itemName.innerHTML = obj.name;
						itemDesc.innerHTML = obj.description;
						itemPrice.innerHTML = "&pound;" + obj.price;
						
						itemSection.appendChild(itemImg);
						itemSection.appendChild(itemName);
						itemSection.appendChild(itemDesc);
						itemSection.appendChild(itemPrice);
						
						// Populate navigation
						window.ecoCart.xhr.sendRequest({
							vars: {
								a: "categories",
								ssv: obj.cat
							},
							callback: {
								load: populateNavigation(),
								error: loadError
							}
						});
					}
				}
				
				main.appendChild(itemSection);
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
				vars: {
					a: "time",
					ssv: "Y"
				},
				callback: {
					load: setFooterDate(),
					error: loadError
				}
			});
			
			// Populate navigation
			window.ecoCart.xhr.sendRequest({
				vars: {
					a: "categories",
					ssv: 0 // Top level (no parent) categories
				},
				callback: {
					load: populateNavigation(),
					error: loadError
				}
			});
			
			// Populate featured products (only for when the page is on the home page)
			window.ecoCart.xhr.sendRequest({
				vars: {
					a: "item",
					ssv: 1 // Featured products only
				},
				callback: {
					load: populateFeaturedProducts(),
					error: loadError
				}
			});
			// </editor-fold>
		},
		
		loadViewItem = function (id) {
			// <editor-fold defaultstate="collapsed" desc="loadViewItem">
			// Populate featured products (only for when the page is on the home page)
			window.ecoCart.xhr.sendRequest({
				vars: {
					a: "item",
					id: id // For this id only 
				},
				callback: {
					load: populateItem(),
					error: loadError
				}
			});
			// </editor-fold>
		},
		
		itemLinkClicked = function (evt) {
			// <editor-fold defaultstate="collapsed" desc="itemLinkClicked">
			var id = evt.target.dataset.item;
			
			window.ecoCart.currentView = "item";
			loadView(id); // Load the item view
			// </editor-fold>
		},
		
		headerClicked = function () {
			// <editor-fold defaultstate="collapsed" desc="headerClicked">
			window.ecoCart.currentView = "home";
			loadView(); // Load the home view
			// </editor-fold>
		},
		
		setup = function () {
			// <editor-fold defaultstate="collapsed" desc="setup">
			uiLogger = new Logger("UI", "script", 1); // Create a new logger object to keep track of this script
			uiLogger.log("loaded"); // Log that this script has been loaded
			
			window.ecoCart.xhr.xhrLogger = new Logger("xhr", "script", 1); // Create a new logger object to keep track of the XHR script

			/* Static event listeners */
			document.addEventListener("ecoCartLoaded", window.ecoCart.animations.hideLoading); // Event listener to close the modal loading screen when the application has loaded
			document.querySelector("#headerLogo").addEventListener("click", headerClicked); // Event listener to handle the header logo being clicked
						
			window.ecoCart.animations.setup(); // Call the animations setup
			
			loadView(); // Load the default view
			// </editor-fold>
		};
		
		return {
			"setup": setup
		};
}());

window.addEventListener("load", window.ecoCart.ui.setup);