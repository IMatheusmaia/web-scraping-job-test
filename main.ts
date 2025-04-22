import './main.css';
import axios, { AxiosError } from 'axios';
import { Product } from './src/types';

// Manipulação do formulário
const form = document.querySelector('form');
const searchInput:HTMLInputElement | null = document.querySelector('#search');
const appContainer = document.querySelector('#app');

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const keyword:string = searchInput?.value.trim() ?? "";

  // Remove mensagens ou cards anteriores
  const existingMessage = document.querySelector('.message');
  const existingCards = document.querySelector('.cards-container');
  if (existingMessage) existingMessage.remove();
  if (existingCards) existingCards.remove();

  if (!keyword) {
    renderMessage('Por favor, insira um produto no campo de busca', 'error');
    return;
  }

  try {
    const response = await axios.get(`http://localhost:3000/api/scrape?keyword=${keyword}`);
    
    if (response.status === 200) {
      const products = Array.isArray(response.data) ? response.data : [response.data];
      renderCards(products);
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.code === "404") {
        renderMessage(error.message, 'error');

      } else if (error.code === "400") {
        renderMessage(error.message, 'error');
      } else {
        renderMessage('Erro ao buscar produtos', 'error');
      }
    } else {
      renderMessage('Erro de conexão com o servidor', 'error');
    }
  }
});

// Função para renderizar mensagens
function renderMessage(text:string, type:string) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = text;
  appContainer?.appendChild(messageDiv);
}

// Função para renderizar cards
function renderCards(products:Product[]) {
  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'cards-container';

  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'card';

    const img:HTMLImageElement = document.createElement('img');
    img.src = product.productUrlImage ?? '';
    img.alt = product.productTitle ?? '';

    const title = document.createElement('h3');
    title.textContent = product.productTitle ?? '';

    const rating = document.createElement('p');
    rating.textContent = `Avaliação: ${product.rating} estrelas`;

    const reviews = document.createElement('p');
    reviews.textContent = `${product.numberOfReviews} avaliações`;

    card.append(img, title, rating, reviews);
    cardsContainer.appendChild(card);
  });

  appContainer?.appendChild(cardsContainer);
}