import axios from "axios";
import jsdom from "jsdom";

export async function fetchPage (value: string) {
  try {

    const config = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://www.amazon.com.br/',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive'
      }
    };

    const response = await axios.get(`https://www.amazon.com.br/s?k=${value}`, {...config});

    const dom = new jsdom.JSDOM(response.data);
    const document = dom.window.document;
    const products = document.querySelectorAll('[class*="widgetId=search-results"]');

    if (products.length === 0 || undefined) {
      throw new Error('No products found for this selector');
    }

    console.log(Array.from(products))
    
  } catch (error) {
    console.error(error);
  }
}