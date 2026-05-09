<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['usuario'])) {
    echo json_encode(['sucesso' => false, 'itens' => []]);
    exit;
}

include 'config.php'; // "Puxa" toda a conexão do banco de dados automaticamente



try {
    $usuario_email = $_SESSION['usuario'];

    // Faz um JOIN para pegar os dados do produto que estão na outra tabela
    $sql = "SELECT c.id, c.quantidade, p.nome, p.preco, p.imagem 
            FROM carrinho c 
            JOIN produtos p ON c.produto_id = p.id 
            WHERE c.usuario_email = ?";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$usuario_email]);
    $itens = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['sucesso' => true, 'itens' => $itens]);

} catch (PDOException $e) {
    echo json_encode(['sucesso' => false, 'mensagem' => $e->getMessage()]);
}
?>