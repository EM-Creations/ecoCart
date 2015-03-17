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

window.ecoCart.admin.ui = (function () {
    var
        uiLogger = {},
        setCatParentFieldFromID = function (id, elem) {
            // <editor-fold defaultstate="collapsed" desc="setCatParentFieldFromID">
            id = parseInt(id); // Ensure it's an integer
            
            if (id === 0) { // Invalid for request, return some dummy data
                elem.innerHTML = "-- No Parent --";
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
            addCatForm.appendChild(getCategoryParentSelect("categoryParent"));
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
            section.setAttribute("id", "categories");
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
		getCategoryParentSelect = function (selectID, defaultVal) {
			// <editor-fold defaultstate="collapsed" desc="getCategoryParentSelect">
            if (!defaultVal) { // If a default value isn't specified
                defaultVal = 0; // Set it to 0
            }
            
			var addCatParent = document.createElement("select");
            addCatParent.setAttribute("id", selectID);
            var noParentOption = document.createElement("option");
            noParentOption.setAttribute("value", 0);
            noParentOption.innerHTML = "-- No Parent --";
            addCatParent.appendChild(noParentOption);
            
            // Populate parent select
            window.ecoCart.xhr.sendRequest({
                url: window.ecoCart.apiURL + "categories",
                callback: {
                    load: function (xhr) {
                        var resp = JSON.parse(xhr.target.responseText).data;

                        for (var key in resp) {
                            if (resp.hasOwnProperty(key)) { // Loop through the object
                                var obj = resp[key];
                                var option = document.createElement("option");
                                option.setAttribute("value", obj.id);
                                option.innerHTML = obj.name;

                                addCatParent.appendChild(option);
                            }
                        }
                        addCatParent.value = defaultVal; // Set the currently selected option to the specified default value
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
								tr.setAttribute("id", "cat-" + obj.id)
                                tr.dataset.cat = obj.id;
                                var td1 = document.createElement("td");
								td1.setAttribute("class", "name");
                                var td2 = document.createElement("td");
								td2.setAttribute("class", "parent");
                                td2.dataset.parent = obj.parent_id;
                                var td3 = document.createElement("td");
								td3.setAttribute("class", "options");
                                
                                td1.innerHTML = obj.name;
                                setCatParentFieldFromID(obj.parent_id, td2);
                                
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
                nodes[1].appendChild(getCategoryParentSelect("modCatParent", parentID));
                
                window.ecoCart.shared.addClassEvents("click", "save-cat", saveCatClicked); // Add event listener for the save button
            }
            // </editor-fold>
        },
        saveCatClicked = function (evt) {
            // <editor-fold defaultstate="collapsed" desc="saveCatClicked">
            evt.preventDefault(); // Prevent default action, e.g. the form submitting and the page changing
            
            if (window.ecoCart.admin.editingCat) { // If a category is currently open for editing
                var id = evt.target.dataset.cat;
                var name = document.getElementById("modCatName").value;
                var parent = document.getElementById("modCatParent").value;
                
                if (name.length > 0) { // If there's at least one character set for the category name
                    // Send this category update to the API to store it in the database
                    window.ecoCart.xhr.sendRequest({
                        url: window.ecoCart.apiURL + "categories/" + id + "/" + name + "/" + parent,
                        method: "PUT",
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
                var id = evt.target.dataset.del;
                var name = document.getElementById("modDelName").value;
                var maxWeight = document.getElementById("modDelMaxWeight").value;
                var eco = document.getElementById("modDelEco").value;
                var cost = document.getElementById("modDelCost").value;
                
                if (name.length > 0) { // If there's at least one character set for the delivery option
                    // Send this category update to the API to store it in the database
                    window.ecoCart.xhr.sendRequest({
                        url: window.ecoCart.apiURL + "delivery/" + id + "/" + name + "/" + maxWeight + "/" + eco + "/" + cost,
                        method: "PUT",
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