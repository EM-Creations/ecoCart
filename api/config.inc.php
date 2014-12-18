<?php
/**
 * Author: Edward McKnight (UP608985)
 */

define("DB_TYPE", "mysql");
define("DB_HOST", "localhost");
define("DB_NAME", "ecocart");
define("DB_USER", "root");
define("DB_PASSWORD", "");

switch (DB_TYPE) {
	case "mysql":
		$pdoStr = "mysql:";
		break;
	
	default:
		$pdoStr = "mysql:";
}

$pdoStr .= "host=" . DB_HOST . ";" . "dbname=" . DB_NAME;

try { // Try to connect to the database
	$db_conn = new PDO($pdoStr, DB_USER, DB_PASSWORD);
	$db_conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); // Set the error mode to exception FOR DEV ONLY!
} catch (PDOException $pdoE) { // If an exception was caught
	print("DATABASE CONNECTION ERROR: " . $pdoE->getMessage()); // Output the exception's message
}