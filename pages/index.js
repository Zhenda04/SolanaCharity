import { Inter } from 'next/font/google';
import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useWalletTokenBalance } from '@lndgalante/solutils';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Button from '@/components/Button';

import { PublicKey, Transaction, sendAndConfirmTransaction, SystemProgram } from '@solana/web3.js';

const inter = Inter({ subsets: ['latin'] })

function Home() {
  const { publicKey, wallet } = useWallet();
  const { connection } = useConnection();

  // solutils hooks
  const { getWalletTokenBalance, result, status, error } = useWalletTokenBalance(publicKey, connection);

  // State to store the recipient's public key and amount for sending SOL
  const [recipientPublicKey, setRecipientPublicKey] = useState('');
  const [sendAmount, setSendAmount] = useState(0);

  // handlers
  function handleWalletBalanceRequest() {
    getWalletTokenBalance('SOL');
  }

  async function sendSOLToRecipient() {
    if (!recipientPublicKey || sendAmount <= 0) {
      alert('Please provide a valid recipient and amount.');
      return;
    }

    try {
      // Convert the recipient's public key to a PublicKey object
      const receiver = new PublicKey(recipientPublicKey);

      // Create a new transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: receiver,
          lamports: sendAmount * 10 ** 9, // Convert SOL to lamports
        })
      );

      // Sign the transaction
      const signature = await wallet.signTransaction(transaction);

      // Send the transaction and confirm it
      const txHash = await connection.sendRawTransaction(signature.serialize());
      await connection.confirmTransaction(txHash);

      // Transaction was successful
      alert(`Transaction successful. Transaction hash: ${txHash}`);
    } catch (err) {
      console.error(`Error sending SOL: ${err}`);
      alert(`Error sending SOL: ${err}`);
    }
  }

  return (
    <main className='flex min-h-screen flex-col p-10 '>
      <Header />
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
            {status === 'idle' ? <p>Haven't requested any SOL balance yet</p> : null}
            {status === 'loading' ? <p>Requesting your SOL balance tokens</p> : null}
            {status === 'success' ? <p>We successfully got your balance: {result} SOL</p> : null}
            {status === 'error' ? <p>{error}</p> : null}
          </div> : null}
      </div>

      <div className='mt-4'>
        <h2 className='font-900 text-lg font-sans'>Send SOL to Another Address</h2>
        <div className='grid grid-cols-2 gap-4'>
          <input
            type='text'
            placeholder="Recipient's Public Key"
            value={recipientPublicKey}
            onChange={(e) => setRecipientPublicKey(e.target.value)}
            className='p-2 border border-gray-300 rounded'
          />
          <input
            type='number'
            placeholder='Amount SOL'
            value={sendAmount}
            onChange={(e) => setSendAmount(e.target.value)}
            className='p-2 border border-gray-300 rounded'
          />
        </div>
        <Button onClick={sendSOLToRecipient} className='mt-2'>
          Send SOL
        </Button>
      </div>
    </main>
  )
}

export default dynamic(() => Promise.resolve(Home), { ssr: false })
