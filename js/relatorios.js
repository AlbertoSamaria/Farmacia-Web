const reportMessage = document.getElementById('reportMessage');
const reportContent = document.getElementById('reportContent');
let reportData;

function reportCard(title, icon, values) {
    return `<section class="panel report-card"><h2><span class="report-icon" aria-hidden="true">${icon}</span>${title}</h2>${values.map(([label, value]) => `<p><strong>${label}:</strong> ${value}</p>`).join('')}</section>`;
}

function renderReports(data) {
    reportContent.innerHTML = [
        reportCard('Vendas', '💳', [
            ['Quantidade', data.vendas.quantidade],
            ['Total', money(data.vendas.total)]
        ]),
        reportCard('Stock', '📦', [
            ['Produtos', data.stock.produtos],
            ['Unidades', data.stock.unidades],
            ['Stock baixo', data.stock.stock_baixo]
        ]),
        reportCard('Compras', '🛒', [
            ['Quantidade', data.compras.quantidade],
            ['Total', money(data.compras.total)]
        ]),
        reportCard('Financeiro', '📊', [
            ['Entradas', money(data.financeiro.entradas)],
            ['Saídas', money(data.financeiro.saidas)],
            ['Saldo', money(data.financeiro.saldo)]
        ])
    ].join('');
}

function downloadExcel() {
    const rows = [
        ['RELATÓRIO FARMÁCIA WEB'],
        [],
        ['VENDAS', 'Quantidade', reportData.vendas.quantidade, 'Total', reportData.vendas.total],
        ['STOCK', 'Produtos', reportData.stock.produtos, 'Unidades', reportData.stock.unidades, 'Stock baixo', reportData.stock.stock_baixo],
        ['COMPRAS', 'Quantidade', reportData.compras.quantidade, 'Total', reportData.compras.total],
        ['FINANCEIRO', 'Entradas', reportData.financeiro.entradas, 'Saídas', reportData.financeiro.saidas, 'Saldo', reportData.financeiro.saldo],
        [],
        ['Últimas vendas', 'Fatura', 'Total', 'Pagamento', 'Data'],
        ...reportData.ultimas_vendas.map((item) => ['Venda', item.numero, item.total, item.pagamento, item.criado_em]),
        [],
        ['Stock atual', 'Código', 'Produto', 'Stock', 'Mínimo', 'Validade'],
        ...reportData.stock_lista.map((item) => ['Stock', item.codigo, item.nome, item.stock, item.stock_minimo, item.validade || '']),
        [],
        ['Últimas compras', 'Número', 'Fornecedor', 'Total', 'Data'],
        ...reportData.ultimas_compras.map((item) => ['Compra', item.numero, item.fornecedor || '', item.total, item.criado_em])
    ];

    const htmlRows = rows.map((row) => {
        const cells = row.map((value) => `<td>${String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')}</td>`).join('');
        return `<tr>${cells}</tr>`;
    }).join('');
    const workbook = `<!doctype html><html><head><meta charset="utf-8"></head><body><table border="1">${htmlRows}</table></body></html>`;
    const blob = new Blob([workbook], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'relatorio-farmacia.xls';
    link.click();
    URL.revokeObjectURL(link.href);
}

const downloadButton = document.getElementById('downloadReport');
downloadButton?.addEventListener('click', downloadExcel);
if (downloadButton) {
    downloadButton.disabled = true;
}

api('relatorios.php')
    .then((response) => {
        reportData = response.dados;
        renderReports(reportData);
        if (downloadButton) {
            downloadButton.disabled = false;
        }
    })
    .catch((error) => {
        reportMessage.textContent = error.message;
    });
