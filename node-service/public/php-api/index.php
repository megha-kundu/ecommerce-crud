<?php
header("Content-Type: application/json");

echo json_encode([
    "success" => true,
    "message" => "PHP API is working!",
    "endpoints" => [
        "products" => "GET/POST/PUT/DELETE -> products.php",
        "login"    => "POST -> login.php",
        "signup"   => "POST -> signup.php"
    ]
]);
?>