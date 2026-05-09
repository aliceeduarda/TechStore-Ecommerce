<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['usuario'])) {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Sessão expirada. Faça login novamente.']);
    exit;
}

include 'config.php'; // "Puxa" toda a conexão do banco de dados automaticamente

try {
    $dados = json_decode(file_get_contents('php://input'), true);

    if (!$dados) {
        echo json_encode(['sucesso' => false, 'mensagem' => 'Dados não recebidos.']);
        exit;
    }

    $novoEmail    = trim($dados['email']);
    $novoCelular  = trim($dados['celular']);
    $novoEndereco = trim($dados['endereco']);
    $idSessao = $_SESSION['usuario']; 

    $sql = "UPDATE usuarios SET email = ?, celular = ?, endereco = ? WHERE email = ? OR cpf = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $novoEmail,
        $novoCelular, 
        $novoEndereco, 
        $idSessao, 
        $idSessao
    ]);

  if ($stmt) {
        $_SESSION['usuario'] = $novoEmail; 

        echo json_encode(['sucesso' => true]);
    } else {
        echo json_encode(['sucesso' => false, 'mensagem' => 'Erro ao processar os dados no servidor.']);
    }

} catch (PDOException $e) {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Erro no Banco: ' . $e->getMessage()]);
}
?>