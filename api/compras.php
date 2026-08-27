<?php

require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Método não permitido']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true) ?? [];
$supplierId = !empty($data['fornecedor']) ? (int)$data['fornecedor'] : null;
$items = $data['itens'] ?? [];

if (!$items) {
    http_response_code(400);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Nenhum produto informado']);
    exit;
}

try {
    $pdo->beginTransaction();
    $number = 'CP-' . date('YmdHis') . '-' . random_int(100, 999);
    $statement = $pdo->prepare(
        'INSERT INTO compras (numero, fornecedor_id, total) VALUES (?, ?, 0)'
    );
    $statement->execute([$number, $supplierId]);
    $purchaseId = $pdo->lastInsertId();
    $total = 0;

    foreach ($items as $item) {
        $productId = (int)($item['produto_id'] ?? 0);
        $quantity = (int)($item['quantidade'] ?? 0);
        $cost = (float)($item['preco_compra'] ?? 0);

        if (!$productId || $quantity < 1 || $cost < 0) {
            throw new Exception('Dados de compra inválidos');
        }

        $total += $quantity * $cost;
        $statement = $pdo->prepare(
            'INSERT INTO compra_itens '
            . '(compra_id, produto_id, quantidade, custo_unitario, lote, validade) '
            . 'VALUES (?, ?, ?, ?, ?, ?)'
        );
        $statement->execute([
            $purchaseId,
            $productId,
            $quantity,
            $cost,
            $item['lote'] ?? null,
            $item['validade'] ?? null
        ]);

        $statement = $pdo->prepare(
            'UPDATE produtos SET stock = stock + ?, preco_compra = ?, lote = ?, validade = ? '
            . 'WHERE id = ?'
        );
        $statement->execute([
            $quantity,
            $cost,
            $item['lote'] ?? null,
            $item['validade'] ?? null,
            $productId
        ]);
    }

    $statement = $pdo->prepare('UPDATE compras SET total = ? WHERE id = ?');
    $statement->execute([$total, $purchaseId]);
    $pdo->commit();

    echo json_encode([
        'sucesso' => true,
        'numero' => $number,
        'mensagem' => 'Compra registada e stock atualizado'
    ]);
} catch (Throwable $error) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(400);
    echo json_encode(['sucesso' => false, 'mensagem' => $error->getMessage()]);
}
