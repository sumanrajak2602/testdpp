const express = require('express');
const router = express.Router();
const dppController = require('../controllers/dppController');
const { protect } = require('../middleware/auth'); // 
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Create DPP (Authenticated)
//router.post('/', protect, dppController.createDPP);


router.post('/', protect, upload.single('document'), dppController.createDPP);

router.get('/', dppController.getAllDPPs);

// Get DPP by ID
router.get('/:productId', dppController.getDPP);

// Add lifecycle event (Authenticated)
router.patch(
    '/:productId/lifecycle',
    protect,
    upload.single('document'), // Add this
    dppController.addLifecycleEvent
  );
module.exports = router;
