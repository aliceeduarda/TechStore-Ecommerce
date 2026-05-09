<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>Login Administrativo - TechStore</title>
    <link rel="stylesheet" href="style.css">
    <style>
        body { background: #f4f4f4; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .form-admin { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center; width: 320px; }
        .form-admin h2 { color: #333; margin-bottom: 25px; font-family: 'Raleway', sans-serif; }
        .form-admin input { width: 100%; padding: 12px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; }
        .form-admin button { width: 100%; padding: 12px; background: #ff9900; border: none; color: white; font-weight: bold; border-radius: 5px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="form-admin">
        <h2>Acesso Restrito</h2>
        <form onsubmit="fazerLoginAdmin(event)">
            <input type="text" id="admin-user" placeholder="E-mail ou CPF" required>
            <input type="password" id="admin-pass" placeholder="Senha" required>
            <button type="submit">Entrar no Sistema</button>
        </form>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    
    <script src="script.js"></script>
    <script>
        async function fazerLoginAdmin(event) {
            event.preventDefault();
            const identificador = document.getElementById('admin-user').value;
            const senha = document.getElementById('admin-pass').value;

            try {
                const resposta = await fetch('login_usuario.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ identificador, senha })
                });

                const resultado = await resposta.json();

                if (resultado.sucesso) {
                    // Só passa se for admin
                    if (resultado.nivel === 'admin') {
                        alertar("Sucesso", "Bem-vinda, Administradora!", "success");
                        localStorage.setItem('usuarioLogado', JSON.stringify({
                            nome: resultado.nome,
                            logado: true,
                            nivel: resultado.nivel
                        }));
                        window.location.href = 'dashboard.php'; 
                    } else {
                        alertar("Atenção","Acesso Negado: Esta área é exclusiva para administradores.", "error");
                    }
                } else {
                    alertar("Atenção", " Acesso negado.", "error");
                }
            } catch (erro) {
                alertar("Atenção","Erro ao conectar com o servidor.", "error");
            }
        }
    </script>
</body>
</html>