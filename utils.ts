import jsdom from "jsdom";
import axios, { AxiosHeaders, type AxiosHeaderValue } from "axios";
import puppeteer, { Browser, type Cookie } from 'puppeteer';
import type { AxiosRequestConfig } from "axios";

export async function fetchPage (value: string):Promise<void> {
  
  const browser:Browser = await puppeteer.launch();
  const agent:string = await browser.userAgent();
  const browserCookies:Cookie[] = await browser.cookies();
  
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

    const dom = new jsdom.JSDOM(response.data);
    const document = dom.window.document;
    const products = document.querySelectorAll('[class*="widgetId=search-results"]');

    if (products.length === 0 || undefined) {
      throw new Error('No products found for this selector');
    }

    console.log(Array.from(products).map((product) => product.textContent))

    await browser.close();
    
  } catch (error) {
    console.error(error);
  }
}