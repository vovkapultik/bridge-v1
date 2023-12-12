import {
  Fq,
  getSchnorrAccount,
  PXE,
  AccountWalletWithPrivateKey,
  createPXEClient,
  getSandboxAccountsWallets,
  AztecAddressLike, AztecAddress
} from "@aztec/aztec.js";
import { CompleteAddress } from "@aztec/circuits.js";
// @ts-ignore
import { TokenContract } from "@aztec/noir-contracts/types";
import { type } from "os";

const pxe = createPXEClient(process.env.PXE_URL || "http://localhost:8080");


export async function getOwnerWallet() {
  let ownerWallet: AccountWalletWithPrivateKey;
  [ownerWallet] = await getSandboxAccountsWallets(pxe);

  return ownerWallet;
}

export async function deployTokens(ownerWallet: AccountWalletWithPrivateKey) {
  const WMATIC = await TokenContract.deploy(ownerWallet, ownerWallet.getAddress()).send().deployed();
  const USDT = await TokenContract.deploy(ownerWallet, ownerWallet.getAddress()).send().deployed();

  process.env.WMATIC_ADDRESS = WMATIC.address.toString();
  process.env.USDT_ADDRESS = USDT.address.toString();
}

export async function generateWallet() {
  const encryptionPrivateKey = Fq.random();
  const signingPrivateKey = Fq.random();
  const wallet = await getSchnorrAccount(
    pxe,
    encryptionPrivateKey,
    signingPrivateKey
  ).waitDeploy();

  return {
    encryptionPrivateKey: encryptionPrivateKey.toString(),
    signingPrivateKey: signingPrivateKey.toString(),
    completeAddress: {
      address: wallet.getCompleteAddress().address.toString(),
      partialAddress: wallet.getCompleteAddress().partialAddress.toString(),
      publicKey: wallet.getCompleteAddress().publicKey.toString()
    }
  }
}

export async function loadWallet(encryptionPrivateKey: Fq, signingPrivateKey: Fq, completeAddress: CompleteAddress) {
  const wallet = await getSchnorrAccount(
    pxe,
    new Fq(Number(encryptionPrivateKey)),
    new Fq(Number(signingPrivateKey)),
    new CompleteAddress(completeAddress.address, completeAddress.publicKey, completeAddress.partialAddress)
  ).register();

  console.log(wallet);
  console.log(`getAddress: ${wallet.getAddress()}`);
  console.log(wallet.getCompleteAddress());
  console.log(`-----------------------------------`);
  const ownerWallet = await getOwnerWallet();
  console.log(ownerWallet);
  console.log(`getAddress: ${ownerWallet.getAddress()}`);
  console.log(ownerWallet.getCompleteAddress());
  console.log(`-----------------------------------`);

  return wallet
}

export async function getPublicBalances (encryptionPrivateKey: Fq, signingPrivateKey: Fq, completeAddress: CompleteAddress) {
  const wallet = await loadWallet(encryptionPrivateKey, signingPrivateKey, completeAddress);

  const WMATIC = await TokenContract.at(AztecAddress.fromString(process.env.WMATIC_ADDRESS), wallet);
  const USDT = await TokenContract.at(AztecAddress.fromString(process.env.USDT_ADDRESS), wallet);

  const wmaticBalance = await WMATIC.methods.balance_of_public(wallet.getCompleteAddress().address).view();
  const usdtBalance = await USDT.methods.balance_of_public(wallet.getCompleteAddress().address).view();

  return {
    WMATIC: wmaticBalance.toString(),
    USDT: usdtBalance.toString()
  }
}

export async function getPrivateBalances (encryptionPrivateKey: Fq, signingPrivateKey: Fq, completeAddress: CompleteAddress) {
  const wallet = await loadWallet(encryptionPrivateKey, signingPrivateKey, completeAddress);

  const WMATIC = await TokenContract.at(AztecAddress.fromString(process.env.WMATIC_ADDRESS), wallet);
  const USDT = await TokenContract.at(AztecAddress.fromString(process.env.USDT_ADDRESS), wallet);

  const wmaticBalance = await WMATIC.methods.balance_of_private(wallet.getCompleteAddress().address).view();
  const usdtBalance = await USDT.methods.balance_of_private(wallet.getCompleteAddress().address).view();

  return {
    WMATIC: wmaticBalance.toString(),
    USDT: usdtBalance.toString()
  }
}

export async function mintPublic (token: string, amount: number, encryptionPrivateKey: Fq, signingPrivateKey: Fq, completeAddress: CompleteAddress) {
  const wallet = await loadWallet(encryptionPrivateKey, signingPrivateKey, completeAddress);
  const ownerWallet = await getOwnerWallet();

  let tokenContract;
  let tokenOwnerContract;
  if (token.toLowerCase() === 'wmatic') {
    tokenContract = await TokenContract.at(AztecAddress.fromString(process.env.WMATIC_ADDRESS), wallet);
    tokenOwnerContract = await TokenContract.at(AztecAddress.fromString(process.env.WMATIC_ADDRESS), ownerWallet);
  } else if (token.toLowerCase() === 'usdt') {
    tokenContract = await TokenContract.at(AztecAddress.fromString(process.env.USDT_ADDRESS), wallet);
    tokenOwnerContract = await TokenContract.at(AztecAddress.fromString(process.env.USDT_ADDRESS), ownerWallet);
  } else {
    return {
      status: false,
      reason: 'No such token'
    }
  }
  try {
    const tx = tokenContract.methods.mint_public(wallet.getAddress(), amount).send();
    const receipt = await tx.wait();
    console.log(receipt.status)

    // await tokenOwnerContract.methods.set_minter(wallet.getAddress(), true).send().wait();
    // await tokenContract.methods.mint_public(wallet.getAddress(), BigInt(amount)).send().wait();
    // await tokenOwnerContract.methods.set_minter(wallet.getAddress(), false).send().wait();

    return {
      status: true
    }
  } catch (e) {
    console.log(e);
    return {
      status: false,
      reason: e
    }
  }
}

export async function mintPrivate (token: string, amount: number, encryptionPrivateKey: Fq, signingPrivateKey: Fq, completeAddress: CompleteAddress) {
  const wallet = await loadWallet(encryptionPrivateKey, signingPrivateKey, completeAddress);

  // let tokenContract;
  // if (token.toLowerCase() === 'wmatic') {
  //   tokenContract = await TokenContract.at(AztecAddress.fromString(process.env.WMATIC_ADDRESS), wallet);
  // } else if (token.toLowerCase() === 'usdt') {
  //   tokenContract = await TokenContract.at(AztecAddress.fromString(process.env.USDT_ADDRESS), wallet);
  // } else {
  //   return {
  //       status: false,
  //       reason: 'No such token'
  //     }
  // }
  //
  // tokenContract.methods.shield(wallet.getAddress(), amount, )
  //
  // return {
  //   WMATIC: wmaticBalance.toString(),
  //   USDT: usdtBalance.toString()
  // }
}

export async function shieldBalance (token: string, amount: number, encryptionPrivateKey: Fq, signingPrivateKey: Fq, completeAddress: CompleteAddress) {
  const wallet = await loadWallet(encryptionPrivateKey, signingPrivateKey, completeAddress);

  let tokenContract;
  if (token.toLowerCase() === 'wmatic') {
    tokenContract = await TokenContract.at(AztecAddress.fromString(process.env.WMATIC_ADDRESS), wallet);
  } else if (token.toLowerCase() === 'usdt') {
    tokenContract = await TokenContract.at(AztecAddress.fromString(process.env.USDT_ADDRESS), wallet);
  } else {
    return {
      status: false,
      reason: 'No such token'
    }
  }

  return { status: true }

  // tokenContract.methods.shield(wallet.getAddress(), amount, )

  // return {
  //   WMATIC: wmaticBalance.toString(),
  //   USDT: usdtBalance.toString()
  // }
}
