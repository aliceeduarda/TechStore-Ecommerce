<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();

if (!isset($_SESSION['logado']) || $_SESSION['nivel'] !== 'admin') {
    header("Location: conta.html"); 
    exit;
}
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>Painel Administrativo - TechStore</title>
    <link rel="stylesheet" href="style.css">
    <style>
        
        .form-admin { 
            max-width: 500px; 
            margin: 50px auto; 
            background: white; 
            padding: 30px; 
            border-radius: 8px; 
            box-shadow: 0 0 10px rgba(0,0,0,0.1); 
        }
        .form-admin input { 
            width: 100%; 
            padding: 10px; 
            margin: 10px 0; 
            border: 1px solid #ddd; 
            border-radius: 4px; 
        }
        .btn-logout {
            display: inline-block;
            margin-top: 20px;
            color: red;
            text-decoration: none;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <header>
        <h1>Painel Admin</h1>
        <div>
            <span>Bem-vinda, <?php echo $_SESSION['usuario']; ?>!</span>
            <a href="index.html" style="color:white; margin-left: 20px;">Ver Loja</a>
        </div>
    </header>

    <div class="form-admin">
        <h2>Cadastrar Novo Produto</h2>
        <p>Preencha os dados abaixo para enviar à vitrine:</p>
        
        <form action="salvar_produto.php" method="POST">
    <input type="text" name="nome" placeholder="Nome do Produto" required>
    
    <select name="categoria" required style="width: 100%; padding: 10px; margin: 10px 0;">
        <option value="">Selecione uma Categoria</option>
        <option value="PC Gamer">PC Gamer</option>
        <option value="Hardware">Hardware</option>
        <option value="Periféricos">Periféricos</option>
        <option value="Setup">Setup</option>
        <option value="Realidade Virtual">Realidade Virtual</option>
    </select>

    <input type="number" step="0.01" name="preco" placeholder="Preço (R$)" required>
    <input type="text" name="imagem" placeholder="Nome da imagem (ex: mouse.jpg)" required>
    <input type="text" name="imagem2" placeholder="Nome da imagem 2 (opcional)">
    
    <textarea name="descricao" placeholder="Descrição detalhada do produto" rows="4" style="width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px;"></textarea>
    
    <button type="submit">Publicar na Loja</button>
</form>

        <a href="logout.php" class="btn-logout">SAIR DO SISTEMA</a>
    </div>
</body>
</html>