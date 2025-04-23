import jsdom from "jsdom";
import axios, { AxiosHeaders, type AxiosHeaderValue } from "axios";
import puppeteer, { Browser, type Cookie } from 'puppeteer';
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import type { Product } from "./types";


// função auxiliar assincrona que vai converter e tratar os dados obtidos pelo axios, e retornar uma lista de objetos do tipo produto
const domHandle = async ({ data }:AxiosResponse): Promise<Product[]> => {
    // transformando a string(json) retornada pelo axios em elementos DOM manipuláveis
    const dom = new jsdom.JSDOM(data);
    const document = dom.window.document;
    
    //capturando elementos HTML de interesse para obtenção de valores
    const titleProducts = document.querySelectorAll('[class*="a-color-base"][class*="a-text-normal"]');
    const ratingProducts = document.querySelectorAll('.a-popover-trigger.a-declarative i span');
    const numberOfReviewsProducts = document.querySelectorAll('.s-csa-instrumentation-wrapper.alf-search-csa-instrumentation-wrapper a span');
    const productUrlImages = document.querySelectorAll('.s-product-image-container img');

    //fluxo para retornar um erro, caso algum seletor não ache nenhum elemento
    if (titleProducts.length === 0) {
      throw new Error('No title found for this selector');
    } else if (ratingProducts.length === 0) {
      throw new Error('No rating found for this selector');
    } else if (numberOfReviewsProducts.length === 0) {
      throw new Error('No number of reviews found for this selector');
    } else if (productUrlImages.length === 0) {
      throw new Error('No product url image found for this selector');
    }
      // retorna um array de produtos limitado a 10 produtos por busca
      return Array.from({ length: 10 }).map((_value, index) => {
        // iterar e tratar cada elemento capturado do DOM, convertendo em elemento HTML e depois removendo substrings indesejadas, retornando apenas o que interessa

        const titles:string[] = Array.from(titleProducts).map((titleProduct) => titleProduct.outerHTML.replace(/.*<span>(.*?)<\/span>.*/i, '$1'));
        const ratings:number[] = Array.from(ratingProducts).map((ratingProduct) => {
        const rating = ratingProduct.outerHTML.replace(/<(span|div|i|a)[^>]*>|<\/(span|div|i|a)>/g, '');

        if (rating.includes('out of 5 stars')) {
          return parseFloat(rating.split(" ")[0] || '');

        }
          return 0;
        
      });
        const reviews:number[] = Array.from(numberOfReviewsProducts).map((review) => {
        const nReview:string = review.outerHTML.replace(/<span[^>]*>|<\/span>/g, '');
        
        if(Number.isNaN(parseFloat(nReview))) {
          return 0;
        }
        return parseFloat(nReview.replace(',', ''));
      });

        const images:string[] = Array.from(productUrlImages).map((productUrlImage:any) => productUrlImage.src);
      
        // retorna um objeto com as informações do produto de acordo com o index correspondente de cada lista de elementos capturados da página
        return {
          productTitle: titles[index],
          rating: ratings[index],
          numberOfReviews: reviews[index],
          productUrlImage: images[index]

        };
    });
};

export async function fetchPage (value: string):Promise<Product[]> {
  
  // criando uma instância de navegador do pupperteer para simular um navegador real com user-agent e cookies válidos, para contornar o bloqueio de webscrapping da amazon 
  const browser:Browser = await puppeteer.launch(
    {
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  );
  const agent:string = await browser.userAgent();
  const browserCookies:Cookie[] = await browser.cookies();

  // inicializando o array de produtos como vazio para posteriormente ser adicionado e retornado
  const productsResponse: Product[] = [];
  
  try {
    // injetando cookies e user-agent do pupperter nos headers do axios que serão posteriormente usados para fazer requisições á página da amazon, sem restrições de bloqueio
    const headerValues:AxiosHeaderValue = new AxiosHeaders({
      'User-Agent': agent,
      'Cookie': browserCookies.map((cookie:Cookie) => `${cookie.name}=${cookie.value}`).join('; ')
    });

    // injetando os headers e definindo headers extras para o axios config object
    const axiosConfig: AxiosRequestConfig = {
      headers : {
        ...headerValues,
        'Accept': '*/*',
        'Referer': 'https://www.amazon.com',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive'
      }
    };

    // fazendo requisição para página da amazon com axios inserindo o valor de keyword  passado como parâmetro da função e injetando configurações adicionais do axios
    const response = await axios.get(`https://www.amazon.com/s?k=${value}`, {...axiosConfig});
    
    // passando a resposta do axios para a função auxiliar que vai tratar os dados de JSON para HTML e retornar uma lista de produtos
    const domOutput = await domHandle(response);

    //itera e adicionar cada produto obtido de saída na variável global de produtos para posteriormente ser retornado
    domOutput.forEach(
      (prod):void => {
        productsResponse.push(prod);
      }
    );
    // encerra a instância de navegador do pupperteer
    await browser.close();
    
  } catch (error) {
    //caso tenha acontecido algum erro durante a requisição do axios ou no instânciamento do navegador retorna o erro no terminal do servidor
    console.error(error);
  }
  // retorna a variável global com os produtos
  return productsResponse;
}