<?php

require_once __DIR__ . '/auth.php';

/**
 * Verifica se o usuário está autenticado
 * Se não estiver, retorna erro 401 e encerra
 */
function protegerRota() {
	if (!estaAutenticado()) {
		http_response_code(401);
		header('Content-Type: application/json; charset=utf-8');
		echo json_encode([
			'sucesso' => false,
			'mensagem' => 'Não autenticado. Faça login novamente.'
		], JSON_UNESCAPED_UNICODE);
		exit;
	}
}

/**
 * Valida token CSRF em requisições que modificam dados
 * Se não for válido, retorna erro 403 e encerra
 */
function validarCSRF() {
	$method = $_SERVER['REQUEST_METHOD'];
	
	// Apenas valida em requisições que modificam dados
	if (!in_array($method, ['POST', 'PUT', 'DELETE', 'PATCH'])) {
		return true;
	}

	// Obtém o token do header
	$token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';

	if (!validarTokenCSRF($token)) {
		http_response_code(403);
		header('Content-Type: application/json; charset=utf-8');
		echo json_encode([
			'sucesso' => false,
			'mensagem' => 'Token CSRF inválido.'
		], JSON_UNESCAPED_UNICODE);
		exit;
	}

	return true;
}

/**
 * Middleware que combina autenticação e validação CSRF
 */
function protegerRotaSegura() {
	protegerRota();
	validarCSRF();
}
