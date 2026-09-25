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

$name     = $conn->real_escape_string($input["name"] ?? "");
$email    = $conn->real_escape_string($input["email"] ?? "");
$password = $input["password"] ?? "";

if ($name === "" || $email === "" || $password === "") {
    echo json_encode(["success" => false, "message" => "All fields are required"]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "message" => "Invalid email address"]);
    exit;
}

if (strlen($password) < 6) {
    echo json_encode(["success" => false, "message" => "Password must be at least 6 characters"]);
    exit;
}

$check = $conn->query("SELECT id FROM users WHERE email = '$email'");
if ($check->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Email already registered. Please login."]);
    exit;
}

$hashed = password_hash($password, PASSWORD_DEFAULT);

$sql = "INSERT INTO users (name, email, password) VALUES ('$name', '$email', '$hashed')";

if ($conn->query($sql)) {
    echo json_encode(["success" => true, "message" => "Signup successful! Please login."]);
} else {
    echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
}
?>