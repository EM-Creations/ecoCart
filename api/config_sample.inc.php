<?php
/**
 * config_sample.inc.php
 * Sample configuration file
 * Follow the instructions below to edit this file then rename it to: "config.inc.php"
 * 
 * Author: UP608985
 */

/*
 * Only edit the below constant definitions
 */
const DB_TYPE = "mysql"; // Database type (default: mysql)
const DB_HOST = "localhost"; // Database host (default: localhost)
const DB_NAME = "ecocart"; // Database name (default: ecocart)
const DB_USER = "root"; // Database user (default: root)
const DB_PASSWORD = ""; // Database password (default: **none**)
/*
 * DO NOT MODIFY ANYTHING BELOW
 */

switch (DB_TYPE) {
    case "mysql":
        $pdoStr = "mysql:";
        break;

    default:
        $pdoStr = "mysql:";
}

$pdoStr .= "host=" . DB_HOST . ";"; // Build the PDO string

try { // Try to connect to the database
    $db_conn = new PDO($pdoStr, DB_USER, DB_PASSWORD);
} catch (PDOException $pdoE) { // If an exception was caught
	API::outputStatus(500); // Internal Server Error (500)
    print(json_encode(["errorMsg"=>"Could not connect to database." , "errorDetails"=>$pdoE->getMessage(), "errorCode"=>11])); // Output the exception's message
	exit; // Kill the script at this point
}
