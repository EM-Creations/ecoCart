<?php
/**
 * Automatically generated CSS styles from admin defined settings
 * Author: UP608985
 */

header("Content-type: text/css"); // Content type is text/css
require(__DIR__ . "/../api/config.inc.php"); // Require the configuration file

$stmt = $db_conn->prepare("SELECT `name`, `value` FROM `setting` WHERE `name` LIKE 'style-%'"); // Get all style settings
$stmt->execute();
$results = $stmt->fetchAll(PDO::FETCH_ASSOC); // Fetch the results as an associative array

foreach ($results as $setting) { // For each setting
    $setting['name'] = substr($setting['name'], 6);
    $setting['name'] = processSpecialChars($setting['name']);
    $attrSeparatorPos = strpos($setting['name'], '!attr!');
    $setting['attribute'] = substr($setting['name'], $attrSeparatorPos + 6);
    $setting['name'] = substr($setting['name'], 0, $attrSeparatorPos);
    
    print($setting['name'] . " {\n");
    print("\t" . $setting['attribute'] . ": " . $setting['value'] . " !important;\n");
    print("}\n\n");
}

/**
 * Process special characters used
 * 
 * @param string $val
 */
function processSpecialChars($val) 
{
    // <editor-fold defaultstate="collapsed" desc="processSpecialChars">
    $val = str_replace(["!id!", "!class!"], ["#", "."], $val);
    return $val;
    // </editor-fold>
}
