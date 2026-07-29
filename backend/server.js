const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Banco de dados em memória (simulado)
let produtos = [
  {
    id: 1,
    nome: 'Camiseta Algodão Premium',
    preco: '89.90',
    descricao: 'Camiseta 100% algodão, confortável e durável.',
    imagem: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300'
  },
  {
    id: 2,
    nome: 'Tênis Esportivo Urban',
    preco: '249.90',
    descricao: 'Ideal para caminhadas e uso no dia a dia.',
    imagem: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300'
  }
];

// 1. GET - Listar todos os produtos
app.get('/api/produtos', (req, res) => {
  res.json(produtos);
});

// 2. POST - Criar um novo produto
app.post('/api/produtos', (req, res) => {
  const { nome, preco, descricao, imagem } = req.body;

  if (!nome || !preco) {
    return res.status(400).json({ error: 'Nome e Preço são obrigatórios.' });
  }

  const novoProduto = {
    id: Date.now(),
    nome,
    preco,
    descricao: descricao || '',
    imagem: imagem || 'https://via.placeholder.com/300'
  };

  produtos.push(novoProduto);
  res.status(201).json(novoProduto);
});

// 3. PUT - Atualizar um produto existente
app.put('/api/produtos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = produtos.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Produto não encontrado.' });
  }

  const { nome, preco, descricao, imagem } = req.body;
  produtos[index] = {
    ...produtos[index],
    nome: nome || produtos[index].nome,
    preco: preco || produtos[index].preco,
    descricao: descricao !== undefined ? descricao : produtos[index].descricao,
    imagem: imagem || produtos[index].imagem
  };

  res.json(produtos[index]);
});

// 4. DELETE - Remover um produto
app.delete('/api/produtos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  produtos = produtos.filter(p => p.id !== id);
  res.json({ message: 'Produto removido com sucesso.' });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
});