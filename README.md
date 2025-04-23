# Como iniciar o Projeto? (Linux SO)🐧

## Clone o repositório executando os seguintes passos: 📥

### Caso tenha o git instalado na máquina 🛠️

1. Navegue até um diretório de sua preferência no seu Sistema Operacional pelo terminal:
   ```bash
   cd ~/Downloads/  # diretório exemplo
   ```
2. Execute o comando:
   ```bash
   git clone git@github.com:IMatheusmaia/web-scraping-job-test.git
   ```
3. Ainda no terminal, execute o comando:
   ```bash
   cd web-scraping-job-test/
   ```

### Caso não tenha o git instalado na máquina 🚫

1. Clique em "Code" > "Download ZIP", baixe o arquivo e descompacte-o.
2. Abra a pasta `web-scraping-job-test`.

## Execute a aplicação com os seguintes passos: 🚀

> **Obs.:** Garanta que o Bun (runtime JavaScript) esteja instalado na sua máquina. Caso não esteja, siga as instruções da [documentação oficial do Bun](https://bun.sh/docs/installation).

1. Dentro do diretório raiz do projeto, execute os comandos:
   ```bash
   bun install
   ```
   e depois:

   ```bash
   bun run start
   ```
2. Caso a aplicação não inicie automaticamente no seu navegador padrão, digite o seguinte endereço na barra de pesquisa do navegador:
   ```
   http://localhost:5173
   ```
3. Digite o nome de um produto em inglês e clique no botão "scrape".

---