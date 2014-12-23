<?php
/**
 * Setting API class
 *
 * @author Edward McKnight (UP608985)
 */
class Setting {
	private $id;
	private $name;
	private $start;
	private $limit;
	private $orderBy;
	private $orderType;
	
	public function __construct() {
		// <editor-fold defaultstate="collapsed" desc="Constructor">
		$this->id = false;
		$this->name = false;
		$this->start = 0;
		$this->limit = false;
		$this->orderBy = false;
		$this->orderType = false;
		// </editor-fold>
	}
	
	public function setID($newID) {
		$this->id = $newID;
	}
	
	public function setName($newName) {
		$this->name = $newName;
	}
	
	public function setStart($newStart) {
		$this->start = (int) $newStart;
	}
	
	public function setLimit($newLimit) {
		$this->limit = (int) $newLimit;
	}
	
	public function setOrderBy($newOrderBy) {
		$this->orderBy = $newOrderBy;
	}
	
	public function setOrderType($newOrderType) {
		$this->orderType = $newOrderType;
	}
	
	public function execute() {
		// <editor-fold defaultstate="collapsed" desc="execute">
		global $db_conn;
		
		$str = "SELECT * FROM `setting`";
		
		// WHERE clauses
		$wheres = []; // Array of WHERE clauses
		
		if ($this->id) {
			$wheres[] = " `id` = :id";
		}
		
		if ($this->name) {
			$wheres[] = " `name` = :name";
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