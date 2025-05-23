const DPP = require('../models/DPP');
const {  recordDPPHash,
  updateDPPHash } = require('../services/blockchain');
  const { uploadToIPFS } = require('../services/ipfs');


const crypto = require('crypto');





exports.createDPP = async (req, res) => {
  try {
    let ipfsHash = '';

    // Handle file upload if present
    if (req.file) {
      console.log('Uploading document to IPFS...');
      ipfsHash = await uploadToIPFS(req.file);
      console.log(`Document uploaded to IPFS: ${ipfsHash}`);
    }

    // Parse JSON arrays from strings if present (coming from multipart/form-data)
    let materials = [];
    let certifications = [];
    let supplyChainActors = [];

    try {
      materials = req.body.materials ? JSON.parse(req.body.materials) : [];
    } catch (e) {
      console.warn('Could not parse materials JSON:', e.message);
    }
    try {
      certifications = req.body.certifications ? JSON.parse(req.body.certifications) : [];
    } catch (e) {
      console.warn('Could not parse certifications JSON:', e.message);
    }
    try {
      supplyChainActors = req.body.supplyChainActors ? JSON.parse(req.body.supplyChainActors) : [];
    } catch (e) {
      console.warn('Could not parse supplyChainActors JSON:', e.message);
    }

    // Create DPP data object with parsed arrays
    const dppData = {
      ...req.body,
      materials,
      certifications,
      supplyChainActors,
      productId: crypto.randomUUID(),
      creator: req.user.id,
      ipfsHash,
    };

    console.log('Saving DPP to DB...');
    const dpp = new DPP(dppData);
    await dpp.save();
    console.log('DPP saved successfully.');

    // Record hash on blockchain
    const dppJson = dpp.toJSON();
    console.log('Recording hash on blockchain...');
    await recordDPPHash(dpp.productId, dppJson);

    res.status(201).json(dpp);
  } catch (err) {
    console.error('Error creating DPP:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.getDPP = async (req, res) => {
  try {
    let productId = req.params.productId;
    console.log('Raw productId:', JSON.stringify(productId));

    productId = productId.trim();  // Remove whitespace/newlines

    console.log('Trimmed productId:', JSON.stringify(productId));

    const dpp = await DPP.findOne({ productId });

    if (!dpp) return res.status(404).json({ error: 'DPP not found in DB' });

    res.json(dpp);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.addLifecycleEvent = async (req, res) => {
  try {
    const productId = req.params.productId.trim(); // Clean in case of trailing newlines

    const dpp = await DPP.findOne({ productId });
    
    // Upload document to IPFS
    let ipfsHash = '';
    if (req.file) {
      ipfsHash = await uploadToIPFS(req.file);
    }

    // Create event with IPFS hash
    const eventData = {
      ...req.body,
      ipfsHash
    };

    dpp.lifecycleEvents.push(eventData);
    await dpp.save();
    console.log('💾 DPP document saved to DB.');

    // Update hash on blockchain
    await updateDPPHash(dpp.productId, dpp.toJSON());
    console.log('🔗 Blockchain hash updated.');


    res.json(dpp);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};



exports.getAllDPPs = async (req, res) => {
  try {
    console.log("Fetching all DPPs...");
    const dpps = await DPP.find().sort({ createdAt: -1 }); // Removed populate
    res.json(dpps);
  } catch (err) {
    console.error("Error fetching DPPs:", err);
    res.status(500).json({ error: 'Server error' });
  }
};
