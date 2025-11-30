# Jogo de Adivinhação de Cores

Este projeto foi construído com Vite e está pronto para ser hospedado na Vercel.

## Como Hospedar na Vercel

1.  **Crie uma conta na Vercel**: Se ainda não tiver, vá para [vercel.com](https://vercel.com) e crie uma conta (pode usar o login do GitHub).
2.  **Novo Projeto**: No painel da Vercel, clique em **"Add New..."** -> **"Project"**.
3.  **Importar Repositório**:
    *   Selecione o provedor Git (GitHub).
    *   Procure por `JogoDeCores` (o repositório que você acabou de subir).
    *   Clique em **"Import"**.
4.  **Configurações de Build**:
    *   A Vercel deve detectar automaticamente que é um projeto **Vite**.
    *   **Framework Preset**: Vite
    *   **Build Command**: `vite build` (ou `npm run build`)
    *   **Output Directory**: `dist`
    *   *Geralmente você não precisa mudar nada aqui, o padrão funciona.*
5.  **Deploy**: Clique em **"Deploy"**.

A Vercel vai baixar o projeto, instalar as dependências e gerar o site. Em alguns segundos, você terá um link (ex: `jogo-de-cores.vercel.app`) com o jogo funcionando!

## Funcionalidades
- 15 Cores animadas.
- Física de gelatina com interação do mouse.
- Revelação de cor no final.
- Design responsivo.
