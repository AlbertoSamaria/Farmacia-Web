<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/middleware.php';

header('Content-Type: application/json; charset=utf-8');

try {
	// Protege a rota
	protegerRota();
	
$method=$_SERVER['REQUEST_METHOD'];


// =====================================================
// GET
// =====================================================

if($method==='GET'){


    // Lista produtos do stock
    if(isset($_GET['produtos'])){


        $stmt=$pdo->query("
            SELECT
                id,
                codigo,
                nome,
                principio_ativo,
                categoria,
                stock,
                stock_minimo,
                validade,
                lote
            FROM produtos
            ORDER BY nome ASC
        ");


        echo json_encode([
            "sucesso"=>true,
            "dados"=>$stmt->fetchAll(PDO::FETCH_ASSOC)
        ],JSON_UNESCAPED_UNICODE);

        exit;
    }



    // Histórico movimentos

    $stmt=$pdo->query("
        SELECT
            sm.*,
            p.codigo,
            p.nome
        FROM stock_movimentos sm

        INNER JOIN produtos p
        ON p.id=sm.produto_id

        ORDER BY sm.id DESC
    ");


    echo json_encode([
        "sucesso"=>true,
        "dados"=>$stmt->fetchAll(PDO::FETCH_ASSOC)
    ],JSON_UNESCAPED_UNICODE);


    exit;

}




// =====================================================
// POST
// Entrada / saída / ajuste
// =====================================================

if($method==='POST'){


$data=json_decode(
file_get_contents("php://input"),
true
);


$produto=(int)($data['produto_id']??0);
$tipo=$data['tipo']??'';
$qtd=(int)($data['quantidade']??0);



if(!$produto || !$qtd){

http_response_code(422);

echo json_encode([
"sucesso"=>false,
"mensagem"=>"Dados inválidos"
]);

exit;

}



$stmt=$pdo->prepare("
SELECT stock FROM produtos WHERE id=?
");

$stmt->execute([$produto]);

$p=$stmt->fetch();



if(!$p){

http_response_code(404);

echo json_encode([
"sucesso"=>false,
"mensagem"=>"Produto não encontrado"
]);

exit;

}



$stock=$p['stock'];


if($tipo=="ENTRADA"){

$novo=$stock+$qtd;

}

elseif($tipo=="SAIDA"){

$novo=$stock-$qtd;

if($novo<0){

echo json_encode([
"sucesso"=>false,
"mensagem"=>"Stock insuficiente"
]);

exit;

}

}

else{

$novo=$qtd;

}



$pdo->beginTransaction();



$stmt=$pdo->prepare("
INSERT INTO stock_movimentos
(
produto_id,
tipo,
quantidade
)
VALUES(?,?,?)
");


$stmt->execute([
$produto,
$tipo,
$qtd
]);



$stmt=$pdo->prepare("
UPDATE produtos
SET stock=?
WHERE id=?
");


$stmt->execute([
$novo,
$produto
]);



$pdo->commit();


echo json_encode([
"sucesso"=>true,
"mensagem"=>"Stock atualizado"
]);


exit;

}




// =====================================================
// PUT EDITAR PRODUTO
// =====================================================


if($method==="PUT"){


$data=json_decode(
file_get_contents("php://input"),
true
);


$id=(int)$data['id'];


$stmt=$pdo->prepare("
UPDATE produtos SET

codigo=?,
nome=?,
principio_ativo=?,
categoria=?,
stock=?,
stock_minimo=?

WHERE id=?

");


$stmt->execute([

$data['codigo'],
$data['nome'],
$data['principio_ativo'],
$data['categoria'],
$data['stock'],
$data['stock_minimo'],
$id

]);



echo json_encode([
"sucesso"=>true,
"mensagem"=>"Produto atualizado"
]);


exit;

}




// =====================================================
// DELETE PRODUTO
// =====================================================


if($method==="DELETE"){


$id=(int)$_GET['id'];



$stmt=$pdo->prepare("
DELETE FROM produtos WHERE id=?
");


$stmt->execute([$id]);



echo json_encode([
"sucesso"=>true,
"mensagem"=>"Produto eliminado"
]);


exit;

}



http_response_code(405);


echo json_encode([
"sucesso"=>false,
"mensagem"=>"Método inválido"
]);



}catch(Throwable $e){


http_response_code(500);


echo json_encode([
"sucesso"=>false,
"erro"=>$e->getMessage()
]);


}