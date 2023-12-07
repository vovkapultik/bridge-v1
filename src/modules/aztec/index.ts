import { createPXEClient, getSandboxAccountsWallets } from "@aztec/aztec.js";

const pxe = createPXEClient(process.env.PXE_URL || "http://localhost:8080");

export async function generateWallet() {
  return getSandboxAccountsWallets(pxe)
}

//
//
// let ownerWallet: AccountWalletWithPrivateKey;
// let dex: Contract, zkb: Contract, usdt: Contract;
//
// it('set owner', async () => {
//   [ownerWallet] = await getSandboxAccountsWallets(pxe);
// });
//
// it('deploy contracts', async () => {
//   dex = await dexContract.deploy(ownerWallet, ownerWallet.getAddress()).send().deployed();
// zkb = TokenContract.deploy(ownerWallet, ownerWallet.getAddress()).send().deployed();
//   usdt = await TokenContract.deploy(ownerWallet, ownerWallet.getAddress()).send().deployed();
// });