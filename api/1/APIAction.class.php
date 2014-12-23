<?php
/**
 * APIAction abstract class
 *
 * @author Edward McKnight (UP608985)
 */
abstract class APIAction {
	protected $id;
	protected $name;
	protected $start;
	protected $limit;
	protected $orderBy;
	protected $orderType;
	private $table;
	
	/**
	 * Constrcutor
	 * 
	 * @param string $dbTable
	 */
	public function __construct($dbTable) {
		// <editor-fold defaultstate="collapsed" desc="Constructor">
		$this->id = false;
		$this->name = false;
		$this->start = 0;
		$this->limit = false;
		$this->orderBy = false;
		$this->orderType = false;
		$this->table = $dbTable;
		// </editor-fold>
	}
	
	/**
	 * Constructor
	 * 
	 * @param int $newID
	 */
	public function setID($newID) {
		$this->id = $newID;
	}
	
	/**
	 * Set the name to search by
	 * 
	 * @param string $newName
	 */
	public function setName($newName) {
		$this->name = $newName;
	}
	
	/**
	 * Set the start number of records
	 * 
	 * @param int $newStart
	 */
	public function setStart($newStart) {
		$this->start = (int) $newStart;
	}
	
	/**
	 * Set the limit of records
	 * 
	 * @param int $newLimit
	 */
	public function setLimit($newLimit) {
		$this->limit = (int) $newLimit;
	}
	
	/**
	 * Set the column to order the results by
	 * 
	 * @param string $newOrderBy
	 */
	public function setOrderBy($newOrderBy) {
		$this->orderBy = $newOrderBy;
	}
	
	/**
	 * Set the order type
	 * 
	 * @param string $newOrderType
	 */
	public function setOrderType($newOrderType) {
		// <editor-fold defaultstate="collapsed" desc="setOrderType">
		if (($newOrderType == "ASC") || ($newOrderType == "DESC")) {
			$this->orderType = $newOrderType;
		}
		// </editor-fold>
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
		
		$str = "SELECT * FROM `" . $this->table . "`";
		
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