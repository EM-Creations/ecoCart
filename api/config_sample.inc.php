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
const DB_TYPE = "mysql";
const DB_HOST = "localhost";
const DB_NAME = "ecocart";
const DB_USER = "root";
const DB_PASSWORD = "";
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

$pdoStr .= "host=" . DB_HOST . ";" . "dbname=" . DB_NAME; // Build the PDO string

try { // Try to connect to the database
    $db_conn = new PDO($pdoStr, DB_USER, DB_PASSWORD);
    // TODO: Modify the line below before completion
    $db_conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); // Set the error mode to exception FOR DEV ONLY!
} catch (PDOException $pdoE) { // If an exception was caught
	API::outputStatus(500); // Internal Server Error (500)
    print(json_encode(["errorMsg"=>"Could not connect to database." , "errorDetails"=>$pdoE->getMessage(), "errorCode"=>11])); // Output the exception's message
	exit; // Kill the script at this point
}
