<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/middleware.php';

header('Content-Type: application/json; charset=utf-8');

try {
	// Apenas usuários autenticados podem ver o dashboard
	protegerRota();

	$products = $pdo->query('SELECT COUNT(*) n FROM produtos')->fetch()['n'];
	$lowStock = $pdo->query(
		'SELECT COUNT(*) n FROM produtos WHERE stock <= stock_minimo'
	)->fetch()['n'];
	$expiring = $pdo->query(
		'SELECT COUNT(*) n FROM produtos WHERE validade IS NOT NULL '
		. 'AND validade <= DATE_ADD(CURDATE(), INTERVAL 90 DAY)'
	)->fetch()['n'];
	$todaySales = $pdo->query(
		'SELECT COUNT(*) n, COALESCE(SUM(total), 0) total FROM vendas '
		. 'WHERE DATE(criado_em) = CURDATE()'
	)->fetch();
	$cashBalance = $pdo->query(
		"SELECT COALESCE(SUM(CASE WHEN tipo = 'Entrada' THEN valor ELSE -valor END), 0) saldo "
		. 'FROM movimentos_caixa'
	)->fetch()['saldo'];

	echo json_encode([
		'sucesso' => true,
		'dados' => [
			'produtos' => $products,
			'stock_baixo' => $lowStock,
			'validade' => $expiring,
			'vendas_hoje' => $todaySales['n'],
			'receita_hoje' => $todaySales['total'],
			'caixa' => $cashBalance
		]
	], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
	http_response_code(500);
	echo json_encode([
		'sucesso' => false,
		'mensagem' => 'Erro ao carregar dashboard.'
	], JSON_UNESCAPED_UNICODE);
}