<?php

require_once __DIR__ . '/../config/auth.php';

header('Content-Type: application/json; charset=utf-8');

try {
    if (!estaAutenticado()) {
        http_response_code(401);
        echo json_encode([
            'autenticado' => false
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    echo json_encode([
        'autenticado' => true,
        'usuario' => retornarUsuarioJSON()
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'sucesso' => false,
        'mensagem' => 'Erro interno no servidor.'
    ], JSON_UNESCAPED_UNICODE);
}
