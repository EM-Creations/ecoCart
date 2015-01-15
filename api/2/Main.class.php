<?php
/**
 * Main API class
 * Includes functions for handling API end points
 *
 * @author Edward McKnight (UP608985)
 */
class Main extends API {
	
	/**
	 * Time end point
	 * 
	 * @param array $arg
	 */
	protected function time($args) {
		// <editor-fold defaultstate="collapsed" desc="time">
		if ($this->method == "GET") {
			if (isset($args[0])) {
				$format = $args[0];
			} else {
				$format = "d/m/Y";
			}
			$this->statusCode = 200; // Set the status code to OK (successful)
			$this->resp['data'] = date($format); // Put the data into the $this->resp['data'] element
		} else {
			$this->statusCode = 405; // Only accepts GET requests
		}
		// </editor-fold>
	}
	
	protected function categories($args) {
		// <editor-fold defaultstate="collapsed" desc="categories">
		global $db_conn;
		
		switch ($this->method) {
			case "GET":
				// <editor-fold defaultstate="collapsed" desc="GET">
				$stmt = null;
				
				if (isset($args[0]) && ($args[0] == "parent")) { // If we're returning all categories with a specified parent
					$stmt = $db_conn->prepare("SELECT * FROM `category` WHERE `parent_id` = :parentID");
					if (!isset($args[1]) || !is_numeric($args[1])) { // If the parent isn't set or isn't a number
						$args[1] = 0; // Set the parent to none
					}
					$stmt->bindParam(":parentID", $args[1]);
				} else if (isset($args[0]) && is_numeric($args[0])) { // If we're returning a specific category
					$stmt = $db_conn->prepare("SELECT * FROM `category` WHERE `id` = :catID");
					$stmt->bindParam(":catID", $args[0]);
				} else { // If we're just returning all of the categories
					$stmt = $db_conn->prepare("SELECT * FROM `category`");
				}
				
				$stmt->execute();
				$this->resp['data'] = $stmt->fetchAll(PDO::FETCH_ASSOC); // Return the results
				// </editor-fold>
				break;
			
			default:
				$this->statusCode = 405;
		}
		// </editor-fold>
	}
}