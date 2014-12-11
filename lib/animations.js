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
			var data = evt.target.innerHTML;
			evt.target.innerHTML = "";
			
			document.getElementById("catNav").addEventListener("mouseout", function () {leftNavAniNoHover(evt.target, data);});
		},
		
		leftNavAniNoHover = function (tgt, data) { // Redundant atm
			tgt.innerHTML = data;
		},
		
		setup = function () {
			animationsLogger = new Logger("animations", "script", 1); // Create a new logger object to keep track of this script
			animationsLogger.log("loaded"); // Log that this script has been loaded
			
			//leftNavAni(); // Left navigation animation - Redundant atm
		};
		
		return {
			"setup": setup
		};
}());