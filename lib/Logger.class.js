/* 
 * File: Logger.class.js
 * Author: Edward McKnight (UP608985)
 * This file holds the Logger class
 */

/**
 * Logger constructor
 * 
 * @param {string} name
 * @param {string} type
 * @param {int} logLevel
 * @returns {Logger}
 */
function Logger(name, type, logLevel) {
	// <editor-fold defaultstate="collapsed" desc="constructor">
	this.name = name;
	this.type = type;
	this.level = logLevel;
	// </editor-fold>
}

/**
 * Log an action
 * 
 * @param {string} action
 */
Logger.prototype.log = function(action) {
	// <editor-fold defaultstate="collapsed" desc="log">
	if (this.level > 0) { // If the log level allows us to output to console
		console.log("LOGGER: " + this.name + " (" + this.type + ") - " + action + "..");
	}
	// </editor-fold>
};