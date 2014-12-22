<?php
/**
 * Author: Edward McKnight (UP608985)
 */

// Routing design: /api/{version}/?a={action}[&id={id}][&name={name}][&ssv={special search value}][&start={startVal}][&limit={limitVal}]

require("../config.inc.php"); // Require the database config file
require("./Lib.class.php"); // Require the Library class

$action = Lib::getRequestVar('a', FILTER_SANITIZE_STRING);

$jsonResp = []; // JSON response variable

switch ($action) { // Process the specified action
	// <editor-fold defaultstate="collapsed" desc="Process actions">
	case "categories":
		// <editor-fold defaultstate="collapsed" desc="Process categories action">
		require("./Category.class.php"); // Include the Category class
		
		$ssv = Lib::getRequestVar('ssv', FILTER_SANITIZE_NUMBER_INT);
		$catSearch = new Category();

		if (is_numeric($ssv)) {
			$catSearch->setParent($ssv); // Set that we're looking for categories with a specific parent
		}
		
		$jsonResp['resp'] = $catSearch->execute();
		// </editor-fold>
		break;
	
	default: // If the action is invalid
		$jsonResp['resp']['error'] = ['code' => 501, 'msg' => "Not implemented"];
		$json['resp']['vars'] = $_REQUEST; // TODO: Remove after testing
		break;
	// </editor-fold>
}

print(json_encode($jsonResp)); // Print the JSON response to the request