<?php

header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed"]);
    exit;
}

require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$name     = trim($data["name"] ?? "");
$email    = trim($data["email"] ?? "");
$password = $data["password"] ?? "";

// double check for empty fields and invalid email format 
if ($name === "" || $email === "" || $password === "") {
    http_response_code(400);
    echo json_encode(["message" => "All fields are required"]);
    exit;
}
if (!preg_match('/^[\p{L}\s]+$/u', $name)) {
    http_response_code(400);
    echo json_encode(["message" => "Name must contain letters only"]);
    exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid email format"]);
    exit;
}
if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(["message" => "Password must be at least 6 characters"]);
    exit;
}

try {
    // Check if the email already exists in the database
    $check = $pdo->prepare("SELECT user_id FROM `user` WHERE email = ?");
    $check->execute([$email]);

    if ($check->fetch()) {
        http_response_code(409);
        echo json_encode(["message" => "Email Already Exists"]);
        exit;
    }

    // Hash the password using md5
    $hashedPassword = md5($password);

    $stmt = $pdo->prepare(
        "INSERT INTO `user` (name, email, password) VALUES (?, ?, ?)"
    );
    $stmt->execute([$name, $email, $hashedPassword]);

    http_response_code(201);
    echo json_encode(["message" => "Registration successful", "name" => $name]);

} catch (PDOException $e) {
    // Check for duplicate email error code (23000) and handle it
    if ($e->getCode() === "23000") {
        http_response_code(409);
        echo json_encode(["message" => "Email Already Exists"]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Database error"]);
    }
}
