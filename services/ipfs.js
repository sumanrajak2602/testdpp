const pinataSDK = require('@pinata/sdk');
const pinata = new pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_KEY
);

exports.uploadToIPFS = async (file) => {
  try {
    const readableStream = require('stream').Readable.from(file.buffer);
    const options = { pinataMetadata: { name: file.originalname } };
    
    const result = await pinata.pinFileToIPFS(readableStream, options);
    return result.IpfsHash;
  } catch (err) {
    throw new Error(`IPFS upload failed: ${err.message}`);
  }
};