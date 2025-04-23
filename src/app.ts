import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { type QueryParams } from './types';
import { fetchPage } from './utils';

// cria uma instância do servidor express
const app = express();
//definindo variável de porta da aplicação
const port = 3000;

// suporte para conteúdos no formato json -> serialização e desserialização de json
app.use(express.json());

// configurando a camada de cors para permitir que o front envie requisições a API sem ser bloqueado, mas impedindo outras origens de se comunicar
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET'],
  allowedHeaders: ['*']
}));

//abrindo e definindo rota get para o enpoint /api/scrape
app.get('/api/scrape', async (req: Request<{}, {}, {}, QueryParams>, res: Response) => {

  // armazenando o valor passado na query string para a variável keyword
  const queryString = req.query.keyword;

  //caso não tenha sido passado valor a variável keyword a API retorna um erro 400 BAD_REQUEST
  if (!queryString) {
    res.status(400).json({ error: 'Missing keyword query parameter' });
  }
  else {
    // caso tenha sido passado um valor válido passa para função auxiar que extrai os dados da página
    const data = fetchPage(queryString);

    // caso tenha retornado os dados responde com os dados obtidos e status 200 OK
    if((await data).length > 0) {

      res.status(200).json(await data);
    }
    else {
      // caso nenhum dado tenha sido obtido o keyword passado para função auxiliar, retorna um 404 NOT_FOUND
      res.status(404).json({ error: 'No results found' });
    }
  }


});

// define a porta em que o servidor express vai funcionar
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});