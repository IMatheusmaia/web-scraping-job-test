import express, { type Request, type Response } from 'express';
import { type QueryParams } from './types';
import { fetchPage } from './utils';

const app = express();
const port = 3000;

app.get('/api/scrape', async (req: Request<{}, {}, {}, QueryParams>, res: Response) => {


  const queryString = req.query.keyword;

  if (!queryString) {
    res.status(400).json({ error: 'Missing keyword query parameter' });
  }
  else {
    const data = fetchPage(queryString);

    if((await data).length > 0) {

      res.status(200).json(await data);
    }
    else {
      res.status(404).json({ error: 'No results found' });
    }
  }


});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});