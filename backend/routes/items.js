const express = require('express');
const multer = require('multer');
const path = require('path');
const { verifyToken } = require('../middleware/auth');
const { cacheMiddleware } = require('../middleware/cache');
const {
  createItem,
  getNearbyItems,
  getItemById,
  getUserItems,
  updateItem,
  deleteItem,
  getItemAvailability
} = require('../controllers/itemController');

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

// Cached public search and availability endpoints (300 seconds TTL)
router.get('/nearby', cacheMiddleware(300), getNearbyItems);
router.get('/availability/:itemId', cacheMiddleware(300), getItemAvailability);

// Authenticated item routes
router.post('/', verifyToken, upload.array('images', 5), createItem);
router.get('/my-items', verifyToken, getUserItems);
router.get('/:id', cacheMiddleware(180), getItemById);
router.put('/:id', verifyToken, updateItem);
router.delete('/:id', verifyToken, deleteItem);

module.exports = router;
