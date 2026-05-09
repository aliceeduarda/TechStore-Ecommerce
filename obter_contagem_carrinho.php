<?php
session_start();
header('Content-Type: application/json');

// Verifica se existe um usuário na sessão
if (!isset($_SESSION['usuario'])) {
    echo json_encode(['sucesso' => true, 'quantidade' => 0]);
    exit;
}

include 'config.php'; // "Puxa" toda a conexão do banco de dados automaticamente

header('Content-Type: application/json');

try {
    $usuario_email = $_SESSION['usuario'];

    // Soma a coluna 'quantidade' de todos os itens do usuário
    $stmt = $pdo->prepare("SELECT SUM(quantidade) as total FROM carrinho WHERE usuario_email = ?");
    $stmt->execute([$usuario_email]);
    $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

    $total = $resultado['total'] ? (int)$resultado['total'] : 0;

    echo json_encode(['sucesso' => true, 'quantidade' => $total]);

} catch (PDOException $e) {
    echo json_encode(['sucesso' => false, 'mensagem' => $e->getMessage()]);
}
?>