<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['usuario'])) {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Login necessário']);
    exit;
}

include 'config.php'; // "Puxa" toda a conexão do banco de dados automaticamente

try {
    $dados = json_decode(file_get_contents('php://input'), true);

    if ($dados) {
        $produto_id = $dados['produto_id'];
        $usuario_email = $_SESSION['usuario']; 

        
        $check = $pdo->prepare("SELECT id FROM carrinho WHERE usuario_email = ? AND produto_id = ?");
        $check->execute([$usuario_email, $produto_id]);
        $itemExistente = $check->fetch();

        if ($itemExistente) {
            $sql = "UPDATE carrinho SET quantidade = quantidade + 1 WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$itemExistente['id']]);
        } else {
            $sql = "INSERT INTO carrinho (usuario_email, produto_id, quantidade) VALUES (?, ?, 1)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$usuario_email, $produto_id]);
        }

        echo json_encode(['sucesso' => true]);
    }
} catch (PDOException $e) {
    echo json_encode(['sucesso' => false, 'mensagem' => $e->getMessage()]);
}
?>