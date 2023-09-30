import { Inter } from 'next/font/google';
import React, { useState, useEffect } from 'react';
import { useConnection, useWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import { useWalletTokenBalance } from '@lndgalante/solutils';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Button from '@/components/Button';
import Link from 'next/link';
// import 'bootstrap/dist/css/bootstrap.css';


import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';

const inter = Inter({ subsets: ['latin'] });

function Home() {
const { publicKey } = useWallet();
const { connection } = useConnection();

const { getWalletTokenBalance, result, status, error } = useWalletTokenBalance(publicKey, connection);

const [recipientPublicKey, setRecipientPublicKey] = useState('');
const [sendAmount, setSendAmount] = useState();

const wallet = useAnchorWallet();
const [txHash, setTxHash] = useState(null);


const organizations = [
    {
    id: 1,
    name: 'UK Cancer Research',
    description: 'Cancer is relentless. But so are we. Whether you fundraise, pledge to leave a gift in your will or donate. Every supports life-saving research. Play your part and together we will beat cancer.​[learn more]',
    address: '31PR8yQkHYHVK2jtcrfmGF389ogGxc5GBkL3HybdTe8c',
    img: 'char.jpg',
    alt: 'uk',
    link: 'www.google.com'
    },
    {
    id: 2,
    name: 'Send a Child to School',
    description: 'Every children deserve education. Thousands of children in Africa drop out of school each year simply because their parents cannot afford to cover tuition and school-related costs. [learn more]',
    address: 'BStZkRJAzUXroTFqbEHyCD4uh5boTLF42BubrJwh1hx7',
    img: 'char2.jpg',
    alt: 'send child to School'
    },
    {
        id: 3,
        name: 'Beirut Blast Lebanon Disaster Relief Fund',
        description: 'Lebanon and its citizens are experiencing unprecedented social, economic and political turmoil for months if not years. [learn more]',
        address: '7zDQyqoocARgZN16RifaBjWwuevgougfJPYK6ozz7PNF',
        img: 'char3.jpg',
        alt: 'Disaster relief'
    },
    {
        id: 4,
        name: 'Donation Pool',
        description: 'Do not know who to donate? Donate to the donation pool so that the donation will be distributed to fundraiser randomly once the pool is fulled [learn more]',
        address: 'BStZkRJAzUXroTFqbEHyCD4uh5boTLF42BubrJwh1hx7',
        img: 'char5.jpg',
        alt: 'Earthquake relief'
    },
];
function handleOrganizationSelect(org) {
    setRecipientPublicKey(org.address);
}



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
    setTxHash(txHash);
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
        {publicKey ? 
        <div className='place-items-start grid mt-3'>
            <Button onClick={handleWalletBalanceRequest}>Check Wallet Balance</Button>
            {status === 'idle' ? <p>Haven't requested any SOL balance yet</p> : null}
            {status === 'loading' ? <p>Requesting your SOL balance tokens</p> : null}
            {status === 'success' ? <p>SOL Balance: {result} SOL</p> : null}
            {status === 'error' ? <p>{error}</p> : null}
        </div> : null}
    </div>

    <div className="flex justify-center mx-4 space-x-4 mt-3">
      {/* Render organization cards */}
      {organizations.map((org) => (
    <div key={org.id} className={`w-80 rounded-lg overflow-hidden shadow-md border border-gray-300 cursor-pointer ${org.id === 4 ? 'w-80 rounded-lg overflow-hidden shadow-md border border-yellow-300 cursor-pointer' : ''}`}>
    <Link href={`/organization/${org.id}`}>
            <div>
              <div className="w-full h-50">
                <img src={window.location.origin + '/' + org.img} alt={org.alt} />
              </div>
              <div className="p-4">
                <h2 className='font-bold text-xl'>{org.name}</h2>
                <p className='text-gray-200'>{org.description}</p>
              </div>
            </div>
          </Link>
          <button className="ml-1 mb-1 bg-blue-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mt-2" onClick={() => handleOrganizationSelect(org)}>
            Donate
          </button>
        </div>
      ))}
    </div>

    <div className='mt-4'>
        <h2 className='font-900 text-lg font-sans'>Recipient</h2>
        <div className='grid grid-cols-2 gap-4'>
        <input
            type='text'
            placeholder="Recipient's Public Key"
            value={recipientPublicKey}
            onChange={(e) => setRecipientPublicKey(e.target.value)}
            className='placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-m font-sans font-medium text-m'
            style={{ color: '#303030' }}
            readOnly
        />
        <input
            type='number'
            placeholder='Amount SOL'
            value={sendAmount}
            onChange={(e) => setSendAmount(e.target.value)}
            className='placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-m font-sans font-medium text-m'
            style={{ color: '#303030' }}
        />
        </div>
        <div className='mt-2'>
            <Button onClick={sendSOLToSpecificAddress} className=''>
            Send
            </Button>
        </div>
    </div>
    <div className='mt-6'>
        <p className='font-semibold'>Transaction ID:</p>
        <div className='mt-4 text-m'>{txHash}</div>
        <div className='flex mt-4'>
        {txHash ? (
            <a
            href={`https://explorer.solana.com/tx/${txHash}?cluster=devnet`}
            target='_blank'
            className='text-black backdrop-blur-2xl rounded-xl px-4 py-2 bg-white'
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