<?php

$host = '127.0.0.1';
$database = 'farmacia_web';
$username = 'root';
$password = '';

try {
	$pdo = new PDO(
		"mysql:host=$host;dbname=$database;charset=utf8mb4",
		$username,
		$password,
		[
			PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
			PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
		]
	);
} catch (PDOException $error) {
	http_response_code(500);
	header('Content-Type: application/json; charset=utf-8');
	echo json_encode([
		'sucesso' => false,
		'mensagem' => 'Erro de ligação à base de dados.'
	]);
	exit;
}