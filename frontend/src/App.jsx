import React, { useState, useEffect } from 'react';

// COLOQUE SEU NÚMERO AQUI (DDI 55 + DDD + NUMERO)
const NUMERO_WHATSAPP = '5591992733201';

function App() {
  const [produtos, setProdutos] = useState([]);
  const [form, setForm] = useState({ id: null, nome: '', preco: '', descricao: '', imagem: '' });
  const [editando, setEditando] = useState(false);

  // 1. GET: Buscar produtos da API
  const carregarProdutos = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/produtos');
      const data = await res.json();
      setProdutos(data);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
    }
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  // 2. Gerar link dinâmico para o WhatsApp
  const criarLinkWhatsapp = (produto) => {
    const mensagem = `Olá! Vi seu catálogo e tenho interesse no produto: *${produto.nome}* (R$ ${produto.preco}). Como faço para comprar?`;
    return `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensagem)}`;
  };

  // Preencher formulário
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 3. POST / PUT: Salvar produto
  const handleSalvar = async (e) => {
    e.preventDefault();
    if (!form.nome || !form.preco) return alert('Preencha Nome e Preço');

    const url = editando 
      ? `http://localhost:3001/api/produtos/${form.id}` 
      : 'http://localhost:3001/api/produtos';

    const method = editando ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    limparForm();
    carregarProdutos();
  };

  // 4. DELETE: Remover produto
  const handleDeletar = async (id) => {
    if (confirm('Deseja realmente excluir este produto?')) {
      await fetch(`http://localhost:3001/api/produtos/${id}`, { method: 'DELETE' });
      carregarProdutos();
    }
  };

  // Iniciar edição
  const handleEditar = (produto) => {
    setForm(produto);
    setEditando(true);
  };

  // Limpar formulário
  const limparForm = () => {
    setForm({ id: null, nome: '', preco: '', descricao: '', imagem: '' });
    setEditando(false);
  };

  return (
    <div className="container">
      <header>
        <h1>🛍️ Catálogo de Produtos</h1>
        <p>Escolha um produto e fale diretamente conosco no WhatsApp!</p>
      </header>

      {/* GRADE DE PRODUTOS */}
      <div className="grid-produtos">
        {produtos.map((p) => (
          <div key={p.id} className="card">
            <div>
              <img src={p.imagem} alt={p.nome} />
              <div className="card-body">
                <div className="card-title">{p.nome}</div>
                <div className="card-price">R$ {p.preco}</div>
                <p className="card-desc">{p.descricao}</p>
              </div>
            </div>

            <div style={{ padding: '0 15px 15px 15px' }}>
              <a
                href={criarLinkWhatsapp(p)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-zap"
              >
                Comprar no WhatsApp 💬
              </a>

              {/* Botões de Ação Administrativa */}
              <div className="acoes-admin">
                <button className="btn-edit" onClick={() => handleEditar(p)}>Editar</button>
                <button className="btn-delete" onClick={() => handleDeletar(p.id)}>Excluir</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PAINEL ADMINISTRATIVO (POST / PUT) */}
      <div className="admin-section">
        <h2>{editando ? 'Editar Produto' : 'Cadastrar Novo Produto'}</h2>
        <form onSubmit={handleSalvar}>
          <div className="form-grid">
            <input
              type="text"
              name="nome"
              placeholder="Nome do Produto *"
              value={form.nome}
              onChange={handleChange}
            />
            <input
              type="text"
              name="preco"
              placeholder="Preço (ex: 99.90) *"
              value={form.preco}
              onChange={handleChange}
            />
            <input
              type="text"
              name="imagem"
              placeholder="URL da Imagem"
              value={form.imagem}
              onChange={handleChange}
            />
            <input
              type="text"
              name="descricao"
              placeholder="Descrição curta"
              value={form.descricao}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="btn-salvar">
            {editando ? 'Atualizar Produto' : 'Adicionar ao Catálogo'}
          </button>
          {editando && (
            <button type="button" className="btn-cancelar" onClick={limparForm}>
              Cancelar
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default App;