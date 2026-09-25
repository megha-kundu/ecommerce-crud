<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once "db.php";

$method = $_SERVER["REQUEST_METHOD"];
$input  = json_decode(file_get_contents("php://input"), true);

// ---------- GET : Read ----------
if ($method === "GET") {
    if (isset($_GET["id"])) {
        $id = intval($_GET["id"]);
        $result = $conn->query("SELECT * FROM products WHERE id = $id");
        $product = $result->fetch_assoc();
        if ($product) {
            echo json_encode(["success" => true, "data" => $product]);
        } else {
            echo json_encode(["success" => false, "message" => "Product not found"]);
        }
    } else {
        $result = $conn->query("SELECT * FROM products ORDER BY id DESC");
        $products = [];
        while ($row = $result->fetch_assoc()) {
            $products[] = $row;
        }
        echo json_encode(["success" => true, "count" => count($products), "data" => $products]);
    }
    exit;
}

// ---------- POST : Create ----------
if ($method === "POST") {
    $name     = $conn->real_escape_string($input["name"] ?? "");
    $brand    = $conn->real_escape_string($input["brand"] ?? "");
    $price    = floatval($input["price"] ?? 0);
    $mrp      = floatval($input["mrp"] ?? 0);
    $category = $conn->real_escape_string($input["category"] ?? "");
    $image    = $conn->real_escape_string($input["image"] ?? "");
    $desc     = $conn->real_escape_string($input["description"] ?? "");

    if ($name === "" || $price <= 0) {
        echo json_encode(["success" => false, "message" => "Product name and price are required"]);
        exit;
    }

    $sql = "INSERT INTO products (name, brand, price, mrp, category, image, description)
            VALUES ('$name', '$brand', '$price', '$mrp', '$category', '$image', '$desc')";

    if ($conn->query($sql)) {
        echo json_encode(["success" => true, "message" => "Product added successfully", "id" => $conn->insert_id]);
    } else {
        echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
    }
    exit;
}

// ---------- PUT : Update ----------
if ($method === "PUT") {
    $id       = intval($input["id"] ?? 0);
    $name     = $conn->real_escape_string($input["name"] ?? "");
    $brand    = $conn->real_escape_string($input["brand"] ?? "");
    $price    = floatval($input["price"] ?? 0);
    $mrp      = floatval($input["mrp"] ?? 0);
    $category = $conn->real_escape_string($input["category"] ?? "");
    $image    = $conn->real_escape_string($input["image"] ?? "");
    $desc     = $conn->real_escape_string($input["description"] ?? "");

    if ($id <= 0 || $name === "") {
        echo json_encode(["success" => false, "message" => "Product id and name are required"]);
        exit;
    }

    $sql = "UPDATE products SET
                name = '$name', brand = '$brand', price = '$price',
                mrp = '$mrp', category = '$category', image = '$image',
                description = '$desc'
            WHERE id = $id";

    if ($conn->query($sql)) {
        echo json_encode(["success" => true, "message" => "Product updated successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
    }
    exit;
}

// ---------- DELETE : Delete ----------
if ($method === "DELETE") {
    $id = intval($input["id"] ?? $_GET["id"] ?? 0);

    if ($id <= 0) {
        echo json_encode(["success" => false, "message" => "Product id is required"]);
        exit;
    }

    if ($conn->query("DELETE FROM products WHERE id = $id")) {
        echo json_encode(["success" => true, "message" => "Product deleted successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
    }
    exit;
}

echo json_encode(["success" => false, "message" => "Invalid request method"]);
?>