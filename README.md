# Guia de Execução

## Requisitos
- Node.js e NPM instalados
- MongoDB (para execução local no Windows)
- Docker/Podman (para execução em container)

---

## Execução Local (Windows)

### Pré-requisitos
Certifique-se de ter o MongoDB instalado e em execução.

### Passos

**1. Navegue até o diretório do projeto**
```bash
cd \lex3
```

**2. Instale as dependências**
```bash
npm install
```

**3. Execute a aplicação**
```bash
npx tsx ./src/app.ts
```

---

## Execução com Container (Linux)

### Instalação do Podman

**Fedora (DNF)**
```bash
sudo dnf install -y podman-docker podman-compose
```

**Debian/Ubuntu (APT)**
```bash
sudo apt install podman-docker podman-compose
```

### Passos

**1. Navegue até o diretório do projeto**
```bash
cd /lex3
```

**2. Inicie os containers**
```bash
sudo podman-compose up --build
```

## Execução com Container (Windows)

### Pré-requisitos
Instale o Docker Desktop para Windows através do [site oficial](https://www.docker.com/products/docker-desktop/).

### Passos

**1. Abra o PowerShell ou Command Prompt**

**2. Navegue até o diretório do projeto**
```powershell
cd \lex3
```

**3. Inicie os containers**
```powershell
docker-compose up --build
```

### Informações dos Serviços

- **MongoDB**: Acessível em `localhost:27018`
  - Usuário: `admin`
  - Senha: `123`
  
- **Aplicação**: Acessível em `localhost:32456`