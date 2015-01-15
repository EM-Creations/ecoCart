<?php
/**
 * Author: Edward McKnight (UP608985)
 * ecoCart API Version 2 routing / processing file
 */

// Routing design: /api/{version}/{end point}/{identifier | special action}/{argument}[/{argument}]
// Example: "/api/2/categories/featured" and "/api/2/item/1"

require(__DIR__ . "/../config.inc.php"); // Require the database configuration file
require(__DIR__ . "/API.class.php"); // Require the abstract API class
require(__DIR__ . "/Main.class.php"); // Require the main class containing the end point handlers

try {
	$api = new Main();
	print($api->processAPI());
} catch (Exception $ex) {
	print(json_encode(['error' => $ex->getMessage()]));
}