const API = 'api/';

document.getElementById('loginForm')?.addEventListener('submit', async (event) => {
	event.preventDefault();

	const message = document.getElementById('msg');
	const usernameInput = document.getElementById('username');
	const passwordInput = document.getElementById('password');

	try {
		const response = await fetch(API + 'login.php', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				username: usernameInput.value,
				password: passwordInput.value
			})
		});
		const data = await response.json();

		if (!data.sucesso) {
			throw new Error(data.mensagem || 'Login inválido');
		}

		sessionStorage.setItem('farmacia_user', JSON.stringify(data.usuario));
		location.href = 'dashboard.html';
	} catch (error) {
		message.textContent = error.message;
	}
});

function logout() {
	sessionStorage.clear();
	location.href = 'index.html';
}