import { Keypair, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import { test, describe, expect, beforeAll } from "bun:test";
import { LiteSVM } from "litesvm";


describe("Create pda from client", () => {
    let liteSvm: LiteSVM;
    let pda: PublicKey;
    let bump: number;
    let programId: PublicKey;
    let payer: Keypair;

    beforeAll(() => {
        liteSvm = new LiteSVM();
        programId = PublicKey.unique();
        payer = Keypair.generate();
        liteSvm.addProgramFromFile(programId, "./contract.so");
        liteSvm.airdrop(payer.publicKey, BigInt(100000000000));
        [pda, bump] = PublicKey.findProgramAddressSync([Buffer.from("client1"), payer.publicKey.toBuffer()], programId);

        let ix = new TransactionInstruction({
            keys: [
                {
                    pubkey: payer.publicKey,
                    isSigner: true,
                    isWritable: true,
                },
                {
                    pubkey: pda,
                    isSigner: false,
                    isWritable: true,
                },
                {
                    pubkey: SystemProgram.programId,
                    isSigner: false,
                    isWritable: false,
                },
            ],
            programId,
            data: Buffer.from("")
        });

        const tx = new Transaction().add(ix);
        tx.feePayer = payer.publicKey;
        tx.recentBlockhash = liteSvm.latestBlockhash();
        tx.sign(payer);
        let res = liteSvm.sendTransaction(tx);
        console.log(res.toString());
    });

    test("should create pda", () => {
        const balance = liteSvm.getBalance(pda);
        console.log(balance);
        expect(Number(balance)).toBeGreaterThan(0);
        expect(Number(balance)).toBe(1000000000);
    });
});