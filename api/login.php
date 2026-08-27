<?php

require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json; charset=utf-8');

try {

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {

        http_response_code(405);

        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'Método não permitido.'
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }


    $raw = file_get_contents('php://input');

    $data = json_decode($raw, true);


    if (!is_array($data)) {

        http_response_code(400);

        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'Dados de login inválidos.'
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }


    $username = trim(
        (string)($data['username'] ?? '')
    );

    $password =
        (string)($data['password'] ?? '');


    if ($username === '' || $password === '') {

        http_response_code(422);

        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'Utilizador e palavra-passe são obrigatórios.'
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }


    $stmt = $pdo->prepare(
        "SELECT
            id,
            nome,
            username,
            password,
            perfil,
            estado
         FROM utilizadores
         WHERE username = ?
         LIMIT 1"
    );


    $stmt->execute([
        $username
    ]);


    $usuario = $stmt->fetch(
        PDO::FETCH_ASSOC
    );


    if (!$usuario) {

        http_response_code(401);

        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'Utilizador ou palavra-passe incorretos.'
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }


    if ($usuario['estado'] !== 'Ativo') {

        http_response_code(403);

        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'Este utilizador está inativo.'
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }


    if (!password_verify(
        $password,
        $usuario['password']
    )) {

        http_response_code(401);

        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'Utilizador ou palavra-passe incorretos.'
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }


    unset(
        $usuario['password']
    );


    echo json_encode([
        'sucesso' => true,
        'mensagem' => 'Login efetuado com sucesso.',
        'usuario' => $usuario
    ], JSON_UNESCAPED_UNICODE);

    exit;


} catch (Throwable $e) {

    http_response_code(500);

    echo json_encode([
        'sucesso' => false,
        'mensagem' => 'Erro interno no servidor.',
        'erro' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);

    exit;
}