<?php
/**
 * Author: Edward McKnight (UP608985)
 * Autoload file
 */

/**
 * Autoload function
 * 
 * @param string $class
 */
function __autoload($class) {
	// <editor-fold defaultstate="collapsed" desc="__autoload">
	$file = __DIR__ . "/" . $class . ".class.php"; // Set the file to load as the .class.php extension of the class name in this directory
	if (file_exists($file)) { // If the class file exists
		require($file); // Require / include it
	}
	// </editor-fold>
}

spl_autoload_register("__autoload"); // Register the __autoload function as a function to call when trying to load a class