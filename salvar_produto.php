<?php
session_start();
header('Content-Type: text/html; charset=utf-8');

//  Segurança: Só admin entra
if (!isset($_SESSION['logado']) || $_SESSION['nivel'] !== 'admin') {
    die("Acesso negado.");
}

include 'config.php'; // "Puxa" toda a conexão do banco de dados automaticamente


try {
    //  Coleta os dados do POST
    $nome = $_POST['nome'];
    $preco = $_POST['preco'];
    $imagem = $_POST['imagem'];
    $imagem2 = $_POST['imagem2'] ?? '';
    $descricao = $_POST['descricao'];
    $categoria = $_POST['categoria'];

    // Execução Segura 
    $sql = "INSERT INTO produtos (nome, categoria, preco, imagem, imagem2, descricao) 
            VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    
    if ($stmt->execute([$nome, $categoria, $preco, $imagem, $imagem2, $descricao])) {
        echo "<script>
                alertar('Produto cadastrado com sucesso!');
                window.location.href='admin.php';
              </script>";
    }

} catch (PDOException $e) {
    echo "Erro ao cadastrar: " . $e->getMessage();
}
?>