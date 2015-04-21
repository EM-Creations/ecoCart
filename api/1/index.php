<?php

/**
 * Author: UP608985
 * ecoCart API Version 1 routing / processing file
 * Routing design: /api/{version}/?a={action}[&id={id}][&name={name}][&ssv={special search value}][&start={startVal}][&limit={limitVal}][&orderBy={orderVal}][&orderType={ASC|DESC}]
 */

/**
 * HELP:
 * 	'a' variable - The action (part of the API) being requested
 * 	'ssv' variable - "Special Search Value", used by different actions to reference values specific to them
 */
require("../config.inc.php"); // Require the database config file
require("./Lib.class.php"); // Require the Library class
require("./APIAction.class.php"); // Require the APIAction abstract class

$action = Lib::getRequestVar('a', FILTER_SANITIZE_STRING);

$jsonResp = []; // JSON response variable

$id = Lib::getRequestVar('id', FILTER_SANITIZE_NUMBER_INT);
$name = Lib::getRequestVar('name', FILTER_SANITIZE_STRING);
$start = Lib::getRequestVar('start', FILTER_SANITIZE_NUMBER_INT);
$limit = Lib::getRequestVar('limit', FILTER_SANITIZE_NUMBER_INT);
$orderBy = Lib::getRequestVar('orderBy', FILTER_SANITIZE_STRING);
$orderType = Lib::getRequestVar('orderType', FILTER_SANITIZE_STRING);
$ssv = Lib::getRequestVar('ssv', FILTER_SANITIZE_NUMBER_INT);

$db_conn->query("USE `ecocart`;"); // Use the ecocart database

switch ($action) { // Process the specified action
    // <editor-fold defaultstate="collapsed" desc="Process actions">
    case "categories":
        // <editor-fold defaultstate="collapsed" desc="Process categories action">
        require("./Category.class.php"); // Include the Category class

        $catSearch = new Category();

        if (isset($id) && is_numeric($id)) {
            $catSearch->setID($id);
        }

        if (isset($name)) {
            $catSearch->setName($name);
        }

        if (isset($start) && is_numeric($start)) {
            $catSearch->setStart($start);
        }

        if (isset($limit) && is_numeric($limit)) {
            $catSearch->setLimit($limit);
        }

        if (isset($orderBy)) {
            $catSearch->setOrderBy($orderBy);
        }

        if (isset($orderType)) {
            $catSearch->setOrderType($orderType);
        }

        if (is_numeric($ssv)) {
            $catSearch->setParent($ssv); // Set that we're looking for categories with a specific parent
        }

        $jsonResp['resp'] = $catSearch->execute();
        // </editor-fold>
        break;

    case "time":
        // <editor-fold defaultstate="collapsed" desc="Process time action">
        $ssv = Lib::getRequestVar('ssv', FILTER_SANITIZE_STRING); // Override default $ssv handling to look for a string instead

        if (isset($ssv)) { // If the special search value is set
            $format = $ssv;
        } else { // If the special search value isn't set
            $format = "d/m/Y"; // Default time format: day/month/year
        }

        $jsonResp['resp'] = date($format);
        // </editor-fold>
        break;

    case "item":
        // <editor-fold defaultstate="collapsed" desc="Process item action">
        require("./Item.class.php"); // Include the Setting class

        $itemSearch = new Item();

        if (isset($id) && is_numeric($id)) {
            $itemSearch->setID($id);
        }

        if (isset($name)) {
            $itemSearch->setName($name);
        }

        if (isset($start) && is_numeric($start)) {
            $itemSearch->setStart($start);
        }

        if (isset($limit) && is_numeric($limit)) {
            $itemSearch->setLimit($limit);
        }

        if (isset($orderBy)) {
            $itemSearch->setOrderBy($orderBy);
        }

        if (isset($orderType)) {
            $itemSearch->setOrderType($orderType);
        }

        if (is_numeric($ssv)) { // Don't add "isset" check; it causes breakages if the value is 0
            $itemSearch->setFeatured($ssv);
        }

        $jsonResp['resp'] = $itemSearch->execute();
        // </editor-fold>
        break;

    default: // If the action is invalid
        $jsonResp['resp']['error'] = ['code' => 501, 'msg' => "Not implemented"];
        $json['resp']['vars'] = $_REQUEST; // TODO: Remove after testing
        break;
    // </editor-fold>
}

print(json_encode($jsonResp)); // Print the JSON response to the request
