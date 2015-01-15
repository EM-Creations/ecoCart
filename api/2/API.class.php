<?php
/**
 * Abstract API class
 *
 * @author Edward McKnight (UP608985)
 */
abstract class API {
	/**
	 * Request method used
	 * 
	 * @var string
	 */
	protected $method = "";
	
	/**
	 * End point targeted
	 * 
	 * @var string
	 */
	protected $endPoint = "";
	
	/**
	 * Arguments
	 * 
	 * @var array
	 */
	protected $args = [];
	
	/**
	 * Response to be returned
	 * 
	 * @var array
	 */
	protected $resp = ['data' => null]; // Response array (to be output as JSON)
	
	/**
	 * Status code to be used and returned
	 * 
	 * @var int
	 */
	protected $statusCode = 200;

	/**
	 * Constructor
	 */
	public function __construct() {
		// <editor-fold defaultstate="collapsed" desc="Constructor">
		// Set headers
		header("Access-Control-Allow-Orgin: *");
		header("Access-Control-Allow-Methods: *");
		header("Content-Type: application/json");

		$rawPath = filter_input(INPUT_SERVER, "PATH_INFO", FILTER_SANITIZE_STRING); // Get the raw path info variable
		$this->args = explode('/', trim($rawPath, '/')); // Set the arguments
		$this->endPoint = array_shift($this->args); // Set the end point

		$this->method = filter_input(INPUT_SERVER, "REQUEST_METHOD", FILTER_SANITIZE_STRING); // Get the request method
		// </editor-fold>
	}

	/**
	 * Process API request
	 * 
	 * @return response
	 */
	public function processAPI() {
		// <editor-fold defaultstate="collapsed" desc="processAPI">
		if ((int) method_exists($this, $this->endPoint) > 0) {
			$this->{$this->endPoint}($this->args); // Calls method
			return $this->_response();
		}
		
		$this->resp['error'] = "Endpoint does not exist: $this->endPoint";
		return $this->_response(404);
		// </editor-fold>
	}

	/**
	 * Output response
	 * 
	 * @return string
	 */
	private function _response() {
		// <editor-fold defaultstate="collapsed" desc="__response">
		header("HTTP/1.1 " . $this->statusCode . " " . $this->_requestStatus($this->statusCode));
		return json_encode($this->resp);
		// </editor-fold>
	}

	/**
	 * Return request status string
	 * 
	 * @param int $code
	 * @return string
	 */
	private function _requestStatus($code) {
		// <editor-fold defaultstate="collapsed" desc="__requestStatus">
		$status = [
			200 => "OK",
			404 => "Not Found",
			405 => "Method Not Allowed",
			500 => "Internal Server Error",
		];
		return ($status[$code]) ? $status[$code] : $status[500];
		// </editor-fold>
	}
}