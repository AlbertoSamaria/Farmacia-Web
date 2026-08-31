<?php

/**
 * Arquivo de configuração de autenticação e sessão
 * Gerencia sessões seguras e tokens CSRF
 */

// Inicia sessão se ainda não estiver iniciada
if (session_status() === PHP_SESSION_NONE) {
	session_start([
		'cookie_httponly' => true,
		'cookie_secure' => false, // true apenas em HTTPS
		'cookie_samesite' => 'Strict',
		'use_strict_mode' => true,
		'gc_maxlifetime' => 3600 // 1 hora
	]);
}

/**
 * Gera um novo token CSRF
 */
function gerarTokenCSRF() {
	if (empty($_SESSION['csrf_token'])) {
		$_SESSION['csrf_token'] = bin2hex(random_bytes(32));
	}
	return $_SESSION['csrf_token'];
}

/**
 * Valida um token CSRF
 */
function validarTokenCSRF($token) {
	return hash_equals($_SESSION['csrf_token'] ?? '', $token);
}

/**
 * Obtém o usuário autenticado
 */
function obterUsuarioAutenticado() {
	return $_SESSION['usuario'] ?? null;
}

/**
 * Verifica se está autenticado
 */
function estaAutenticado() {
	return isset($_SESSION['usuario']);
}

/**
 * Faz login do usuário
 */
function fazerLogin($usuario) {
	$_SESSION['usuario'] = $usuario;
	gerarTokenCSRF();
}

/**
 * Faz logout do usuário
 */
function fazerLogout() {
	session_destroy();
	header('Location: index.html');
	exit;
}

/**
 * Retorna o usuário em JSON para o frontend
 */
function retornarUsuarioJSON() {
	$usuario = obterUsuarioAutenticado();
	if ($usuario) {
		return [
			'id' => $usuario['id'],
			'nome' => $usuario['nome'],
			'username' => $usuario['username'],
			'perfil' => $usuario['perfil'],
			'csrf_token' => gerarTokenCSRF()
		];
	}
	return null;
}
