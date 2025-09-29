# BrilhoGestor

Sistema simples de controle de estoque e vendas para lojas de joias (Prata / Semijoias).

**O que tem neste pacote**
- Projeto React (Vite) básico
- Componente principal já funcional (`src/App.jsx`) com:
  - Cadastro de produtos (custo, preço, estoque)
  - Registro de entradas (compra) e saídas (vendas)
  - Formas de pagamento: Dinheiro, Cartão, PIX, Boleto
  - Cadastro de clientes (nome + CPF)
  - Cálculo de receita e lucro
  - Exportação de dados (JSON/CSV)
- Logo em `public/logo.svg`
- Estilos simples em `src/styles.css`

## Como usar

Requisitos: Node.js (versão 16 ou superior) e npm.

1. Extraia o conteúdo do ZIP.
2. Abra um terminal na pasta do projeto.
3. Rode:
```bash
npm install
npm run dev
```
4. Abra `http://localhost:5173` (ou o endereço mostrado pelo Vite).
5. Para gerar build de produção:
```bash
npm run build
npm run preview
```

**Observações**
- Os dados são salvos no `localStorage` do seu navegador. Use os botões de exportação para backup.
- Se quiser, posso:
  - Gerar validação de CPF automática.
  - Integrar com Google Sheets ou um backend simples (Node/Express).
  - Disponibilizar deploy pronto no Vercel/Netlify.

Desenvolvido por você + assistente — BrilhoGestor.
