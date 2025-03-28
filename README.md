# 🛒 Amazon Product Scraper

Um script em Node.js para extrair dados de produtos da Amazon usando **Bun** e **Axios**.  
⚠️ **Requer um proxy pago para funcionar corretamente** (a Amazon bloqueia requisições automáticas).

---

## 🚀 Como Rodar o Projeto

### **Pré-requisitos**
- [Node.js](https://nodejs.org/) (v18+) ou [Bun](https://bun.sh/)
- Conta em um serviço de **proxy pago** (ex: [Smartproxy](https://smartproxy.com), [Oxylabs](https://oxylabs.io))

---

## ⚙️ Configuração

### **1. Instale as Dependências**
**Entre na pasta backend e execute no terminal:**
- npm install


### **2. Configurar o Proxy**
- Edite o arquivo server.js e adicione seu proxy pago:
- Remova os Proxies gratuitos e adicione a sua lista de proxy

const proxyList = [
    'http://45.79.199.134:3128',  // EUA
    'http://45.224.153.39:999'     // Brasil
  ];

### **3. Rodar o Servidor**

**Para o Frontend:**
- cd frontend
- npm run dev 

**Para o Backend:**
- cd backend
- bun run server.js



---

## **🔍 Passo 3: Explicação para a Empresa**
No `README.md`, destaque:
1. **Por que proxies gratuitos não funcionam** (bloqueio da Amazon).  
2. **Opções pagas recomendadas** (Smartproxy, Oxylabs).  
3. **Como configurar** (basta substituir as credenciais no código).  

Exemplo de trecho importante:
```markdown
⚠️ **Aviso:** Proxies gratuitos não funcionam devido ao bloqueio da Amazon.  
