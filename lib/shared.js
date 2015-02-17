/* 
 * File: shared.js
 * Author: UP608985
 * Shared JavaScript functions between multiple parts of the application
 */

window.ecoCart = window.ecoCart || {}; // Check the object exists, if not instantiate it as an empty object
window.ecoCart.apiVersion = 2; // Set the API version to use
window.ecoCart.apiURL = "./api/" + window.ecoCart.apiVersion + "/";

window.ecoCart.imgDir = "./images/products/";
window.ecoCart.name = "ecoCart";

window.ecoCart.mainElem = null; // Main element handle

window.ecoCart.shared = (function () {
    var
        /**
         * Return whether the user is using Internet Explorer or not
         * 
         * @returns boolean
         */
        usingIE = function () {
            // <editor-fold defaultstate="collapsed" desc="usingIE">
            var earlyIE = (navigator.userAgent.indexOf("MSIE") !== -1); // dhaber. (2014). Detect Internet Explorer with Javascript. Retrieved from http://www.html5gamedevs.com/topic/3907-detect-internet-explorer-with-javascript/ on 08/02/2015
            
            /* enpu. (2014). Detect Internet Explorer with Javascript. Retrieved from http://www.html5gamedevs.com/topic/3907-detect-internet-explorer-with-javascript/ on 08/02/2015 */
            var ie9 = /MSIE 9/i.test(navigator.userAgent);
            var ie10 = /MSIE 10/i.test(navigator.userAgent);
            var ie11 = /rv:11.0/i.test(navigator.userAgent);
            /* End of reference */
            
            
            return earlyIE || ie9 || ie10 || ie11;
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
        setClassDisabled = function (className, disabled) {
            // <editor-fold defaultstate="collapsed" desc="setClassDisabled">
            var classes = document.getElementsByClassName(className);
            for (var i = 0; i < classes.length; i++) {
                if (disabled) {
                    classes[i].setAttribute("disabled", "disabled");
                } else {
                    classes[i].removeAttribute("disabled");
                }
            }
            // </editor-fold>
        },
        setFooterDate = function () {
            // <editor-fold defaultstate="collapsed" desc="setFooterDate">
            return function (xhr) {
                var resp = JSON.parse(xhr.target.responseText).data;
                document.querySelector("footer>span#date").innerHTML = resp;
            };
            // </editor-fold>
        },
        // kirupa. (2012). Get an Element's Position Using JavaScript. Retrieved from http://www.kirupa.com/html5/get_element_position_using_javascript.htm on 25/01/2015
        getPosition = function (element) {
            // <editor-fold defaultstate="collapsed" desc="getPosition">
            var xPosition = 0;
            var yPosition = 0;

            while (element) {
                xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
                yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
                element = element.offsetParent;
            }
            return {x: xPosition, y: yPosition};
            // </editor-fold>
        };
    
    return {
        'usingIE': usingIE,
        'addClassEvents': addClassEvents,
        'getPosition': getPosition,
        'setFooterDate': setFooterDate,
        'setClassDisabled': setClassDisabled
    };
}());