if (history.scrollRestoration) {
  history.scrollRestoration = "manual";
}

window.scrollTo(0, 0);
// Variáveis Globais
let todosOsProdutos = [];
let produtosFiltrados = [];
let paginaAtual = 1;
const produtosPorPagina = 6;
let categoriaAtual = "todos";
let slideAtual = 0;
let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

// Carregamento de Dados
async function carregarProdutos() {
  const urlParams = new URLSearchParams(window.location.search);
  try {
    const resposta = await fetch("get_produtos.php");
    todosOsProdutos = await resposta.json();

    const urlParams = new URLSearchParams(window.location.search);
    const idProduto = urlParams.get("id");

    if (idProduto) {
      exibirDetalhes(idProduto);
    } else {
      const catParam = urlParams.get("cat");
      if (catParam) categoriaAtual = catParam;

      const pageParam = urlParams.get("page");
      paginaAtual = pageParam ? parseInt(pageParam) : 1;

      processarProdutos();
    }
  } catch (erro) {
    console.error("Erro ao carregar produtos:", erro);
  }

  const buscaParam = urlParams.get("busca");
  if (buscaParam) {
    document.getElementById("campo-busca").value = buscaParam;
    setTimeout(() => filtrarProdutos(), 500);
  }
}

// IR PARA HOME
function irParaHome() {
  window.location.href = "index.html";
}

// Desenhar a Vitrine
function exibirProdutos(lista) {
  const vitrine = document.getElementById("vitrine");
  if (!vitrine) return;
  vitrine.innerHTML = "";

  lista.forEach((produto) => {
    const precoOriginal = parseFloat(produto.preco);
    const precoPix = precoOriginal * 0.9;
    const valorParcela = precoOriginal / 12;

    const card = document.createElement("div");
    card.classList.add("produto-card");

    card.innerHTML = `
    <div class="categoria-tag">${produto.categoria}</div>
    <a href="produto.html?id=${produto.id}">
        <img src="img/${produto.imagem}" alt="${produto.nome}">
        <h3>${produto.nome}</h3>
    </a>
    
    <div class="container-preco-vitrine">
        <p class="preco-pix">R$ ${precoPix.toFixed(2)}</p>
        <p class="metodo-pagamento">no PIX ou</p>
        <p class="preco-parcelado">R$ ${precoOriginal.toFixed(2)}</p>
        <p class="parcelamento">em até 12x de R$ ${valorParcela.toFixed(2)} sem juros</p>
    </div>

    <button onclick="adicionarAoCarrinho('${produto.id}') ">Comprar</button>
`;

    vitrine.appendChild(card);
  });
}

// LÓGICA DE FILTRO E ORDENAÇÃO
function filtrarCategoria(categoria) {
  categoriaAtual = categoria;
  processarProdutos();
}

function ordenarProdutos() {
  processarProdutos();
}

function processarProdutos() {
  if (todosOsProdutos.length === 0) return;

  const novaURL = new URL(window.location);
  novaURL.searchParams.set("cat", categoriaAtual);
  novaURL.searchParams.set("page", paginaAtual);
  window.history.pushState({}, "", novaURL);

  // FILTRAGEM
  produtosFiltrados =
    categoriaAtual === "todos"
      ? [...todosOsProdutos]
      : todosOsProdutos.filter((p) => p.categoria === categoriaAtual);

  // ORDENAÇÃO
  const selectOrdenar = document.getElementById("ordenar");
  if (selectOrdenar) {
    const criterio = selectOrdenar.value;
    if (criterio === "az") {
      produtosFiltrados.sort((a, b) => a.nome.localeCompare(b.nome));
    } else if (criterio === "za") {
      produtosFiltrados.sort((a, b) => b.nome.localeCompare(a.nome));
    } else if (criterio === "preco-crescente") {
      produtosFiltrados.sort(
        (a, b) => parseFloat(a.preco) - parseFloat(b.preco),
      );
    } else if (criterio === "preco-decrescente") {
      produtosFiltrados.sort(
        (a, b) => parseFloat(b.preco) - parseFloat(a.preco),
      );
    }
  }

  paginaAtual = 1;
  renderizarPagina();
}

// Botões dinamicamente no final da vitrine
function renderizarPagina() {
  const novaURL = new URL(window.location);
  novaURL.searchParams.set("page", paginaAtual);
  window.history.pushState({}, "", novaURL);

  const inicio = (paginaAtual - 1) * produtosPorPagina;
  const fim = inicio + produtosPorPagina;
  const produtosExibir = produtosFiltrados.slice(inicio, fim);

  exibirProdutos(produtosExibir);
  criarBotoesPaginacao();
}

function criarBotoesPaginacao() {
  const totalPaginas = Math.ceil(produtosFiltrados.length / produtosPorPagina);
  const container = document.getElementById("paginacao");

  if (!container) return;
  container.innerHTML = "";

  if (totalPaginas <= 1) return;

  for (let i = 1; i <= totalPaginas; i++) {
    const num = document.createElement("button");
    num.innerText = i;
    num.classList.add("btn-paginacao");

    if (i === paginaAtual) {
      num.classList.add("ativo");
    }

    num.onclick = () => {
      paginaAtual = i;
      renderizarPagina();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    container.appendChild(num);
  }
}

// BUSCA EM TEMPO REAL
const campoBusca = document.getElementById("campo-busca");
if (campoBusca) {
  campoBusca.addEventListener("input", function (e) {
    const termoBusca = e.target.value.toLowerCase();
    const cards = document.querySelectorAll(".produto-card");
    cards.forEach((card) => {
      const nomeProduto = card.querySelector("h3").innerText.toLowerCase();
      card.style.display = nomeProduto.includes(termoBusca) ? "block" : "none";
    });
  });
}

// CARRINHO
function toggleCarrinho() {
  document
    .getElementById("carrinho-lateral")
    .classList.toggle("carrinho-fechado");
}

async function adicionarAoCarrinho(produtoId) {
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

  if (!usuarioLogado) {
    alertar(
      "Atenção",
      "Ops! Você precisa estar logado para adicionar itens ao carrinho.",
    );
    window.location.href = "conta.html";
    return;
  }

  try {
    const resposta = await fetch("atualizar_carrinho.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        produto_id: produtoId,
      }),
    });

    const resultado = await resposta.json();

    if (resultado.sucesso) {
      await atualizarIconeCarrinho();

      if (typeof renderizarCarrinho === "function") {
        renderizarCarrinho();
      }
    } else {
      alertar("Atenção", "Erro: ", resultado.mensagem, "error");
    }
  } catch (erro) {
    console.error("Erro ao conectar com o servidor:", erro);
    alertar(
     "Erro de Conexão",
      "Não foi possível adicionar ao carrinho. Verifique sua rede.",
      "warning"
    );
  }
}

async function removerDoCarrinhoBD(carrinhoId) {
    const confirmacao = await Swal.fire({
        title: 'Remover item?',
        text: "O produto será retirado do seu carrinho.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#aeaeae',
        cancelButtonColor: 'rgb(24, 144, 249)',
        confirmButtonText: 'Sim, remover',
        cancelButtonText: 'Cancelar'
    });

    if (confirmacao.isConfirmed) {
        try {
            const resposta = await fetch('remover_do_carrinho.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ carrinho_id: carrinhoId })
            });
            const resultado = await resposta.json();

            if (resultado.sucesso) {
                await atualizarIconeCarrinho();
                renderizarCarrinho();
                Swal.fire({ title: 'Removido!', icon: 'success', timer: 1500, showConfirmButton: false });
            }
        } catch (erro) {
            alertar("Erro", "Não foi possível remover o item.", "error");
        }
    }
}

async function atualizarIconeCarrinho() {
  try {
    const resposta = await fetch("obter_contagem_carrinho.php");
    const dados = await resposta.json();

    if (dados.sucesso) {
      const spanQtd = document.getElementById("qtd-itens");
      if (spanQtd) {
        spanQtd.innerText = dados.quantidade;
      }
    }
  } catch (erro) {
    console.error("Erro ao atualizar ícone do carrinho:", erro);
  }
}

// Executa a função assim que a página carrega
document.addEventListener("DOMContentLoaded", atualizarIconeCarrinho);

function removerDoCarrinho(index) {
  carrinho.splice(index, 1);
  salvarEAtualizar();
}

function salvarEAtualizar() {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  renderizarCarrinho();
}

async function renderizarCarrinho() {
  const listaItens = document.getElementById("itens-carrinho");
  const totalTela = document.getElementById("valor-total");

  if (!listaItens) return;

  try {
    const resposta = await fetch("obter_itens_carrinho.php");
    const dados = await resposta.json();

    if (dados.sucesso) {
      listaItens.innerHTML = "";
      let somaTotal = 0;

      dados.itens.forEach((item) => {
        const preco = parseFloat(item.preco);
        const subtotal = preco * item.quantidade;
        somaTotal += subtotal;

        const div = document.createElement("div");
        div.className = "item-no-carrinho";
        div.innerHTML = `
                    <img src="img/${item.imagem}" class="img-carrinho">
                    <div class="info-item-carrinho">
                        <strong>${item.nome}</strong>
                        <span>${item.quantidade}x R$ ${parseFloat(item.preco).toFixed(2)}</span>
                    </div>
                    <button onclick="removerDoCarrinhoBD(${item.id})" class="btn-remover">&times;</button>
                `;
        listaItens.appendChild(div);
      });

      if (totalTela) totalTela.innerText = somaTotal.toFixed(2);
    }
  } catch (erro) {
    console.error("Erro ao renderizar carrinho:", erro);
  }
}

// PÁGINA DE DETALHES
async function exibirDetalhes(id) {
  const areaDetalhes = document.getElementById("detalhes-produto");
  if (!areaDetalhes) return;

  if (typeof todosOsProdutos === "undefined" || todosOsProdutos.length === 0) {
    try {
      const resposta = await fetch("get_produtos.php");
      todosOsProdutos = await resposta.json();
    } catch (erro) {
      console.error("Erro ao buscar produtos:", erro);
      areaDetalhes.innerHTML = "<p>Erro ao carregar os dados do produto.</p>";
      return;
    }
  }

  const produto = todosOsProdutos.find((p) => p.id == id);

  if (produto) {
    // Lógica de Preço
    const precoOriginal = parseFloat(produto.preco);
    const precoPix = precoOriginal * 0.9;
    const valorParcela = precoOriginal / 12;

    // 2. INJEÇÃO DO HTML
    areaDetalhes.innerHTML = `
            <div class="produto-detalhe-wrapper">
                <div class="secao-principal">
                    <div class="fotos-coluna">
                        <div class="slider-container">
                            <button class="seta seta-esquerda" onclick="mudarFoto(-1)">&#10094;</button>
                            <div class="slider-viewport">
                                <div class="slider-track" id="slider-track">
                                    <img src="img/${produto.imagem}" class="foto-slider" onclick="abrirZoom(this.src)">
                                    ${produto.imagem2 ? `<img src="img/${produto.imagem2}" class="foto-slider" onclick="abrirZoom(this.src)">` : ""}
                                </div>
                            </div>
                            <button class="seta seta-direita" onclick="mudarFoto(1)">&#10095;</button>
                        </div>
                    </div>

                    <div class="info-coluna">
                        <p class="categoria-badge">${produto.categoria}</p>
                        <h1>${produto.nome}</h1>
                        <hr>
                        
                        <div class="container-preco-detalhes">
                            <h2 class="preco-pix-grande">R$ ${precoPix.toFixed(2)}</h2>
                            <p class="metodo-pix">À VISTA NO PIX (10% OFF)</p>
                            <p class="preco-ou">ou <strong>R$ ${precoOriginal.toFixed(2)}</strong> em até 12x de R$ ${valorParcela.toFixed(2)} sem juros</p>
                        </div>

                        <button class="btn-comprar-grande" onclick="adicionarAoCarrinho('${produto.id}', '${produto.nome}', ${produto.preco}, '${produto.imagem}')">
                            ADICIONAR AO CARRINHO
                        </button>
                    </div>
                </div>

                <div class="descricao-completa-container">
                    <h2>Informações do Produto</h2>
                    <p class="descricao-texto">${produto.descricao}</p>
                </div>
            </div>
        `;
    slideAtual = 0;
  } else {
    areaDetalhes.innerHTML = "<h2>Produto não encontrado!</h2>";
  }
}

function mudarFoto(direcao) {
  const track = document.getElementById("slider-track");
  if (!track) return;
  const fotos = track.querySelectorAll(".foto-slider");
  slideAtual = (slideAtual + direcao + fotos.length) % fotos.length;
  track.style.transform = `translateX(${slideAtual * -100}%)`;
}

function abrirZoom(src) {
  const modal = document.createElement("div");
  modal.id = "modal-zoom";
  modal.onclick = fecharZoom;

  const img = document.createElement("img");
  img.src = src;
  img.classList.add("img-zoom-aberta");

  const btnFechar = document.createElement("span");
  btnFechar.innerHTML = "&times;";
  btnFechar.classList.add("btn-fechar-zoom");

  modal.appendChild(btnFechar);
  modal.appendChild(img);
  document.body.appendChild(modal);
}

function fecharZoom() {
  const modal = document.getElementById("modal-zoom");
  if (modal) modal.remove();
}

// Frase de efeito
function iniciarAnimacaoTitulo() {
  const fancyHeading = document.querySelector(".fancy");
  if (!fancyHeading) return;

  const textoOriginal = fancyHeading.textContent.trim();
  const letras = textoOriginal.split("");
  const novoConteudo = letras
    .map((char) => {
      const delay = Math.floor(Math.random() * 1000 + 1);
      return `<span style="animation-delay: ${delay}ms">${char === " " ? "&nbsp;" : char}</span>`;
    })
    .join("");

  fancyHeading.innerHTML = novoConteudo;
}

// Pop-up Dúvida

function abrirModalDuvida() {
  document.getElementById("modal-duvida").style.display = "flex";
}

function fecharModalDuvida() {
  document.getElementById("modal-duvida").style.display = "none";
}

async function setupPagina() {
  verificarStatusLogin();
  await atualizarIconeCarrinho();
  if (typeof renderizarCarrinho === "function") {
    renderizarCarrinho();
  }

  iniciarAnimacaoTitulo();
}

// Fecha o modal se o usuário clicar fora dele
window.onclick = function (event) {
  const modal = document.getElementById("modal-duvida");
  if (event.target == modal) {
    fecharModalDuvida();
  }
};

// Logica de envio do form
document
  .getElementById("form-duvida")
  ?.addEventListener("submit", function (e) {
    e.preventDefault();
    alertar(
      "Atenção",
      "Sua dúvida foi enviada! Entraremos em contato em breve.",
    );
    fecharModalDuvida();
    this.reset();
  });

// 11. Função para validar o algoritmo do CPF
function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, "");
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;

  let soma = 0,
    resto;
  for (let i = 1; i <= 9; i++)
    soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++)
    soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;

  return true;
}

// ABAS DE CADASTRO E LOGIN
function alternarAuth(tipo) {
  const loginForm = document.getElementById("form-login");
  const cadForm = document.getElementById("form-cadastro");
  const recForm = document.getElementById("form-recuperar");
  const btnLogin = document.getElementById("btn-tab-login");
  const btnCad = document.getElementById("btn-tab-cadastro");

  loginForm.style.display = "none";
  cadForm.style.display = "none";
  recForm.style.display = "none";

  btnLogin.classList.remove("active");
  btnCad.classList.remove("active");

  if (tipo === "login") {
    loginForm.style.display = "block";
    btnLogin.classList.add("active");
  } else if (tipo === "cadastro") {
    cadForm.style.display = "block";
    btnCad.classList.add("active");
  } else if (tipo === "recuperar") {
    recForm.style.display = "block";
  }
}

// Função de Cadastro
async function fazerCadastro(event) {
  event.preventDefault();

  const nome = document.getElementById("cad-nome").value;
  const email = document.getElementById("cad-email").value;
  const cpf = document.getElementById("cad-cpf").value;
  const senha = document.getElementById("cad-senha").value;
  const celular = document.getElementById("cad-celular").value;
  const endereco = document.getElementById("cad-endereco").value;

  // Validação de segurança (Algoritmo do CPF)
  if (!validarCPF(cpf)) {
    alertar(
      "Atenção",
      "O CPF digitado é inválido. Por favor, verifique os números.",
    );
    return;
  }

  // Validação básica de senha
  if (senha.length < 6) {
    alertar("Atenção", "A senha deve ter pelo menos 6 caracteres.", "warning");
    return;
  }

  // Validação de Endereço
  if (endereco.trim().length < 5) {
    alertar("Atenção", "Por favor, digite um endereço completo.", "warning");
    return;
  }

  try {
    const resposta = await fetch("cadastrar_usuario.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, cpf, senha, celular, endereco }),
    });

    const resultado = await resposta.json();

    if (resultado.sucesso) {
      alertar(
        "Atenção",
        "Conta criada com sucesso! Agora você já pode fazer login.", "success"
      );
      alternarAuth("login");
    } else {
      alertar("Atenção", resultado.mensagem, "error");
    }
  } catch (erro) {
    console.error("Erro no cadastro:", erro);
    alertar("Atenção", "Erro ao conectar com o servidor.", "error");
  }
}

// Login
async function fazerLogin(event) {
  event.preventDefault();

  const identificador = document.getElementById("login-identificador").value;
  const senha = document.getElementById("login-senha").value;

  try {
    const resposta = await fetch("login_usuario.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identificador, senha }),
    });

    const resultado = await resposta.json();

    if (resultado.sucesso) {
      localStorage.setItem(
        "usuarioLogado",
        JSON.stringify({
          nome: resultado.nome,
          nome_completo: resultado.nome_completo,
          cpf: resultado.cpf,
          logado: true,
          nivel: resultado.nivel,
          email: resultado.email,
          celular: resultado.celular,
          endereco: resultado.endereco,
        }),
      );

      if (resultado.nivel === "admin") {
        alertar("Atenção", "Bem-vinda, Administradora!", "success");
      }

      window.location.href = "index.html";
    } else {
      alertar("Atenção", resultado.mensagem, "error");
    }
  } catch (erro) {
    console.error("Erro técnico:", erro);
    alertar("Atenção", "Erro ao conectar com o servidor.", "error");
  }
}

function verificarStatusLogin() {
  const dados = localStorage.getItem("usuarioLogado");
  const spanNome = document.getElementById("link-login-header");

  const leitura = document.getElementById("dados-leitura");
  const edicao = document.getElementById("dados-edicao");

  if (dados) {
    const usuario = JSON.parse(dados);

    if (usuario && usuario.logado) {
      const primeiroNome = usuario.nome
        ? usuario.nome.split(" ")[0]
        : "Usuário";
      if (spanNome) {
        spanNome.innerText = "Olá, " + primeiroNome;
      }

      // Preenche o painel (Visualização)
      const nomeEx = document.getElementById("user-nome-exibicao");
      const nomeCompletoEx = document.getElementById(
        "user-nome-completo-exibicao",
      );
      const cpfEx = document.getElementById("user-cpf-exibicao");
      const emailEx = document.getElementById("user-email-exibicao");
      const celularEx = document.getElementById("user-celular-exibicao");
      const enderecoEx = document.getElementById("user-endereco-exibicao");

      if (nomeEx) nomeEx.innerText = usuario.nome || "Não informado";
      if (nomeCompletoEx)
        nomeCompletoEx.innerText = usuario.nome_completo || "Não informado";
      if (cpfEx) cpfEx.innerText = usuario.cpf || "Não informado";
      if (emailEx) emailEx.innerText = usuario.email || "Não informado";
      if (celularEx) celularEx.innerText = usuario.celular || "Não informado";
      if (enderecoEx)
        enderecoEx.innerText = usuario.endereco || "Não informado";

      // Preenche os campos de EDIÇÃO
      const editEmail = document.getElementById("edit-email");
      const editCelular = document.getElementById("edit-celular");
      const editEndereco = document.getElementById("edit-endereco");

      if (editEmail) editEmail.value = usuario.email || "";
      if (editCelular) editCelular.value = usuario.celular || "";
      if (editEndereco) editEndereco.value = usuario.endereco || "";

      // Reset de Layout: Garante que a edição comece ESCONDIDA ao logar
      if (leitura) leitura.style.display = "block";
      if (edicao) edicao.style.display = "none";

      // Controle de visibilidade das seções (Login vs Painel)
      const secaoAuth = document.getElementById("secao-auth");
      const painelUser = document.getElementById("painel-usuario");
      if (secaoAuth) secaoAuth.style.display = "none";
      if (painelUser) painelUser.style.display = "block";

      // 6. Lógica de ADMIN
      const cardAdmin = document.getElementById("card-admin");
      if (cardAdmin) {
        cardAdmin.style.display = usuario.nivel === "admin" ? "block" : "none";
      }
    }
  } else {
    if (spanNome) spanNome.innerText = "Login";
    const painelUser = document.getElementById("painel-usuario");
    if (painelUser) painelUser.style.display = "none";
  }
}

// Controle da interface de edição
function toggleEdicao(mostrar) {
  const leitura = document.getElementById("dados-leitura");
  const edicao = document.getElementById("dados-edicao");

  if (leitura && edicao) {
    leitura.style.display = mostrar ? "none" : "block";
    edicao.style.display = mostrar ? "block" : "none";

    if (mostrar) {
      const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
      if (usuario) {
        document.getElementById("edit-email").value = usuario.email || "";
        document.getElementById("edit-celular").value = usuario.celular || "";
        document.getElementById("edit-endereco").value = usuario.endereco || "";
      }
    }
  }
}

async function salvarEdicao() {
  const inputEmail = document.getElementById("edit-email");
  const inputCelular = document.getElementById("edit-celular");
  const inputEndereco = document.getElementById("edit-endereco");

  if (!inputEmail || inputEmail.value.trim() === "") {
    alertar("Atenção", "O campo e-mail é obrigatório.", "warning");
    return;
  }

  const dadosParaEnviar = {
    email: inputEmail.value.trim(),
    celular: inputCelular ? inputCelular.value.trim() : "",
    endereco: inputEndereco ? inputEndereco.value.trim() : "",
  };

  try {
    const resposta = await fetch("atualizar_perfil.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosParaEnviar),
    });

    const resultado = await resposta.json();

    if (resultado.sucesso) {
      let dadosLocais = JSON.parse(localStorage.getItem("usuarioLogado")) || {};
      const novosDadosLocais = { ...dadosLocais, ...dadosParaEnviar };
      localStorage.setItem("usuarioLogado", JSON.stringify(novosDadosLocais));

      alertar("Sucesso!", "Perfil atualizado com sucesso!", "success");
    
      setTimeout(() => window.location.reload(), 2000); 
      
    } else {
      alertar("Atenção", "Erro: ", resultado.mensagem, "error"); 
    }

  } catch (erro) {
    console.error("Erro técnico:", erro);
    alertar("Atenção", "Erro ao conectar com o servidor.", "error");
  }
}

async function solicitarNovaSenha(event) {
  event.preventDefault();

  const email = document.getElementById("rec-email").value;
  const cpf = document.getElementById("rec-cpf").value;
  const novaSenha = document.getElementById("rec-nova-senha").value;

  try {
    const resposta = await fetch("recuperar_senha.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, cpf, novaSenha }),
    });

    const resultado = await resposta.json();

    if (resultado.sucesso) {
      alertar("Sucesso!", "Sua senha foi alterada. Você já pode fazer login!", "success");
      
      setTimeout(() => {
          alternarAuth("login");
      }, 2000);
    } else {
      alertar("Ops!", resultado.mensagem, "error");
    }
  } catch (erro) {
    alertar("Erro", "Não foi possível conectar ao servidor de recuperação.", "error");
  }
}

function fazerLogout() {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "index.html";
}

// Dispara a busca levando o termo na URL para a index
function dispararBusca() {
  const campo = document.getElementById("campo-busca");
  if (!campo) return;

  const termo = campo.value.trim();
  if (termo !== "") {
    window.location.href = `index.html?busca=${encodeURIComponent(termo)}`;
  }
}

function verificarEnter(event) {
  if (event.key === "Enter") {
    dispararBusca();
  }
}

// Filtra os produtos que já estão na tela (DOM)
function filtrarProdutos() {
  const termo = document.getElementById("campo-busca").value.toLowerCase();
  if (
    !window.location.pathname.includes("index.html") &&
    window.location.pathname !== "/"
  ) {
    window.location.href = `index.html?busca=${termo}`;
    return;
  }

  produtosFiltrados = todosOsProdutos.filter(
    (produto) =>
      produto.nome.toLowerCase().includes(termo) ||
      produto.categoria.toLowerCase().includes(termo),
  );

  paginaAtual = 1;
  renderizarPagina();
}

function verificarBuscaNaURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const termoDaURL = urlParams.get("busca");

  if (termoDaURL) {
    const campoBusca = document.getElementById("campo-busca");
    if (campoBusca) {
      campoBusca.value = termoDaURL;

      setTimeout(filtrarProdutos, 100);
      setTimeout(filtrarProdutos, 500);
      setTimeout(filtrarProdutos, 1500);
    }
  }
}

// "OLINHO" DE VISUALIZAÇÃO DE SENHA
function toggleSenha(idInput) {
  const input = document.getElementById(idInput);
  const icone = input.parentElement.querySelector(".toggle-password");

  if (input.type === "password") {
    input.type = "text";
    icone.classList.replace("fa-eye", "fa-eye-slash");
  } else {
    input.type = "password";
    icone.classList.replace("fa-eye-slash", "fa-eye");
  }
}

function alertar(titulo = "Aviso", texto = "", icone = 'info') {
    Swal.fire({
        title: titulo,
        text: texto,
        icon: icone,
        confirmButtonColor: '#ff9900',
        confirmButtonText: 'Ok'
    });
}

// (MANTER SEMPRE NO FINAL)
// GERENCIADOR DE INICIALIZAÇÃO ÚNICO
document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM pronto. Iniciando setup da página...");

  verificarStatusLogin();
  renderizarCarrinho();
  await carregarProdutos();

  if (typeof iniciarAnimacaoTitulo === "function") {
    iniciarAnimacaoTitulo();
  }

  const urlParams = new URLSearchParams(window.location.search);
  const termoBusca = urlParams.get("busca");
  if (termoBusca) {
    verificarBuscaNaURL();
  }
});
