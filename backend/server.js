import { HttpsProxyAgent } from 'https-proxy-agent';
import express from 'express';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import cors from 'cors';
import https from 'https';

const app = express();
const PORT = 3000;

// Configuração avançada de CORS
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Lista de proxies rotativos (substitua com seus proxies)
const proxyList = [
    'http://45.79.199.134:3128',  // EUA
    'http://200.105.215.22:33630', // Argentina
    'http://51.15.242.202:8888',   // França
    'http://138.199.48.1:8443',    // Alemanha
    'http://209.97.150.167:3128',  // Reino Unido
    'http://103.149.162.195:80',   // Índia
    'http://47.243.242.70:8080',   // Singapura
    'http://191.97.16.113:999',    // Peru
    'http://186.67.192.246:8080',  // Colômbia
    'http://45.224.153.39:999'     // Brasil
  ];

// Headers avançados
const getRandomHeaders = () => {
  const userAgents = [
    // Lista de 10 user-agents diferentes
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    // Adicione mais user-agents
  ];

  return {
    'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0',
    'Referer': 'https://www.google.com/',
    'DNT': '1'
  };
};

// Função para tentar com diferentes proxies
const tryWithProxies = async (url, headers) => {
  let lastError = null;
  
  for (const proxy of proxyList) {
    try {
      const agent = new HttpsProxyAgent(proxy);
      const response = await axios.get(url, {
        headers,
        httpsAgent: agent,
        timeout: 10000
      });
      return response;
    } catch (error) {
      lastError = error;
      console.log(`Falha com proxy ${proxy}. Tentando próximo...`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Delay entre tentativas
    }
  }
  
  throw lastError || new Error('Todos os proxies falharam');
};

// Rota de scraping
app.get('/api/scrape', async (req, res) => {
  const { keyword } = req.query;

  if (!keyword) {
    return res.status(400).json({ error: 'Parâmetro keyword é obrigatório' });
  }

  try {
    const headers = getRandomHeaders();
    const amazonUrl = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`;

    // Tentativa com proxy
    const response = await tryWithProxies(amazonUrl, headers);

    // Verificação de bloqueio
    if (response.data.includes('api-services-support@amazon.com') || 
        response.data.includes('Sorry! Something went wrong!')) {
      throw new Error('Amazon bloqueou a requisição');
    }

    // Parseamento dos resultados
    const dom = new JSDOM(response.data);
    const document = dom.window.document;

    const products = Array.from(document.querySelectorAll('[data-component-type="s-search-result"]'))
      .map(item => {
        const titleEl = item.querySelector('h2 a');
        const ratingEl = item.querySelector('.a-icon-alt');
        const reviewsEl = item.querySelector('.a-size-base.s-underline-text');
        const imageEl = item.querySelector('.s-image');
        const priceEl = item.querySelector('.a-price .a-offscreen');

        return {
          title: titleEl?.textContent?.trim(),
          url: titleEl?.href ? `https://amazon.com${titleEl.href}` : null,
          rating: ratingEl?.textContent?.match(/\d\.?\d*/)?.[0],
          reviews: reviewsEl?.textContent?.replace(/\D/g, ''),
          imageUrl: imageEl?.src,
          price: priceEl?.textContent?.trim()
        };
      })
      .filter(p => p.title && p.imageUrl);

    if (products.length === 0) {
      return res.status(404).json({ 
        error: 'Nenhum produto encontrado',
        tip: 'A estrutura da página pode ter mudado'
      });
    }

    return res.json(products);
  } catch (error) {
    console.error('Erro completo:', error);
    
    const errorResponse = {
      error: 'Falha ao acessar a Amazon',
      details: error.message,
      solutions: [
        'Tente novamente mais tarde (esperar 1-2 horas)',
        'Use um serviço de proxy residencial profissional',
        'Considere a API oficial da Amazon',
        'Atualize os seletores CSS'
      ]
    };

    if (error.response) {
      errorResponse.statusCode = error.response.status;
      errorResponse.amazonResponse = error.response.data?.slice(0, 200) + '...';
    }

    return res.status(500).json(errorResponse);
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});