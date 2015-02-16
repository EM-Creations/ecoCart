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
        setCatParentFieldFromID = function (id, elem) {
            // <editor-fold defaultstate="collapsed" desc="setCatParentFieldFromID">
            id = parseInt(id); // Ensure it's an integer
            
            if (id === 0) { // Invalid for request, return some dummy data
                elem.innerHTML = "-- None --";
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
            var addCatParent = document.createElement("select");
            addCatParent.setAttribute("id", "categoryParent");
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

                        var i = 0;
                        for (var key in resp) {
                            if (resp.hasOwnProperty(key)) { // Loop through the object
                                var obj = resp[key];
                                var option = document.createElement("option");
                                option.setAttribute("value", obj.id);
                                option.innerHTML = obj.name;

                                addCatParent.appendChild(option);
                            }
                            i++;
                        }
                    },
                    error: loadError
                }
            });
            
            var addCatTextFieldLabel = document.createElement("label");
            addCatTextFieldLabel.setAttribute("for", "categoryName");
            addCatTextFieldLabel.innerHTML = "Category Name";
            var addCatTextField = document.createElement("input");
            addCatTextField.setAttribute("id", "categoryName");
            var addCatButton = document.createElement("button");
            addCatButton.setAttribute("type", "submit");
            addCatButton.innerHTML = "Add";
            
            addCatForm.appendChild(addCatParentLabel);
            addCatForm.appendChild(addCatParent);
            addCatForm.appendChild(addCatTextFieldLabel);
            addCatForm.appendChild(addCatTextField);
            addCatForm.appendChild(addCatButton);
            addCatGroup.appendChild(addCatForm);
            // </editor-fold>
            
            // TODO: Edit category
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
                        
            window.ecoCart.animations.hideLoading(); // Hide the loading screen
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
                                tr.dataset.cat = obj.id;
                                var td1 = document.createElement("td");
                                var td2 = document.createElement("td");
                                var td3 = document.createElement("td");
                                
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
                    },
                    error: loadError
                }
            });
            
            return catTable;
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
        addCategoryEvent = function (evt) {
            // <editor-fold defaultstate="collapsed" desc="addCategoryEvent">
            evt.preventDefault(); // Prevent default action, e.g. the form submitting and the page changing
            
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
        setup = function () {
            // <editor-fold defaultstate="collapsed" desc="setup">
            uiLogger = new Logger("Admin UI", "script", 1); // Create a new logger object to keep track of this script
            uiLogger.log("loaded"); // Log that this script has been loaded

            window.ecoCart.xhr.xhrLogger = new Logger("xhr", "script", 1); // Create a new logger object to keep track of the XHR script
            
            window.ecoCart.mainElem = document.querySelector("main");

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