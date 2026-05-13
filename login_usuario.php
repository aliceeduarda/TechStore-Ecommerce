<?php

ini_set('display_errors', 0);
header('Content-Type: application/json');

include 'config.php'; 

try {
   
    $json = file_get_contents("php://input");
    $dados = json_decode($json, true);

    if ($dados) {
        $identificador = $dados['identificador']; // E-mail ou CPF
        $senhaDigitada = $dados['senha'];

        // Busca o usuário por E-mail OU CPF
        $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = ? OR cpf = ?");
        $stmt->execute([$identificador, $identificador]);
        $usuarioEncontrado = $stmt->fetch(PDO::FETCH_ASSOC);

        // Verifica a senha usando a criptografia 
        if ($usuarioEncontrado && password_verify($senhaDigitada, $usuarioEncontrado['senha'])) {
            
            session_start();
            $_SESSION['logado'] = true;
            $_SESSION['usuario'] = $usuarioEncontrado['email'];
            $_SESSION['nome_exibicao'] = $usuarioEncontrado['usuario'];
            $_SESSION['nivel']   = $usuarioEncontrado['nivel'];

           echo json_encode([
              'sucesso' => true,
              'nome' => $usuarioEncontrado['usuario'],
              'nome_completo' => $usuarioEncontrado['nome_completo'],
              'cpf' => $usuarioEncontrado['cpf'],
              'email' => $usuarioEncontrado['email'],
              'celular' => $usuarioEncontrado['celular'],
              'endereco' => $usuarioEncontrado['endereco'],
              'nivel' => $usuarioEncontrado['nivel']
]);
        } else {
            echo json_encode(['sucesso' => false, 'mensagem' => 'E-mail/CPF ou senha incorretos.']);
        }
    } else {
        echo json_encode(['sucesso' => false, 'mensagem' => 'Dados de login não recebidos.']);
    }

} catch (PDOException $e) {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Erro de conexão: ' . $e->getMessage()]);
}
?>