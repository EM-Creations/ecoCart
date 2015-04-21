<?php
/**
 * ecoCart install script
 * Author: UP608985
 */

$configFile = __DIR__ . "/../api/config.inc.php";

print("<!doctype html>\n"
        . "<html>\n"
        . "\t<head>\n"
        . "\t\t<title>Install ecoCart</title>\n"
        . "\t</head>\n"
        . "\t<body>\n");

if (file_exists($configFile)) { // If the configuration file exists
    require($configFile); // Require the configuration file
    
    // Create database
    print("<h2>Creating database</h2>\n");
    $db_conn->query("CREATE DATABASE IF NOT EXISTS `ecocart` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
                    USE `ecocart`;");
    
    // Create tables
    print("<h2>Creating tables</h2>\n");
    print("\n<p>Creating category table...... ");
    $catStmt = $db_conn->prepare("CREATE TABLE `category` (
                                    `id` tinyint(1) NOT NULL AUTO_INCREMENT,
                                    `name` varchar(100) NOT NULL,
                                    `parent_id` bigint(20) NOT NULL,
                                    PRIMARY KEY (`id`)
                                  ) ENGINE=InnoDB  DEFAULT CHARSET=latin1;");
    $catStmt->execute();
    print("done!</p>");
    
    print("\n<p>Creating delivery options table...... ");
    $delStmt = $db_conn->prepare("CREATE TABLE `delivery_option` (
                                    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
                                    `name` varchar(100) NOT NULL,
                                    `max_weight` double NOT NULL,
                                    `eco_rating` int(11) NOT NULL,
                                    `cost` double NOT NULL,
                                    PRIMARY KEY (`id`),
                                    UNIQUE KEY `id` (`id`)
                                  ) ENGINE=InnoDB  DEFAULT CHARSET=latin1;");
    $delStmt->execute();
    print("done!</p>");
    
    print("\n<p>Creating item table...... ");
    $itemStmt = $db_conn->prepare("CREATE TABLE `item` (
                                    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
                                    `cat` bigint(20) NOT NULL,
                                    `name` varchar(100) NOT NULL,
                                    `description` text NOT NULL,
                                    `weight` double NOT NULL,
                                    `featured` tinyint(1) NOT NULL,
                                    `price` double NOT NULL,
                                    `stock` int(11) NOT NULL DEFAULT '0',
                                    PRIMARY KEY (`id`),
                                    UNIQUE KEY `id` (`id`)
                                  ) ENGINE=InnoDB  DEFAULT CHARSET=latin1;");
    $itemStmt->execute();
    print("done!</p>");
    
    print("\n<p>Creating item image table...... ");
    $itemImgStmt = $db_conn->prepare("CREATE TABLE `item_image` (
                                        `item_id` int(11) NOT NULL,
                                        `image` varchar(100) NOT NULL,
                                        `main` tinyint(1) NOT NULL,
                                        PRIMARY KEY (`item_id`,`image`)
                                      ) ENGINE=InnoDB DEFAULT CHARSET=latin1;");
    $itemImgStmt->execute();
    print("done!</p>");
    
    print("\n<p>Creating order table...... ");
    $orderStmt = $db_conn->prepare("CREATE TABLE `order` (
                                    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
                                    `title` enum('Mr','Mrs','Miss','Ms','Dr') NOT NULL,
                                    `first_name` varchar(100) NOT NULL,
                                    `last_name` varchar(100) NOT NULL,
                                    `address_1` varchar(100) NOT NULL,
                                    `address_2` varchar(100) NOT NULL,
                                    `post_code` char(8) NOT NULL,
                                    `delivery` bigint(20) NOT NULL,
                                    `created` bigint(20) NOT NULL,
                                    `sent` tinyint(1) NOT NULL DEFAULT '0',
                                    PRIMARY KEY (`id`),
                                    UNIQUE KEY `id` (`id`)
                                  ) ENGINE=InnoDB  DEFAULT CHARSET=latin1;");
    $orderStmt->execute();
    print("done!</p>");
    
    print("\n<p>Creating order item table...... ");
    $orderItemStmt = $db_conn->prepare("CREATE TABLE `order_item` (
                                        `order_id` bigint(20) NOT NULL,
                                        `item_id` bigint(20) NOT NULL,
                                        `quantity` int(11) NOT NULL,
                                        PRIMARY KEY (`order_id`,`item_id`)
                                      ) ENGINE=InnoDB DEFAULT CHARSET=latin1;");
    $orderItemStmt->execute();
    print("done!</p>");
    
    print("\n<p>Creating setting table...... ");
    $settingStmt = $db_conn->prepare("CREATE TABLE `setting` (
                                        `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
                                        `name` varchar(100) NOT NULL,
                                        `value` varchar(255) NOT NULL,
                                        PRIMARY KEY (`id`),
                                        UNIQUE KEY `id` (`id`)
                                      ) ENGINE=InnoDB  DEFAULT CHARSET=latin1;");
    $settingStmt->execute();
    print("done!</p>");
    
    // Insert data
    print("\n<p>Inserting data...... ");
    $settingData = $db_conn->prepare("INSERT INTO `setting` (`id`, `name`, `value`) VALUES
                                        (1, 'url', 'http://localhost/WEBSCRP/Coursework/ecoCart/'),
                                        (2, 'name', 'ecoCart'),
                                        (3, 'style-header!id!mainHeader!attr!background-color', '#FFFFFF'),
                                        (4, 'style-body!attr!color', '#000000'),
                                        (5, 'style-body!attr!font-family', 'roboto'),
                                        (6, 'style-!class!link!attr!color', '#00248F'),
                                        (7, 'style-!class!link:hover!attr!color', '#CCCC00');");
    $settingData->execute();
    print("done!</p>");
    
} else { // If the configuration file doesn't exist
    die("Error: Configuration file not found, please ensure that the \"config.inc.php\" file exists under the \"api\" directory.</body></html>");
}

print("\t</body>\n"
        . "</html>");
