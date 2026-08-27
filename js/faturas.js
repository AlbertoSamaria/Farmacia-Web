const invoicesTable = document.getElementById('invoicesTable');
const invoiceMessage = document.getElementById('invoiceMessage');
const companyStorageKey = 'farmacia_invoice_company';

function getCompanyData() {
    return JSON.parse(localStorage.getItem(companyStorageKey) || '{}');
}

function loadCompanyData() {
    const company = getCompanyData();
    document.getElementById('companyName').value = company.nome_empresa || '';
    document.getElementById('companyNi').value = company.ni || '';
    document.getElementById('companyPhone').value = company.telefone || '';
    document.getElementById('companyAddress').value = company.endereco || '';
}

function saveCompanyData(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    localStorage.setItem(companyStorageKey, JSON.stringify(Object.fromEntries(form)));
    document.getElementById('companyMessage').textContent = 'Dados da empresa guardados.';
}

function renderInvoices(invoices) {
    invoicesTable.innerHTML = invoices.map((invoice) => `
        <tr>
            <td>${invoice.numero}</td>
            <td>${invoice.criado_em}</td>
            <td>${invoice.pagamento}</td>
            <td>${invoice.utilizador || '-'}</td>
            <td>${money(invoice.total)}</td>
            <td class="invoice-actions">
                <button type="button" onclick="viewInvoice(${invoice.id})">Ver</button>
                <button type="button" onclick="editInvoice(${invoice.id})">Editar</button>
                <button type="button" onclick="printInvoice(${invoice.id})">Imprimir</button>
            </td>
        </tr>
    `).join('');
}

async function getInvoice(id) {
    const response = await api('faturas.php?id=' + id);
    return response.dados;
}

function showInvoice(invoice, editable = false) {
    const company = getCompanyData();
    document.getElementById('invoiceTitle').textContent =
        (editable ? 'Editar fatura ' : 'Fatura ') + invoice.numero;
    document.getElementById('invoiceDetails').innerHTML = `
        <div class="print-company-header">
            <img src="css/logo-farmacia.svg" alt="Logotipo da Farmácia Web">
            <div>
                <h2>${company.nome_empresa || 'Farmácia Web'}</h2>
                <p><strong>NI:</strong> ${company.ni || '-'} | <strong>Telefone:</strong> ${company.telefone || '-'}</p>
                <p><strong>Endereço:</strong> ${company.endereco || '-'}</p>
            </div>
        </div>
        <div class="print-invoice-heading"><h2>Fatura ${invoice.numero}</h2><p>Documento de venda</p></div>
        <p><strong>Data:</strong> ${invoice.criado_em}</p>
        <p><strong>Utilizador:</strong> ${invoice.utilizador || '-'}</p>
        <label>Forma de pagamento<select id="invoicePayment" ${editable ? '' : 'disabled'}>
            ${['Dinheiro', 'TPA', 'Transferencia', 'Outro'].map((method) => `<option ${method === invoice.pagamento ? 'selected' : ''}>${method}</option>`).join('')}
        </select></label>
        <h3>Produtos vendidos</h3>
        <div class="table-wrap"><table><thead><tr><th>Produto</th><th>Quantidade</th><th>Preço</th></tr></thead><tbody>
            ${invoice.itens.map((item) => `<tr><td>${item.nome}</td><td>${item.quantidade}</td><td>${money(item.preco_unitario)}</td></tr>`).join('')}
        </tbody></table></div>
        <p class="invoice-total"><strong>Total: ${money(invoice.total)}</strong></p>`;
    document.getElementById('saveInvoice').hidden = !editable;
    document.getElementById('invoiceModal').classList.remove('hidden');
    document.getElementById('invoiceModal').dataset.id = invoice.id;
}

async function viewInvoice(id) {
    try {
        showInvoice(await getInvoice(id));
    } catch (error) {
        invoiceMessage.textContent = error.message;
    }
}

async function editInvoice(id) {
    try {
        showInvoice(await getInvoice(id), true);
    } catch (error) {
        invoiceMessage.textContent = error.message;
    }
}

async function saveInvoice() {
    const modal = document.getElementById('invoiceModal');
    try {
        await api('faturas.php', {
            method: 'PUT',
            body: JSON.stringify({
                id: modal.dataset.id,
                pagamento: document.getElementById('invoicePayment').value
            })
        });
        closeInvoice();
        await loadInvoices();
        invoiceMessage.textContent = 'Fatura atualizada com sucesso.';
    } catch (error) {
        invoiceMessage.textContent = error.message;
    }
}

function closeInvoice() {
    document.getElementById('invoiceModal').classList.add('hidden');
}

async function printInvoice(id) {
    try {
        showInvoice(await getInvoice(id));
        window.setTimeout(() => window.print(), 100);
    } catch (error) {
        invoiceMessage.textContent = error.message;
    }
}

async function loadInvoices() {
    const response = await api('faturas.php');
    renderInvoices(response.dados);
}

document.getElementById('saveInvoice')?.addEventListener('click', saveInvoice);
document.getElementById('closeInvoice')?.addEventListener('click', closeInvoice);
document.getElementById('companyForm')?.addEventListener('submit', saveCompanyData);

loadCompanyData();

loadInvoices()
    .catch((error) => {
        invoiceMessage.textContent = error.message;
    });
