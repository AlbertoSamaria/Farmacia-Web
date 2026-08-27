/* =========================================================
   FARMÁCIA WEB - PRODUTOS / MEDICAMENTOS
   ========================================================= */

/* ---------- UTILITÁRIOS ---------- */

function esc(valor) {
    if (valor === null || valor === undefined) {
        return '';
    }

    return String(valor)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function numero(valor) {
    const n = parseFloat(valor);
    return isNaN(n) ? 0 : n;
}

function money(valor) {
    return new Intl.NumberFormat('pt-AO', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(numero(valor)) + ' Kz';
}

function mostrarMensagem(texto, tipo = 'sucesso') {
    let msg = document.getElementById('mensagemProduto');

    if (!msg) {
        msg = document.createElement('div');
        msg.id = 'mensagemProduto';

        const main = document.querySelector('main');

        if (main) {
            main.prepend(msg);
        } else {
            document.body.prepend(msg);
        }
    }

    msg.textContent = texto;
    msg.className = 'msg ' + tipo;

    setTimeout(() => {
        msg.textContent = '';
        msg.className = 'msg';
    }, 4000);
}


/* ---------- ELEMENTOS ---------- */

const modal = document.getElementById('modal');
const produtoForm = document.getElementById('produtoForm');
const busca = document.getElementById('busca');
const tabelaProdutos = document.getElementById('produtos');


/* ---------- CARREGAR PRODUTOS ---------- */

async function carregarProdutos() {

    try {

        const termo = busca ? busca.value.trim() : '';

        const url = 'api/produtos.php?busca=' +
            encodeURIComponent(termo);

        const resposta = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        const texto = await resposta.text();

        let dados;

        try {
            dados = JSON.parse(texto);
        } catch (erro) {

            console.error('Resposta inválida da API:', texto);

            throw new Error(
                'A API retornou uma resposta que não é JSON válido.'
            );
        }

        if (!resposta.ok) {
            throw new Error(
                dados.mensagem ||
                'Erro ao carregar produtos.'
            );
        }

        if (!dados.sucesso) {
            throw new Error(
                dados.mensagem ||
                'Não foi possível carregar os produtos.'
            );
        }

        const produtos = Array.isArray(dados.dados)
            ? dados.dados
            : [];

        if (!tabelaProdutos) {
            console.warn(
                'Elemento #produtos não encontrado.'
            );
            return;
        }

        if (produtos.length === 0) {

            tabelaProdutos.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align:center;padding:25px;">
                        Nenhum produto encontrado.
                    </td>
                </tr>
            `;

            return;
        }

        tabelaProdutos.innerHTML = produtos.map(p => {

            const stock = numero(p.stock);
            const stockMinimo = numero(p.stock_minimo);

            let classeStock = '';

            if (stock <= 0) {
                classeStock = 'stock-zero';
            } else if (stock <= stockMinimo) {
                classeStock = 'stock-baixo';
            }

            const receita =
                String(p.receita_obrigatoria) === '1'
                    ? 'Sim'
                    : 'Não';

            return `
                <tr>

                    <td>
                        <strong>${esc(p.codigo)}</strong>
                    </td>

                    <td>
                        ${esc(p.nome)}
                    </td>

                    <td>
                        ${esc(p.principio_ativo || '')}
                    </td>

                    <td>
                        ${esc(p.categoria || '')}
                    </td>

                    <td>
                        ${money(p.preco_venda)}
                    </td>

                    <td>
                        <span class="${classeStock}">
                            ${stock}
                        </span>
                    </td>

                    <td>
                        ${p.validade
                            ? esc(p.validade)
                            : '<span>—</span>'
                        }
                    </td>

                    <td>
                        ${receita}
                    </td>

                    <td>
                        <div class="acoes-produto">

                            <button
                                type="button"
                                onclick="editarProduto(${Number(p.id)})"
                            >
                                Editar
                            </button>

                        </div>
                    </td>

                </tr>
            `;

        }).join('');

    } catch (erro) {

        console.error(
            'Erro ao carregar produtos:',
            erro
        );

        if (tabelaProdutos) {

            tabelaProdutos.innerHTML = `
                <tr>
                    <td colspan="9"
                        style="text-align:center;color:#b42318;padding:25px;">
                        Erro ao carregar produtos.
                    </td>
                </tr>
            `;
        }

        mostrarMensagem(
            erro.message ||
            'Erro ao carregar produtos.',
            'erro'
        );
    }
}


/* ---------- NOVO PRODUTO ---------- */

function novoProduto() {

    if (!produtoForm) {
        console.error(
            'Formulário #produtoForm não encontrado.'
        );
        return;
    }

    produtoForm.reset();

    const campoId =
        document.getElementById('id');

    if (campoId) {
        campoId.value = '';
    }

    const stockMinimo =
        document.getElementById('stock_minimo');

    if (stockMinimo) {
        stockMinimo.value = '5';
    }

    const receita =
        document.getElementById('receita_obrigatoria');

    if (receita) {
        receita.value = '0';
    }

    if (modal) {
        modal.classList.remove('hidden');
    }
}


/* ---------- FECHAR MODAL ---------- */

function fechar() {

    if (modal) {
        modal.classList.add('hidden');
    }
}


/* ---------- EDITAR PRODUTO ---------- */

async function editarProduto(idProduto) {

    try {

        if (!idProduto) {
            mostrarMensagem(
                'Produto inválido.',
                'erro'
            );
            return;
        }

        const resposta = await fetch(
            'api/produtos.php?id=' +
            encodeURIComponent(idProduto),
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            }
        );

        const texto = await resposta.text();

        let dados;

        try {
            dados = JSON.parse(texto);
        } catch (erro) {

            console.error(
                'Resposta inválida da API:',
                texto
            );

            throw new Error(
                'A API retornou uma resposta inválida.'
            );
        }

        if (!resposta.ok || !dados.sucesso) {

            throw new Error(
                dados.mensagem ||
                'Não foi possível carregar o produto.'
            );
        }

        const produto =
            Array.isArray(dados.dados)
                ? dados.dados[0]
                : dados.dados;

        if (!produto) {
            throw new Error(
                'Produto não encontrado.'
            );
        }

        preencherFormulario(produto);

        if (modal) {
            modal.classList.remove('hidden');
        }

    } catch (erro) {

        console.error(
            'Erro ao editar produto:',
            erro
        );

        mostrarMensagem(
            erro.message ||
            'Erro ao carregar produto.',
            'erro'
        );
    }
}


/* ---------- PREENCHER FORMULÁRIO ---------- */

function preencherFormulario(p) {

    const campos = {

        id: p.id,

        codigo: p.codigo,

        nome: p.nome,

        principio_ativo:
            p.principio_ativo,

        categoria:
            p.categoria,

        preco_compra:
            p.preco_compra,

        preco:
            p.preco_venda,

        stock:
            p.stock,

        stock_minimo:
            p.stock_minimo,

        validade_input:
            p.validade,

        lote:
            p.lote,

        receita_obrigatoria:
            p.receita_obrigatoria

    };

    Object.keys(campos).forEach(idCampo => {

        const elemento =
            document.getElementById(idCampo);

        if (!elemento) {
            return;
        }

        elemento.value =
            campos[idCampo] ??
            '';

    });
}


/* ---------- RECOLHER FORMULÁRIO ---------- */

function obterDadosFormulario() {

    const campo = id =>
        document.getElementById(id);

    return {

        id:
            campo('id')?.value || '',

        codigo:
            campo('codigo')?.value.trim() || '',

        nome:
            campo('nome')?.value.trim() || '',

        principio_ativo:
            campo('principio_ativo')?.value.trim() || '',

        categoria:
            campo('categoria')?.value.trim() || '',

        preco_compra:
            campo('preco_compra')?.value || '0',

        preco_venda:
            campo('preco')?.value || '0',

        stock:
            campo('stock')?.value || '0',

        stock_minimo:
            campo('stock_minimo')?.value || '5',

        validade:
            campo('validade_input')?.value || null,

        lote:
            campo('lote')?.value.trim() || null,

        receita_obrigatoria:
            campo('receita_obrigatoria')?.value || '0'

    };
}


/* ---------- GUARDAR PRODUTO ---------- */

if (produtoForm) {

    produtoForm.addEventListener(
        'submit',
        async function (e) {

            e.preventDefault();

            const dados =
                obterDadosFormulario();

            if (!dados.codigo) {

                mostrarMensagem(
                    'Informe o código do produto.',
                    'erro'
                );

                return;
            }

            if (!dados.nome) {

                mostrarMensagem(
                    'Informe o nome do produto.',
                    'erro'
                );

                return;
            }

            if (
                dados.preco_venda === '' ||
                numero(dados.preco_venda) < 0
            ) {

                mostrarMensagem(
                    'Informe um preço de venda válido.',
                    'erro'
                );

                return;
            }

            const botao =
                produtoForm.querySelector(
                    'button[type="submit"]'
                );

            try {

                if (botao) {
                    botao.disabled = true;
                    botao.textContent =
                        'A guardar...';
                }

                const resposta = await fetch(
                    'api/produtos.php',
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'application/json',

                            'Accept':
                                'application/json'
                        },

                        body:
                            JSON.stringify(dados)
                    }
                );

                const texto =
                    await resposta.text();

                let resultado;

                try {

                    resultado =
                        JSON.parse(texto);

                } catch (erro) {

                    console.error(
                        'Resposta da API:',
                        texto
                    );

                    throw new Error(
                        'O servidor retornou uma resposta inválida.'
                    );
                }

                if (
                    !resposta.ok ||
                    !resultado.sucesso
                ) {

                    throw new Error(
                        resultado.mensagem ||
                        'Erro ao guardar produto.'
                    );
                }

                fechar();

                mostrarMensagem(
                    dados.id
                        ? 'Produto atualizado com sucesso.'
                        : 'Produto cadastrado com sucesso.',
                    'sucesso'
                );

                await carregarProdutos();

            } catch (erro) {

                console.error(
                    'Erro ao guardar produto:',
                    erro
                );

                mostrarMensagem(
                    erro.message ||
                    'Erro ao guardar produto.',
                    'erro'
                );

            } finally {

                if (botao) {
                    botao.disabled = false;
                    botao.textContent =
                        'Guardar';
                }

            }

        }
    );
}


/* ---------- PESQUISA ---------- */

if (busca) {

    let temporizador;

    busca.addEventListener(
        'input',
        function () {

            clearTimeout(
                temporizador
            );

            temporizador =
                setTimeout(
                    carregarProdutos,
                    250
                );
        }
    );
}


/* ---------- FECHAR MODAL AO CLICAR FORA ---------- */

if (modal) {

    modal.addEventListener(
        'click',
        function (e) {

            if (e.target === modal) {
                fechar();
            }

        }
    );
}


/* ---------- TECLA ESC ---------- */

document.addEventListener(
    'keydown',
    function (e) {

        if (
            e.key === 'Escape' &&
            modal &&
            !modal.classList.contains('hidden')
        ) {

            fechar();
        }

    }
);


/* ---------- INICIALIZAÇÃO ---------- */

document.addEventListener(
    'DOMContentLoaded',
    function () {

        carregarProdutos();

    }
);