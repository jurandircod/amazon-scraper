document.addEventListener('DOMContentLoaded', () => {
    const keywordInput = document.getElementById('keywordInput');
    const searchButton = document.getElementById('searchButton');
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error');
    const resultsContainer = document.getElementById('results');

    searchButton.addEventListener('click', async () => {
        const keyword = keywordInput.value.trim();

        if (!keyword) {
            showError('Please enter a search keyword');
            return;
        }

        // Limpar resultados anteriores e erros
        resultsContainer.innerHTML = '';
        hideError();

        // Mostrar loading
        loadingElement.classList.remove('hidden');

        try {
            const products = await scrapeAmazon(keyword);

            if (products.length === 0) {
                showError('No products found. Try a different keyword.');
                return;
            }

            displayResults(products);
        } catch (error) {
            showError(`Error: ${error.message}`);
        } finally {
            loadingElement.classList.add('hidden');
        }
    });

    async function scrapeAmazon(keyword) {
        try {
          const response = await fetch(`http://localhost:3000/api/scrape?keyword=${encodeURIComponent(keyword)}`);
          
          if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.error || 'Erro no servidor';
            const solutions = errorData.solutions || [];
            
            throw new Error(`${errorMessage}. Soluções: ${solutions.join(', ')}`);
          }
          
          return await response.json();
        } catch (error) {
          console.error('Erro completo:', error);
          throw new Error(`Falha na comunicação com o servidor: ${error.message}`);
        }
      }
    
    // Adicione esta função para exibir os erros detalhados
    function showError(message) {
        errorElement.innerHTML = `
            <strong>Error:</strong> ${message}
            <div class="error-tip">Try different keywords or come back later</div>
        `;
        errorElement.classList.remove('hidden');
    }

    function displayResults(products) {
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';

            productCard.innerHTML = `
              <img src="${product.imageUrl}" alt="${product.title}" class="product-image">
              <h3 class="product-title">${product.title}</h3>
              <div class="product-rating">${product.rating}</div>
              <div class="product-reviews">${product.reviews} reviews</div>
          `;

            resultsContainer.appendChild(productCard);
        });
    }

    function showError(message) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }

    function hideError() {
        errorElement.classList.add('hidden');
    }
});