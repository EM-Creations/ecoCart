<?php
/**
 * Library class for version 1 of the API
 *
 * @author UP608985
 */
class Lib
{

    public static function getRequestVar($varName, $filter)
    {
        // <editor-fold defaultstate="collapsed" desc="getRequestVar">		
        $reqVar = filter_input(INPUT_GET, $varName, $filter); // Try to get the value via GET

        if (!isset($reqVar)) {
            $reqVar = filter_input(INPUT_POST, $varName, $filter); // Try to get the value via POST
        }
        return $reqVar; // Return the request value
        // </editor-fold>
    }
}
