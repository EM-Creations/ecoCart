/* 
 * File: admin_setup.js
 * Author: UP608985
 */

window.ecoCart = window.ecoCart || {}; // Check the object exists, if not instantiate it as an empty object
window.ecoCart.admin = window.ecoCart.admin || {}; // Check the admin object exists, if not instantiate it as an empty object
window.ecoCart.admin.currentView = "home";
window.ecoCart.apiURL = "." + window.ecoCart.apiURL; // Prepend "." to the API URL so it goes to the parent directory (neccessary for the admin area)
window.ecoCart.admin.editingCat = false; // Variable to store whether a category is currently open for editing
window.ecoCart.admin.editingDel = false; // Variable to store whether a delivery option is currently open for editing

window.ecoCart.admin.fileSizeLimit = 5000000; // 5MB

window.ecoCart.admin.ui = (function () {
    var
        uiLogger = {},
        setCatParentFieldFromID = function (id, elem, noCatText) {
            // <editor-fold defaultstate="collapsed" desc="setCatParentFieldFromID">
            id = parseInt(id); // Ensure it's an integer
            
            if (id === 0) { // Invalid for request, return some dummy data
                elem.innerHTML = noCatText;
            } else {
                window.ecoCart.xhr.sendRequest({
                    url: window.ecoCart.apiURL + "categories/" + id,
                    callback: {
                        load: function (xhr) {
                            var resp = JSON.parse(xhr.target.responseText).data;

                            for (var key in resp) {
                                if (resp.hasOwnProperty(key)) { // Loop through the object
                                    var obj = resp[key];
                                    elem.innerHTML = obj.name;
                                }
                            }
                        },
                        error: function () {
                            console.log("XHR Error when requesting: " + id);
                            elem.innerHTML = "-- Error --";
                        }
                    }
                });
            }
            // </editor-fold>
        },
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
                    
                case "category":
                    loadViewCategory();
                    break;
                    
                case "delivery-options":
                    loadViewDeliveryOpts();
                    break;
					
				case "products":
					loadViewProducts();
					break;
                    
                case "product":
                    loadViewProduct(id);
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
            grid.setAttribute("class", "admin-grid");
            
            var options = {
                            'Categories': 
                                    {
                                        'name': "Categories",
                                        'link': "category"
                                    },
                            'Products':
                                    {
                                        'name': "Products",
                                        'link': "products"
                                    },
                            'Delivery Options':
                                    {
                                        'name': "Delivery Options",
                                        'link': "delivery-options"
                                    },
                            'Settings':
                                    {
                                       'name': "Settings", 
                                       'link': "settings"
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
        loadViewCategory = function () {
            // <editor-fold defaultstate="collapsed" desc="loadViewCategory">            
            var section = document.createElement("section");
            section.setAttribute("id", "categories");
            var sectionHeader = document.createElement("header");
            sectionHeader.innerHTML = "Categories";
            section.appendChild(sectionHeader);

            // <editor-fold defaultstate="collapsed" desc="Add Category">
            var addCatGroup = document.createElement("fieldset");
            var addCatHeader = document.createElement("legend");
            addCatHeader.innerHTML = "Add Category";
            addCatGroup.appendChild(addCatHeader);
            var addCatForm = document.createElement("form");
            addCatForm.setAttribute("id", "add-category");
            addCatForm.setAttribute("method", "post");
            addCatForm.setAttribute("action", "#");
            var addCatParentLabel = document.createElement("label");
            addCatParentLabel.setAttribute("for", "categoryParent");
            addCatParentLabel.innerHTML = "Parent";
            
            var addCatTextFieldLabel = document.createElement("label");
            addCatTextFieldLabel.setAttribute("for", "categoryName");
            addCatTextFieldLabel.innerHTML = "Category Name";
            var addCatTextField = document.createElement("input");
            addCatTextField.required = true; // Required field
            addCatTextField.setAttribute("id", "categoryName");
            var addCatButton = document.createElement("button");
            addCatButton.setAttribute("id", "add-cat-button");
            addCatButton.setAttribute("type", "submit");
            addCatButton.innerHTML = "Add";
            
            addCatForm.appendChild(addCatParentLabel);
            addCatForm.appendChild(getCategorySelect("categoryParent", 0, true));
            addCatForm.appendChild(addCatTextFieldLabel);
            addCatForm.appendChild(addCatTextField);
            addCatForm.appendChild(addCatButton);
            addCatGroup.appendChild(addCatForm);
            // </editor-fold>
            
            // <editor-fold defaultstate="collapsed" desc="Edit / Remove category">
            var modCatGroup = document.createElement("fieldset");
            var modCatGroupHeader = document.createElement("legend");
            modCatGroupHeader.innerHTML = "Edit Categories";
            var div = document.createElement("div");
            div.setAttribute("id", "modifyCatDiv");
            var catTable = getCategoriesTable();
            
            modCatGroup.appendChild(modCatGroupHeader);
            div.appendChild(catTable);
            modCatGroup.appendChild(div);
            // </editor-fold>
            
            section.appendChild(addCatGroup);
            section.appendChild(modCatGroup);
            window.ecoCart.mainElem.appendChild(section); // Add the options section to the main element
            
            /* Event Listeners */
            document.getElementById("add-category").addEventListener("submit", addCategoryEvent);
            // </editor-fold>
        },
        loadViewDeliveryOpts = function () {
            // <editor-fold defaultstate="collapsed" desc="loadViewDeliveryOpts">            
            var section = document.createElement("section");
            section.setAttribute("id", "delivery-opts");
            var sectionHeader = document.createElement("header");
            sectionHeader.innerHTML = "Delivery Options";
            section.appendChild(sectionHeader);

            // <editor-fold defaultstate="collapsed" desc="Add Delivery Option">
            var addDelGroup = document.createElement("fieldset");
            var addDelHeader = document.createElement("legend");
            addDelHeader.innerHTML = "Add Delivery Option";
            addDelGroup.appendChild(addDelHeader);
            var addDelForm = document.createElement("form");
            addDelForm.setAttribute("id", "add-del");
            addDelForm.setAttribute("method", "post");
            addDelForm.setAttribute("action", "#");
            
            var addDelNameFieldLabel = document.createElement("label");
            addDelNameFieldLabel.setAttribute("for", "delName");
            addDelNameFieldLabel.innerHTML = "Delivery Option Name";
            var addDelNameField = document.createElement("input");
            addDelNameField.setAttribute("id", "delName");
            addDelNameField.required = true; // Required field
            
            var addDelMaxWeightFieldLabel = document.createElement("label");
            addDelMaxWeightFieldLabel.setAttribute("for", "delMaxWeight");
            addDelMaxWeightFieldLabel.innerHTML = "Max Weight (kg)";
            var addDelMaxWeightField = document.createElement("input");
            addDelMaxWeightField.setAttribute("id", "delMaxWeight");
            addDelMaxWeightField.setAttribute("type", "number");
            addDelMaxWeightField.setAttribute("step", "any"); // Allow decimals
            addDelMaxWeightField.setAttribute("min", "0.1");
            
            var addDelEcoFieldLabel = document.createElement("label");
            addDelEcoFieldLabel.setAttribute("for", "delEco");
            addDelEcoFieldLabel.innerHTML = "Eco Rating";
            var addDelEcoField = document.createElement("input");
            addDelEcoField.setAttribute("id", "delEco");
            addDelEcoField.setAttribute("type", "number");
            addDelEcoField.setAttribute("min", "1");
            
            var addDelCostFieldLabel = document.createElement("label");
            addDelCostFieldLabel.setAttribute("for", "delCost");
            addDelCostFieldLabel.innerHTML = "Cost (&pound;)";
            var addDelCostField = document.createElement("input");
            addDelCostField.setAttribute("id", "delCost");
            addDelCostField.setAttribute("type", "number");
            addDelCostField.setAttribute("step", "any");
            addDelCostField.setAttribute("min", "0");
            
            var addDelButton = document.createElement("button");
            addDelButton.setAttribute("id", "add-del-button");
            addDelButton.setAttribute("type", "submit");
            addDelButton.innerHTML = "Add";
            
            addDelForm.appendChild(addDelNameFieldLabel);
            addDelForm.appendChild(addDelNameField);
            addDelForm.appendChild(addDelMaxWeightFieldLabel);
            addDelForm.appendChild(addDelMaxWeightField);
            addDelForm.appendChild(addDelEcoFieldLabel);
            addDelForm.appendChild(addDelEcoField);
            addDelForm.appendChild(addDelCostFieldLabel);
            addDelForm.appendChild(addDelCostField);
            addDelForm.appendChild(addDelButton);
            addDelGroup.appendChild(addDelForm);
            // </editor-fold>
            
            // <editor-fold defaultstate="collapsed" desc="Edit / Remove delivery option">
            var modDelGroup = document.createElement("fieldset");
            var modDelGroupHeader = document.createElement("legend");
            modDelGroupHeader.innerHTML = "Edit Delivery Options";
            var div = document.createElement("div");
            div.setAttribute("id", "modifyDelDiv");
            var delTable = getDeliveryTable();
            
            modDelGroup.appendChild(modDelGroupHeader);
            div.appendChild(delTable);
            modDelGroup.appendChild(div);
            // </editor-fold>
            
            section.appendChild(addDelGroup);
            section.appendChild(modDelGroup);
            window.ecoCart.mainElem.appendChild(section); // Add the options section to the main element
            
            /* Event Listeners */
            document.getElementById("add-del").addEventListener("submit", addDelEvent);
            // </editor-fold>
        },
		loadViewProducts = function () {
            // <editor-fold defaultstate="collapsed" desc="loadViewProducts">            
            var section = document.createElement("section");
            section.setAttribute("id", "products");
            var sectionHeader = document.createElement("header");
            sectionHeader.innerHTML = "Products";
            section.appendChild(sectionHeader);

			// <editor-fold defaultstate="collapsed" desc="Create elements">
			// New product button
			var newButton = document.createElement("button");
			newButton.setAttribute("id", "new-product-button");
			newButton.innerHTML = "New Product";
			section.appendChild(newButton);
			
			// Search
			var searchProduct = document.createElement("fieldset");
			searchProduct.setAttribute("id", "searchProduct");
			var searchProductTitle = document.createElement("legend");
			searchProductTitle.innerHTML = "Search";
			var searchProductForm = document.createElement("form");
			searchProductForm.setAttribute("id", "search-product-form");
			var searchProductInput = document.createElement("input");
			searchProductInput.setAttribute("placeholder", "Search text");
			searchProductInput.setAttribute("class", "search-field");
			var searchProductButton = document.createElement("button");
			searchProductButton.setAttribute("type", "submit");
			searchProductButton.innerHTML = "Go";
			
			searchProductForm.appendChild(searchProductInput);
			searchProductForm.appendChild(searchProductButton);
			
			searchProduct.appendChild(searchProductTitle);
			searchProduct.appendChild(searchProductForm);
			searchProduct.appendChild(getProductsTable(null)); // Append the products table
			
			section.appendChild(searchProduct);
			// </editor-fold>
            
			window.ecoCart.mainElem.appendChild(section); // Add the options section to the main element

			/* Event Listeners */
            document.getElementById("new-product-button").addEventListener("click", newProductButtonClicked);
			document.getElementById("search-product-form").addEventListener("submit", productSearchPerformed);
            // </editor-fold>
        },
        loadViewProduct = function (id) {
            // <editor-fold defaultstate="collapsed" desc="loadViewProduct">            
            var section = document.createElement("section");
            section.setAttribute("id", "product");
            var sectionHeader = document.createElement("header");
            if (id !== null) { // If we're editing a product
                sectionHeader.innerHTML = "Editing Product (" + id + ")";
            } else { // If we're adding a new product
                sectionHeader.innerHTML = "New Product";
            }
            
            section.appendChild(sectionHeader);

			// <editor-fold defaultstate="collapsed" desc="Create elements">
            var productForm = document.createElement("form");
            productForm.setAttribute("id", "product-form");
            productForm.setAttribute("enctype", "multipart/form-data");
            var formTable = document.createElement("table");
            formTable.setAttribute("id", "product-table");
            var row = document.createElement("tr");
            var cell1 = document.createElement("td");
            var cell2 = document.createElement("td");
            
            // Name
            cell1.setAttribute("class", "label");
            cell1.innerHTML = "Name:";
            var name = document.createElement("input");
            name.setAttribute("id", "name");
            name.setAttribute("name", "name");
            name.required = true; // Required field
            cell2.appendChild(name);
            row.appendChild(cell1);
            row.appendChild(cell2);
            formTable.appendChild(row);
            
            // Category
            row = document.createElement("tr");
            cell1 = document.createElement("td");
            var catSelectCell = document.createElement("td");
            var catSelect = getCategorySelect("category", null, false);
            cell1.setAttribute("class", "label");
            cell1.innerHTML = "Category:";
            catSelectCell.appendChild(catSelect);
            row.appendChild(cell1);
            row.appendChild(catSelectCell);
            formTable.appendChild(row);
            
            // Price
            row = document.createElement("tr");
            cell1 = document.createElement("td");
            cell2 = document.createElement("td");
            cell1.setAttribute("class", "label");
            cell1.innerHTML = "Price (&pound;):";
            var price = document.createElement("input");
            price.setAttribute("id", "price");
            price.setAttribute("name", "price");
            price.setAttribute("type", "number");
            price.setAttribute("step", "any"); // Allow decimals
            price.setAttribute("min", "0.1");
            price.required = true; // Required field
            
            cell2.appendChild(price);
            row.appendChild(cell1);
            row.appendChild(cell2);
            formTable.appendChild(row);
            
            // Featured
            row = document.createElement("tr");
            cell1 = document.createElement("td");
            cell2 = document.createElement("td");
            cell1.setAttribute("class", "label");
            cell1.innerHTML = "Featured:";
            var featuredYes = document.createElement("input");
            featuredYes.setAttribute("type", "radio");
            featuredYes.setAttribute("name", "featured");
            featuredYes.setAttribute("id", "featuredYes");
            featuredYes.setAttribute("value", "1");
            var featuredYesLabel = document.createElement("label");
            featuredYesLabel.setAttribute("for", "featuredYes");
            featuredYesLabel.innerHTML = "Yes";
            var featuredNo = document.createElement("input");
            featuredNo.setAttribute("type", "radio");
            featuredNo.setAttribute("name", "featured");
            featuredNo.setAttribute("id", "featuredNo");
            featuredNo.setAttribute("value", "0");
            featuredNo.setAttribute("checked", "checked");
            var featuredNoLabel = document.createElement("label");
            featuredNoLabel.setAttribute("for", "featuredNo");
            featuredNoLabel.innerHTML = "No";
            
            cell2.appendChild(featuredYes);
            cell2.appendChild(featuredYesLabel);
            cell2.appendChild(featuredNo);
            cell2.appendChild(featuredNoLabel);
            row.appendChild(cell1);
            row.appendChild(cell2);
            formTable.appendChild(row);
            
            // Weight
            row = document.createElement("tr");
            cell1 = document.createElement("td");
            cell2 = document.createElement("td");
            cell1.setAttribute("class", "label");
            cell1.innerHTML = "Weight (kg):";
            var weight = document.createElement("input");;
            weight.setAttribute("id", "weight");
            weight.setAttribute("name", "weight");
            weight.setAttribute("type", "number");
            weight.setAttribute("step", "any"); // Allow decimals
            weight.setAttribute("min", "0.001");
            weight.required = true; // Required field
            
            cell2.appendChild(weight);
            row.appendChild(cell1);
            row.appendChild(cell2);
            formTable.appendChild(row);
            
            // Stock
            row = document.createElement("tr");
            cell1 = document.createElement("td");
            cell2 = document.createElement("td");
            cell1.setAttribute("class", "label");
            cell1.innerHTML = "Stock:";
            var stock = document.createElement("input");
            stock.setAttribute("id", "stock");
            stock.setAttribute("name", "stock");
            stock.setAttribute("type", "number");
            stock.setAttribute("min", "0");
            stock.value = 0;
            stock.required = true; // Required field
            
            cell2.appendChild(stock);
            row.appendChild(cell1);
            row.appendChild(cell2);
            formTable.appendChild(row);
            
            // Description
            row = document.createElement("tr");
            cell1 = document.createElement("td");
            cell2 = document.createElement("td");
            cell1.setAttribute("class", "label");
            cell1.innerHTML = "Description:";
            var desc = document.createElement("textarea");
            desc.setAttribute("id", "desc");
            desc.setAttribute("name", "desc");
            desc.required = true; // Required field
            
            cell2.appendChild(desc);
            row.appendChild(cell1);
            row.appendChild(cell2);
            formTable.appendChild(row);
            
            // Image
            row = document.createElement("tr");
            cell1 = document.createElement("td");
            cell2 = document.createElement("td");
            cell1.setAttribute("class", "label");
            cell1.innerHTML = "Image:";
            var image = document.createElement("input");
            image.setAttribute("id", "image");
            image.setAttribute("name", "image");
            image.setAttribute("type", "file");
            if (id === null) {
                image.required = true; // Required field
            }

            cell2.appendChild(image);
            row.appendChild(cell1);
            row.appendChild(cell2);
            formTable.appendChild(row);
            
            // Submit button
            row = document.createElement("tr");
            cell1 = document.createElement("td");
            cell2 = document.createElement("td");
            var submitButton = document.createElement("button");
            submitButton.setAttribute("id", "submitButton");
            submitButton.setAttribute("type", "submit");
            if (id === null) { // New product
                submitButton.innerHTML = "Add Product";
            } else { // Existing product
                submitButton.innerHTML = "Save";
                submitButton.dataset.prod = id;
            }
            
            cell2.appendChild(submitButton);
            row.appendChild(cell1);
            row.appendChild(cell2);
            formTable.appendChild(row);
            
            productForm.appendChild(formTable);
            
            // Image area
            var imageFieldSet = document.createElement("fieldset");
            imageFieldSet.setAttribute("id", "image-area");
            var imageLegend = document.createElement("legend");
            imageLegend.innerHTML = "Image";
            imageFieldSet.appendChild(imageLegend);
            var imagePreview = document.createElement("img");
            imagePreview.setAttribute("id", "image-preview");
            var imageInfo = document.createElement("div");
            imageInfo.setAttribute("id", "image-info");
            var imageName = document.createElement("div");
            imageName.setAttribute("id", "image-name");
            var imageSize = document.createElement("div");
            imageSize.setAttribute("id", "image-size");
            var imageType = document.createElement("div");
            imageType.setAttribute("id", "image-type");
            var imageDim = document.createElement("div");
            imageDim.setAttribute("id", "image-dim");
            imageInfo.appendChild(imageName);
            imageInfo.appendChild(imageSize);
            imageInfo.appendChild(imageType);
            imageInfo.appendChild(imageDim);
            var error = document.createElement("div");
            error.setAttribute("id", "error");
            
            imageFieldSet.appendChild(imagePreview);
            imageFieldSet.appendChild(imageInfo);
            imageFieldSet.appendChild(error);
            
            section.appendChild(productForm);
            section.appendChild(imageFieldSet);
			// </editor-fold>
            
            if (id !== null) { // If we're editing an existing item
                window.ecoCart.xhr.sendRequest({
                        url: window.ecoCart.apiURL + "item/" + id,
                        callback: {
                            load: function (xhr) {
                                var resp = JSON.parse(xhr.target.responseText).data;

                                for (var key in resp) {
                                    if (resp.hasOwnProperty(key)) { // Loop through the object
                                        var obj = resp[key];
                                        name.value = obj.name;
                                        catSelectCell.innerHTML = ""; // Clear the cell
                                        var catSelect = getCategorySelect("category", obj.cat, false);
                                        catSelectCell.appendChild(catSelect);
                                        price.value = obj.price;
                                        weight.value = obj.weight;
                                        stock.value = obj.stock;
                                        desc.value = obj.description;
                                        
                                        if (obj.featured === "1") {
                                            featuredYes.checked = true;
                                            featuredNo.checked = false;
                                        } else {
                                            featuredYes.checked = false;
                                            featuredNo.checked = true;
                                        }
                                        
                                        imagePreview.setAttribute("src", "." + window.ecoCart.imgDir + obj.image);
                                    }
                                }
                                window.ecoCart.animations.hideLoading(); // Hide the loading screen
                            },
                        error: loadError
                    }
                });
            }
            
			window.ecoCart.mainElem.appendChild(section); // Add the section to the main element
            if (id === null) {
                window.ecoCart.animations.hideLoading(); // Hide the loading screen
            }

			/* Event Listeners */
            document.getElementById("product-form").addEventListener("submit", productFormSubmitted);
            document.getElementById("image").addEventListener("change", imageFileSelected);
            // </editor-fold>
        },
		getCategorySelect = function (selectID, defaultVal, parent, ignoreID) {
			// <editor-fold defaultstate="collapsed" desc="getCategorySelect">            
			var addCatParent = document.createElement("select");
            addCatParent.setAttribute("id", selectID);
            addCatParent.setAttribute("name", selectID);
            if (parent) { // If this is for setting a cetegory parent
                var noParentOption = document.createElement("option");
                noParentOption.setAttribute("value", 0);
                noParentOption.innerHTML = "-- No Parent --";
                addCatParent.appendChild(noParentOption);
            }
            
            // Populate parent select
            window.ecoCart.xhr.sendRequest({
                url: window.ecoCart.apiURL + "categories",
                callback: {
                    load: function (xhr) {
                        var resp = JSON.parse(xhr.target.responseText).data;

                        for (var key in resp) {
                            if (resp.hasOwnProperty(key)) { // Loop through the object
                                var obj = resp[key];
                                if (obj.id !== ignoreID) { // If this object isn't being ignored
                                    var option = document.createElement("option");
                                    option.setAttribute("value", obj.id);
                                    option.innerHTML = obj.name;

                                    addCatParent.appendChild(option);
                                }
                            }
                        }
                        if (defaultVal !== null) { // If a default value is provided
                            addCatParent.value = defaultVal; // Set the currently selected option to the specified default value
                        }
                    },
                    error: loadError
                }
            });
			return addCatParent;
			// </editor-fold>
		},
        getCategoriesTable = function () {
            // <editor-fold defaultstate="collapsed" desc="getCategoriesTable">
            var catTable = document.createElement("table");
            catTable.setAttribute("id", "catTable");
            var headerTR = document.createElement("tr");
            headerTR.setAttribute("class", "heading");
            
            var headers = ["Category", "Parent", "Options"];
            
            for (var i = 0; i < headers.length; i++) {
                var td = document.createElement("td");
                td.innerHTML = headers[i];
                headerTR.appendChild(td);
            }
            catTable.appendChild(headerTR);
            
            // Populate categories
            window.ecoCart.xhr.sendRequest({
                url: window.ecoCart.apiURL + "categories",
                callback: {
                    load: function (xhr) {
                        var resp = JSON.parse(xhr.target.responseText).data;

                        for (var key in resp) {
                            if (resp.hasOwnProperty(key)) { // Loop through the object
                                var obj = resp[key];
                                var tr = document.createElement("tr");
								tr.setAttribute("id", "cat-" + obj.id);
                                tr.dataset.cat = obj.id;
                                var td1 = document.createElement("td");
								td1.setAttribute("class", "name");
                                var td2 = document.createElement("td");
								td2.setAttribute("class", "parent");
                                td2.dataset.parent = obj.parent_id;
                                var td3 = document.createElement("td");
								td3.setAttribute("class", "options");
                                
                                td1.innerHTML = obj.name;
                                setCatParentFieldFromID(obj.parent_id, td2, "-- No Parent --");
                                
                                var editButton = document.createElement("button");
                                editButton.setAttribute("class", "edit-cat");
                                editButton.dataset.cat = obj.id;
                                editButton.innerHTML = "Edit";
                                var deleteButton = document.createElement("button");
                                deleteButton.setAttribute("class", "delete-cat");
                                deleteButton.dataset.cat = obj.id;
                                deleteButton.innerHTML = "Delete";
                                td3.appendChild(editButton);
                                td3.appendChild(deleteButton);

                                tr.appendChild(td1);
                                tr.appendChild(td2);
                                tr.appendChild(td3);
                                catTable.appendChild(tr);
                            }
                        }
                        window.ecoCart.shared.addClassEvents("click", "delete-cat", deleteCatClicked);
						window.ecoCart.shared.addClassEvents("click", "edit-cat", editCatClicked);
                        window.ecoCart.animations.hideLoading(); // Hide the loading screen
                    },
                    error: loadError
                }
            });
            
            return catTable;
            // </editor-fold>
        },
        getDeliveryTable = function () {
            // <editor-fold defaultstate="collapsed" desc="getDeliveryTable">
            var delTable = document.createElement("table");
            delTable.setAttribute("id", "delTable");
            var headerTR = document.createElement("tr");
            headerTR.setAttribute("class", "heading");
            
            var headers = ["Delivery Option", "Max Weight (kg)", "Eco Rating", "Cost (&pound;)", "Options"];
            
            for (var i = 0; i < headers.length; i++) {
                var td = document.createElement("td");
                td.innerHTML = headers[i];
                headerTR.appendChild(td);
            }
            delTable.appendChild(headerTR);
            
            // Populate delivery options
            window.ecoCart.xhr.sendRequest({
                url: window.ecoCart.apiURL + "delivery",
                callback: {
                    load: function (xhr) {
                        var resp = JSON.parse(xhr.target.responseText).data;

                        for (var key in resp) {
                            if (resp.hasOwnProperty(key)) { // Loop through the object
                                var obj = resp[key];
                                var tr = document.createElement("tr");
								tr.setAttribute("id", "del-" + obj.id);
                                tr.dataset.del = obj.id;
                                var td1 = document.createElement("td");
								td1.setAttribute("class", "name");
                                var td2 = document.createElement("td");
								td2.setAttribute("class", "maxWeight");
                                var td3 = document.createElement("td");
								td3.setAttribute("class", "eco");
                                var td4 = document.createElement("td");
								td4.setAttribute("class", "cost");
                                var td5 = document.createElement("td");
								td5.setAttribute("class", "options");
                                
                                td1.innerHTML = obj.name;
                                td2.innerHTML = obj.max_weight;
                                td3.innerHTML = obj.eco_rating;
                                td4.innerHTML = obj.cost;
                                
                                var editButton = document.createElement("button");
                                editButton.setAttribute("class", "edit-del");
                                editButton.dataset.del = obj.id;
                                editButton.innerHTML = "Edit";
                                var deleteButton = document.createElement("button");
                                deleteButton.setAttribute("class", "delete-del");
                                deleteButton.dataset.del = obj.id;
                                deleteButton.innerHTML = "Delete";
                                td5.appendChild(editButton);
                                td5.appendChild(deleteButton);

                                tr.appendChild(td1);
                                tr.appendChild(td2);
                                tr.appendChild(td3);
                                tr.appendChild(td4);
                                tr.appendChild(td5);
                                delTable.appendChild(tr);
                            }
                        }
                        window.ecoCart.shared.addClassEvents("click", "delete-del", deleteDelClicked);
						window.ecoCart.shared.addClassEvents("click", "edit-del", editDelClicked);
                        window.ecoCart.animations.hideLoading(); // Hide the loading screen
                    },
                    error: loadError
                }
            });
            
            return delTable;
            // </editor-fold>
        },
		getProductsTable = function (searchVal) {
            // <editor-fold defaultstate="collapsed" desc="getProductsTable">
            var productsTable = document.createElement("table");
            productsTable.setAttribute("id", "productsTable");
            var headerTR = document.createElement("tr");
            headerTR.setAttribute("class", "heading");
            
            var headers = ["Product", "Options"];
            
            for (var i = 0; i < headers.length; i++) {
                var td = document.createElement("td");
                td.innerHTML = headers[i];
                headerTR.appendChild(td);
            }
            productsTable.appendChild(headerTR);
            
			if (searchVal !== null) { // If the search value isn't null
				// Populate products
				window.ecoCart.xhr.sendRequest({
					url: window.ecoCart.apiURL + "item/search/" + searchVal,
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
									td2.setAttribute("class", "options");
									
									td1.innerHTML = obj.name;

									var editButton = document.createElement("button");
									editButton.setAttribute("class", "edit-prod");
									editButton.dataset.prod = obj.id;
									editButton.innerHTML = "Edit";
									var deleteButton = document.createElement("button");
									deleteButton.setAttribute("class", "delete-prod");
									deleteButton.dataset.prod = obj.id;
									deleteButton.innerHTML = "Delete";
									td2.appendChild(editButton);
									td2.appendChild(deleteButton);

									tr.appendChild(td1);
									tr.appendChild(td2);
									productsTable.appendChild(tr);
								}
							}
							window.ecoCart.shared.addClassEvents("click", "delete-prod", deleteProdClicked);
							window.ecoCart.shared.addClassEvents("click", "edit-prod", editProdClicked);
							window.ecoCart.animations.hideLoading(); // Hide the loading screen
						},
						error: loadError
					}
				});
			} else { // If the search value is null
				var tr = document.createElement("tr");
				var td = document.createElement("td");
				td.setAttribute("colspan", 2);
				td.innerHTML = "Use the search form above to populate this table with products, which you can then modify.";
				
				tr.appendChild(td);
				productsTable.appendChild(tr);
				window.ecoCart.animations.hideLoading(); // Hide the loading screen
			}
            
            return productsTable;
            // </editor-fold>
        },
        optionsLinkClicked = function (evt) {
            // <editor-fold defaultstate="collapsed" desc="categoryOptionsLinkClicked">
            evt.preventDefault(); // Prevent default action, e.g. changing the URL in the address bar if it's an <a> element
            var view = evt.target.dataset.view;
            window.ecoCart.admin.currentView = view;
            loadView(); // Load the category view
            // </editor-fold>
        },
        deleteCatClicked = function (evt) {
            // <editor-fold defaultstate="collapsed" desc="deleteCatClicked">
            evt.preventDefault(); // Prevent default action, e.g. the form submitting and the page changing
            evt.target.disabled = true; // Disable this button
            
            var catToDelete = evt.target.dataset.cat;
            
            // Send off to the API to delete the category
            window.ecoCart.xhr.sendRequest({
                url: window.ecoCart.apiURL + "categories/" + catToDelete,
                method: "DELETE",
                callback: {
                    load: function (xhr) {
                        var resp = JSON.parse(xhr.target.responseText).data;
                        uiLogger.log("Category (" + catToDelete + ") deleted");
                        loadView(); // Reload the view
                    },
                    error: loadError
                }});
            // </editor-fold>
        },
		editCatClicked = function (evt) {
            // <editor-fold defaultstate="collapsed" desc="editCatClicked">
            evt.preventDefault(); // Prevent default action, e.g. the form submitting and the page changing
            
            if (!window.ecoCart.admin.editingCat) { // If a category isn't currently open for editing
                window.ecoCart.admin.editingCat = true;
                
                // Change the edit button for this category into a save button
                evt.target.innerHTML = "Save";
                evt.target.setAttribute("class", "save-cat");
                window.ecoCart.shared.setClassDisabled("edit-cat", true);
                
                var id = evt.target.dataset.cat;
                var row = document.querySelector("table#catTable>tr#cat-" + id); // Get the corresponding row
                var nodes = row.childNodes; // nodes[0] - Name nodes[1] - Parent
                var parentID = nodes[1].dataset.parent;

                var input = document.createElement("input");
                input.setAttribute("id", "modCatName");
                input.value = nodes[0].innerHTML;
                input.required = true; // Required field
                nodes[0].innerHTML = ""; // Clear the cell
                nodes[0].appendChild(input);

                nodes[1].innerHTML = ""; // Clear the cell
                nodes[1].appendChild(getCategorySelect("modCatParent", parentID, true, id));
                
                window.ecoCart.shared.addClassEvents("click", "save-cat", saveCatClicked); // Add event listener for the save button
            }
            // </editor-fold>
        },
        saveCatClicked = function (evt) {
            // <editor-fold defaultstate="collapsed" desc="saveCatClicked">
            evt.preventDefault(); // Prevent default action, e.g. the form submitting and the page changing
            
            if (window.ecoCart.admin.editingCat) { // If a category is currently open for editing
                evt.target.disabled = true; // Disable the save button so it can't be clicked again
                var id = evt.target.dataset.cat;
                var name = document.getElementById("modCatName");
                var parent = document.getElementById("modCatParent");
                
                if (name.value.length > 0) { // If there's at least one character set for the category name
                    var catDetails = {
                        name: name.value,
                        parent: parent.value
                    };
                     
                    // Send this category update to the API to store it in the database
                    window.ecoCart.xhr.sendRequest({
                        url: window.ecoCart.apiURL + "categories/" + id,
                        method: "PUT",
                        data: catDetails,
                        callback: {
                            load: function (xhr) {
                                uiLogger.log("Category updated (id: " + id + ")");
                                loadView(); // Reload the view
                            },
                            error: loadError
                        }});
                    
                    window.ecoCart.admin.editingCat = false; // Another category can now be edited
                }
            }
            // </editor-fold>
        },
        addCategoryEvent = function (evt) {
            // <editor-fold defaultstate="collapsed" desc="addCategoryEvent">
            evt.preventDefault(); // Prevent default action, e.g. the form submitting and the page changing
            document.getElementById("add-cat-button").disabled = true; // Set the button to be disabled
            
            var catName = document.querySelector("form#add-category>input#categoryName");
            var parent = document.querySelector("form#add-category>select#categoryParent");
            
            if (catName.value.length > 0) { // If there's at least one character set for the new category
                var catDetails = {
                    name: catName.value,
                    parent: parent.value
                };
                
                // Send this new category to the API to store it in the database
                window.ecoCart.xhr.sendRequest({
                    url: window.ecoCart.apiURL + "categories",
                    method: "POST",
                    data: catDetails,
                    callback: {
                        load: function (xhr) {
                            var resp = JSON.parse(xhr.target.responseText).data;
                            uiLogger.log("New category added (id: " + resp + ")");
                            loadView(); // Reload the view
                        },
                        error: loadError
                    }});
                }
            // </editor-fold>
        },
        addDelEvent = function (evt) {
            // <editor-fold defaultstate="collapsed" desc="addDelEvent">
            evt.preventDefault(); // Prevent default action, e.g. the form submitting and the page changing
            document.getElementById("add-del-button").disabled = true; // Disable this button
            
            var name = document.querySelector("form#add-del>input#delName");
            var maxWeight = document.querySelector("form#add-del>input#delMaxWeight");
            var ecoRating = document.querySelector("form#add-del>input#delEco");
            var cost = document.querySelector("form#add-del>input#delCost");
            
            if (name.value.length > 0) { // If there's at least one character set for the new delivery option
                var delDetails = {
                    name: name.value,
                    maxWeight: maxWeight.value,
                    ecoRating: ecoRating.value,
                    cost: cost.value
                };
                
                // Send this new category to the API to store it in the database
                window.ecoCart.xhr.sendRequest({
                    url: window.ecoCart.apiURL + "delivery",
                    method: "POST",
                    data: delDetails,
                    callback: {
                        load: function (xhr) {
                            var resp = JSON.parse(xhr.target.responseText).data;
                            uiLogger.log("New delivery option added (id: " + resp + ")");
                            loadView(); // Reload the view
                        },
                        error: loadError
                    }});
                }
            // </editor-fold>
        },
        deleteDelClicked = function (evt) {
            // <editor-fold defaultstate="collapsed" desc="deleteDelClicked">
            evt.preventDefault(); // Prevent default action, e.g. the form submitting and the page changing
            evt.target.disabled = true; // Disable this button
            
            var delToDelete = evt.target.dataset.del;
            
            // Send off to the API to delete the category
            window.ecoCart.xhr.sendRequest({
                url: window.ecoCart.apiURL + "delivery/" + delToDelete,
                method: "DELETE",
                callback: {
                    load: function (xhr) {
                        uiLogger.log("Delivery option (" + delToDelete + ") deleted");
                        loadView(); // Reload the view
                    },
                    error: loadError
                }});
            // </editor-fold>
        },
        editDelClicked = function (evt) {
            // <editor-fold defaultstate="collapsed" desc="editDelClicked">
            evt.preventDefault(); // Prevent default action, e.g. the form submitting and the page changing
            
            if (!window.ecoCart.admin.editingDel) { // If a category isn't currently open for editing
                window.ecoCart.admin.editingDel = true;
                
                // Change the edit button for this delivery option into a save button
                evt.target.innerHTML = "Save";
                evt.target.setAttribute("class", "save-del");
                window.ecoCart.shared.setClassDisabled("edit-del", true);
                
                var id = evt.target.dataset.del;
                var row = document.querySelector("table#delTable>tr#del-" + id); // Get the corresponding row
                var nodes = row.childNodes; // nodes[0] - Name nodes[1] - Max Weight nodes[2] - Eco Rating nodes[3] - Cost

                var input = document.createElement("input");
                input.setAttribute("id", "modDelName");
                input.value = nodes[0].innerHTML;
                input.required = true; // Required field
                nodes[0].innerHTML = ""; // Clear the cell
                nodes[0].appendChild(input);
                
                input = document.createElement("input");
                input.setAttribute("id", "modDelMaxWeight");
                input.setAttribute("type", "number");
                input.setAttribute("step", "any");
                input.setAttribute("min", "0.1");
                input.value = nodes[1].innerHTML;
                nodes[1].innerHTML = ""; // Clear the cell
                nodes[1].appendChild(input);
                
                input = document.createElement("input");
                input.setAttribute("id", "modDelEco");
                input.setAttribute("type", "number");
                input.setAttribute("min", "1");
                input.value = nodes[2].innerHTML;
                nodes[2].innerHTML = ""; // Clear the cell
                nodes[2].appendChild(input);
                
                input = document.createElement("input");
                input.setAttribute("id", "modDelCost");
                input.setAttribute("type", "number");
                input.setAttribute("step", "any");
                input.setAttribute("min", "0");
                input.value = nodes[3].innerHTML;
                nodes[3].innerHTML = ""; // Clear the cell
                nodes[3].appendChild(input);
                
                window.ecoCart.shared.addClassEvents("click", "save-del", saveDelClicked); // Add event listener for the save button
            }
            // </editor-fold>
        },
        saveDelClicked = function (evt) {
            // <editor-fold defaultstate="collapsed" desc="saveDelClicked">
            evt.preventDefault(); // Prevent default action, e.g. the form submitting and the page changing
            
            if (window.ecoCart.admin.editingDel) { // If a delivery option is currently open for editing
                evt.target.disabled = true; // Disable the button so it can't be clicked
                var id = evt.target.dataset.del;
                var name = document.getElementById("modDelName");
                var maxWeight = document.getElementById("modDelMaxWeight");
                var eco = document.getElementById("modDelEco");
                var cost = document.getElementById("modDelCost");
                
                var delDetails = {
                    name: name.value,
                    maxWeight: maxWeight.value,
                    ecoRating: eco.value,
                    cost: cost.value
                };
                
                if (name.value.length > 0) { // If there's at least one character set for the delivery option
                    // Send this category update to the API to store it in the database
                    window.ecoCart.xhr.sendRequest({
                        url: window.ecoCart.apiURL + "delivery/" + id,
                        method: "PUT",
                        data: delDetails,
                        callback: {
                            load: function (xhr) {
                                uiLogger.log("Delivery option updated (id: " + id + ")");
                                loadView(); // Reload the view
                            },
                            error: loadError
                        }});
                    
                    window.ecoCart.admin.editingDel = false; // Another deliveyr option can now be edited
                }
            }
            // </editor-fold>
        },
        headerClicked = function () {
            // <editor-fold defaultstate="collapsed" desc="headerClicked">
            window.ecoCart.admin.currentView = "home";
            loadView(); // Reload the view
            // </editor-fold>
        },
		productSearchPerformed = function (evt) {
            // <editor-fold defaultstate="collapsed" desc="productSearchPerformed">
            evt.preventDefault(); // Stop the search form from submitting
			
			var searchInput = document.querySelector("form#search-product-form>input").value;
			if (searchInput.length > 0) { // If there's some search input
				window.ecoCart.animations.showLoading(); // Start the loading screen
				var currProducts = document.getElementById("productsTable");
				var searchFieldset = document.getElementById("searchProduct");
				searchFieldset.removeChild(currProducts); // Remove the current table
				searchFieldset.appendChild(getProductsTable(searchInput)); // Append the new table
			}
            // </editor-fold>
        },
		deleteProdClicked = function (evt) {
            // <editor-fold defaultstate="collapsed" desc="deleteProdClicked">
            evt.preventDefault(); // Prevent default action, e.g. the form submitting and the page changing
            evt.target.disabled = true; // Disable this button
            
            var prodToDelete = evt.target.dataset.prod;
            
            // Send off to the API to delete the product
            window.ecoCart.xhr.sendRequest({
                url: window.ecoCart.apiURL + "item/" + prodToDelete,
                method: "DELETE",
                callback: {
                    load: function (xhr) {
                        var resp = JSON.parse(xhr.target.responseText).data;
                        uiLogger.log("Product (" + prodToDelete + ") deleted");
                        loadView(); // Reload the view
                    },
                    error: loadError
                }});
            // </editor-fold>
        },
        newProductButtonClicked = function () {
          // <editor-fold defaultstate="collapsed" desc="newProductButtonClicked"> 
          window.ecoCart.admin.currentView = "product";
          loadView(null); // Load view and pass in null to indicate a new product
          // </editor-fold>
        },
        editProdClicked = function (evt) {
            // <editor-fold defaultstate="collapsed" desc="editProdClicked">
            evt.preventDefault(); // Prevent default action, e.g. the form submitting and the page changing
            evt.target.disabled = true; // Disable this button
            
            var prodToEdit = evt.target.dataset.prod;
            
            window.ecoCart.admin.currentView = "product";
            loadView(prodToEdit);
            // </editor-fold>
        },
        productFormSubmitted = function (evt) {
          // <editor-fold defaultstate="collapsed" desc="productFormSubmitted">
          evt.preventDefault(); // Prevent default action
          var submitButton = document.getElementById("submitButton");
          var prod = submitButton.dataset.prod;
          submitButton.disabled = true; // Disable the submit button

          var formData = new FormData(document.getElementById("product-form"));
          
          if (prod === undefined) { // If we're adding a new product
            // Send this new category to the API to store it in the database
              window.ecoCart.xhr.sendRequest({
                  url: window.ecoCart.apiURL + "item",
                  method: "POST",
                  noProcess: true, // Don't further process this into form data (already in correct format
                  data: formData,
                  callback: {
                      load: function (xhr) {
                          var resp = JSON.parse(xhr.target.responseText).data;
                          uiLogger.log("New product added (id: " + resp + ")");
                          window.ecoCart.admin.currentView = "products"; // Go to the products screen
                          loadView(); // Reload the view
                      },
                      error: loadError
                  }});
            } else { // If we're editing an existing product
                window.ecoCart.xhr.sendRequest({
                  url: window.ecoCart.apiURL + "item/" + prod,
                  method: "PUT",
                  noProcess: true, // Don't further process this into form data (already in correct format
                  data: formData,
                  callback: {
                      load: function (xhr) {
                          var resp = JSON.parse(xhr.target.responseText).data;
                          uiLogger.log("Edited product (id: " + resp + ")");
                          window.ecoCart.admin.currentView = "products"; // Go to the products screen
                          loadView(); // Reload the view
                      },
                      error: loadError
                  }});
            }
          // </editor-fold>
        },
		imageFileSelected = function () {
            // <editor-fold defaultstate="collapsed" desc="imageFileSelected">
            var error = document.getElementById("error");
            error.style.display = "none"; // Hide the error message
            var file = document.getElementById("image").files[0];

            // Test that it's an image file
            var imageFilter = /^(image\/bmp|image\/gif|image\/jpeg|image\/png|image\/tiff)$/i;
            if (!imageFilter.test(file.type)) { // If the file type is invalid
                error.innerHTML = "Invalid image file type.";
                error.style.display = "block"; // Shw the error
                return;
            }

            // Test for filesize
            if (file.size > window.ecoCart.admin.fileSizeLimit) { // If the file is too large
                error.innerHTML = "File size exceeds maximum (" + window.ecoCart.shared.bytesToSize(window.ecoCart.admin.fileSizeLimit) + ").";
                error.style.display = 'block';
                return;
            }

            var imagePreview = document.getElementById("image-preview");

            var fReader = new FileReader(); // Intialise HTML5 FileReader object
            
            fReader.addEventListener("load", function(e) {
                // e.target.result contains the DataURL which we will use as a source of the image
                imagePreview.setAttribute("src", e.target.result);

                // Output image information
                var fileSizeFormatted = window.ecoCart.shared.bytesToSize(file.size);
                document.getElementById("image-info").style.display = "block"; // Make it visible
                document.getElementById("image-name").innerHTML = "Name: " + file.name;
                document.getElementById("image-size").innerHTML = "Size: " + fileSizeFormatted;
                document.getElementById("image-type").innerHTML = "Type: " + file.type;
                document.getElementById("image-dim").innerHTML = "Dimension: " + imagePreview.naturalWidth + " x " + imagePreview.naturalHeight;
            });

           fReader.readAsDataURL(file); // Read the file
           // </editor-fold>
		},
        setup = function () {
            // <editor-fold defaultstate="collapsed" desc="setup">
            uiLogger = new Logger("Admin UI", "script", 1); // Create a new logger object to keep track of this script
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

window.addEventListener("load", window.ecoCart.admin.ui.setup);