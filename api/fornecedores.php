<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/middleware.php';

header('Content-Type: application/json; charset=utf-8');

try {
	// Protege a rota
	protegerRota();

if($_SERVER['REQUEST_METHOD']==='GET'){


$stmt=$pdo->query("
SELECT 
id,
nome,
telefone,
email,
nif
FROM fornecedores
ORDER BY nome ASC
");


echo json_encode([

"sucesso"=>true,

"dados"=>$stmt->fetchAll(PDO::FETCH_ASSOC)

],JSON_UNESCAPED_UNICODE);


exit;

}




http_response_code(405);


echo json_encode([

"sucesso"=>false,

"mensagem"=>"Método não permitido"

]);


}catch(Throwable $e){


http_response_code(500);


echo json_encode([

"sucesso"=>false,

"erro"=>$e->getMessage()

]);

}
