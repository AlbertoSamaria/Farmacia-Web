<?php
require_once __DIR__.'/../config/database.php'; header('Content-Type: application/json; charset=utf-8');
if($_SERVER['REQUEST_METHOD']==='GET'){
 $id=$_GET['id']??null;$busca=$_GET['busca']??'';
 if($id){$s=$pdo->prepare("SELECT * FROM produtos WHERE id=?");$s->execute([$id]);echo json_encode(['sucesso'=>true,'dados'=>$s->fetchAll()]);exit;}
 $s=$pdo->prepare("SELECT * FROM produtos WHERE codigo LIKE ? OR nome LIKE ? OR principio_ativo LIKE ? ORDER BY nome");$q="%$busca%";$s->execute([$q,$q,$q]);echo json_encode(['sucesso'=>true,'dados'=>$s->fetchAll()]);exit;
}
$data=json_decode(file_get_contents('php://input'),true)??[];
if(!empty($data['id'])){$s=$pdo->prepare("UPDATE produtos SET codigo=?,nome=?,principio_ativo=?,categoria=?,preco_venda=?,stock_minimo=?,validade=?,receita_obrigatoria=? WHERE id=?");$s->execute([$data['codigo'],$data['nome'],$data['principio_ativo'],$data['categoria'],$data['preco_venda'],$data['stock_minimo']??5,$data['validade']?:null,$data['receita_obrigatoria']??0,$data['id']]);}
else{$s=$pdo->prepare("INSERT INTO produtos(codigo,nome,principio_ativo,categoria,preco_venda,stock_minimo,validade,receita_obrigatoria) VALUES(?,?,?,?,?,?,?,?)");$s->execute([$data['codigo'],$data['nome'],$data['principio_ativo'],$data['categoria'],$data['preco_venda'],$data['stock_minimo']??5,$data['validade']?:null,$data['receita_obrigatoria']??0]);}
echo json_encode(['sucesso'=>true]);