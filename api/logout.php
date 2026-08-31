<?php

require_once __DIR__ . '/../config/auth.php';

header('Content-Type: application/json; charset=utf-8');

try {
    fazerLogout();
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'sucesso' => false,
        'mensagem' => 'Erro ao fazer logout.'
    ], JSON_UNESCAPED_UNICODE);
}
