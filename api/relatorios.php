<?php

require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json; charset=utf-8');

$reports = [
    'vendas' => $pdo->query(
        'SELECT COUNT(*) quantidade, COALESCE(SUM(total), 0) total '
        . 'FROM vendas'
    )->fetch(),
    'stock' => $pdo->query(
        'SELECT COUNT(*) produtos, '
        . 'SUM(CASE WHEN stock <= stock_minimo THEN 1 ELSE 0 END) stock_baixo, '
        . 'COALESCE(SUM(stock), 0) unidades '
        . 'FROM produtos'
    )->fetch(),
    'compras' => $pdo->query(
        'SELECT COUNT(*) quantidade, COALESCE(SUM(total), 0) total '
        . 'FROM compras'
    )->fetch(),
    'financeiro' => $pdo->query(
        "SELECT COALESCE(SUM(CASE WHEN tipo = 'Entrada' THEN valor ELSE 0 END), 0) entradas, "
        . "COALESCE(SUM(CASE WHEN tipo = 'Saida' THEN valor ELSE 0 END), 0) saidas "
        . 'FROM movimentos_caixa'
    )->fetch()
];

$reports['financeiro']['saldo'] =
    $reports['financeiro']['entradas'] - $reports['financeiro']['saidas'];

$reports['ultimas_vendas'] = $pdo->query(
    'SELECT numero, total, pagamento, criado_em FROM vendas ORDER BY id DESC LIMIT 100'
)->fetchAll();

$reports['stock_lista'] = $pdo->query(
    'SELECT codigo, nome, stock, stock_minimo, validade FROM produtos ORDER BY nome'
)->fetchAll();

$reports['ultimas_compras'] = $pdo->query(
    'SELECT c.numero, c.total, c.criado_em, f.nome fornecedor '
    . 'FROM compras c LEFT JOIN fornecedores f ON f.id = c.fornecedor_id '
    . 'ORDER BY c.id DESC LIMIT 100'
)->fetchAll();

echo json_encode(['sucesso' => true, 'dados' => $reports]);
