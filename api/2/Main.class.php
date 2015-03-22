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
        if ($this->method == "GET") {
            if (isset($args[0])) {
                $format = $args[0];
            } else {
                $format = "d/m/Y";
            }
            $this->statusCode = 200; // Set the status code to OK (successful)
            $this->resp['data'] = date($format); // Put the data into the $this->resp['data'] element
        } else {
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
                    $stmt->bindParam(":parentID", $args[1]);
                } else if (isset($args[0]) && is_numeric($args[0])) { // If we're returning a specific category
                    $stmt = $db_conn->prepare("SELECT * FROM `category` WHERE `id` = :catID");
                    $stmt->bindParam(":catID", $args[0]);
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

                // TODO: Validate these inputs
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
                    
                    // TODO: Validate category PUT inputs
                    $id = $args[0];
                    $name = $args[1];
                    $parent = $args[2];
                    
                    $stmt = $db_conn->prepare($str);
                    $stmt->bindParam('id', $id, PDO::PARAM_INT);
                    $stmt->bindParam('name', $name);
                    $stmt->bindParam('parent', $parent, PDO::PARAM_INT);
                }
                
                $stmt->execute();
                $this->resp['data'] = $db_conn->lastInsertID(); // Return the ID of the category
                // </editor-fold>
                break;
            
            case "DELETE":
                // <editor-fold defaultstate="collapsed" desc="DELETE">
                $stmt = null;

                if (isset($args[0]) && is_numeric($args[0])) { // If we're deleting a specific category
					// Update categories that were using the category to be deleted as their parent
					$updateStmt = $db_conn->prepare("UPDATE `category` SET `parent_id` = 0 WHERE `parent_id` = :catID");
					$updateStmt->bindParam(":catID", $args[0]);
					$updateStmt->execute(); // Run the update statement
					
                    $stmt = $db_conn->prepare("DELETE FROM `category` WHERE `id` = :catID");
                    $stmt->bindParam(":catID", $args[0]);
                }

                $stmt->execute();
                $this->resp['data'] = "Deleted";
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
                    $str .= " WHERE `id` = :id";
                    $stmt = $db_conn->prepare($str);
                    $stmt->bindParam(":id", $args[0]);
                } else if (isset($args[0]) && ($args[0] == "featured")) { // If we're returning featured items
                    $str .= " WHERE `featured` = 1";
                    $stmt = $db_conn->prepare($str);
                } else if (isset($args[0]) && ($args[0] == "category")) { // If we're returning items within a specific category
                    if (isset($args[1]) && is_numeric($args[1])) { // If the category ID is present
                        $str .= " WHERE `cat` = :cat";
                        $stmt = $db_conn->prepare($str);
                        $stmt->bindParam(":cat", $args[1]);
                    } else { // If the category ID is not present
                        $this->statusCode = 404;
                        break;
                    }
                } else if (isset($args[0]) && ($args[0] == "search")) { // If we're returning searched for items
                    if (isset($args[1]) && is_string($args[1])) { // If the search value is present
                        $str .= " WHERE `name` LIKE :search";
                        $stmt = $db_conn->prepare($str);
                        $args[1] = "%" . $args[1] . "%"; // Add wildcard characters around the search value
                        $stmt->bindParam(":search", $args[1]);
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

                // TODO: Validate these inputs
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
                move_uploaded_file($tmpFile, $imageUploadsDir . "/" . $fileName);
                
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
                    
                    // TODO: Validate item PUT inputs
                    $id = $args[0];
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
                        if (!move_uploaded_file($tmpFile, $imageUploadsDir . "/" . $fileName)) {
                            $this->resp['error'] = "Couldn't move uploaded file."; // Return error message
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
                    $imagesStmt = $db_conn->prepare("SELECT `image` FROM `item_image` WHERE `item_id` = :prodID");
                    $imagesStmt->bindParam(":prodID", $args[0]);
                    if ($imagesStmt->execute()) { // If the statement succeeded
                        while ($row = $imagesStmt->fetch(PDO::FETCH_ASSOC)) { // For each statement
                            $imageName = $row['image'];
                            unlink($imageUploadsDir . "/" . $imageName); // Delete the file
                        }
                    }
                    
					// Delete images for this item
					$imagesDelStmt = $db_conn->prepare("DELETE FROM `item_image` WHERE `item_id` = :prodID");
					$imagesDelStmt->bindParam(":prodID", $args[0]);
					$imagesDelStmt->execute();
					
                    $stmt = $db_conn->prepare("DELETE FROM `item` WHERE `id` = :prodID");
                    $stmt->bindParam(":prodID", $args[0]);
                }

                $stmt->execute();
                $this->resp['data'] = "Deleted";
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
                    $str .= " WHERE `id` = :id";
                    $stmt = $db_conn->prepare($str);
                    $stmt->bindParam(":id", $args[0]);
                } else if (isset($args[0]) && ($args[0] == "max-weight")) { // If we're returning delivery options within a max weight
                    if (isset($args[1]) && is_numeric($args[1])) { // If the max weight is specified
                        $str .= " WHERE `max_weight` >= :maxWeight ORDER BY `eco_rating` DESC";
                        $stmt = $db_conn->prepare($str);
                        $stmt->bindParam(":maxWeight", $args[1]);
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

                // TODO: Validate delivery option POST inputs
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
                    
                    // TODO: Validate delivery option PUT inputs
                    $id = $args[0];
                    $name = $args[1];
                    $maxWeight = $args[2];
                    $ecoRating = $args[3];
                    $cost = $args[4];
                    
                    $stmt = $db_conn->prepare($str);
                    $stmt->bindParam('id', $id, PDO::PARAM_INT);
                    $stmt->bindParam('name', $name);
                    $stmt->bindParam('maxWeight', $maxWeight);
                    $stmt->bindParam('ecoRating', $ecoRating, PDO::PARAM_INT);
                    $stmt->bindParam('cost', $cost);
                }
                
                $stmt->execute();
                $this->resp['data'] = $db_conn->lastInsertID(); // Return the ID of the delivery option
                // </editor-fold>
                break;
            
            case "DELETE":
                // <editor-fold defaultstate="collapsed" desc="DELETE">
                $stmt = null;

                if (isset($args[0]) && is_numeric($args[0])) { // If we're deleting a specific delivery option
                    $stmt = $db_conn->prepare("DELETE FROM `delivery_option` WHERE `id` = :id");
                    $stmt->bindParam(':id', $args[0]);
                }

                $stmt->execute();
                $this->resp['data'] = "Deleted";
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
            case "POST":
                // <editor-fold defaultstate="collapsed" desc="POST">
                $stmt = null;
                $str = "INSERT INTO `order` (`title`, `first_name`, `last_name`, `address_1`, `address_2`, `post_code`, `delivery`, `created`) VALUES (:title, :fName, :lName, :address1, :address2, :postCode, :delivery, UNIX_TIMESTAMP())";

                // TODO: Validate these inputs
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
            case "POST":
                // <editor-fold defaultstate="collapsed" desc="POST">
                if (isset($args[0]) && is_numeric($args[0])) { // If the order ID is set
                    $stmt = null;
                    $str = "INSERT INTO `order_item` (`order_id`, `item_id`, `quantity`) VALUES (:order, :item, :qty)";

                    // TODO: Validate these inputs
                    $orderID = $args[0];
                    $item = filter_input(INPUT_POST, 'id', FILTER_SANITIZE_NUMBER_INT);
                    $qty = filter_input(INPUT_POST, 'qty', FILTER_SANITIZE_NUMBER_INT);

                    $stmt = $db_conn->prepare($str);
                    $stmt->bindParam("order", $orderID);
                    $stmt->bindParam("item", $item);
                    $stmt->bindParam("qty", $qty);

                    $stmt->execute();
                } else { // If the ID of the order isn't set
                    $this->statusCode = 404;
                }
                // </editor-fold>
                break;

            default:
                $this->statusCode = 405;
        }
        // </editor-fold>
    }
}
