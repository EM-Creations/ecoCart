<?php
/**
 * Category API class
 *
 * @author Edward McKnight (UP608985)
 */
class Category {
	private $id;
	private $start;
	private $limit;
	private $parent;
	
	public function __construct() {
		// <editor-fold defaultstate="collapsed" desc="Constructor">
		$this->id = false;
		$this->start = 0;
		$this->limit = false;
		$this->parent = -1;
		// </editor-fold>
	}
	
	public function setID($newID) {
		$this->id = $newID;
	}
	
	public function setParent($parentID) {
		$this->parent = (int) $parentID;
	}
	
	public function execute() {
		// <editor-fold defaultstate="collapsed" desc="execute">
		global $db_conn;
		
		$str = "SELECT * FROM `category`";
		
		$wheres = []; // Array of WHERE clauses
		
		if ($this->id) {
			$wheres[] = " `id` = :id";
		}
		
		if ($this->parent >= 0) {
			$wheres[] = " `parent_id` = :parentID";
		}
		
		if (sizeof($wheres)) {
			$str .= " WHERE";
			$str .= implode(" AND", $wheres);
		}

		$stmt = $db_conn->prepare($str);
		
		if ($this->id) {
			$stmt->bindParam(":id", $this->id);
		}
		
		if ($this->parent >= 0) {
			$stmt->bindParam(":parentID", $this->parent);
		}
		
		$stmt->execute();
		
		return $stmt->fetchAll(PDO::FETCH_ASSOC); // Return the results
		// </editor-fold>		
	}
}