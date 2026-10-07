<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");

require_once "db.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["success" => false, "message" => "Only POST method allowed"]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);

$email    = $conn->real_escape_string($input["email"] ?? "");
$password = $input["password"] ?? "";

if ($email === "" || $password === "") {
    echo json_encode(["success" => false, "message" => "Email and password are required"]);
    exit;
}

$result = $conn->query("SELECT id, name, email, password FROM users WHERE email = '$email'");

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();
    if (password_verify($password, $user["password"])) {
        echo json_encode([
            "success" => true,
            "message" => "Login successful!",
            "user" => ["id" => $user["id"], "name" => $user["name"], "email" => $user["email"]]
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Wrong password"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Email not registered. Please signup first."]);
}
?>