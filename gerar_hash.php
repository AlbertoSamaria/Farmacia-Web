<?php

$senha = 'F@rma2026';

$hash = password_hash($senha, PASSWORD_DEFAULT);

echo '<!DOCTYPE html>';
echo '<html lang="pt">';
echo '<head>';
echo '<meta charset="UTF-8">';
echo '<title>Gerar Hash</title>';
echo '</head>';
echo '<body style="font-family:Arial;padding:30px;">';

echo '<h2>Hash gerado</h2>';

echo '<p>Senha: <strong>F@rma2026</strong></p>';

echo '<p>Hash:</p>';

echo '<textarea style="width:700px;height:100px;font-size:16px;">';
echo htmlspecialchars($hash);
echo '</textarea>';

echo '</body>';
echo '</html>';