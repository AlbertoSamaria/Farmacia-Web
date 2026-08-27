<?php

require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $users = $pdo->query(
        'SELECT id, nome, username, perfil, estado, criado_em '
        . 'FROM utilizadores ORDER BY nome'
    )->fetchAll();

    echo json_encode(['sucesso' => true, 'dados' => $users]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Método não permitido']);
    exit;
}

if (($_SERVER['HTTP_X_USER_PERFIL'] ?? '') !== 'Administrador') {
    http_response_code(403);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Apenas o Administrador pode criar utilizadores']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true) ?? [];
$required = ['nome', 'username', 'password', 'perfil'];

foreach ($required as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        echo json_encode(['sucesso' => false, 'mensagem' => 'Preencha todos os campos obrigatórios']);
        exit;
    }
}

if (!in_array($data['perfil'], ['Administrador', 'Farmaceutico', 'Operador'], true)) {
    http_response_code(400);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Perfil inválido']);
    exit;
}

try {
    $statement = $pdo->prepare(
        'INSERT INTO utilizadores (nome, username, password, perfil, estado) '
        . 'VALUES (?, ?, ?, ?, ?)'
    );
    $statement->execute([
        trim($data['nome']),
        trim($data['username']),
        password_hash($data['password'], PASSWORD_DEFAULT),
        $data['perfil'],
        $data['estado'] ?? 'Ativo'
    ]);

    echo json_encode(['sucesso' => true, 'mensagem' => 'Utilizador criado']);
} catch (PDOException $error) {
    http_response_code(400);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Username já existente ou dados inválidos']);
}
