<?php
/**
 * Author: Edward McKnight (UP608985)
 * ecoCart API Version 2 routing / processing file
 */

// Routing design: /api/{version}/{action}/{identifier}

$rawPath = filter_input(INPUT_SERVER, "PATH_INFO", FILTER_SANITIZE_STRING); // Get the raw path info variable
if (!isset($rawPath)) { // If the path hasn't been set
	$rawPath = "/"; // Set it to /
}

$method = filter_input(INPUT_SERVER, "REQUEST_METHOD", FILTER_SANITIZE_STRING); // Get the request method variable
if (!isset($method)) { // If we can't get the request method
	$method = "GET"; // Set it to GET by default
}

$path = trim($rawPath, '/');
$pathParts = explode('/', $path); // Separate the path into its individual components

$resp = ['status' => ['code' => 200, 'msg' => "OK"]]; // Set up response variable

switch ($pathParts[0]) { // Check the first part of the path
	// <editor-fold defaultstate="collapsed" desc="Request handlers">
	case "time":
		// <editor-fold defaultstate="collapsed" desc="time request handler">
		switch ($method) {
			case "GET":
				
				if (isset($pathParts[1])) {
					$format = $pathParts[1];
				} else {
					$format = "d/m/Y";
				}
				
				$resp['data'] = date($format);
				break;
		
			default:
				$resp['status'] = ['code' => 405, 'msg' => "Method Not Allowed"];
		}
		// </editor-fold>
		break;
	
	default:
		$resp['status'] = ['code' => 404, 'msg' => "Not Found"];
	// </editor-fold>
}

print(json_encode($resp)); // Output the response