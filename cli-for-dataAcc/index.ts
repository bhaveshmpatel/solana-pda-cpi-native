import { Connection, Keypair, LAMPORTS_PER_SOL, SystemProgram, Transaction } from "@solana/web3.js";

const conn = new Connection("http://127.0.0.1:8899");

async function main() {
  const kp = Keypair.generate()
  const dataAcc = Keypair.generate()
  const signature = await conn.requestAirdrop(kp.publicKey, 1 * LAMPORTS_PER_SOL)
  await conn.confirmTransaction(signature);
  const balance = await conn.getBalance(kp.publicKey);

  const instruction = SystemProgram.createAccount({
    fromPubkey: kp.publicKey,
    newAccountPubkey: dataAcc.publicKey,
    lamports: await conn.getMinimumBalanceForRentExemption(8),
    space: 8,
    programId: SystemProgram.programId
  })
  const tx = new Transaction().add(instruction);
  tx.feePayer = kp.publicKey;
  tx.recentBlockhash = (await conn.getLatestBlockhash()).blockhash;
//   tx.sign(kp)
  await conn.sendTransaction(tx, [kp, dataAcc]);
  console.log(dataAcc.publicKey.toBase58());
}

main();
