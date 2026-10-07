<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");

/*
|--------------------------------------------------------------------------
| PEXELS API KEY
|--------------------------------------------------------------------------
| Yahan apni Pexels API key paste karo.
| API key ko kisi ke saath share mat karna.
|--------------------------------------------------------------------------
*/

$apiKey = "n1bgXBLSHrDWhCwAWvILk2SUw7b2Dr0K1yzxGrQICf3vwOsnfUl8CqzJ";

$query = trim($_GET["query"] ?? "");

if ($query === "") {
    echo json_encode([
        "success" => false,
        "message" => "Product search query is required"
    ]);
    exit;
}

/*
|--------------------------------------------------------------------------
| Product search ko better banane ke liye
|--------------------------------------------------------------------------
*/

$searchQuery = $query . " fashion product";

$url = "https://api.pexels.com/v1/search?" . http_build_query([
    "query" => $searchQuery,
    "per_page" => 10,
    "page" => 1,
    "orientation" => "square"
]);

$ch = curl_init($url);

curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 15,
    CURLOPT_HTTPHEADER => [
        "Authorization: " . $apiKey
    ]
]);

$response = curl_exec($ch);

if ($response === false) {

    echo json_encode([
        "success" => false,
        "message" => "Unable to connect to Pexels API"
    ]);

    curl_close($ch);
    exit;
}

$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

curl_close($ch);

$data = json_decode($response, true);

if ($httpCode !== 200 || !isset($data["photos"])) {

    echo json_encode([
        "success" => false,
        "message" => "Pexels API error",
        "status_code" => $httpCode
    ]);

    exit;
}

$images = [];

foreach ($data["photos"] as $photo) {

    if (!isset($photo["src"]["large"])) {
        continue;
    }

    $images[] = [
        "image" => $photo["src"]["large"],
        "original" => $photo["src"]["original"] ?? "",
        "photographer" => $photo["photographer"] ?? "",
        "photographer_url" => $photo["photographer_url"] ?? "",
        "pexels_url" => $photo["url"] ?? ""
    ];
}

echo json_encode([
    "success" => true,
    "query" => $searchQuery,
    "count" => count($images),
    "data" => $images
]);
?>