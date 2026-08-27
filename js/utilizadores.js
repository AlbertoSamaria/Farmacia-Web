const userMessage = document.getElementById('userMessage');
const userForm = document.getElementById('userForm');
const usersTable = document.getElementById('usersTable');

if (user?.perfil !== 'Administrador') {
    document.querySelector('.admin-only')?.remove();
}

function renderUsers(users) {
    usersTable.innerHTML = users.map((item) => `
        <tr>
            <td>${item.nome}</td>
            <td>${item.username}</td>
            <td>${item.perfil}</td>
            <td>${item.estado}</td>
            <td>${item.criado_em}</td>
        </tr>
    `).join('');
}

async function loadUsers() {
    const response = await api('utilizadores.php');
    renderUsers(response.dados);
}

userForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    userMessage.textContent = '';

    const formData = new FormData(userForm);
    const data = Object.fromEntries(formData.entries());

    try {
        await api('utilizadores.php', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        userForm.reset();
        userMessage.textContent = 'Utilizador criado com sucesso.';
        await loadUsers();
    } catch (error) {
        userMessage.textContent = error.message;
    }
});

loadUsers().catch((error) => {
    userMessage.textContent = error.message;
});
