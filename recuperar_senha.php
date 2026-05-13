<?php

ini_set('display_errors', 0);
header('Content-Type: application/json; charset=utf-8');

include 'config.php'; 

try {
    
    $json = file_get_contents("php://input");
    $dados = json_decode($json, true);

    if (!$dados || empty($dados['email']) || empty($dados['cpf']) || empty($dados['novaSenha'])) {
        echo json_encode(['sucesso' => false, 'mensagem' => 'Preencha todos os campos corretamente.']);
        exit;
    }

    $email = trim($dados['email']);
    $cpf = trim($dados['cpf']);
    $novaSenhaHash = password_hash($dados['novaSenha'], PASSWORD_DEFAULT);

    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ? AND cpf = ?");
    $stmt->execute([$email, $cpf]);
    
    if ($stmt->rowCount() > 0) {
        $update = $pdo->prepare("UPDATE usuarios SET senha = ? WHERE email = ? AND cpf = ?");
        $update->execute([$novaSenhaHash, $email, $cpf]);
        
        echo json_encode(['sucesso' => true, 'mensagem' => 'Senha atualizada com sucesso!']);
    } else {
        echo json_encode(['sucesso' => false, 'mensagem' => 'Os dados informados não conferem com nossos registros.']);
    }

} catch (PDOException $e) {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>