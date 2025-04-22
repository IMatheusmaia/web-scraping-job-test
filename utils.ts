import jsdom from "jsdom";
import axios, { AxiosHeaders, type AxiosHeaderValue } from "axios";
import puppeteer, { Browser, type Cookie } from 'puppeteer';
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import type { Product } from "./types";


const domHandle = ({ data }:AxiosResponse):Product[] => {
    const dom = new jsdom.JSDOM(data);
    const document = dom.window.document;
    
    const titleProducts = document.querySelectorAll('.a-section.a-spacing-none.a-spacing-top-small.s-title-instructions-style a h2 span');
    const ratingProducts = document.querySelectorAll('.a-popover-trigger.a-declarative i span');
    const numberOfReviewsProducts = document.querySelectorAll('.s-csa-instrumentation-wrapper.alf-search-csa-instrumentation-wrapper a span');
    const productUrlImages = document.querySelectorAll('.a-section.aok-relative.s-image-square-aspect img');

    if (titleProducts.length === 0 || undefined) {
      throw new Error('No title found for this selector');
    } else if (ratingProducts.length === 0) {
      throw new Error('No rating found for this selector');
    } else if (numberOfReviewsProducts.length === 0) {
      throw new Error('No number of reviews found for this selector');
    } else if (productUrlImages.length === 0 || undefined) {
      throw new Error('No product url image found for this selector');
    }

      return Array.from({ length: 10 }).map((_value, index) => {
      const titles:string[] = Array.from(titleProducts).map((titleProduct) => titleProduct.outerHTML.replace(/<span[^>]*>|<\/span>/g, ''));
      const ratings:number[] = Array.from(ratingProducts).map((ratingProduct) => {
        const rating = ratingProduct.outerHTML.replace(/<(span|div|i|a)[^>]*>|<\/(span|div|i|a)>/g, '')
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
      
      return {
        productTitle: titles[index],
        rating: ratings[index],
        numberOfReviews: reviews[index],
        productUrlImage: images[index]

      }
    });
    
};

export async function fetchPage (value: string):Promise<Product[]> {
  
  const browser:Browser = await puppeteer.launch();
  const agent:string = await browser.userAgent();
  const browserCookies:Cookie[] = await browser.cookies();
  const productsResponse: Product[] = [];
  
  try {
    
    const headerValues:AxiosHeaderValue = new AxiosHeaders({
      'User-Agent': agent,
      'Cookie': browserCookies.map((cookie:Cookie) => `${cookie.name}=${cookie.value}`).join('; ')
    });
    const axiosConfig: AxiosRequestConfig = {
      headers : {
        ...headerValues,
        'Accept': '*/*',
        'Referer': 'https://www.amazon.com',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive'
      }
    };

    const response = await axios.get(`https://www.amazon.com/s?k=${value}`, {...axiosConfig});
    
    domHandle(response).forEach(
      (prod):void => {
        productsResponse.push(prod);
      }
    );

    await browser.close();
    
  } catch (error) {
    console.error(error);
  }

  return productsResponse;
}