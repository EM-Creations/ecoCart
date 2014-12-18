<?php
/**
 * Author: Edward McKnight (UP608985)
 */

require("../config.inc.php"); // Require the configuration file

$tableExistence = ["category", "delivery_option", "item", "item_image", "order", "order_item"];

foreach ($tableExistence as $tableName) { // For each required table
	try { // Try to query it
		$db_conn->query("SELECT 1 FROM `" . $tableName . "` LIMIT 1");
	} catch (PDOException $pdoE) { // If there's an exception it doesn't exist
		print("TABLE NAME: \"" . $tableName . "\" doesn't exist.. creating..<br />");
		
		switch ($tableName) {
			// TODO: Add relevant SQL to these cases
			case "category":
				$query = "";
				break;
			
			case "delivery_option":
				$query = "";
				break;
			
			case "item":
				$query = "";
				break;
			
			case "item_image":
				$query = "";
				break;
			
			case "order":
				$query = "";
				break;
			
			case "order_item":
				$query = "";
				break;
			
			default:
				$query = "";
		}
		
		try {
			$db_conn->query($query);
		} catch (PDOException $pdoE) {
			print("DATABASE ERROR: " . $pdoE->getMessage());
		}
	}
}