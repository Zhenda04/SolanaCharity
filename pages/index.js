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

    const [isOpen, setIsOpen] = useState(false);

    const [selectedModal, setSelectedModal] = useState(0);


    const organizations = [
        {
            id: 1,
            name: 'UK Cancer Research',
            description: `'UK Cancer Research' is relentless in its fight against cancer. Cancer is one of the most relentless adversaries we face, but our determination remains unwavering. Our ultimate goal is to conquer cancer, and there is nothing more vital.

            Our mission is to provide hope to those affected by cancer and their families and to continually offer support for research aimed at defeating cancer. Your support is the key to achieving this.
    
            There are various ways you can support us. First and foremost, you can make a donation. This is a crucial means of providing funds for cancer research, advancing the development of new treatments and diagnostic methods. Many people suffering from cancer believe that your donation can be the lifeline that saves them.
    
            Additionally, you can leave a gift in your will. This allows you to support cancer research after you have passed, leaving a legacy that will be a valuable resource for continuing the fight against cancer for future generations.
    
            Another option is to make regular donations. By contributing a fixed amount each month, you can provide sustained support, ensuring ongoing assistance for cancer research and patients.
    
            We are eagerly awaiting your participation. Cancer is our common enemy, and by fighting together, we can undoubtedly emerge victorious. Join us in protecting people from cancer and nurturing new hope.
    
            If you would like to learn more, please click the link below for further information. Let's beat cancer together.
            `,
            address: '31PR8yQkHYHVK2jtcrfmGF389ogGxc5GBkL3HybdTe8c',
            img: 'char.jpg',
            alt: 'uk',
            link: 'www.google.com',
            createdDate: "5, Sep, 2023",
            startDate: "2, Oct, 2023",
            endDate: "10, Dec, 2023",
            amount: 20000,
            amountCollected: 14000,
            numberOfDonors: 342
        },
        {
            id: 2,
            name: 'Send a Child to School',
            description: `"Send a Child to School" is dedicated to providing education to all children. Thousands of children in Africa drop out of school each year simply because their parents cannot afford tuition and school-related costs. However, we are determined to change this.

            Our mission is to offer access to education for children from impoverished families. We extend a helping hand to them and their families to ensure that they can attend school. Their education forms the foundation for a brighter future and the pursuit of their dreams.

            By funding this project, you contribute to providing children with the opportunity to receive an education and take a step closer to future success. Your support is the power to change these children's futures. Let's work together to bring education to these children.

            If you'd like to learn more or make a donation, please click the link below. Let's change the world through the power of education.
            `,
            address: 'BStZkRJAzUXroTFqbEHyCD4uh5boTLF42BubrJwh1hx7',
            img: 'char2.jpg',
            alt: 'send child to School',
            createdDate: "5, Sep, 2023",
            startDate: "2, Oct, 2023",
            endDate: "10, Dec, 2023",
            amount: 140000,
            amountCollected: 65000,
            numberOfDonors: 80
        },
        {
            id: 3,
            name: 'Beirut Disaster Relief Fund',
            description: `The "Beirut Blast Lebanon Disaster Relief Fund" was established to support Lebanon and its citizens during unprecedented social, economic, and political turmoil that has persisted for months, if not years.

            Lebanon is facing multiple crises, and its citizens are in increasingly dire need of support. We aim to address this critical situation and provide assistance to the affected individuals and their families.

            Our goal is to provide the necessary support for the people of Lebanon to recover from challenging circumstances. Your donation is a crucial contribution to achieving this mission. Together, let's offer hope and support to the people of Lebanon.

            If you'd like to learn more or make a donation, please click the link below. Let's contribute to the recovery of Lebanon.
            `,
            address: '7zDQyqoocARgZN16RifaBjWwuevgougfJPYK6ozz7PNF',
            img: 'char3.jpg',
            alt: 'Disaster relief',
            createdDate: "5, Sep, 2023",
            startDate: "2, Oct, 2023",
            endDate: "10, Dec, 2023",
            amount: 10000,
            amountCollected: 5000,
            numberOfDonors: 33
        },
        {
            id: 4,
            name: 'Donation Pool',
            description: `"Donation Pool" is a solution for those who are unsure which organization to donate to. When the pool is filled, donations are randomly distributed to fundraising campaigns.

            We believe that this pool is convenient for situations where it's difficult to choose a charity or if you're uncertain about where to contribute. Your donation will be effectively distributed to various charitable organizations once the pool is full.

            By contributing to the pool, you can make a meaningful impact on multiple charitable causes and spread goodwill and kindness. Together, let's share our generosity with the world.

            If you'd like to learn more or make a donation, please click the link below. Let's spread kindness and make a positive impact on the world through donations.
            `,
            address: 'BStZkRJAzUXroTFqbEHyCD4uh5boTLF42BubrJwh1hx7',
            img: 'char5.jpg',
            alt: 'Earthquake relief',
            createdDate: "5, Sep, 2023",
            startDate: "2, Oct, 2023",
            endDate: "10, Dec, 2023",
            amount: 6500,
            amountCollected: 30,
            numberOfDonors: 5
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
                    <div key={org.id} className={`w-80 rounded-lg overflow-hidden shadow-md border border-gray-300  ${org.id === 4 ? 'w-80 rounded-lg overflow-hidden shadow-md border border-yellow-300' : ''}`}>
                        <button onClick={() => { setIsOpen(true); setSelectedModal(org.id) }}>
                            <div>
                                <div className="w-full h-50">
                                    <img src={window.location.origin + '/' + org.img} alt={org.alt} />
                                </div>
                                <div className="p-4">
                                    <h2 className='font-bold text-xl'>{org.name}</h2>
                                    <p className='text-gray-200'>
                                        {org.description.length > 150 ?
                                            org.description.slice(0, 150).replace(/\s+/g, ' ') + '...' :
                                            org.description.replace(/\s+/g, ' ')
                                        }
                                    </p>
                                </div>
                            </div>
                        </button>

                        <div className='p-4'>
                            <button className="ml-1 mb-1 bg-blue-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mt-2" onClick={() => handleOrganizationSelect(org)}>
                                Donate
                            </button>

                            <div className="relative pt-1 mt-5">
                                <div className="flex mb-2 items-center justify-between">
                                    <div>
                                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white-500 bg-green-500">
                                            Fund Progress
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-semibold inline-block text-yellow-400">
                                            {Math.round((org.amountCollected / org.amount) * 100)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                                    <div style={{ width: "70%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-400"></div>
                                </div>
                            </div>

                            <div className="relative">
                                {isOpen && org.id == selectedModal && (
                                    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-50">
                                        <div className="p-6 rounded-lg w-1/2 shadow-xl z-10 fixed top-1/10 left-1/4" style={{ backgroundColor: '#242424' }}>
                                            <button className="ml-1 mb-1 bg-red-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mt-2" onClick={() => setIsOpen(false)}>
                                                &times;
                                            </button>
                                            <div className='p-5'>
                                                <h2 className="text-xl font-bold mb-4">{org.name}</h2>
                                                <div className='pl-5'>
                                                    <p className="mb-4 text-gray-200">Organization Overview</p>
                                                    <p className="mb-4 text-gray-200">Start of Collection: {org.startDate}</p>
                                                    <p className="mb-4 text-gray-200">End of Collection: {org.endDate}</p>
                                                    <p className="mb-4 text-gray-200">Target Amount: ${org.amount.toLocaleString()}</p>
                                                    <p className="mb-4 text-gray-200">Amount Collected: ${org.amountCollected.toLocaleString()}</p>
                                                    <p className="mb-4 text-gray-200">Number of Donors: {org.numberOfDonors.toLocaleString()}</p>
                                                </div>
                                                <h2 className="text-xl font-bold mb-4">Description</h2>
                                                <div className="overflow-y-auto max-h-80 text-gray-200">
                                                    {org.description.split('\n').map((line, index) => (
                                                        <span key={index}>
                                                            {line}
                                                            <br />
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="fixed top-0 left-0 w-full h-full bg-black opacity-10 z-0" onClick={() => setIsOpen(false)}></div>
                                    </div>
                                )}
                            </div>
                        </div>
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