<?php

header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed"]);
    exit;
}

require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$email    = trim($data["email"] ?? "");
$password = $data["password"] ?? "";

if ($email === "" || $password === "") {
    http_response_code(400);
    echo json_encode(["message" => "Email and password are required"]);
    exit;
}

try {
    // comparing hashed password with the database
    $stmt = $pdo->prepare(
        "SELECT name FROM `user` WHERE email = ? AND password = ?"
    );
    $stmt->execute([$email, md5($password)]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        echo json_encode(["message" => "Login successful", "name" => $user["name"]]);
    } else {
        http_response_code(401);
        echo json_encode(["message" => "Invalid email or password"]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Database error"]);
}
