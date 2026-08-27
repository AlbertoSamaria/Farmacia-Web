const API_BASE = 'api/';
const user = JSON.parse(sessionStorage.getItem('farmacia_user') || 'null');

if (!user && !location.pathname.endsWith('index.html')) {
	location.href = 'index.html';
}

async function api(path, options = {}) {
	const requestOptions = {
		...options,
		headers: {
			...(options.headers || {}),
			'Content-Type': 'application/json',
			'X-User-Perfil': user?.perfil || '',
			'X-User-Id': user?.id || ''
		}
	};

	const response = await fetch(API_BASE + path, requestOptions);
	const data = await response.json();

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

document.getElementById('userInfo')?.append(
	'Utilizador: ' + (user?.nome || '') + ' | Perfil: ' + (user?.perfil || '')
);

function logout() {
	sessionStorage.clear();
	location.href = 'index.html';
}