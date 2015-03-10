/* 
 * File: animations.js
 * Author: UP608985
 * This file handles animations
 */

window.ecoCart = window.ecoCart || {}; // Check the object exists, if not instantiate it as an empty object
window.ecoCart.animations = (function () {
    var
        animationsLogger = {},
        showLoading = function () {
            // <editor-fold defaultstate="collapsed" desc="showLoading">
            if (!window.ecoCart.shared.usingIE()) { // If the user isn't using Internet Explorer
                var modalHider = document.createElement("div");
                modalHider.setAttribute("id", "modalHider");

                var modalDiv = document.createElement("div");
                modalDiv.setAttribute("id", "modalLoading");
                modalDiv.innerHTML = "<canvas id=\"modalLogo\"></canvas><div id=\"loadingText\">loading<span id=\"dots\"></span></div>";

                document.body.appendChild(modalHider);
                document.body.appendChild(modalDiv);

                drawLogo(modalDiv.querySelector("canvas#modalLogo"), true, 300); // Draw the logo on the specified canvas element

                var dots = modalDiv.querySelector("div#loadingText>span#dots");
                var dotCount = 0;
                var dotStr = "";

                setInterval(function () { // Animate the dots
                    if (dotCount > 2) {
                        dotCount = 0;
                    }

                    for (var i = 0; i <= dotCount; i++) {
                        dotStr += "."; // Add a dot
                    }

                    dots.innerHTML = dotStr;

                    dotStr = ""; // Reset the dot string
                    dotCount++; // Increment the dot counter
                }, 1000);
            }
            // </editor-fold>
        },
        hideLoading = function () {
            // <editor-fold defaultstate="collapsed" desc="hideLoading">
            var modalHider = document.getElementById("modalHider");
            var modalDiv = document.getElementById("modalLoading");
            document.body.removeChild(modalDiv);
            document.body.removeChild(modalHider);
            // </editor-fold>
        },
        drawLogo = function (c, animated, animTime) {
            // <editor-fold defaultstate="collapsed" desc="drawLogo">
            // TODO: BUG: When the page changes this isn't being drawn properly (text in weird places etc..)
            ctx = c.getContext("2d");

            if (animated) { // If the logo drawing is animated
                drawLogoSun(ctx, animated, animTime); // Start initial drawing
                setInterval(function () {
                    ctx.clearRect(0, 0, c.width, c.height);
                    setTimeout(function () {
                        drawLogoSun(ctx, animated, animTime);
                    }, animTime);
                }, 5000);
            } else {
                drawLogoSun(ctx, animated, animTime);
                drawLogoLeaf(ctx, animated, animTime);
                drawLogoText(ctx, animated, animTime);
            }
            // </editor-fold>
        },
        drawLogoSun = function (context, animated, animTime) {
            // <editor-fold defaultstate="collapsed" desc="drawLogoSun">
            context.save();
            context.fillStyle = "#FFFF00";
            context.beginPath();
            context.arc(73, 25, 17, 0, 2 * Math.PI);
            context.fill();
            context.closePath();

            if (animated) {
                setTimeout(function () {
                    drawLogoLeaf(context, animated, animTime);
                }, animTime);
            }
            // </editor-fold>
        },
        drawLogoLeaf = function (context, animated, animTime) {
            // <editor-fold defaultstate="collapsed" desc="drawLogoLeaf">
            // Left side
            context.rotate(-0.3); // Roate the leaf to put it at an angle
            context.fillStyle = "#29A329";
            context.beginPath();
            context.arc(35, 40, 30, 0.6 * Math.PI, 1.4 * Math.PI, false);
            context.fill();
            context.closePath();

            // Right side
            if (animated) {
                setTimeout(function () {
                    drawLogoLeafRight(context);
                    setTimeout(function () {
                        drawLogoLeafBottom(context, animated, animTime);
                    }, animTime);
                }, animTime);
            } else {
                drawLogoLeafRight(context);
                drawLogoLeafBottom(context, animated, animTime);
            }
            // </editor-fold>
        },
        drawLogoLeafRight = function (context) {
            // <editor-fold defaultstate="collapsed" desc="drawLogoLeafRight">
            context.beginPath();
            context.arc(15, 40, 30, 0.4 * Math.PI, 1.6 * Math.PI, true);
            context.fill();
            context.closePath();
            // </editor-fold>
        },
        drawLogoLeafBottom = function (context, animated, animTime) {
            // <editor-fold defaultstate="collapsed" desc="drawLogoLeafBottom">
            context.fillRect(21, 65, 8, 10);
            context.restore();

            if (animated) {
                setTimeout(function () {
                    drawLogoText(context, animated, animTime);
                }, animTime);
            } else {
                drawLogoText(context, animated, animTime);
            }
            // </editor-fold>
        },
        drawLogoText = function (context, animated, animTime) {
            // <editor-fold defaultstate="collapsed" desc="drawLogoText">
            var chars = window.ecoCart.name.split("");
            var xPos = 48;
            var i = 0;

            context.font = "bold 32pt Roboto";

            if (animated) { // If the drawing is animated
                setInterval(function () {
                    if (i >= chars.length) {
                        return; // Break out of the method / function when the characters have been output
                    }

                    context.fillText(chars[i], xPos, 60);

                    if (chars[i] === "C") {
                        xPos += 28;
                    } else {
                        xPos += 22;
                    }

                    i++; // Increment i
                }, animTime);
            } else {
                setTimeout(function () { // Waits for a moment and ensures CSS file has been loaded before trying to use Roboto font
                    // TODO: Look up better way to check that CSS file has been loaded, may be using a static image (for the user's website logo anyway)
                    context.fillText(window.ecoCart.name, xPos, 60);
                }, 200);
            }
            // </editor-fold>
        },
        showAddToBasketConfirm = function (target) {
            // <editor-fold defaultstate="collapsed" desc="showAddToBasketConfirm">
            var pos = window.ecoCart.shared.getPosition(target);
            var div = document.createElement("div");
            div.setAttribute("class", "add-to-basket-confirm");
            div.innerHTML = "Added to basket!";
            div.style.left = (pos.x + target.offsetWidth) + "px";
            div.style.top = pos.y + "px";
            window.ecoCart.mainElem.appendChild(div);

            setTimeout(function () {
                window.ecoCart.mainElem.removeChild(div);
            }, 2000);
            // </editor-fold>
        },
        setup = function () {
            // <editor-fold defaultstate="collapsed" desc="setup">
            animationsLogger = new Logger("animations", "script", 1); // Create a new logger object to keep track of this script
            animationsLogger.log("loaded"); // Log that this script has been loaded

            drawLogo(document.querySelector("header#mainHeader>canvas#headerLogo"), false, 0); // Draw the logo
            // </editor-fold>
        };
    return {// Makes these functions externally accessible
        "setup": setup,
        "showLoading": showLoading,
        "hideLoading": hideLoading,
        "showAddToBasketConfirm": showAddToBasketConfirm
    };
}());