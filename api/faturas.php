<?php

require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
    $statement = $pdo->prepare(
        'SELECT v.id, v.numero, v.total, v.pagamento, v.criado_em, '
        . 'COALESCE(u.nome, \'\') utilizador '
        . 'FROM vendas v LEFT JOIN utilizadores u ON u.id = v.utilizador_id '
        . 'WHERE v.id = ?'
    );
    $statement->execute([(int)$_GET['id']]);
    $invoice = $statement->fetch();

    if (!$invoice) {
        http_response_code(404);
        echo json_encode(['sucesso' => false, 'mensagem' => 'Fatura não encontrada']);
        exit;
    }

    $items = $pdo->prepare(
        'SELECT p.nome, vi.quantidade, vi.preco_unitario '
        . 'FROM venda_itens vi INNER JOIN produtos p ON p.id = vi.produto_id '
        . 'WHERE vi.venda_id = ?'
    );
    $items->execute([(int)$_GET['id']]);
    $invoice['itens'] = $items->fetchAll();

    echo json_encode(['sucesso' => true, 'dados' => $invoice]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    $paymentMethods = ['Dinheiro', 'TPA', 'Transferencia', 'Outro'];

    if (empty($data['id']) || !in_array($data['pagamento'] ?? '', $paymentMethods, true)) {
        http_response_code(400);
        echo json_encode(['sucesso' => false, 'mensagem' => 'Dados da fatura inválidos']);
        exit;
    }

    $statement = $pdo->prepare('UPDATE vendas SET pagamento = ? WHERE id = ?');
    $statement->execute([$data['pagamento'], (int)$data['id']]);
    echo json_encode(['sucesso' => true, 'mensagem' => 'Fatura atualizada']);
    exit;
}

$statement = $pdo->query(
    'SELECT v.id, v.numero, v.total, v.pagamento, v.criado_em, '
    . 'COALESCE(u.nome, \'\') utilizador '
    . 'FROM vendas v LEFT JOIN utilizadores u ON u.id = v.utilizador_id '
    . 'ORDER BY v.id DESC LIMIT 200'
);

$invoices = $statement->fetchAll();

echo json_encode(['sucesso' => true, 'dados' => $invoices]);
