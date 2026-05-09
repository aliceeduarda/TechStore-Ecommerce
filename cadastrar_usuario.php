<?php
ini_set('display_errors', 0); 
header('Content-Type: application/json');

$endereco_banco = '127.0.0.1';
$nome_banco     = 'loja_eletronicos';
$usuario_mysql  = 'root';
$senha_mysql    = '';

try {
    $pdo = new PDO("mysql:host=$endereco_banco;dbname=$nome_banco;charset=utf8", $usuario_mysql, $senha_mysql);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $json = file_get_contents("php://input");
    $dados = json_decode($json, true);

    if ($dados) {
        $nomeCompleto = trim($dados['nome']); 
        $partes = explode(' ', $nomeCompleto);

       if (count($partes) > 1) {
       $primeiroNome = $partes[0];
       $ultimoNome = end($partes); 
       $nomeCurto = $primeiroNome . ' ' . $ultimoNome; 
      } else {
          $nomeCurto = $partes[0];
      }

        $email   = $dados['email'];
        $cpf     = $dados['cpf'];
        $celular = isset($dados['celular']) ? $dados['celular'] : null;
        $endereco = $dados['endereco']; 
        $senha   = password_hash($dados['senha'], PASSWORD_DEFAULT);

        $check = $pdo->prepare("SELECT id FROM usuarios WHERE email = ? OR cpf = ?");
        $check->execute([$email, $cpf]);

        if ($check->rowCount() > 0) {
            echo json_encode(['sucesso' => false, 'mensagem' => 'E-mail ou CPF já cadastrados!']);
            exit;
        }

        $sql = "INSERT INTO usuarios (nome_completo, usuario, email, cpf, celular, senha, nivel, endereco) VALUES (?, ?, ?, ?, ?, ?, 'cliente', ?)";
        $stmt = $pdo->prepare($sql);
        
        $stmt->execute([
            $nomeCompleto, 
            $nomeCurto, 
            $email, 
            $cpf, 
            $celular, 
            $senha,
            $endereco
        ]);

        echo json_encode(['sucesso' => true]);
    } else {
        echo json_encode(['sucesso' => false, 'mensagem' => 'Dados de formulário não recebidos.']);
    }

} catch (PDOException $e) {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Erro no Banco: ' . $e->getMessage()]);
}
?>