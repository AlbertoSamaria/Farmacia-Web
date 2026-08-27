let produtosStock = [];


// ===============================
// CARREGAR STOCK
// ===============================

async function carregarStock(){

    try{


        const busca = document
            .getElementById("busca")
            ?.value || "";


        const resposta = await api(
            "stock.php?produtos=1"
        );


        if(!resposta.sucesso){

            throw new Error(
                resposta.mensagem || "Erro ao carregar"
            );

        }



        produtosStock = resposta.dados;



        if(busca){

            produtosStock = produtosStock.filter(p=>{

                return (

                    p.nome.toLowerCase()
                    .includes(busca.toLowerCase())

                    ||

                    p.codigo.toLowerCase()
                    .includes(busca.toLowerCase())

                    ||

                    (p.principio_ativo||"")
                    .toLowerCase()
                    .includes(busca.toLowerCase())

                );

            });


        }



        const tabela =
            document.getElementById("tabelaStock");



        tabela.innerHTML =
        produtosStock.map(p=>{


            let estado="Normal";


            if(Number(p.stock)<=0){

                estado="Sem stock";

            }

            else if(
                Number(p.stock)
                <=
                Number(p.stock_minimo)
            ){

                estado="Stock baixo";

            }



            return `


<tr>


<td>${esc(p.codigo)}</td>


<td>${esc(p.nome)}</td>


<td>${esc(p.principio_ativo || "")}</td>



<td>
${p.stock}
</td>



<td>
${p.stock_minimo}
</td>



<td>
${p.validade || "-"}
</td>



<td>

<span class="badge">

${estado}

</span>

</td>



<td>


<button
onclick="editarProduto(${p.id})">

Editar

</button>




<button
onclick="eliminarProduto(${p.id})">

Eliminar

</button>



</td>



</tr>


`;



        }).join("");




    }catch(e){

        console.error(
            "Erro stock:",
            e
        );


    }


}







// ===============================
// ABRIR MOVIMENTO
// ===============================

async function abrirMovimento(){


    document
    .getElementById("modalStock")
    .classList.remove("hidden");



    await carregarProdutosSelect();


}







async function carregarProdutosSelect(){


    const select =
    document.getElementById("produto");



    if(!select)return;



    select.innerHTML =
    `
    <option value="">
    Selecionar produto
    </option>
    `;



    produtosStock.forEach(p=>{


        select.innerHTML +=
        `

        <option value="${p.id}">
        ${p.codigo} - ${p.nome}
        </option>

        `;


    });



}








function fecharModal(){


document
.getElementById("modalStock")
.classList.add("hidden");


}









// ===============================
// GUARDAR MOVIMENTO
// ===============================


document
.getElementById("stockForm")
?.addEventListener(
"submit",
async function(e){


e.preventDefault();



const dados={


produto_id:
produto.value,


tipo:
tipo.value,


quantidade:
quantidade.value,


lote:
lote.value,


validade:
validade.value,


fornecedor:
fornecedor.value,


preco_compra:
preco_compra.value,


observacao:
observacao.value


};





const r = await api(
"stock.php",
{

method:"POST",

body:
JSON.stringify(dados)

}

);





if(r.sucesso){


alert(
"Movimento registado"
);


fecharModal();


carregarStock();


}
else{


alert(
r.mensagem
);


}



});









// ===============================
// EDITAR PRODUTO
// ===============================


function editarProduto(id){



const p =
produtosStock.find(
x=>x.id==id
);



if(!p)return;




editar_id.value=p.id;

editar_codigo.value=p.codigo;

editar_nome.value=p.nome;

editar_principio.value=
p.principio_ativo || "";

editar_categoria.value=
p.categoria || "";

editar_stock.value=
p.stock;

editar_minimo.value=
p.stock_minimo;




document
.getElementById("modalEditar")
.classList.remove("hidden");



}








function fecharEditar(){


document
.getElementById("modalEditar")
.classList.add("hidden");


}









// ===============================
// GUARDAR EDIÇÃO
// ===============================


document
.getElementById("editarForm")
?.addEventListener(
"submit",
async function(e){


e.preventDefault();



const dados={


id:
editar_id.value,


codigo:
editar_codigo.value,


nome:
editar_nome.value,


principio_ativo:
editar_principio.value,


categoria:
editar_categoria.value,


stock:
editar_stock.value,


stock_minimo:
editar_minimo.value


};





const r =
await api(
"stock.php",
{

method:"PUT",

body:
JSON.stringify(dados)

}

);




if(r.sucesso){


alert(
"Produto atualizado"
);


fecharEditar();


carregarStock();


}
else{


alert(
r.mensagem
);


}



});









// ===============================
// ELIMINAR
// ===============================


async function eliminarProduto(id){



if(!confirm(
"Deseja eliminar este produto?"
))return;





const r =
await api(
"stock.php?id="+id,
{

method:"DELETE"

}

);





if(r.sucesso){


alert(
"Produto eliminado"
);


carregarStock();



}
else{


alert(
r.mensagem
);


}



}









// ===============================
// ESCAPE HTML
// ===============================

function esc(valor){


return String(valor ?? "")
.replace(
/[&<>"']/g,
m=>({

"&":"&amp;",
"<":"&lt;",
">":"&gt;",
'"':"&quot;",
"'":"&#039;"

}[m])

);


}






carregarStock();