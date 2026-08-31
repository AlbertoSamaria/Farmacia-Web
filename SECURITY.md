# 🔐 Guia de Segurança - Autenticação com $_SESSION + Tokens CSRF

## O que foi implementado

### 1. **Sessões PHP (`$_SESSION`)**
   - Substituiu `sessionStorage` (inseguro, fica no cliente)
   - Dados da sessão ficam no servidor
   - Cookies HTTP-only (não podem ser acessados por JavaScript)
   - Expiração automática após 1 hora

### 2. **Tokens CSRF (Cross-Site Request Forgery)**
   - Cada sessão gera um token único
   - Obrigatório para POST, PUT, DELETE
   - Previne ataques onde alguém força ações em nome do usuário

### 3. **Middleware de Proteção**
   - `protegerRota()` - Verifica autenticação
   - `validarCSRF()` - Valida token em requisições que modificam dados
   - `protegerRotaSegura()` - Combina ambas

---

## Arquivos criados/modificados

### ✅ Criados:
- `config/auth.php` - Gerencia sessões e tokens CSRF
- `config/middleware.php` - Middleware de proteção
- `api/auth-info.php` - Endpoint para verificar autenticação
- `api/logout.php` - Endpoint para fazer logout

### ✅ Modificados:
- `api/login.php` - Agora usa `$_SESSION`
- `js/auth.js` - Gerencia login/logout com cookies
- `js/app.js` - Inclui token CSRF nas requisições
- `api/produtos.php` - Exemplo de como usar middleware
- `api/dashboard.php` - Outro exemplo

---

## Como proteger os outros endpoints

Para cada arquivo em `api/`, adicione no início:

```php
<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/middleware.php';

header('Content-Type: application/json; charset=utf-8');

try {
    // Protege a rota
    protegerRota();

    // Se for POST/PUT/DELETE, também valida CSRF
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        validarCSRF();
    }

    // ... seu código aqui ...

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'sucesso' => false,
        'mensagem' => 'Erro ao processar requisição.'
    ], JSON_UNESCAPED_UNICODE);
}
```

---

## Endpoints a atualizar

No seu projeto, atualize os seguintes arquivos em `api/`:

1. ✅ `login.php` - JÁ FEITO
2. ✅ `dashboard.php` - JÁ FEITO
3. ✅ `produtos.php` - JÁ FEITO
4. ⏳ `vendas.php`
5. ⏳ `compras.php`
6. ⏳ `stock.php`
7. ⏳ `faturas.php`
8. ⏳ `relatorios.php`
9. ⏳ `utilizadores.php`
10. ⏳ `fornecedores.php`

---

## Fluxo de autenticação

```
1. Usuário faz login
   └─> api/login.php verifica credenciais
   └─> Cria $_SESSION['usuario']
   └─> Gera token CSRF
   └─> Retorna token CSRF ao cliente

2. Cliente armazena token CSRF em localStorage
   (localStorage é OK pois token não é sensível, é apenas para CSRF)

3. Client faz requisições protegidas
   └─> Inclui token CSRF no header X-CSRF-Token
   └─> Middleware valida token
   └─> Se válido, continua
   └─> Se inválido, retorna erro 403

4. Usuário faz logout
   └─> api/logout.php destrói sessão
   └─> Cliente limpa localStorage
```

---

## Testes para validar

### ✅ Login e Dashboard
```bash
# 1. Fazer login
curl -X POST http://localhost/farmacia_web/api/login.php \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}' \
  -c cookies.txt

# 2. Verificar autenticação
curl -X GET http://localhost/farmacia_web/api/auth-info.php \
  -b cookies.txt

# 3. Acessar dashboard (vai retornar erro se não autenticado)
curl -X GET http://localhost/farmacia_web/api/dashboard.php \
  -b cookies.txt
```

### ❌ Teste CSRF
```bash
# Tente POST sem token CSRF (deve retornar erro 403)
curl -X POST http://localhost/farmacia_web/api/produtos.php \
  -H "Content-Type: application/json" \
  -d '{"nome":"Produto Teste"}' \
  -b cookies.txt
```

---

## Variáveis de ambiente (próximo passo)

Para melhorar ainda mais, você deve criar um arquivo `.env`:

```
DB_HOST=127.0.0.1
DB_NAME=farmacia_web
DB_USER=root
DB_PASS=

SESSION_TIMEOUT=3600
HTTPS_ONLY=false  # true em produção
```

---

## Resumo das melhorias

| Aspecto | Antes | Depois |
|---------|-------|--------|
| Autenticação | sessionStorage (cliente) | `$_SESSION` (servidor) |
| Proteção CSRF | Nenhuma | Token CSRF obrigatório |
| Cookies | Vulnerável | HTTP-only + SameSite=Strict |
| Expiração | Nenhuma | 1 hora automática |
| Proteção API | Nenhuma | Middleware em todos endpoints |

---

## Próximas etapas

1. ✅ **FEITO**: Implementar `$_SESSION` + Tokens CSRF
2. ⏳ Adicionar logging de operações
3. ⏳ Implementar `.env` para configurações
4. ⏳ Rate limiting
5. ⏳ Backup automático

