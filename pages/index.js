import { Inter } from 'next/font/google'
import { useWalletTokenBalance } from '@lndgalante/solutils';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { Transaction,  } from "@solana/web3.js";
import { useState } from "react";
import dynamic from 'next/dynamic'
import Header from '@/components/Header'
import Button from '@/components/Button'


const inter = Inter({ subsets: ['latin'] })

function Home() { 
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  //New
  const [txid, setTxid] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amountToTransfer, setAmountToTransfer] = useState(0);
  const [isSending, setIsSending] = useState(false);

  const keypair = Keypair.generate(); // Generate a new keypair


  //Hardcoded Recipient
  const hardcodedRecipient = "BStZkRJAzUXroTFqbEHyCD4uh5boTLF42BubrJwh1hx7";

  const onClickTransfer = async () => {
    if (!publicKey) return;

    try {
      new PublicKey(hardcodedRecipient);
    } catch (error) {
      alert("Invalid Public Key");
      return;
    }

    setIsSending(true);

    try {
      const ix = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey(hardcodedRecipient),
        lamports: amountToTransfer,
      });

      const { blockhash } = await connection.getLatestBlockhash();
      const transaction = new Transaction().add(ix); // Create a Transaction
      transaction.recentBlockhash = blockhash; // Set the recent blockhash
      transaction.sign(keypair); // Sign the transaction with the keypair
      const txid = await connection.sendTransaction(transaction); // Send the transaction
      setTxid(txid);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  }

  // solutils hooks
  const { getWalletTokenBalance, result, status, error } = useWalletTokenBalance(publicKey, connection);

  // handlers
  function handleWalletBalanceRequest() {
    getWalletTokenBalance('SOL');
  }

  return (
    <main className='flex min-h-screen flex-col p-10 '>
        <Header/>
        <div className="relative ">
          <div className="absolute right-0 top-3">
          
          <WalletMultiButton />
          </div>
        </div>
        <div className="">
          <h1 className='font-900 text-xl font-sans'>
            Solana SOL Checker
          </h1>
          {publicKey ? 
          <div className='place-items-center grid mt-10'>
            <Button onClick={handleWalletBalanceRequest}>Request Wallet Balance</Button>
            {status === 'iddle' ? <p>Haven&apos;t requested any SOL balance yet</p> : null}
            {status === 'loading' ? <p>Requesting your SOL balance tokens</p> : null}
            {status === 'success' ? <p>We successfully got your balance: {result} SOL</p> : null}
            {status === 'error' ? <p>{error}</p> : null}
          </div> : null}
      </div>

      <div>
      <div className='mt-6'>
        <p className='font-semibold'>Transfer SOL</p>
        <div className='mt-4'>
          Recipient:{""}
          <input
            value={hardcodedRecipient}
            className='text-black rounded-lg border border-black/10 px-2 py-1 w-full max-w-[480px]'
            onChange={(e) => {
              setRecipient(e.target.value);
            }}
          />
        </div>
        <div className='mt-4'>
          Amount to transfer:{" "}
          <input
            className='text-black rounded-lg border border-black-10 px-2 py-1'
            value={amountToTransfer}
            onChange={(e) => {
              setAmountToTransfer(e.target.valueAsNumber);
            }}
            type='number'
          />
        </div>

        {isSending ? (
          <button
            type='button'
            disabled
            className='text-black backdrop-blur-2xl rounded-xl px-4 py-2 bg-white mt-4 cursor-not-allowed opacity-50'
          >
            Sending...
          </button>
        ) : (
          <button
            type='button'
            onClick={onClickTransfer}
            className='text-black backdrop-blur-2xl rounded-xl px-4 py-2 border-black mt-4'
          >
            Transfer
          </button>
        )}
      </div>

      <div className='mt-6'>
        <p className='font-semibold'>Transaction ID:</p>
        <div className='mt-4 text-xs'>{txid}</div>

        <div className='flex mt-4'>
          {txid ? (
            <a
              href={`https://explorer.solana.com/tx/${txid}?cluster=devnet`}
              target='_blank'
              className='text-black backdrop-blur-2xl rounded-xl px-4 py-2 bg-white'
            >
              Open Explorer
            </a>
          ) : null}
        </div>
      </div>

      </div>
    </main>
  )
}


export default dynamic (() => Promise.resolve(Home), {ssr: false} )