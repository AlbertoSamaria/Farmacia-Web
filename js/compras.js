let itensCompra = [];


// ===============================
// CARREGAR FORNECEDORES
// ===============================

async function carregarFornecedores(){

    const select =
    document.getElementById("fornecedor");


    if(!select) return;


    const r =
    await api("fornecedores.php");


    if(!r.sucesso){

        alert("Erro ao carregar fornecedores");
        return;

    }


    select.innerHTML =
    `
    <option value="">
    Selecionar fornecedor
    </option>
    `;


    r.dados.forEach(f=>{


        select.innerHTML +=
        `
        <option value="${f.id}">
        ${f.nome}
        </option>
        `;


    });


}






// ===============================
// CARREGAR PRODUTOS
// ===============================

async function carregarProdutosCompra(){


    const select =
    document.getElementById("produtoCompra");


    if(!select)return;



    const r =
    await api("stock.php?produtos=1");



    if(!r.sucesso){

        alert(
        "Erro ao carregar produtos"
        );

        return;

    }



    select.innerHTML =
    `
    <option value="">
    Selecionar produto
    </option>
    `;



    r.dados.forEach(p=>{


        select.innerHTML +=
        `

        <option 
        value="${p.id}"
        data-nome="${p.nome}">

        ${p.codigo} - ${p.nome}

        </option>

        `;


    });


}







// ===============================
// ADICIONAR ITEM
// ===============================


function adicionarItemCompra(){



const select =
document.getElementById("produtoCompra");



const produtoId =
select.value;



if(!produtoId){

alert(
"Selecione um produto"
);

return;

}



const nome =
select.options[
select.selectedIndex
]
.dataset.nome;



const quantidade =
Number(
document.getElementById("quantidade").value
);



const preco =
Number(
document.getElementById("preco_compra").value
);



const lote =
document.getElementById("lote").value;



const validade =
document.getElementById("validade").value;




if(quantidade<=0){

alert(
"Quantidade inválida"
);

return;

}




itensCompra.push({

produto_id:produtoId,

nome,

quantidade,

preco_compra:preco,

lote,

validade


});



mostrarItens();


}








// ===============================
// MOSTRAR TABELA
// ===============================


function mostrarItens(){



const tabela =
document.getElementById("listaCompra");



if(itensCompra.length===0){


tabela.innerHTML =
`
<tr>
<td colspan="7">
Nenhum produto adicionado
</td>
</tr>
`;



calcularTotal();

return;

}




tabela.innerHTML =
itensCompra.map((item,index)=>{


let subtotal =
item.quantidade *
item.preco_compra;



return `


<tr>


<td>
${item.nome}
</td>


<td>
${item.quantidade}
</td>



<td>
${money(item.preco_compra)}
</td>



<td>
${item.lote || "-"}
</td>



<td>
${item.validade || "-"}
</td>



<td>
${money(subtotal)}
</td>



<td>

<button onclick="removerItem(${index})">
Eliminar
</button>


</td>



</tr>


`;



}).join("");



calcularTotal();


}







// ===============================
// REMOVER ITEM
// ===============================


function removerItem(index){


itensCompra.splice(
index,
1
);


mostrarItens();


}








// ===============================
// TOTAL
// ===============================


function calcularTotal(){



let total =
0;



itensCompra.forEach(i=>{


total +=
i.quantidade *
i.preco_compra;


});



document
.getElementById("totalCompra")
.innerHTML =
money(total);



}








// ===============================
// FINALIZAR COMPRA
// ===============================


async function finalizarCompra(){



const fornecedor =
document.getElementById("fornecedor").value;



if(!fornecedor){

alert(
"Selecione o fornecedor"
);

return;

}



if(itensCompra.length===0){

alert(
"Adicione produtos"
);

return;

}




const dados={



fornecedor,


itens:itensCompra



};





const r =
await api(
"compras.php",
{

method:"POST",

body:
JSON.stringify(dados)

}

);





if(r.sucesso){



alert(
"Compra registada com sucesso"
);



itensCompra=[];


mostrarItens();



}
else{


alert(
r.mensagem || "Erro"
);



}



}








// ===============================
// INICIAR
// ===============================


document.addEventListener(
"DOMContentLoaded",
()=>{


carregarFornecedores();

carregarProdutosCompra();


}
);