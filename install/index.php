<?php
/**
 * ecoCart install script
 * Author: UP608985
 */

$configFile = __DIR__ . "/../api/config.inc.php";

if (file_exists($configFile)) { // If the configuration file exists
    require($configFile); // Require the configuration file
    
    // TODO: Create all necessary database tables etc..
    
} else { // If the configuration file doesn't exist
    die("Error: Configuration file not found, please ensure that the \"config.inc.php\" file exists under the \"api\" directory.");
}
