import React, { useState, useEffect } from 'react';
import './App.css';

const NUMERO_WHATSAPP = '5591992733201';

function App() {
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState('');
  const [form, setForm] = useState({ id: null, nome: '', preco: '', descricao: '', imagem: '' });
  const [editando, setEditando] = useState(false);

  const isAdmin = window.location.pathname === '/admin';

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

  const formatarPreco = (valor) => {
    const num = parseFloat(valor);
    if (isNaN(num)) return 'R$ 0,00';
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const criarLinkWhatsapp = (produto) => {
    const mensagem = `Olá! Vi no catálogo e tenho interesse no produto:\n\n📦 *${produto.nome}*\n💰 *Preço:* ${formatarPreco(produto.preco)}\n\nComo posso finalizar a compra?`;
    return `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensagem)}`;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 📸 Função que converte a foto tirada na câmera/galeria
  const handleFotoChange = (e) => {
    const arquivo = e.target.files[0];
    if (arquivo) {
      const leitor = new FileReader();
      leitor.onloadend = () => {
        setForm((prev) => ({ ...prev, imagem: leitor.result }));
      };
      leitor.readAsDataURL(arquivo);
    }
  };

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

  const produtosFiltrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="app-container">
      <header className="main-header">
        <div className="brand">
          <span className="logo-icon">🛍️</span>
          <div>
            <h1>{isAdmin ? 'Painel de Administração' : 'Catálogo Virtual'}</h1>
            <p>{isAdmin ? 'Gerencie o estoque e atualize as ofertas' : 'Confira nossas ofertas e peça direto pelo WhatsApp'}</p>
          </div>
        </div>

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

      <div className="section-title">
        <h2>{isAdmin ? 'Lista de Produtos Ativos' : 'Nossos Produtos'}</h2>
        <span className="badge-count">{produtosFiltrados.length} itens</span>
      </div>

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

            {/* 📸 Campo de Foto Atualizado para Câmera/Galeria */}
            <div className="form-group full-width">
              <label>📸 Tirar Foto ou Escolher da Galeria</label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFotoChange}
                style={{ padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}
              />
              {form.imagem && (
                <div style={{ marginTop: '10px' }}>
                  <small>Pré-visualização da foto:</small>
                  <br />
                  <img 
                    src={form.imagem} 
                    alt="Pré-visualização" 
                    style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', marginTop: '5px' }} 
                  />
                </div>
              )}
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

export default App;