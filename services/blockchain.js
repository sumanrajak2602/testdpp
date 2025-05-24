// services/blockchain.js
const Web3 = require('web3').default;

const SHA256 = require('crypto-js/sha256');

const DPPRegistryABI = require('../build/contracts/DPPRegistry.json').abi; // Import ABI from compiled contract

const web3 = new Web3(process.env.BLOCKCHAIN_RPC_URL);
const contractAddress = process.env.CONTRACT_ADDRESS;
const dppContract = new web3.eth.Contract(DPPRegistryABI, contractAddress);

// Generate hash of DPP data
// const generateDPPHash = (dppData) => {
//   const hashData = {
//     ...dppData,
//     ipfsHash: dppData.ipfsHash || ''
//   };
//   return SHA256(JSON.stringify(hashData)).toString();
// };


const generateDPPHash = (dppData) => {
  const hashData = {
    ...dppData,
    lifecycleEvents: dppData.lifecycleEvents.map(event => ({
      ...event,
      ipfsHash: event.ipfsHash || ''
    }))
  };
  return SHA256(JSON.stringify(hashData)).toString();
};

// Create/update DPP hash on blockchain
const recordDPPHash = async (productId, dppData) => {
  const hash = '0x' + generateDPPHash(dppData);
  const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
  web3.eth.accounts.wallet.add(account); // ✅ add to wallet

  console.log(`Using account: ${account.address}`);

  const balance = await web3.eth.getBalance(account.address);
  console.log(`Account balance: ${web3.utils.fromWei(balance, 'ether')} ETH`);

  const gas = await dppContract.methods.createDPP(productId, hash).estimateGas({
    from: account.address
  });

  console.log('Estimated gas:', gas);

  const tx = await dppContract.methods.createDPP(productId, hash).send({
    from: account.address,
    gas
  });

  console.log('Transaction successful:', tx.transactionHash);
  return tx.transactionHash;
};



const updateDPPHash = async (productId, updatedData) => {
  console.log('🔄 Starting updateDPPHash...');
  
  const hash = '0x' + generateDPPHash(updatedData);
  const cleanProductId = productId.trim();

  console.log('🆔 Clean Product ID:', cleanProductId);
  console.log('🔐 Generated Hash:', hash);

  const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
  web3.eth.accounts.wallet.add(account);
  
  console.log('👤 Using Account:', account.address);

  const tx = dppContract.methods.updateDPP(cleanProductId, hash);

  try {
    const gasEstimate = await tx.estimateGas({ from: account.address });
    console.log('⛽ Estimated Gas:', gasEstimate);

    const receipt = await tx.send({
      from: account.address,
      gas: gasEstimate
    });

    console.log('✅ Transaction successful!');
    console.log('📄 Transaction Hash:', receipt.transactionHash);
    console.log('📦 Block Number:', receipt.blockNumber);
    return receipt.transactionHash;
  } catch (error) {
    console.error('❌ Error sending transaction:', error.message);
    throw error; // rethrow for outer catch block if needed
  }
};


module.exports = {
  generateDPPHash,
  recordDPPHash,
  updateDPPHash
};