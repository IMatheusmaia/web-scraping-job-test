import './main.css';
import axios, { AxiosError } from 'axios';
import { Product } from './src/types';

// Capturando elementos HTML que serão utilizados para atribuir eventListener, capturar valores e rederizar elementos filhos repectivamente
const form = document.querySelector('form');
const searchInput:HTMLInputElement | null = document.querySelector('#search');
const appContainer = document.querySelector('#app');

// escutando evento de submit em <form> e implementando função que vai capturar value do input quando o evento for disparado, e dependendo do valor inputado será renderizado mensagens de erro ou cards de produtos
form?.addEventListener('submit', async (event) => {
  //para não recarregar a página todas as vezes que submeter
  event.preventDefault();
  // tratamento para remover valores digitados valores em branco junto do texto
  const keyword:string = searchInput?.value.trim() ?? "";

  // Remove mensagens de aviso ou cards caso já existam (caso de múltiplas buscas)
  const existingMessage = document.querySelector('.message');
  const existingCards = document.querySelector('.cards-container');
  if (existingMessage) existingMessage.remove();
  if (existingCards) existingCards.remove();

  // caso o usuário não tenha digitado o input vai renderizar uma mensagem de aviso de erro
  if (!keyword) {
    renderMessage('Por favor, insira um produto no campo de busca', 'error');
    return;
  }
  // caso o usuário tenha digitado algum valor entra nesse fluxo para tentar fazer a requisição para a API
  try {
    const response = await axios.get(`http://localhost:3000/api/scrape?keyword=${keyword}`);
    
    // caso a API retorne status 200
    if (response.status === 200) {
      // verifica se o retorno é um array de produtos ou um único produto, garantindo o retorno na estrutura de array no final
      const products = Array.isArray(response.data) ? response.data : [response.data];
      //chama a função de renderizar cards passando o array de produtos
      renderCards(products);
    }
  } catch (error) {
    //fluxo que vai tratar erros originados do axios, que são erros lançados pela API e vai retornar na forma de mensagem de erro na interface do client
    if (error instanceof AxiosError) {
      if (error.code === "404") {
        renderMessage(error.message, 'error');

      } else if (error.code === "400") {
        renderMessage(error.message, 'error');
      } else {
        // fluxo que vai gerar uma mensagem de erro na interface do usuário caso tenha ocorrido erro de manipulação dos dados retornados pela API
        renderMessage('Erro ao buscar produtos', 'error');
      }
    } else {
      // caso o serviço da API não responda é retornado essa mensagem de erro na interface
      renderMessage('Erro de conexão com o servidor', 'error');
    }
  }
});

// Função auxiliar para renderizar mensagens e inserir no app container
function renderMessage(text:string, type:string) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = text;
  appContainer?.appendChild(messageDiv);
}

// Função auxiliar para renderizar e inserir cards no app container
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