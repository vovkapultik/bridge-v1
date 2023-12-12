import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";

import {
  deployTokens,
  generateWallet,
  getOwnerWallet,
  getPublicBalances,
  getPrivateBalances,
  loadWallet,
  shieldBalance,
  mintPublic,
  mintPrivate,
} from "./modules/aztec";
import { BarretenbergSync } from "@aztec/bb.js";

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;

app.use(express.json())

app.get('/ownerWallet', async (req: Request, res: Response) => {
  const address = (await getOwnerWallet()).getAddress().toString();

  res.send({
    address
  });
});

app.post('/deployTokens', async (req: Request, res: Response) => {
  const ownerWallet = await getOwnerWallet();
  await deployTokens(ownerWallet);

  res.send({
    status: true
  });
});

app.post('/generateWallet', async (req: Request, res: Response) => {
  const wallet = await generateWallet();
  console.log(`New account deployed at ${wallet.completeAddress.address}`);

  res.send(wallet);
});

app.post('/loadWallet', async (req: Request, res: Response) => {
  const wallet = await loadWallet(
    req.body.encryptionPrivateKey,
    req.body.signingPrivateKey,
    req.body.completeAddress
  );
  res.send({
    status: true
  });
});

app.post('/publicBalances', async (req: Request, res: Response) => {
  const balances = await getPublicBalances(
      req.body.encryptionPrivateKey,
      req.body.signingPrivateKey,
      req.body.completeAddress
  );

  res.send({
    balances
  });
});

app.post('/privateBalances', async (req: Request, res: Response) => {
  const balances = await getPrivateBalances(
    req.body.encryptionPrivateKey,
    req.body.signingPrivateKey,
    req.body.completeAddress
  );

  res.send({
    balances
  });
});

app.post('/mintPublic', async (req: Request, res: Response) => {
  const status = await mintPublic(
    req.body.token,
    req.body.amount,
    req.body.encryptionPrivateKey,
    req.body.signingPrivateKey,
    req.body.completeAddress
  );

  res.send({
    status
  });
});

app.post('/mintPrivate', async (req: Request, res: Response) => {
  const status = await mintPrivate(
    req.body.token,
    req.body.amount,
    req.body.encryptionPrivateKey,
    req.body.signingPrivateKey,
    req.body.completeAddress
  );

  res.send({
    status
  });
});

app.post('/shieldBalance', async (req: Request, res: Response) => {
  const balances = await shieldBalance(
    req.body.token,
    req.body.amount,
    req.body.encryptionPrivateKey,
    req.body.signingPrivateKey,
    req.body.completeAddress
  );

  res.send({
    balances
  });
});

app.listen(port, async () => {
  await BarretenbergSync.initSingleton();
  console.log(`Server is Fire at http://localhost:${port}`);
});