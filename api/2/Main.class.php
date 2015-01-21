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
	 * @param array $args
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
	
	/**
	 * Categories end point
	 * 
	 * @global PDO $db_conn
	 * @param array $args
	 */
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
	
	/**
	 * Item end point
	 * 
	 * @global PDO $db_conn
	 * @param array $args
	 */
	protected function item($args) {
		// <editor-fold defaultstate="collapsed" desc="item">
		global $db_conn;
		
		switch ($this->method) {
			case "GET":
				// <editor-fold defaultstate="collapsed" desc="GET">
				$stmt = null;
				$str = "SELECT `item`.`id`, `item`.`cat`, `item`.`name`, `item`.`description`, `item`.`weight`, `item`.`price`, `item_image`.`main` as `main_image`, `item_image`.`image`  FROM `item` LEFT JOIN `item_image` ON `item`.`id`=`item_image`.`item_id`";

				if (isset($args[0]) && is_numeric($args[0])) { // If we're returning a specific item
					$str .= " WHERE `id` = :id";
					$stmt = $db_conn->prepare($str);
					$stmt->bindParam(":id", $args[0]);
				} else if (isset($args[0]) && ($args[0] == "featured")) { // If we're returning featured items
					$str .= " WHERE `featured` = 1";
					$stmt = $db_conn->prepare($str);
				} else if (isset($args[0]) && ($args[0] == "category")) { // If we're returning items within a specific category
					if (isset($args[1]) && is_numeric($args[1])) { // If the category ID is present
						$str .= " WHERE `cat` = :cat";
						$stmt = $db_conn->prepare($str);
						$stmt->bindParam(":cat", $args[1]);
					} else { // If the category ID is not present
						$this->statusCode = 404;
						break;
					}
				} else if (isset($args[0]) && ($args[0] == "search")) { // If we're returning searched for items
					if (isset($args[1]) && is_string($args[1])) { // If the search value is present
						$str .= " WHERE `name` LIKE :search";
						$stmt = $db_conn->prepare($str);
						$args[1] = "%" . $args[1] . "%"; // Add wildcard characters around the search value
						$stmt->bindParam(":search", $args[1]);
					} else { // If the search value isn't present
						$this->statusCode = 404;
						break;
					}
				} else { // If the arguments aren't supported
					$this->statusCode = 404;
					break;
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