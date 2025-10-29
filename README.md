# Para rodar o código

## Windows:
(É preciso ter o MongoDB instalado previamente)
<br>
**Passo 1** - Abra um terminal e acesse a pasta do projeto
    `cd <localizacao_do_projeto>\lex3`
<br>
**Passo 2** - Instale as dependências pelo NPM
    `npm install`
<br>
**Passo 3** - Rode através do NPX
    `npx fpx ./src/app.ts`
     
## Linux:
 Exemplo utilizado podman-docker e podman-compose, para instalar use:
    `sudo dnf install -y podman-docker podman-compose` (DNF, Fedora)
    `sudo apt install podman-docker podman-compose` (APT, Debian, Ubuntu)
<br>
**Passo 1** - Abra um terminal e acesse a pasta do projeto
    `cd <localizacao>/lex3`
<br>
**Passo 2** - Rode o container
    `sudo podman-compose up --build`
