const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Dados iniciais de teste
let produtos = [
  {
    id: 1,
    nome: "Camiseta Algodão Premium",
    preco: "89.90",
    descricao: "Camiseta 100% algodão, confortável e durável.",
    imagem: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300"
  },
  {
    id: 2,
    nome: "Tênis Esportivo Urban",
    preco: "249.90",
    descricao: "Ideal para caminhadas e uso no dia a dia.",
    imagem: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300"
  }
];

// Rota padrão de boas-vindas
app.get('/', (req, res) => {
  res.send('🚀 Backend do Catálogo de Vendas está rodando!');
});

// GET: Listar produtos
app.get('/api/produtos', (req, res) => {
  res.json(produtos);
});

// POST: Criar produto
app.post('/api/produtos', (req, res) => {
  const { nome, preco, descricao, imagem } = req.body;
  const novoProduto = {
    id: Date.now(),
    nome,
    preco,
    descricao: descricao || '',
    imagem: imagem || ''
  };
  produtos.push(novoProduto);
  res.status(201).json(novoProduto);
});

// PUT: Editar produto
app.put('/api/produtos/:id', (req, res) => {
  const { id } = req.params;
  const { nome, preco, descricao, imagem } = req.body;
  
  const index = produtos.findIndex(p => p.id == id);
  if (index !== -1) {
    produtos[index] = { id: Number(id), nome, preco, descricao, imagem };
    res.json(produtos[index]);
  } else {
    res.status(404).json({ message: "Produto não encontrado" });
  }
});

// DELETE: Remover produto
app.delete('/api/produtos/:id', (req, res) => {
  const { id } = req.params;
  produtos = produtos.filter(p => p.id != id);
  res.json({ message: "Produto removido com sucesso" });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🔥 Servidor rodando na porta ${PORT}`);
});