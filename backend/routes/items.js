const express = require('express');
const multer = require('multer');
const path = require('path');
const { verifyToken } = require('../middleware/auth');
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

router.post('/', verifyToken, upload.array('images', 5), createItem);
router.get('/nearby', getNearbyItems);
router.get('/my-items', verifyToken, getUserItems);
router.get('/availability/:itemId', getItemAvailability);
router.get('/:id', getItemById);
router.put('/:id', verifyToken, updateItem);
router.delete('/:id', verifyToken, deleteItem);

module.exports = router;
