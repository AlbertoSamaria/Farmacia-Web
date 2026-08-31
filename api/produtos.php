<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/middleware.php';

header('Content-Type: application/json; charset=utf-8');

try {
	// Apenas usuários autenticados podem acessar produtos
	protegerRota();

	if ($_SERVER['REQUEST_METHOD'] === 'GET') {
		$id = $_GET['id'] ?? null;
		$busca = $_GET['busca'] ?? '';

		if ($id) {
			$stmt = $pdo->prepare("SELECT * FROM produtos WHERE id = ?");
			$stmt->execute([$id]);
			echo json_encode([
				'sucesso' => true,
				'dados' => $stmt->fetchAll()
			], JSON_UNESCAPED_UNICODE);
			exit;
		}

		$stmt = $pdo->prepare("
			SELECT * FROM produtos 
			WHERE codigo LIKE ? 
			   OR nome LIKE ? 
			   OR principio_ativo LIKE ? 
			ORDER BY nome
		");
		$search = "%$busca%";
		$stmt->execute([$search, $search, $search]);

		echo json_encode([
			'sucesso' => true,
			'dados' => $stmt->fetchAll()
		], JSON_UNESCAPED_UNICODE);
		exit;
	}

	// POST, PUT, DELETE requerem token CSRF
	validarCSRF();

	$data = json_decode(file_get_contents('php://input'), true) ?? [];

	if (!empty($data['id'])) {
		// UPDATE
		$stmt = $pdo->prepare("
			UPDATE produtos 
			SET codigo=?, nome=?, principio_ativo=?, categoria=?, 
			    preco_venda=?, stock_minimo=?, validade=?, receita_obrigatoria=? 
			WHERE id=?
		");
		$stmt->execute([
			$data['codigo'],
			$data['nome'],
			$data['principio_ativo'],
			$data['categoria'],
			$data['preco_venda'],
			$data['stock_minimo'] ?? 5,
			$data['validade'] ?: null,
			$data['receita_obrigatoria'] ?? 0,
			$data['id']
		]);
	} else {
		// INSERT
		$stmt = $pdo->prepare("
			INSERT INTO produtos(codigo, nome, principio_ativo, categoria, 
			                     preco_venda, stock_minimo, validade, receita_obrigatoria) 
			VALUES(?, ?, ?, ?, ?, ?, ?, ?)
		");
		$stmt->execute([
			$data['codigo'],
			$data['nome'],
			$data['principio_ativo'],
			$data['categoria'],
			$data['preco_venda'],
			$data['stock_minimo'] ?? 5,
			$data['validade'] ?: null,
			$data['receita_obrigatoria'] ?? 0
		]);
	}

	echo json_encode([
		'sucesso' => true,
		'mensagem' => 'Produto salvo com sucesso.'
	], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
	http_response_code(500);
	echo json_encode([
		'sucesso' => false,
		'mensagem' => 'Erro ao processar produto.'
	], JSON_UNESCAPED_UNICODE);
}