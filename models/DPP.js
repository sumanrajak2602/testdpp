const mongoose = require('mongoose');

const dppSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  manufacturer: { type: String, required: true },
  productionDate: { type: Date, default: Date.now },
  ipfsHash: String,
  lifecycleEvents: [{
    timestamp: { type: Date, default: Date.now },
    event: String,
    actor: String,
    ipfsHash: String // Add this
  }],
  materials: [{
    name: String,
    weight: Number,
    recycled: Boolean
  }],
  certifications: [String],
  supplyChainActors: [{
    name: String,
    role: String,
    address: String
  }]
});

module.exports = mongoose.model('DPP', dppSchema);