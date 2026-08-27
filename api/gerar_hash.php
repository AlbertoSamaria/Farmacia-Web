<?php

header('Content-Type: text/html; charset=utf-8');

$senha = 'F@rma2026';

$hash = password_hash($senha, PASSWORD_DEFAULT);

echo '<!DOCTYPE html>';
echo '<html lang="pt">';
echo '<head>';
echo '<meta charset="UTF-8">';
echo '<title>Gerar Hash</title>';
echo '</head>';
echo '<body style="font-family:Arial;padding:30px;">';

echo '<h2>Hash da senha</h2>';

echo '<p>Senha: <strong>' . htmlspecialchars($senha) . '</strong></p>';

echo '<p>Hash:</p>';

echo '<textarea style="width:700px;height:100px;font-size:16px;">';
echo htmlspecialchars($hash);
echo '</textarea>';

echo '<p>Copie o hash acima e coloque-o na coluna <strong>password</strong> do utilizador Farma.</p>';

echo '</body>';
echo '</html>';