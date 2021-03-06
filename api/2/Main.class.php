<?php
/**
 * Main API class
 * Includes functions for handling API end points
 *
 * @author UP608985
 */
class Main extends API {
    /**
     * Time end point
     * 
     * @param array $args
     */
    protected function time($args)
    {
        // <editor-fold defaultstate="collapsed" desc="time">
        switch ($this->method) {
            case "GET":
                // <editor-fold defaultstate="collapsed" desc="GET">
                if (isset($args[0])) {
                    $format = filter_var($args[0], FILTER_SANITIZE_STRING);
                } else {
                    $format = "d/m/Y"; // Default format
                }
                $this->resp['data'] = date($format); // Put the data into the $this->resp['data'] element
                // </editor-fold>
                break;
                
            case "OPTIONS":
                // <editor-fold defaultstate="collapsed" desc="OPTIONS">
                $this->resp['data'] = [
                                        "GET" => 
                                            [
                                            "description" => "Get the time.", 
                                            "parameters" => 
                                                [
                                                "format" => 
                                                    ["type" => "string", "description" => "Time format.", "required" => false]
                                                ]
                                            ]
                                        ]; // Put the data into the $this->resp['data'] element
                // </editor-fold>
                break;
                
            default:
                $this->statusCode = 405; // Only accepts GET requests
        }
        // </editor-fold>
    }

    /**
     * Categories end point
     * 
     * @global PDO $db_conn
     * @param array $args
     */
    protected function categories($args)
    {
        // <editor-fold defaultstate="collapsed" desc="categories">
        global $db_conn;

        switch ($this->method) {
            case "GET":
                // <editor-fold defaultstate="collapsed" desc="GET">
                $stmt = null;

                if (isset($args[0]) && ($args[0] == "parent")) { // If we're returning all categories with a specified parent
                    $stmt = $db_conn->prepare("SELECT * FROM `category` WHERE `parent_id` = :parentID");
                    if (!isset($args[1]) || !is_numeric($args[1])) { // If the parent isn't set or isn't a number
                        $args[1] = 0; // Set the parent to none
                    }
                    $parent = filter_var($args[1], FILTER_SANITIZE_NUMBER_INT);
                    $stmt->bindParam(":parentID", $parent);
                } else if (isset($args[0]) && is_numeric($args[0])) { // If we're returning a specific category
                    $stmt = $db_conn->prepare("SELECT * FROM `category` WHERE `id` = :catID");
                    $catID = filter_var($args[0], FILTER_SANITIZE_NUMBER_INT);
                    $stmt->bindParam(":catID", $catID);
                } else { // If we're just returning all of the categories
                    $stmt = $db_conn->prepare("SELECT * FROM `category`");
                }

                $stmt->execute();
                $this->resp['data'] = $stmt->fetchAll(PDO::FETCH_ASSOC); // Return the results
                // </editor-fold>
                break;
                
            case "POST":
                // <editor-fold defaultstate="collapsed" desc="POST">
                $str = "INSERT INTO `category` (`name`, `parent_id`) VALUES (:name, :parent)";

                $name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
                $parent = filter_input(INPUT_POST, 'parent', FILTER_SANITIZE_NUMBER_INT);

                $stmt = $db_conn->prepare($str);
                $stmt->bindParam("name", $name);
                $stmt->bindParam("parent", $parent, PDO::PARAM_INT);

                $stmt->execute();
                $this->resp['data'] = $db_conn->lastInsertID(); // Return the ID of the category
                // </editor-fold>
                break;
            
            case "PUT":
                // <editor-fold defaultstate="collapsed" desc="PUT">
                $stmt = null;
                
                if (isset($args[0]) && is_numeric($args[0])) { // If we're updating a specific category
                    $str = "UPDATE `category` SET `name` = :name, `parent_id` = :parent WHERE `id` = :id";
                    
                    $putVars = []; // Empty array
                    Lib::parse_input($putVars); // Parses PUT data into $_POST superglobal
                    
                    $id = filter_var($args[0], FILTER_SANITIZE_NUMBER_INT);
                    $name = filter_var($putVars['name'], FILTER_SANITIZE_STRING);
                    $parent = filter_var($putVars['parent'], FILTER_SANITIZE_NUMBER_INT);
                    
                    $stmt = $db_conn->prepare($str);
                    $stmt->bindParam('id', $id, PDO::PARAM_INT);
                    $stmt->bindParam('name', $name);
                    $stmt->bindParam('parent', $parent, PDO::PARAM_INT);
                }
                
                $stmt->execute();
                $this->resp['data'] = "updated";
                // </editor-fold>
                break;
            
            case "DELETE":
                // <editor-fold defaultstate="collapsed" desc="DELETE">
                $stmt = null;

                if (isset($args[0]) && is_numeric($args[0])) { // If we're deleting a specific category
                    $catID = filter_var($args[0], FILTER_SANITIZE_NUMBER_INT);
                    
                    // Update items that were using the category to be deleted
                    $catStmt = $db_conn->prepare("SELECT `parent_id` FROM `category` WHERE `id` = :catID");
                    $catStmt->bindParam(":catID", $catID);
                    if ($catStmt->execute()) { // If the statement succeeded
                        $row = $catStmt->fetch(PDO::FETCH_ASSOC);
                        $parentID = (int) $row['parent_id'];
                    } else {
                        $parentID = 0;
                    }
                    
                    $itemStmt = $db_conn->prepare("UPDATE `item` SET `cat` = :parentID WHERE `cat` = :catID");
                    $itemStmt->bindParam(":catID", $catID);
                    $itemStmt->bindParam(":parentID", $parentID);
                    $itemStmt->execute(); // Update items
                    
                    // Update categories that were using the category to be deleted as their parent
					$updateStmt = $db_conn->prepare("UPDATE `category` SET `parent_id` = :parentID WHERE `parent_id` = :catID");
					$updateStmt->bindParam(":catID", $catID);
                    $updateStmt->bindParam(":parentID", $parentID);
					$updateStmt->execute(); // Run the update statement
					
                    $stmt = $db_conn->prepare("DELETE FROM `category` WHERE `id` = :catID");
                    $stmt->bindParam(":catID", $catID);
                }

                $stmt->execute();
                $this->resp['data'] = "Deleted";
                // </editor-fold>
                break;
                
            case "OPTIONS":
                // <editor-fold defaultstate="collapsed" desc="OPTIONS">
                $this->resp['data'] = [
                                        "GET" => 
                                            [
                                            "description" => "Get a category.", 
                                            "parameters" => 
                                                [
                                                "category ID" => 
                                                    ["type" => "int", "description" => "Specifies a specific category to return.", "required" => false],
                                                "parent" =>
                                                    ["type" => "string", "description" => "Modifier that dictates to return categories with a specific parent category.", "required" => false],
                                                "category parent ID" =>
                                                    ["type" => "int", "description" => "The specific parent category to return categories from.", "required" => false]
                                                ]
                                            ],
                                        "POST" => 
                                            [
                                            "description" => "Add a new category.", 
                                            "parameters" => 
                                                [
                                                "name" => 
                                                    ["type" => "string", "description" => "Name for the new category.", "required" => true],
                                                "parent" =>
                                                    ["type" => "int", "description" => "Parent category ID for the new category.", "required" => true]
                                                ]
                                            ],
                                        "PUT" => 
                                            [
                                            "description" => "Modify an existing category.", 
                                            "parameters" => 
                                                [
                                                "category ID" => 
                                                    ["type" => "int", "description" => "ID of the category to modify.", "required" => true],
                                                "name" => 
                                                    ["type" => "string", "description" => "Name for the category.", "required" => true],
                                                "parent" =>
                                                    ["type" => "int", "description" => "Parent category ID for the category.", "required" => true]
                                                ]
                                            ],
                                        "DELETE" => 
                                            [
                                            "description" => "Delete a category.", 
                                            "parameters" => 
                                                [
                                                "category ID" => 
                                                    ["type" => "int", "description" => "ID of the category to delete.", "required" => true]
                                                ]
                                            ]
                                    ]; // Put the data into the $this->resp['data'] element
                // </editor-fold>
                break;

            default:
                $this->statusCode = 405; // Method not allowed
        }
        // </editor-fold>
    }

    /**
     * Item end point
     * 
     * @global PDO $db_conn
     * @param array $args
     */
    protected function item($args)
    {
        // <editor-fold defaultstate="collapsed" desc="item">
        global $db_conn;
        $imageUploadsDir = __DIR__ . "/../../images/products";

        switch ($this->method) {
            case "GET":
                // <editor-fold defaultstate="collapsed" desc="GET">
                $stmt = null;
                $str = "SELECT `item`.`id`, `item`.`cat`, `item`.`name`, `item`.`description`, `item`.`weight`, `item`.`price`, `item`.`stock`, `item`.`featured`, `item_image`.`main` as `main_image`, `item_image`.`image`  FROM `item` LEFT JOIN `item_image` ON `item`.`id`=`item_image`.`item_id`";

                if (isset($args[0]) && is_numeric($args[0])) { // If we're returning a specific item
                    $id = filter_var($args[0], FILTER_SANITIZE_NUMBER_INT);
                    $str .= " WHERE `id` = :id";
                    $stmt = $db_conn->prepare($str);
                    $stmt->bindParam(":id", $id);
                } else if (isset($args[0]) && ($args[0] == "featured")) { // If we're returning featured items
                    $str .= " WHERE `featured` = 1";
                    $stmt = $db_conn->prepare($str);
                } else if (isset($args[0]) && ($args[0] == "category")) { // If we're returning items within a specific category
                    if (isset($args[1]) && is_numeric($args[1])) { // If the category ID is present
                        $catID = filter_var($args[1], FILTER_SANITIZE_NUMBER_INT);
                        $str .= " WHERE `cat` = :cat";
                        $stmt = $db_conn->prepare($str);
                        $stmt->bindParam(":cat", $catID);
                    } else { // If the category ID is not present
                        $this->statusCode = 404;
                        break;
                    }
                } else if (isset($args[0]) && ($args[0] == "search")) { // If we're returning searched for items
                    if (isset($args[1]) && is_string($args[1])) { // If the search value is present
                        $searchQuery = filter_var($args[1], FILTER_SANITIZE_STRING);
                        $str .= " WHERE `name` LIKE :search";
                        $stmt = $db_conn->prepare($str);
                        $searchQuery = "%" . $searchQuery . "%"; // Add wildcard characters around the search value
                        $stmt->bindParam(":search", $searchQuery);
                    } else { // If the search value isn't present
                        $this->statusCode = 404;
                        break;
                    }
                } else if (isset($args[0]) && ($args[0] == "stock")) { // If we're returning items based on their stock level being below a certain number
                    if (isset($args[1]) && is_numeric($args[1])) { // If the stock level value is present
                        $stockThreshold = filter_var($args[1], FILTER_SANITIZE_NUMBER_INT);
                        $str .= " WHERE `stock` < :stockThreshold ORDER BY `stock` ASC";
                        $stmt = $db_conn->prepare($str);
                        $stmt->bindParam(":stockThreshold", $stockThreshold);
                    } else { // If the search value isn't present
                        $this->statusCode = 404;
                        break;
                    }
                } else { // If the arguments aren't supported
                    $this->statusCode = 404;
                    break;
                }

                $stmt->execute();
                $this->resp['data'] = $stmt->fetchAll(PDO::FETCH_ASSOC); // Return the results
                // </editor-fold>
                break;
                
            case "POST":
                // <editor-fold defaultstate="collapsed" desc="POST">              
                $str = "INSERT INTO `item` (`name`, `cat`, `description`, `weight`, `featured`, `price`, `stock`) VALUES (:name, :category, :description, :weight, :featured, :price, :stock)";

                $name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
                $category = filter_input(INPUT_POST, 'category', FILTER_SANITIZE_NUMBER_INT);
                $description = filter_input(INPUT_POST, 'desc', FILTER_SANITIZE_STRING);
                $weight = filter_input(INPUT_POST, 'weight', FILTER_SANITIZE_STRING); // Sanitise as string to stop conversion of double to int
                $featured = filter_input(INPUT_POST, 'featured', FILTER_SANITIZE_NUMBER_INT);
                $price = filter_input(INPUT_POST, 'price', FILTER_SANITIZE_STRING); // Sanitise as string to stop conversion of double to int
                $stock = filter_input(INPUT_POST, 'stock', FILTER_SANITIZE_NUMBER_INT);

                $stmt = $db_conn->prepare($str);
                $stmt->bindParam("name", $name);
                $stmt->bindParam("category", $category);
                $stmt->bindParam("description", $description);
                $stmt->bindParam("weight", $weight);
                $stmt->bindParam("featured", $featured);
                $stmt->bindParam("price", $price);
                $stmt->bindParam("stock", $stock);

                $stmt->execute(); // Add the item entry
                $newItemID = $db_conn->lastInsertID();
                
//                print("POST:<br /><br />");
//                print_r($_POST);
//                print("FILES:<br /><br />");
//                print_r($_FILES);
                
                // Move the uploaded file
                $fileName = $_FILES['image']['name'];
                $tmpFile = $_FILES['image']['tmp_name'];
                $dest =  $imageUploadsDir . "/" . $fileName;
                if (file_exists($dest)) { // If this file name already exists
                    // Make the filename unique
                    $lastDot = strrpos($fileName, '.');
                    $extension = substr($fileName, $lastDot);
                    $fileName = substr($fileName, 0, $lastDot);
                    $fileName = $fileName . uniqid() . $extension;
                    $dest = $imageUploadsDir . "/" . $fileName;
                }
                move_uploaded_file($tmpFile, $dest);
                
                $imgStr = "INSERT INTO `item_image` (`item_id`, `image`, `main`) VALUES (:itemID, :image, 1)";
                $imgStmt = $db_conn->prepare($imgStr);
                $imgStmt->bindParam("itemID", $newItemID);
                $imgStmt->bindParam("image", $fileName);
                
                $imgStmt->execute(); // Add the item_image entry
                
                $this->resp['data'] = $newItemID; // Return the ID of the created item
                // </editor-fold>
                break;
            
            case "PUT":
                // <editor-fold defaultstate="collapsed" desc="PUT">
                $stmt = null;
                
                if (isset($args[0]) && is_numeric($args[0])) { // If we're updating a specific item
                    $str = "UPDATE `item` SET `name` = :name, `cat` = :category, `weight` = :weight, `featured` = :featured, `price` = :price, `stock` = :stock, `description` = :description WHERE `id` = :id";
                    $putVars = []; // Empty array
                    Lib::parse_input($putVars); // Parses PUT data into $_POST superglobal
//                    print_r($putVars);
                    
                    $id = filter_var($args[0], FILTER_SANITIZE_NUMBER_INT);
                    $name = filter_var($putVars['name'], FILTER_SANITIZE_STRING);
                    $category = filter_var($putVars['category'], FILTER_SANITIZE_NUMBER_INT);
                    $description = filter_var($putVars['desc'], FILTER_SANITIZE_STRING);
                    $weight = filter_var($putVars['weight'], FILTER_SANITIZE_STRING); // Sanitise as string to stop conversion of double to int
                    $featured = filter_var($putVars['featured'], FILTER_SANITIZE_NUMBER_INT);
                    $price = filter_var($putVars['price'], FILTER_SANITIZE_STRING); // Sanitise as string to stop conversion of double to int
                    $stock = filter_var($putVars['stock'], FILTER_SANITIZE_NUMBER_INT);

                    $stmt = $db_conn->prepare($str);
                    $stmt->bindParam("id", $id);
                    $stmt->bindParam("name", $name);
                    $stmt->bindParam("category", $category);
                    $stmt->bindParam("description", $description);
                    $stmt->bindParam("weight", $weight);
                    $stmt->bindParam("featured", $featured);
                    $stmt->bindParam("price", $price);
                    $stmt->bindParam("stock", $stock);

                    $stmt->execute(); // Modify the item entry

                    // Move the uploaded file
                    if (sizeof($_FILES) > 0) { // If an image has been provided, update it
                        //print_r($_FILES); exit;
                        
                        $fileName = $_FILES['name'];
                        $tmpFile = $_FILES['tmp_name'];
                        $dest =  $imageUploadsDir . "/" . $fileName;
                        if (file_exists($dest)) { // If this file name already exists
                            // Make the filename unique
                            $lastDot = strrpos($fileName, '.');
                            $extension = substr($fileName, $lastDot);
                            $fileName = substr($fileName, 0, $lastDot);
                            $fileName = $fileName . uniqid() . $extension;
                            $dest = $imageUploadsDir . "/" . $fileName;
                        }
                        if (!rename($tmpFile, $dest)) { // Use rename (not move_uploaded_file) due to move_uploaded_file only working with files uploaded through POST
                            $this->resp['error'] = "Couldn't move uploaded file."; // Return error message
                            $this->resp['name'] = $fileName; // Return error message
                            $this->resp['tmp'] = $tmpFile; // Return error message
                            $this->resp['dest'] = $dest; // Return error message
                            $this->statusCode = 500;
                            return;
                        }

                        // Get the item image names, so we can delete them
                        $imagesStmt = $db_conn->prepare("SELECT `image` FROM `item_image` WHERE `item_id` = :prodID");
                        $imagesStmt->bindParam(":prodID", $id);
                        if ($imagesStmt->execute()) { // If the statement succeeded
                            while ($row = $imagesStmt->fetch(PDO::FETCH_ASSOC)) { // For each statement
                                $imageName = $row['image'];
                                unlink($imageUploadsDir . "/" . $imageName); // Delete the file
                            }
                        }
                        
                        $imgStr = "UPDATE `item_image` SET `image` = :image WHERE `item_id` = :itemID";
                        $imgStmt = $db_conn->prepare($imgStr);
                        $imgStmt->bindParam("itemID", $id);
                        $imgStmt->bindParam("image", $fileName);

                        $imgStmt->execute(); // Add the item_image entry
                    }
                }
                
                $stmt->execute();
                $this->resp['data'] = $id; // Return the ID of the item
                // </editor-fold>
                break;
				
			case "DELETE":
                // <editor-fold defaultstate="collapsed" desc="DELETE">
                $stmt = null;
				
                if (isset($args[0]) && is_numeric($args[0])) { // If we're deleting a specific item
                    // Get the item image names, so we can delete them
                    $prodID = filter_var($args[0], FILTER_SANITIZE_NUMBER_INT);
                    $imagesStmt = $db_conn->prepare("SELECT `image` FROM `item_image` WHERE `item_id` = :prodID");
                    $imagesStmt->bindParam(":prodID", $prodID);
                    if ($imagesStmt->execute()) { // If the statement succeeded
                        while ($row = $imagesStmt->fetch(PDO::FETCH_ASSOC)) { // For each statement
                            $imageName = $row['image'];
                            unlink($imageUploadsDir . "/" . $imageName); // Delete the file
                        }
                    }
                    
					// Delete images for this item
					$imagesDelStmt = $db_conn->prepare("DELETE FROM `item_image` WHERE `item_id` = :prodID");
					$imagesDelStmt->bindParam(":prodID", $prodID);
					$imagesDelStmt->execute();
					
                    $stmt = $db_conn->prepare("DELETE FROM `item` WHERE `id` = :prodID");
                    $stmt->bindParam(":prodID", $prodID);
                }

                $stmt->execute();
                $this->resp['data'] = "Deleted";
                // </editor-fold>
                break;
                
            case "OPTIONS":
                // <editor-fold defaultstate="collapsed" desc="OPTIONS">
                $this->resp['data'] = [
                                        "GET" => 
                                            [
                                            "description" => "Get an item.", 
                                            "parameters" => 
                                                [
                                                "item ID" => 
                                                    ["type" => "int", "description" => "Specifies a specific item to return.", "required" => false],
                                                "featured" =>
                                                    ["type" => "string", "description" => "Modifier that dictates to return featured items.", "required" => false],
                                                "category" =>
                                                    ["type" => "double", "description" => "Modifier that dictates to return items under a specific category.", "required" => false],
                                                "category ID" =>
                                                    ["type" => "int", "description" => "The specific category to return items from.", "required" => false],
                                                "search" =>
                                                    ["type" => "string", "description" => "Modifier that dictates to return items using a search value.", "required" => false],
                                                "search value" =>
                                                    ["type" => "string", "description" => "The search value to use.", "required" => false],
                                                "stock" =>
                                                    ["type" => "string", "description" => "Modifier that dictates to return items under a stock threshold.", "required" => false],
                                                "stock threshold" =>
                                                    ["type" => "string", "description" => "Stock threshold.", "required" => false]
                                                ]
                                            ],
                                        "POST" => 
                                            [
                                            "description" => "Add a new item.", 
                                            "parameters" => 
                                                [
                                                "name" => 
                                                    ["type" => "string", "description" => "Name for the new item.", "required" => true],
                                                "category" =>
                                                    ["type" => "int", "description" => "Category ID for the new item.", "required" => true],
                                                "desc" =>
                                                    ["type" => "string", "description" => "Description for the new item.", "required" => true],
                                                "weight" =>
                                                    ["type" => "double", "description" => "Weight for the new item.", "required" => true],
                                                "featured" =>
                                                    ["type" => "int", "description" => "Featured (1) or not (0).", "required" => true],
                                                "price" =>
                                                    ["type" => "double", "description" => "Price for the new item.", "required" => true],
                                                "stock" =>
                                                    ["type" => "int", "description" => "Stock level for the new item.", "required" => true]
                                                ]
                                            ],
                                        "PUT" => 
                                            [
                                            "description" => "Modify an existing item.", 
                                            "parameters" => 
                                                [
                                                "item ID" => 
                                                    ["type" => "int", "description" => "ID of the item to modify.", "required" => true],
                                                "name" => 
                                                    ["type" => "string", "description" => "Name for the item.", "required" => true],
                                                "category" =>
                                                    ["type" => "int", "description" => "Category ID for the item.", "required" => true],
                                                "desc" =>
                                                    ["type" => "string", "description" => "Description for the item.", "required" => true],
                                                "weight" =>
                                                    ["type" => "double", "description" => "Weight for the item.", "required" => true],
                                                "featured" =>
                                                    ["type" => "int", "description" => "Featured (1) or not (0).", "required" => true],
                                                "price" =>
                                                    ["type" => "double", "description" => "Price for the item.", "required" => true],
                                                "stock" =>
                                                    ["type" => "int", "description" => "Stock level for the item.", "required" => true]
                                                ]
                                            ],
                                        "DELETE" => 
                                            [
                                            "description" => "Delete an item.", 
                                            "parameters" => 
                                                [
                                                "item ID" => 
                                                    ["type" => "int", "description" => "ID of the item to delete.", "required" => true]
                                                ]
                                            ]
                                    ]; // Put the data into the $this->resp['data'] element
                // </editor-fold>
                break;

            default:
                $this->statusCode = 405;
        }
        // </editor-fold>
    }

    /**
     * Delivery end point
     * 
     * @global PDO $db_conn
     * @param array $args
     */
    protected function delivery($args)
    {
        // <editor-fold defaultstate="collapsed" desc="delivery">
        global $db_conn;

        switch ($this->method) {
            case "GET":
                // <editor-fold defaultstate="collapsed" desc="GET">
                $stmt = null;
                $str = "SELECT * FROM `delivery_option`";

                if (isset($args[0]) && is_numeric($args[0])) { // If we're returning a specific delivery option
                    $id = filter_var($args[0], FILTER_SANITIZE_NUMBER_INT);
                    $str .= " WHERE `id` = :id";
                    $stmt = $db_conn->prepare($str);
                    $stmt->bindParam(":id", $id);
                } else if (isset($args[0]) && ($args[0] == "max-weight")) { // If we're returning delivery options within a max weight
                    if (isset($args[1]) && is_numeric($args[1])) { // If the max weight is specified
                        $maxWeight = filter_var($args[1], FILTER_SANITIZE_STRING);
                        $str .= " WHERE `max_weight` >= :maxWeight ORDER BY `eco_rating` DESC";
                        $stmt = $db_conn->prepare($str);
                        $stmt->bindParam(":maxWeight", $maxWeight);
                    } else { // If the max weight isn't specified
                        $this->statusCode = 404;
                        break;
                    }
                } else { // If anything else is provided, simply return all of the delivery options
                    $stmt = $db_conn->prepare($str); // Don't a
                }

                $stmt->execute();
                $this->resp['data'] = $stmt->fetchAll(PDO::FETCH_ASSOC); // Return the results
                // </editor-fold>
                break;
                
            case "POST":
                // <editor-fold defaultstate="collapsed" desc="POST">
                $str = "INSERT INTO `delivery_option` (`name`, `max_weight`, `eco_rating`, `cost`) VALUES (:name, :maxWeight, :ecoRating, :cost)";

                $name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
                $maxWeight = filter_input(INPUT_POST, 'maxWeight', FILTER_SANITIZE_STRING); // Sanitise as string to stop conversion of double to int
                $ecoRating = filter_input(INPUT_POST, 'ecoRating', FILTER_SANITIZE_NUMBER_INT);
                $cost = filter_input(INPUT_POST, 'cost', FILTER_SANITIZE_STRING); // Sanitise as string to stop conversion of double to int

                $stmt = $db_conn->prepare($str);
                $stmt->bindParam('name', $name);
                $stmt->bindParam('maxWeight', $maxWeight);
                $stmt->bindParam('ecoRating', $ecoRating, PDO::PARAM_INT);
                $stmt->bindParam('cost', $cost);

                $stmt->execute();
                $this->resp['data'] = $db_conn->lastInsertID(); // Return the ID of the category
                // </editor-fold>
                break;
            
            case "PUT":
                // <editor-fold defaultstate="collapsed" desc="PUT">
                $stmt = null;
                
                if (isset($args[0]) && is_numeric($args[0])) { // If we're updating a specific delivery option
                    $str = "UPDATE `delivery_option` SET `name` = :name, `max_weight` = :maxWeight, `eco_rating` = :ecoRating, `cost` = :cost WHERE `id` = :id";
                    
                    $putVars = []; // Empty array
                    Lib::parse_input($putVars); // Parses PUT data into $_POST superglobal
                    
                    $id = filter_var($args[0], FILTER_SANITIZE_NUMBER_INT);
                    $name = filter_var($putVars['name'], FILTER_SANITIZE_STRING);
                    $maxWeight = filter_var($putVars['maxWeight'], FILTER_SANITIZE_STRING); // Sanitise as string to stop conversion of double to int
                    $ecoRating = filter_var($putVars['ecoRating'], FILTER_SANITIZE_NUMBER_INT);
                    $cost = filter_var($putVars['cost'], FILTER_SANITIZE_STRING); // Sanitise as string to stop conversion of double to int
                    
                    $stmt = $db_conn->prepare($str);
                    $stmt->bindParam('id', $id, PDO::PARAM_INT);
                    $stmt->bindParam('name', $name);
                    $stmt->bindParam('maxWeight', $maxWeight);
                    $stmt->bindParam('ecoRating', $ecoRating, PDO::PARAM_INT);
                    $stmt->bindParam('cost', $cost);
                }
                
                $stmt->execute();
                $this->resp['data'] = "updated";
                // </editor-fold>
                break;
            
            case "DELETE":
                // <editor-fold defaultstate="collapsed" desc="DELETE">
                $stmt = null;

                if (isset($args[0]) && is_numeric($args[0])) { // If we're deleting a specific delivery option
                    $id = filter_var($args[0], FILTER_SANITIZE_NUMBER_INT);
                    $stmt = $db_conn->prepare("DELETE FROM `delivery_option` WHERE `id` = :id");
                    $stmt->bindParam(':id', $id);
                }

                $stmt->execute();
                $this->resp['data'] = "Deleted";
                // </editor-fold>
                break;
                
            case "OPTIONS":
                // <editor-fold defaultstate="collapsed" desc="OPTIONS">
                $this->resp['data'] = [
                                        "GET" => 
                                            [
                                            "description" => "Get a delivery option.", 
                                            "parameters" => 
                                                [
                                                "delivery ID" => 
                                                    ["type" => "int", "description" => "Specifies a specific delivery option to return.", "required" => false],
                                                "max-weight" =>
                                                    ["type" => "string", "description" => "Modifier that dictates that the next next argument will be used as the value to return all delivery options up to this max weight value.", "required" => false],
                                                "max-weight value" =>
                                                    ["type" => "double", "description" => "Value to return all delivery options up to this max weight value.", "required" => false]
                                                ]
                                            ],
                                        "POST" => 
                                            [
                                            "description" => "Add a new delivery option.", 
                                            "parameters" => 
                                                [
                                                "name" => 
                                                    ["type" => "string", "description" => "Name for the new delivery option.", "required" => true],
                                                "maxWeight" =>
                                                    ["type" => "double", "description" => "Max weight for the new delivery option.", "required" => true],
                                                "ecoRating" =>
                                                    ["type" => "int", "description" => "Eco rating for the new delivery option.", "required" => true],
                                                "cost" =>
                                                    ["type" => "double", "description" => "Cost for the new delivery option.", "required" => true]
                                                ]
                                            ],
                                        "PUT" => 
                                            [
                                            "description" => "Modify an existing delivery option.", 
                                            "parameters" => 
                                                [
                                                "delivery option ID" => 
                                                    ["type" => "int", "description" => "ID of the delivery option to modify.", "required" => true],
                                                "name" => 
                                                    ["type" => "string", "description" => "Name for the delivery option.", "required" => true],
                                                "maxWeight" =>
                                                    ["type" => "double", "description" => "Max weight for the delivery option.", "required" => true],
                                                "ecoRating" =>
                                                    ["type" => "int", "description" => "Eco rating for thedelivery option.", "required" => true],
                                                "cost" =>
                                                    ["type" => "double", "description" => "Cost for the delivery option.", "required" => true]
                                                ]
                                            ],
                                        "DELETE" => 
                                            [
                                            "description" => "Delete a delivery option.", 
                                            "parameters" => 
                                                [
                                                "delivery option ID" => 
                                                    ["type" => "int", "description" => "ID of the delivery option to delete.", "required" => true]
                                                ]
                                            ]
                                    ]; // Put the data into the $this->resp['data'] element
                // </editor-fold>
                break;

            default:
                $this->statusCode = 405;
        }
        // </editor-fold>
    }

    /**
     * Order end point
     * 
     * @global PDO $db_conn
     * @param array $args
     */
    protected function order($args)
    {
        // <editor-fold defaultstate="collapsed" desc="order">
        global $db_conn;

        switch ($this->method) {
            case "GET":
                // <editor-fold defaultstate="collapsed" desc="GET">
                $stmt = null;

                if (isset($args[0]) && ($args[0] == "search")) { // If we're returning all categories with a specified parent
                    $stmt = $db_conn->prepare("SELECT * FROM `order` WHERE `created` >= :dateStart AND `created` <= :dateEnd");
                    if (isset($args[1]) && isset($args[2])) { // If the dateStart and dateEnd are set
                        $dateStart = strtotime(filter_var($args[1], FILTER_SANITIZE_STRING));
                        $dateEnd = strtotime(filter_var($args[2], FILTER_SANITIZE_STRING));
                        //print("START: " . $dateStart . " END: " . $dateEnd); exit;
                        $stmt->bindParam(":dateStart", $dateStart);
                        $stmt->bindParam(":dateEnd", $dateEnd);
                        
                        $results = [];
                        
                        if ($stmt->execute()) {
                            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                                $total = 0;
                                
                                // Get delivery cost
                                $delStmt = $db_conn->prepare("SELECT `cost` FROM `delivery_option` WHERE `id` = :del LIMIT 1");
                                $delStmt->bindParam(":del", $row['delivery']);
                                $delStmt->execute();
                                $delRow = $delStmt->fetch(PDO::FETCH_ASSOC); // Should only be one result
                                $total += $delRow['cost'];
                                
                                // Get items cost
                                $orderItemsStmt = $db_conn->prepare("SELECT `item_id`, `quantity` FROM `order_item` WHERE `order_id` = :orderID");
                                $orderItemsStmt->bindParam(":orderID", $row['id']);
                                if ($orderItemsStmt->execute()) {
                                    while ($orderItemRow = $orderItemsStmt->fetch(PDO::FETCH_ASSOC)) { // For each item
                                        $itemStmt = $db_conn->prepare("SELECT `price` FROM `item` WHERE `id` = :itemID LIMIT 1");
                                        $itemStmt->bindParam(":itemID", $orderItemRow['item_id']);
                                        $itemStmt->execute();
                                        $itemRow = $itemStmt->fetch(PDO::FETCH_ASSOC); // Should only be one result
                                        $total += ($itemRow['price'] * $orderItemRow['quantity']);
                                    }
                                }
                                
                                $row['total'] = $total;
                                $results[] = $row;
                            }
                        }
                        
                        $this->resp['data'] = $results; // Return the results
                    }
                    
                } else { // Invalid
                    $this->statusCode = 500;
                    return;
                }
                // </editor-fold>
                break;
            
            case "PUT":
                // <editor-fold defaultstate="collapsed" desc="PUT">
                if ((isset($args[0]) && ($args[0] == "markSent")) && (isset($args[1]) && is_numeric($args[1]))) { // If we're marking an order as sent
                    $putVars = []; // Empty array
                    Lib::parse_input($putVars); // Parses PUT data
                    
                    $str = "UPDATE `order` SET `sent` = :sentVal WHERE `id` = :orderID";

                    $orderID = filter_var($args[1], FILTER_SANITIZE_NUMBER_INT);
                    $sent = filter_var($putVars['sent'], FILTER_SANITIZE_NUMBER_INT);

                    $stmt = $db_conn->prepare($str);
                    $stmt->bindParam('orderID', $orderID);
                    $stmt->bindParam('sentVal', $sent);

                    $stmt->execute();
                    $this->resp['data'] = "Order sent value updated"; // Return the ID of the created order, to be subsequently used
                } else {
                    $this->statusCode = 500; // Server error, invalid
                }
                // </editor-fold>
                break;
            
            case "POST":
                // <editor-fold defaultstate="collapsed" desc="POST">
                $stmt = null;
                $str = "INSERT INTO `order` (`title`, `first_name`, `last_name`, `address_1`, `address_2`, `post_code`, `delivery`, `created`) VALUES (:title, :fName, :lName, :address1, :address2, :postCode, :delivery, UNIX_TIMESTAMP())";

                $title = filter_input(INPUT_POST, 'title', FILTER_SANITIZE_STRING);
                $fName = filter_input(INPUT_POST, 'fName', FILTER_SANITIZE_STRING);
                $lName = filter_input(INPUT_POST, 'lName', FILTER_SANITIZE_STRING);
                $address1 = filter_input(INPUT_POST, 'address1', FILTER_SANITIZE_STRING);
                $address2 = filter_input(INPUT_POST, 'address2', FILTER_SANITIZE_STRING);
                $postCode = filter_input(INPUT_POST, 'postCode', FILTER_SANITIZE_STRING);
                $delivery = filter_input(INPUT_POST, 'deliveryOption', FILTER_SANITIZE_STRING);

                $stmt = $db_conn->prepare($str);
                $stmt->bindParam("title", $title);
                $stmt->bindParam("fName", $fName);
                $stmt->bindParam("lName", $lName);
                $stmt->bindParam("address1", $address1);
                $stmt->bindParam("address2", $address2);
                $stmt->bindParam("postCode", $postCode);
                $stmt->bindParam("delivery", $delivery);


                $stmt->execute();
                $this->resp['data'] = $db_conn->lastInsertID(); // Return the ID of the created order, to be subsequently used
                // </editor-fold>
                break;
            
            case "OPTIONS":
                // <editor-fold defaultstate="collapsed" desc="OPTIONS">
                $this->resp['data'] = [
                                        "GET" => 
                                            [
                                            "description" => "Get orders' details.",
                                            "parameters" => 
                                                [
                                                "search" => 
                                                    ["type" => "string", "description" => "Specifies that orders are being searched through.", "required" => true],
                                                "dateStart" =>
                                                    ["type" => "string", "description" => "Date to start searching orders from.", "required" => true],
                                                "dateEnd" =>
                                                    ["type" => "string", "description" => "Date to end searching orders from.", "required" => true]
                                                ]
                                            ],
                                        "PUT" =>
                                            [
                                            "description" => "Mark a specific order as sent.", 
                                            "parameters" =>
                                                [
                                                "markSent" =>
                                                    ["type" => "string", "description" => "Specifies that this order is to have its sent value changed.", "required" => true],
                                                "orderID" =>
                                                    ["type" => "int", "description" => "The order ID to modify.", "required" => true],
                                                "sent" =>
                                                    ["type" => "int", "description" => "Specifies if an order to be marked as sent (1) or unsent (0).", "required" => true]
                                                ]
                                            ],
                                        "POST" =>
                                            [
                                            "description" => "Creates a new order.", 
                                            "parameters" =>
                                                [
                                                "title" =>
                                                    ["type" => "string", "description" => "Customer's title.", "required" => true],
                                                "fName" =>
                                                    ["type" => "string", "description" => "Customer's first name.", "required" => true],
                                                "lName" =>
                                                    ["type" => "string", "description" => "Customer's last name.", "required" => true],
                                                "address1" =>
                                                    ["type" => "string", "description" => "Customer's address line 1.", "required" => true],
                                                "address2" =>
                                                    ["type" => "string", "description" => "Customer's address line 2.", "required" => true],
                                                "postCode" =>
                                                    ["type" => "string", "description" => "Customer's post code.", "required" => true],
                                                "delivery" =>
                                                    ["type" => "int", "description" => "The delivery option to use.", "required" => true]
                                                ]
                                            ]
                                        ]; // Put the data into the $this->resp['data'] element
                // </editor-fold>
                break;

            default:
                $this->statusCode = 405;
        }
        // </editor-fold>
    }

    /**
     * Order Item end point
     * 
     * @global PDO $db_conn
     * @param array $args
     */
    protected function orderItem($args)
    {
        // <editor-fold defaultstate="collapsed" desc="order item">
        global $db_conn;

        switch ($this->method) {
            case "GET":
                // <editor-fold defaultstate="collapsed" desc="GET">
                $stmt = null;

                if ((isset($args[0]) && ($args[0] == "order")) && (isset($args[1]) && is_numeric($args[1]))) { // If we're returning items for a specific order
                    $stmt = $db_conn->prepare("SELECT `order_item`.`quantity`, `item`.`name`, `item`.`price` FROM `order_item` LEFT JOIN `item` ON `order_item`.`item_id` = `item`.`id`  WHERE `order_item`.`order_id` = :orderID");
                    $orderID = filter_var($args[1], FILTER_SANITIZE_NUMBER_INT);
                    $stmt->bindParam(":orderID", $orderID);
                    
                    $stmt->execute();
                    $this->resp['data'] = $stmt->fetchAll(PDO::FETCH_ASSOC); // Return the results
                } else { // Invalid
                    $this->statusCode = 500;
                    return;
                }
                // </editor-fold>
                break;
            
            case "POST":
                // <editor-fold defaultstate="collapsed" desc="POST">
                if (isset($args[0]) && is_numeric($args[0])) { // If the order ID is set
                    $orderID = filter_var($args[0], FILTER_SANITIZE_NUMBER_INT);
                    $item = filter_input(INPUT_POST, 'id', FILTER_SANITIZE_NUMBER_INT);
                    $qty = filter_input(INPUT_POST, 'qty', FILTER_SANITIZE_NUMBER_INT);

                    // Update the stock level for this item
                    $stockStr = "UPDATE `item` SET `stock` = `stock` - :qty WHERE `id` = :item AND `stock` >= :qty"; // Make sure the stock level is at least the quantity being ordered to avoid having stock levels of -1 for example
                    $stockStmt = $db_conn->prepare($stockStr);
                    $stockStmt->bindParam("item", $item);
                    $stockStmt->bindParam("qty", $qty);
                    $stockStmt->execute();
                    
                    if ($stockStmt->rowCount() > 0) { // If the update affected at least 1 row succeeded.
                        $str = "INSERT INTO `order_item` (`order_id`, `item_id`, `quantity`) VALUES (:order, :item, :qty)";
                        $stmt = $db_conn->prepare($str);
                        $stmt->bindParam("order", $orderID);
                        $stmt->bindParam("item", $item);
                        $stmt->bindParam("qty", $qty);

                        $stmt->execute();
                        $this->statusCode = 200;
                        $this->resp['data'] = "Order item added.";
                    } else {
                        $this->statusCode = 500;
                        $this->resp['error'] = "Couldn't add order item, adequate stock may not be available.";
                    }
                } else { // If the ID of the order isn't set
                    $this->statusCode = 404;
                }
                // </editor-fold>
                break;
                
            case "OPTIONS":
                // <editor-fold defaultstate="collapsed" desc="OPTIONS">
                $this->resp['data'] = [
                                        "GET" => 
                                            [
                                            "description" => "Get order items for an order.", 
                                            "parameters" => 
                                                [
                                                "order" => 
                                                    ["type" => "string", "description" => "Specifies that order items for an order are to be returned.", "required" => true],
                                                "order ID" =>
                                                    ["type" => "int", "description" => "The order ID to be used to return order items for.", "required" => true]
                                                ]
                                            ],
                                        "POST" => 
                                            [
                                            "description" => "Add an order item to an order.", 
                                            "parameters" => 
                                                [
                                                "order ID" => 
                                                    ["type" => "int", "description" => "Specifies what order to add order items to.", "required" => true],
                                                "item" =>
                                                    ["type" => "int", "description" => "The item to add to the order.", "required" => true],
                                                "qty" =>
                                                    ["type" => "int", "description" => "The quantity of the item to add to the order.", "required" => true]
                                                ]
                                            ]
                                    ]; // Put the data into the $this->resp['data'] element
                // </editor-fold>
                break;

            default:
                $this->statusCode = 405;
        }
        // </editor-fold>
    }
    
    /**
     * Settings end point
     * 
     * @global PDO $db_conn
     * @param array $args
     */
    protected function settings($args)
    {
        // <editor-fold defaultstate="collapsed" desc="settings">
        global $db_conn;

        switch ($this->method) {
            case "GET":
                // <editor-fold defaultstate="collapsed" desc="GET">
                $stmt = null;

                if (isset($args[0]) && is_string($args[0])) { // If we're returning a specific setting
                    $stmt = $db_conn->prepare("SELECT * FROM `setting` WHERE `name` = :settingName");
                    $settingName = filter_var($args[0], FILTER_SANITIZE_STRING);
                    $stmt->bindParam(":settingName", $settingName);
                } else { // If we're returning all available settings
                    $stmt = $db_conn->prepare("SELECT * FROM `setting`");
                }

                $stmt->execute();
                
                if ($stmt->rowCount()) { // If the setting exists
                    $this->resp['data'] = $stmt->fetchAll(PDO::FETCH_ASSOC); // Return the results
                } else { // If the setting doesn't exist
                    $this->resp['data'] = "Setting does not exist";
                }
                // </editor-fold>
                break;
                
            case "PUT":
                // <editor-fold defaultstate="collapsed" desc="PUT">
                $stmt = null;
                
                if (isset($args[0]) && is_string($args[0])) { // If we're updating a specific setting
                    $str = "UPDATE `setting` SET `value` = :value WHERE `name` = :name LIMIT 1";
                    
                    $putVars = []; // Empty array
                    Lib::parse_input($putVars); // Parses PUT data into $putVars
                    
                    $name = filter_var($args[0], FILTER_SANITIZE_STRING);
                    $value = filter_var($putVars['value'], FILTER_SANITIZE_STRING);
                    
                    $stmt = $db_conn->prepare($str);
                    $stmt->bindParam('name', $name);
                    $stmt->bindParam('value', $value);
                } else { // Invalid
                    $this->statusCode = 500;
                    return;
                }
                
                $stmt->execute();
                $this->resp['data'] = "updated";
                // </editor-fold>
                break;
                
            case "OPTIONS":
                // <editor-fold defaultstate="collapsed" desc="OPTIONS">
                $this->resp['data'] = [
                                        "GET" => 
                                            [
                                            "description" => "Get a setting.", 
                                            "parameters" => 
                                                [
                                                "setting" => 
                                                    ["type" => "string", "description" => "Setting name, only set if returning the value of a specific setting.", "required" => false]
                                                ]
                                            ],
                                        "PUT" =>
                                            [
                                            "description" => "Set a specific setting.", 
                                            "parameters" =>
                                                [
                                                "setting" =>
                                                    ["type" => "string", "description" => "Setting name.", "required" => true],
                                                "value" =>
                                                    ["type" => "string", "description" => "Setting value.", "required" => true]
                                                ]
                                            ]
                                        ]; // Put the data into the $this->resp['data'] element
                // </editor-fold>
                break;

            default:
                $this->statusCode = 405; // Method not allowed
        }
        // </editor-fold>
    }
}
