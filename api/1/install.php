<?php
/**
 * Author: Edward McKnight (UP608985)
 */

require("../config.inc.php"); // Require the configuration file

$tableExistence = ["category", "delivery_option", "item", "item_image", "order", "order_item", "setting"];

foreach ($tableExistence as $tableName) { // For each required table
	try { // Try to query it
		$db_conn->query("SELECT 1 FROM `" . $tableName . "` LIMIT 1");
	} catch (PDOException $pdoE) { // If there's an exception the table doesn't exist
		print("TABLE NAME: \"" . $tableName . "\" doesn't exist.. creating..<br />");
		
		switch ($tableName) {
			case "category":
				$query = "CREATE TABLE `category` (
							`id` tinyint(1) NOT NULL AUTO_INCREMENT,
							`name` varchar(100) NOT NULL,
							`parent_id` bigint(20) NOT NULL,
							PRIMARY KEY (`id`)
						  ) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;";
				break;
			
			case "delivery_option":
				$query = "CREATE TABLE `delivery_option` (
							`id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
							`name` varchar(100) NOT NULL,
							`max_weight` double NOT NULL,
							`eco_rating` int(11) NOT NULL,
							`cost` double NOT NULL,
							PRIMARY KEY (`id`),
							UNIQUE KEY `id` (`id`)
						  ) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;";
				break;
			
			case "item":
				$query = "CREATE TABLE `item` (
							`id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
							`cat` bigint(20) NOT NULL,
							`name` varchar(100) NOT NULL,
							`description` text NOT NULL,
							`weight` double NOT NULL,
							`featured` tinyint(1) NOT NULL,
							PRIMARY KEY (`id`),
							UNIQUE KEY `id` (`id`)
						  ) ENGINE=InnoDB  DEFAULT CHARSET=latin1;";
				break;
			
			case "item_image":
				$query = "CREATE TABLE `item_image` (
							`item_id` int(11) NOT NULL,
							`image` varchar(100) NOT NULL,
							`main` tinyint(1) NOT NULL,
							PRIMARY KEY (`item_id`,`image`)
						  ) ENGINE=InnoDB DEFAULT CHARSET=latin1;";
				break;
			
			case "order":
				$query = "CREATE TABLE `order` (
							`id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
							`title` enum('Mr','Mrs','Miss','Ms','Dr') NOT NULL,
							`first_name` varchar(100) NOT NULL,
							`last_name` varchar(100) NOT NULL,
							`address_1` varchar(100) NOT NULL,
							`address_2` varchar(100) NOT NULL,
							`post_code` char(8) NOT NULL,
							`delivery` bigint(20) NOT NULL,
							`created` bigint(20) NOT NULL,
							PRIMARY KEY (`id`),
							UNIQUE KEY `id` (`id`)
						  ) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;";
				break;
			
			case "order_item":
				$query = "CREATE TABLE `order_item` (
							`order_id` bigint(20) NOT NULL,
							`item_id` bigint(20) NOT NULL,
							`quantity` int(11) NOT NULL,
							PRIMARY KEY (`order_id`,`item_id`)
						  ) ENGINE=InnoDB DEFAULT CHARSET=latin1;";
				break;
			
			case "setting":
				$query = "CREATE TABLE `setting` (
							`id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
							`name` varchar(100) NOT NULL,
							`value` varchar(255) NOT NULL,
							PRIMARY KEY (`id`),
							UNIQUE KEY `id` (`id`)
						  ) ENGINE=InnoDB DEFAULT CHARSET=latin1;";
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

print("Finished!");