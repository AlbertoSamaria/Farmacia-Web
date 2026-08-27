# Farmácia Web

Sistema web de gestão de farmácia para XAMPP + PHP 8 + MySQL/MariaDB.

## Módulos incluídos
- Login e controlo de sessão
- Perfis: Administrador, Farmacêutico, Operador
- Dashboard com indicadores
- Produtos/medicamentos
- Categorias
- Clientes
- Fornecedores
- Entradas/compras
- Vendas
- Controlo de stock
- Alertas de stock mínimo e validade
- Caixa
- Faturas/recibos
- Relatórios
- Utilizadores

## Instalação
1. Copie a pasta `farmacia_web` para `C:\xampp\htdocs\`.
2. Abra o XAMPP e inicie Apache e MySQL.
3. Aceda ao phpMyAdmin.
4. Importe `database/farmacia.sql`.
5. Abra `http://localhost/farmacia_web/`.
6. Login inicial:
  

## Estrutura
### Interface
- `index.html` login
- `dashboard.html` painel principal
- `produtos.html`, `vendas.html`, `compras.html` operações
- `clientes.html`, `fornecedores.html`, `utilizadores.html` cadastros
- `stock.html`, `caixa.html`, `faturas.html`, `relatorios.html` consultas e controlo

### Código partilhado
- `js/app.js` autenticação da página, chamadas à API e formatação de moeda
- `js/auth.js` login e logout
- `js/dashboard.js`, `js/produtos.js`, `js/vendas.js`, `js/compras.js`, `js/stock.js` lógica de cada módulo
- `css/style.css` estilos globais

### Servidor e dados
- `api/` endpoints PHP
- `config/database.php` ligação PDO à base de dados
- `database/farmacia.sql` esquema e dados iniciais
- `api/gerar_hash.php` ferramenta auxiliar para gerar hashes de palavras-passe

O ficheiro `gerar_hash.php` na raiz é uma cópia legada da ferramenta. Use `api/gerar_hash.php` para evitar manter duas versões.

## Nota
Este projeto é uma base funcional para desenvolvimento. Antes de uso em produção, implemente HTTPS, gestão segura de palavras-passe, auditoria, backups automáticos, permissões granulares e adequação às regras fiscais/sanitárias aplicáveis em Angola.
