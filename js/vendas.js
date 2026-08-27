let carrinho = [];
let produtos = [];

const produtoSelect = document.getElementById('produto');
const quantidadeInput = document.getElementById('quantidade');
const vendasTable = document.getElementById('vendas');

async function init() {
	const productsResponse = await api('produtos.php');
	produtos = productsResponse.dados;
	produtoSelect.innerHTML = produtos
		.filter((product) => product.stock > 0)
		.map((product) => `<option value="${product.id}">${product.nome} - ${money(product.preco_venda)} (stock ${product.stock})</option>`)
		.join('');

	const salesResponse = await api('vendas.php');
	vendasTable.innerHTML = salesResponse.dados
		.map((sale) => `<tr><td>${sale.numero}</td><td>${sale.criado_em}</td><td>${money(sale.total)}</td><td>${sale.utilizador || ''}</td></tr>`)
		.join('');
}

function adicionarItem() {
	const product = produtos.find((item) => item.id == produtoSelect.value);
	const quantity = Number(quantidadeInput.value);

	if (!product || quantity < 1 || quantity > product.stock) {
		return alert('Quantidade inválida');
	}

	carrinho.push({
		produto_id: product.id,
		nome: product.nome,
		quantidade: quantity,
		preco: Number(product.preco_venda)
	});
	render();
}

function render() {
	const total = carrinho.reduce(
		(sum, item) => sum + item.quantidade * item.preco,
		0
	);

	document.getElementById('total').textContent = money(total);
	document.getElementById('carrinho').innerHTML = carrinho
		.map((item) => `<p>${item.nome} x ${item.quantidade} = ${money(item.quantidade * item.preco)}</p>`)
		.join('');
}

async function finalizarVenda() {
	if (!carrinho.length) {
		return alert('Carrinho vazio');
	}

	const response = await api('vendas.php', {
		method: 'POST',
		body: JSON.stringify({ itens: carrinho, pagamento: 'Dinheiro' })
	});

	alert('Venda criada: ' + response.numero);
	carrinho = [];
	render();
	init();
}

init();