<?php
require_once __DIR__.'/../config/database.php'; header('Content-Type: application/json; charset=utf-8');
if($_SERVER['REQUEST_METHOD']==='GET'){
$s=$pdo->query("SELECT v.*,u.nome utilizador FROM vendas v LEFT JOIN utilizadores u ON u.id=v.utilizador_id ORDER BY v.id DESC LIMIT 50");echo json_encode(['sucesso'=>true,'dados'=>$s->fetchAll()]);exit;}
$data=json_decode(file_get_contents('php://input'),true)??[];$itens=$data['itens']??[];if(!$itens){http_response_code(400);echo json_encode(['sucesso'=>false,'mensagem'=>'Venda vazia']);exit;}
$pdo->beginTransaction();try{
$total=0;foreach($itens as $i){$s=$pdo->prepare("SELECT preco_venda,stock FROM produtos WHERE id=? FOR UPDATE");$s->execute([$i['produto_id']]);$p=$s->fetch();if(!$p||$i['quantidade']>$p['stock'])throw new Exception('Stock insuficiente');$total+=$i['quantidade']*$p['preco_venda'];}
$num='FT-'.date('YmdHis').'-'.random_int(100,999);$s=$pdo->prepare("INSERT INTO vendas(numero,total,pagamento,utilizador_id) VALUES(?,?,?,?)");$s->execute([$num,$total,$data['pagamento']??'Dinheiro',$_SERVER['HTTP_X_USER_ID']??null]);$vid=$pdo->lastInsertId();
foreach($itens as $i){$s=$pdo->prepare("SELECT preco_venda FROM produtos WHERE id=?");$s->execute([$i['produto_id']]);$p=$s->fetch();$s=$pdo->prepare("INSERT INTO venda_itens(venda_id,produto_id,quantidade,preco_unitario) VALUES(?,?,?,?)");$s->execute([$vid,$i['produto_id'],$i['quantidade'],$p['preco_venda']]);$s=$pdo->prepare("UPDATE produtos SET stock=stock-? WHERE id=?");$s->execute([$i['quantidade'],$i['produto_id']]);}
$pdo->commit();echo json_encode(['sucesso'=>true,'numero'=>$num]);}catch(Throwable $e){$pdo->rollBack();http_response_code(400);echo json_encode(['sucesso'=>false,'mensagem'=>$e->getMessage()]);}