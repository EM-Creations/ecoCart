<?php
/**
 * Author: UP608985
 * ecoCart API Version 2 routing / processing file
 * Routing design: /api/{version}/{end point}/{identifier | special action}/{argument}[/{argument}]
 * Example: "/api/2/categories/featured" and "/api/2/item/1"
 */

require(__DIR__ . "/autoload.inc.php"); // Require the autoload file (saves code having to require each class used)

$configFile = __DIR__ . "/../config.inc.php"; // Configuration file location

if (file_exists($configFile)) { // If the configuration file exists
    require($configFile); // Require the database configuration file
} else { // If the configuration file does not exist
    API::outputStatus(500); // Internal Server Error (500)
    print(json_encode(['error' => "Database configuration file does not exist. Please make sure you've edited 'config_sample.inc.php' and renamed it to 'config.inc.php'."]));
    exit; // Kill the script
}

try {
    $api = new Main();
    print($api->processAPI());
} catch (Exception $ex) {
    print(json_encode(['error' => $ex->getMessage()]));
}
