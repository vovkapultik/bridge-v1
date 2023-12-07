import express, { Request, Response , Application } from 'express';
import dotenv from 'dotenv';

import { generateWallet } from "./modules/aztec";

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;

app.get('/', async (req: Request, res: Response) => {
  const wallet = await generateWallet();
  res.send(JSON.stringify(wallet));
});

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});