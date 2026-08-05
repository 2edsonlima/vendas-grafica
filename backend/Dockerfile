# Usa uma imagem leve do Node.js
FROM node:18-alpine

# Define o diretório de trabalho no container
WORKDIR /app

# Copia os arquivos de dependência e instala
COPY package*.json ./
RUN npm install

# Copia todo o restante do código do backend
COPY . .

# Expõe a porta que o servidor roda
EXPOSE 3001

# Comando para iniciar o servidor
CMD ["npm", "start"]