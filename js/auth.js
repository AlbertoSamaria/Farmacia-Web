const API = 'api/';

// Inicializa o aplicativo ao carregar a página
document.addEventListener('DOMContentLoaded', async () => {
	// Se não há formulário de login, verifica autenticação
	if (!document.getElementById('loginForm')) {
		await verificarAutenticacao();
		return;
	}

	// Formulário de login
	document.getElementById('loginForm').addEventListener('submit', async (event) => {
		event.preventDefault();

		const message = document.getElementById('msg');
		const usernameInput = document.getElementById('username');
		const passwordInput = document.getElementById('password');

		try {
			const response = await fetch(API + 'login.php', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include', // Importante: envia e recebe cookies
				body: JSON.stringify({
					username: usernameInput.value,
					password: passwordInput.value
				})
			});
			const data = await response.json();

			if (!data.sucesso) {
				throw new Error(data.mensagem || 'Login inválido');
			}

			// Armazena o token CSRF no localStorage (não é sensível)
			localStorage.setItem('csrf_token', data.usuario.csrf_token);

			// Sucesso! Redireciona
			location.href = 'dashboard.html';
		} catch (error) {
			message.textContent = error.message;
		}
	});
});

/**
 * Verifica se o usuário está autenticado
 */
async function verificarAutenticacao() {
	try {
		const response = await fetch(API + 'auth-info.php', {
			method: 'GET',
			credentials: 'include' // Envia cookies
		});
		const data = await response.json();

		if (!data.autenticado) {
			// Não autenticado, redireciona para login
			location.href = 'index.html';
			return;
		}

		// Atualiza o token CSRF
		localStorage.setItem('csrf_token', data.usuario.csrf_token);

		// Exibe informações do usuário se existe elemento
		const userInfo = document.getElementById('userInfo');
		if (userInfo) {
			userInfo.textContent = `Utilizador: ${data.usuario.nome} | Perfil: ${data.usuario.perfil}`;
		}
	} catch (error) {
		console.error('Erro ao verificar autenticação:', error);
		location.href = 'index.html';
	}
}

/**
 * Faz logout
 */
async function logout() {
	try {
		await fetch(API + 'logout.php', {
			method: 'POST',
			credentials: 'include'
		});
		
		// Limpa o localStorage
		localStorage.clear();
		location.href = 'index.html';
	} catch (error) {
		console.error('Erro ao fazer logout:', error);
		location.href = 'index.html';
	}
}