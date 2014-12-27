<?php
/**
 * Item API class
 *
 * @author Edward McKnight (UP608985)
 */
class Item extends APIAction {
	private $featured;
	
	/**
	 * Constructor
	 */
	public function __construct() {
		parent::__construct("item");
		$this->featured = null;
	}
	
	/**
	 * Set featured
	 * 
	 * @param boolean $newFeatured
	 */
	public function setFeatured($newFeatured) {
		$this->featured = (bool) $newFeatured;
	}
	
	/**
	 * Execute the search and return the results
	 * 
	 * @global PDO $db_conn
	 * @return Array
	 */
	public function execute() {
		// <editor-fold defaultstate="collapsed" desc="execute">
		global $db_conn;
		
		$str = "SELECT `item`.`id`, `item`.`cat`, `item`.`name`, `item`.`description`, `item`.`weight`, `item`.`price`, `item_image`.`main` as `main_image`, `item_image`.`image`  FROM `item` LEFT JOIN `item_image` ON `item`.`id`=`item_image`.`item_id`";
		
		// WHERE clauses
		$wheres = []; // Array of WHERE clauses
		
		if ($this->id) {
			$wheres[] = " `id` = :id";
		}
		
		if ($this->name) {
			$wheres[] = " `name` = :name";
		}
		
		if ($this->featured !== null) {
			$wheres[] = " `featured` = :featured";
		}
		
		if (sizeof($wheres)) {
			$str .= " WHERE";
			$str .= implode(" AND", $wheres);
		}
		
		// Ordering
		if ($this->orderBy) { // If an order by has been set
			$str .= " ORDER BY :orderBy";
			
			if ($this->orderType) { // If an order type has been set
				$str .= " :orderType";
			}
		}
		
		// Limiting
		if ($this->start) { // If a start has been set
			$str .= " LIMIT :start";
			
			if ($this->limit) { // If a limit has been set
				$str .= ", :limit";
			}
		}

		$stmt = $db_conn->prepare($str);
		
		if ($this->id) {
			$stmt->bindParam(":id", $this->id);
		}
		
		if ($this->name) {
			$stmt->bindParam(":name", $this->name);
		}
		
		if ($this->featured !== null) {
			$stmt->bindParam(":featured", $this->featured, PDO::PARAM_INT);
		}
		
		if ($this->orderBy) {
			$stmt->bindParam(":orderBy", $this->orderBy);
			
			if ($this->orderType) {
				$stmt->bindParam(":orderType", $this->orderType);
			}
		}
		
		if ($this->start) {
			$stmt->bindParam(":start", $this->start, PDO::PARAM_INT);
			
			if ($this->limit) {
				$stmt->bindParam(":limit", $this->limit, PDO::PARAM_INT);
			}
		}

		$stmt->execute();
		
		return $stmt->fetchAll(PDO::FETCH_ASSOC); // Return the results
		// </editor-fold>		
	}
}