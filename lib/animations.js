/* 
 * File: animations.js
 * Author: Edward McKnight (UP608985)
 * This file handles animations
 */

window.ecoCart = window.ecoCart || {}; // Check the object exists, if not instantiate it as an empty object
window.ecoCart.animations = (function () {
	var
		animationsLogger = {},
		
		leftNavAni = function () { // Redundant atm
			document.getElementById("catNav").addEventListener("mouseover", leftNavAniHover);
			
		},
		
		leftNavAniHover = function (evt) { // Redundant atm
			// <editor-fold defaultstate="collapsed" desc="leftNavAniHover">
			var data = evt.target.innerHTML;
			evt.target.innerHTML = "";
			
			document.getElementById("catNav").addEventListener("mouseout", function () {leftNavAniNoHover(evt.target, data);});
			// </editor-fold>
		},
		
		leftNavAniNoHover = function (tgt, data) { // Redundant atm
			tgt.innerHTML = data;
		},
		
		showLoading = function () {
			// <editor-fold defaultstate="collapsed" desc="showLoading">
			var modalHider = document.createElement("div");
			modalHider.setAttribute("id", "modalHider");
			
			var modalDiv = document.createElement("div");
			modalDiv.setAttribute("id", "modalLoading");
			modalDiv.innerHTML = "<canvas id=\"modalLogo\" width=\"100\" height=\"75\"></canvas><div id=\"loadingText\">loading<span id=\"dots\"></span></div>";
			
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
			
			// TODO: Temporary until event is properly used
			setTimeout(function () {
				document.dispatchEvent(new CustomEvent("ecoCartLoaded"));
			}, 5000);
			// </editor-fold>
		},
		
		hideLoading = function () {
			// <editor-fold defaultstate="collapsed" desc="hideLoading">
			var modalHider = document.querySelector("body>div#modalHider");
			var modalDiv = document.querySelector("body>div#modalLoading");
			modalHider.parentElement.removeChild(modalHider);
			modalDiv.parentElement.removeChild(modalDiv);
			// </editor-fold>
		},
		
		drawLogo = function (c, animated, animTime) {
			// <editor-fold defaultstate="collapsed" desc="drawLogo">
			ctx = c.getContext("2d");
			
			if (animated) {
				drawLogoSun(ctx, animated);
				setInterval(function() {
					ctx.clearRect(0, 0, c.width, c.height);
					setTimeout(function () {
						drawLogoSun(ctx, animated, animTime);
					}, animTime);
				}, 3000);
			} else {
				drawLogoSun(ctx, animated, animTime);
				drawLogoLeaf(ctx, animated, animTime);
			}
			// </editor-fold>
		},
		
		drawLogoSun = function (context, animated, animTime) {
			// <editor-fold defaultstate="collapsed" desc="drawLogoSun">
			context.save();
			context.fillStyle = "#FFFF00";
			context.beginPath();
			context.arc(73, 25, 17, 0, 2*Math.PI);
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
						drawLogoLeafBottom(context);
					}, animTime);
				}, animTime);
			} else {
				drawLogoLeafRight(context);
				drawLogoLeafBottom(context);
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
		
		drawLogoLeafBottom = function (context) {
			// <editor-fold defaultstate="collapsed" desc="drawLogoLeafBottom">
			context.fillRect(21, 65, 8, 10);
			context.restore();
			// </editor-fold>
		},
		
		setup = function () {
			// <editor-fold defaultstate="collapsed" desc="setup">
			animationsLogger = new Logger("animations", "script", 1); // Create a new logger object to keep track of this script
			animationsLogger.log("loaded"); // Log that this script has been loaded
			
			showLoading(); // Show the loading modal div
			
			//leftNavAni(); // Left navigation animation - Redundant atm
			// </editor-fold>
		};
		
		return { // Makes these functions externally accessible
			"setup": setup,
			"hideLoading": hideLoading
		};
}());