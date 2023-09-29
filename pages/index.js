import { Inter } from 'next/font/google';
import React, { useState, useEffect } from 'react';
import { useConnection, useWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import { useWalletTokenBalance } from '@lndgalante/solutils';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Button from '@/components/Button';

import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';

const inter = Inter({ subsets: ['latin'] });

function Home() {
const { publicKey } = useWallet();
const { connection } = useConnection();

const { getWalletTokenBalance, result, status, error } = useWalletTokenBalance(publicKey, connection);

const [recipientPublicKey, setRecipientPublicKey] = useState('BStZkRJAzUXroTFqbEHyCD4uh5boTLF42BubrJwh1hx7');
const [sendAmount, setSendAmount] = useState(1);

const wallet = useAnchorWallet();
const [txHash, setTxHash] = useState(null);

async function sendSOLToSpecificAddress() {
    if (!recipientPublicKey || sendAmount <= 0) {
    alert('Please provide a valid recipient and amount.');
    return;
    }

    try {
    const sender = new PublicKey(publicKey);
    const receiver = new PublicKey(recipientPublicKey);

    const recentBlockhash = await connection.getRecentBlockhash();

    const transaction = new Transaction()
        .add(
        SystemProgram.transfer({
            fromPubkey: sender,
            toPubkey: receiver,
            lamports: sendAmount * 10 ** 9,
        })
        );

    transaction.recentBlockhash = recentBlockhash.blockhash;

    if (!wallet) {
        alert('Wallet not connected');
        return;
    }

    transaction.feePayer = sender;

    const signature = await wallet.signTransaction(transaction);

    const txHash = await connection.sendRawTransaction(signature.serialize());
    await connection.confirmTransaction(txHash);

    alert(`Transaction successful. Transaction hash: ${txHash}`);
    } catch (err) {
    console.error(`Error sending SOL: ${err}`);
    alert(`Error sending SOL: ${err}`);
    }
}

function handleWalletBalanceRequest() {
    if (publicKey) {
    getWalletTokenBalance('SOL');
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
        <h2 className='font-900 text-lg font-sans'>Recipient</h2>
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
        <Button onClick={sendSOLToSpecificAddress} className='mt-10'>
        Send
        </Button>
    </div>
    <div className='mt-6'>
        <p className='font-semibold'>Transaction ID:</p>
        <div className='mt-4 text-xs'>{txHash}</div>
        <div className='flex mt-4'>
        {txHash ? (
            <a
            href={`https://explorer.solana.com/tx/${txHash}?cluster=devnet`}
            target='_blank'
            className='text-black backdrop-blur-2xl rounded-xl px-4 py-2 bg-black'
            >
            Open Explorer
            </a>
        ) : null}
        </div>
    </div>

    </main>

)
}

export default dynamic(() => Promise.resolve(Home), { ssr: false })