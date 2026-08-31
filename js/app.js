const API_BASE = 'api/';

// Verifica autenticação ao carregar qualquer página
document.addEventListener('DOMContentLoaded', async () => {
	if (!location.pathname.endsWith('index.html')) {
		await verificarAutenticacao();
	}
});

async function api(path, options = {}) {
	// Adiciona o token CSRF em requisições POST, PUT, DELETE
	const method = (options.method || 'GET').toUpperCase();
	const headers = {
		...(options.headers || {}),
		'Content-Type': 'application/json'
	};

	// Adiciona token CSRF para requisições que modificam dados
	if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
		const csrfToken = localStorage.getItem('csrf_token');
		if (csrfToken) {
			headers['X-CSRF-Token'] = csrfToken;
		}
	}

	const requestOptions = {
		...options,
		method,
		headers,
		credentials: 'include' // Inclui cookies (sessão)
	};

	const response = await fetch(API_BASE + path, requestOptions);
	const data = await response.json();

	// Se não autenticado, redireciona para login
	if (response.status === 401) {
		location.href = 'index.html';
		throw new Error('Sessão expirou. Faça login novamente.');
	}

	if (!response.ok || data.sucesso === false) {
		throw new Error(data.mensagem || 'Erro na API');
	}

	return data;
}

function money(value) {
	return Number(value || 0).toLocaleString('pt-AO', {
		minimumFractionDigits: 2
	}) + ' Kz';
}