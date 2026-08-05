import React, { useState, useEffect } from 'react';
import './App.css';

// ⚠️ COLOQUE SEU NÚMERO DE WHATSAPP AQUI (DDI 55 + DDD + NUMERO)
const NUMERO_WHATSAPP = '5511999999999';

function App() {
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState('');
  const [form, setForm] = useState({ id: null, nome: '', preco: '', descricao: '', imagem: '' });
  const [editando, setEditando] = useState(false);

  // Verifica se a URL acessada é /admin
  const isAdmin = window.location.pathname === '/admin';

  // Buscar produtos do Backend
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

  // Formatar número para Moeda Brasileira (R$)
  const formatarPreco = (valor) => {
    const num = parseFloat(valor);
    if (isNaN(num)) return 'R$ 0,00';
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Gerar link direto do WhatsApp
  const criarLinkWhatsapp = (produto) => {
    const mensagem = `Olá! Vi no catálogo e tenho interesse no produto:\n\n📦 *${produto.nome}*\n💰 *Preço:* ${formatarPreco(produto.preco)}\n\nComo posso finalizar a compra?`;
    return `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensagem)}`;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Salvar/Atualizar Produto (Exclusivo Admin)
  const handleSalvar = async (e) => {
    e.preventDefault();
    if (!form.nome || !form.preco) return alert('Por favor, preencha o Nome e o Preço!');

    const url = editando 
      ? `http://localhost:3001/api/produtos/${form.id}` 
      : 'http://localhost:3001/api/produtos';

    const method = editando ? 'PUT' : 'POST';

    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      limparForm();
      carregarProdutos();
    } catch (err) {
      alert('Erro ao salvar produto.');
    }
  };

  // Excluir Produto (Exclusivo Admin)
  const handleDeletar = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await fetch(`http://localhost:3001/api/produtos/${id}`, { method: 'DELETE' });
        carregarProdutos();
      } catch (err) {
        alert('Erro ao deletar produto.');
      }
    }
  };

  const handleEditar = (produto) => {
    setForm(produto);
    setEditando(true);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const limparForm = () => {
    setForm({ id: null, nome: '', preco: '', descricao: '', imagem: '' });
    setEditando(false);
  };

  // Filtragem pela barra de pesquisa
  const produtosFiltrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="app-container">
      {/* CABEÇALHO */}
      <header className="main-header">
        <div className="brand">
          <span className="logo-icon">🛍️</span>
          <div>
            <h1>{isAdmin ? 'Painel de Administração' : 'Catálogo Virtual'}</h1>
            <p>{isAdmin ? 'Gerencie o estoque e atualize as ofertas' : 'Confira nossas ofertas e peça direto pelo WhatsApp'}</p>
          </div>
        </div>

        {/* BARRA DE PESQUISA */}
        {!isAdmin && (
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Buscar produto..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        )}
      </header>

      {/* TÍTULO DA SEÇÃO */}
      <div className="section-title">
        <h2>{isAdmin ? 'Lista de Produtos Ativos' : 'Nossos Produtos'}</h2>
        <span className="badge-count">{produtosFiltrados.length} itens</span>
      </div>

      {/* GRADE DE PRODUTOS */}
      <div className="produtos-grid">
        {produtosFiltrados.length === 0 ? (
          <p className="empty-message">Nenhum produto encontrado.</p>
        ) : (
          produtosFiltrados.map((p) => (
            <div key={p.id} className="card-produto">
              <div className="card-img-wrapper">
                <img 
                  src={p.imagem || 'https://via.placeholder.com/300x200?text=Sem+Imagem'} 
                  alt={p.nome} 
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=Imagem+Indisponivel'; }}
                />
              </div>

              <div className="card-content">
                <h3 className="card-title">{p.nome}</h3>
                <p className="card-desc">{p.descricao || 'Sem descrição cadastrada.'}</p>
                <div className="card-price">{formatarPreco(p.preco)}</div>

                {/* VISÃO DO CLIENTE: Botão WhatsApp */}
                {!isAdmin && (
                  <a
                    href={criarLinkWhatsapp(p)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp"
                  >
                    <span>Comprar no WhatsApp</span>
                    <span className="btn-icon">💬</span>
                  </a>
                )}

                {/* VISÃO DO ADMIN: Ações de edição */}
                {isAdmin && (
                  <div className="admin-actions">
                    <button className="btn-edit" onClick={() => handleEditar(p)}>✏️ Editar</button>
                    <button className="btn-delete" onClick={() => handleDeletar(p.id)}>🗑️ Excluir</button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* PAINEL DE CADASTRO/EDIÇÃO (Aparece APENAS no /admin) */}
      {isAdmin && (
        <section className="admin-form-section">
          <h2>{editando ? '✏️ Editar Produto' : '➕ Cadastrar Novo Produto'}</h2>
          <form onSubmit={handleSalvar} className="admin-form">
            <div className="form-group">
              <label>Nome do Produto *</label>
              <input
                type="text"
                name="nome"
                placeholder="Ex: Tênis Esportivo"
                value={form.nome}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Preço (R$) *</label>
              <input
                type="text"
                name="preco"
                placeholder="Ex: 149.90"
                value={form.preco}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>URL da Imagem</label>
              <input
                type="text"
                name="imagem"
                placeholder="Ex: https://link-da-imagem.jpg"
                value={form.imagem}
                onChange={handleChange}
              />
            </div>

            <div className="form-group full-width">
              <label>Descrição</label>
              <textarea
                name="descricao"
                rows="3"
                placeholder="Detalhes do produto..."
                value={form.descricao}
                onChange={handleChange}
              />
            </div>

            <div className="form-buttons full-width">
              <button type="submit" className="btn-save">
                {editando ? 'Atualizar Produto' : 'Cadastrar Produto'}
              </button>
              {editando && (
                <button type="button" className="btn-cancel" onClick={limparForm}>
                  Cancelar Edição
                </button>
              )}
            </div>
          </form>
        </section>
      )}
    </div>
  );
}

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