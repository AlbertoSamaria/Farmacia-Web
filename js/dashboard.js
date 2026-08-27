async function dashboard() {
	try {
		const response = await api('dashboard.php');
		const data = response.dados;

		document.getElementById('totalProdutos').textContent = data.produtos;
		document.getElementById('stockBaixo').textContent = data.stock_baixo;
		document.getElementById('validade').textContent = data.validade;
		document.getElementById('vendasHoje').textContent = data.vendas_hoje;
		document.getElementById('receitaHoje').textContent = money(data.receita_hoje);
		document.getElementById('saldoCaixa').textContent = money(data.caixa);
	} catch (error) {
		console.error(error);
	}
}

dashboard();
setInterval(dashboard, 30000);