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
            // kirupa. (2012). Get an Element's Position Using JavaScript. Retrieved 25/01/2015, from http://www.kirupa.com/html5/get_element_position_using_javascript.htm
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
            },
            // Pure HTML5 file upload. (2011). Retrieved 21/03/2015, from http://www.script-tutorials.com/pure-html5-file-upload/
            bytesToSize = function (bytes) {
                // <editor-fold defaultstate="collapsed" desc="bytesToSize">
                var sizes = ['Bytes', 'KB', 'MB'];
                if (bytes == 0) return 'n/a';
                var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
                return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
                // </editor-fold>
            },
            // Tim Down, TD. (2010). Retrieved 27/03/2015, from http://stackoverflow.com/questions/4179708/how-to-detect-if-the-pressed-key-will-produce-a-character-inside-an-input-text
            isCharacterKeyPress = function(evt) {
                // <editor-fold defaultstate="collapsed" desc="isCharacterKeyPress">
                // Modified to get working properly by UP608985
                if (typeof evt.which === "undefined") {
                    // This is IE, which only fires keypress events for printable keys
                    return true;
                } else if (typeof evt.which === "number" && evt.which > 0) {
                    // In other browsers except old versions of WebKit, evt.which is
                    // only greater than zero if the keypress is a printable key.
                    // We need to filter out backspace and ctrl/alt/meta key combinations
                    return !evt.ctrlKey && !evt.metaKey && !evt.altKey && (evt.which !== 17 && evt.which !== 16 && evt.which !== 18 && evt.which !== 20);
                }
                return false;
                // </editor-fold>
            },
            // Aron Rotteveel, AR. (2009). Retrieved 30/03/2015, from http://stackoverflow.com/questions/847185/convert-a-unix-timestamp-to-time-in-javascript
            formatTimestamp = function (timestamp) {
                // <editor-fold defaultstate="collapsed" desc="formatTimestamp">
                // create a new javascript Date object based on the timestamp
                // multiplied by 1000 so that the argument is in milliseconds, not seconds
                var date = new Date(timestamp*1000);
                //date.setSeconds(timestamp);
                
                // day part from the timestamp
                var day = date.getDate();
                if (day < 10) {
                    day = "0" + day;
                }
                
                var month = date.getMonth() + 1;
                if (month < 10) {
                    month = "0" + month;
                }
                
                var year = date.getFullYear();
                
                // hours part from the timestamp
                var hours = date.getHours();
                // minutes part from the timestamp
                var minutes = "0" + date.getMinutes();

                // will display time in 10:30:23 format
                return year + "-" + month + "-" + day + " " + hours + ":" + minutes.substr(minutes.length-2);
                // </editor-fold>
            },
            // Jake Trent, JT. (2010). Retrieved 20/04/2015, from http://jaketrent.com/post/addremove-classes-raw-javascript/
            hasClass = function (ele,cls) {
                return !!ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
            },
            // Jake Trent, JT. (2010). Retrieved 20/04/2015, from http://jaketrent.com/post/addremove-classes-raw-javascript/
            addClass = function (ele,cls) {
                if (!hasClass(ele,cls)) ele.className += " "+cls;
            },
            // Jake Trent, JT. (2010). Retrieved 20/04/2015, from http://jaketrent.com/post/addremove-classes-raw-javascript/
            removeClass = function (ele,cls) {
                // <editor-fold defaultstate="collapsed" desc="removeClass">
                if (hasClass(ele,cls)) {
                    var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
                    ele.className=ele.className.replace(reg,' ');
                }
                // </editor-fold>
            },
            checkXHR = function (evt) {
                // <editor-fold defaultstate="collapsed" desc="checkXHR">
                var tgt = evt.target;
                var data = JSON.parse(tgt.responseText);

                // ecoCart error codes
                /*
                 * 1x - Database problems
                 * 11 - Can't connect to database
                 */

                switch (tgt.status) { // Check the status code
                    case 500: // Internal server error
                        window.ecoCart.xhr.xhrLogger.log("ERROR: " + data.errorCode); // Output the error to console
                        switch (data.errorCode) { // Check the error code
                            case 11:
                                // TODO: Handle error
                        }
                }
                // </editor-fold>
            };
    return {
        'usingIE': usingIE,
        'addClassEvents': addClassEvents,
        'getPosition': getPosition,
        'setFooterDate': setFooterDate,
        'setClassDisabled': setClassDisabled,
        'checkXHR': checkXHR,
        'bytesToSize': bytesToSize,
        'addClass': addClass,
        'removeClass': removeClass,
        'isCharacterKeyPress': isCharacterKeyPress,
        'formatTimestamp': formatTimestamp
    };
}());