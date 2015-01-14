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
	protected function time($arg) {
		// <editor-fold defaultstate="collapsed" desc="time">
		if ($this->method == "GET") {
			if (isset($arg[0])) {
				$format = $arg[0];
			} else {
				$format = "d/m/Y";
			}
			$this->statusCode = 200; // Set the status code to OK (successful)
			$this->resp['data'] = date($format); // Put the data into the $this->resp['data'] element
		}
		// </editor-fold>
	}
}