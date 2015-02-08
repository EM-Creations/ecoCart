/* 
 * File: shared.js
 * Author: UP608985
 * Shared JavaScript functions between multiple parts of the application
 */


window.ecoCart = window.ecoCart || {}; // Check the object exists, if not instantiate it as an empty object

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
        };
    
    return {
        "usingIE": usingIE
    };
}());