<?php
/**
 * Category API class
 *
 * @author UP608985
 */
class Category extends APIAction
{
    private $parent;

    /**
     * Constructor
     */
    public function __construct()
    {
        // <editor-fold defaultstate="collapsed" desc="Constructor">
        parent::__construct("categories");
        $this->parent = -1;
        // </editor-fold>
    }

    /**
     * Set the parent to search for
     * 
     * @param int $parentID
     */
    public function setParent($parentID)
    {
        $this->parent = (int) $parentID;
    }

    /**
     * Execute the search and return the results
     * 
     * @global PDO $db_conn
     * @return Array
     */
    public function execute()
    {
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
