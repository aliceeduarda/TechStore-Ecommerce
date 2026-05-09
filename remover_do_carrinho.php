<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['usuario'])) {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Sessão expirada.']);
    exit;
}

include 'config.php'; // "Puxa" toda a conexão do banco de dados automaticamente

try {
    $dados = json_decode(file_get_contents('php://input'), true);

    if ($dados) {
        $carrinho_id = $dados['carrinho_id'];
        $usuario_email = $_SESSION['usuario'];

        // Deleta garantindo que o item pertence ao usuário logado
        $stmt = $pdo->prepare("DELETE FROM carrinho WHERE id = ? AND usuario_email = ?");
        $stmt->execute([$carrinho_id, $usuario_email]);

        echo json_encode(['sucesso' => true]);
    }
} catch (PDOException $e) {
    echo json_encode(['sucesso' => false, 'mensagem' => $e->getMessage()]);
}
?>