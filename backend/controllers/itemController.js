const mongoose = require('mongoose');
const Item = require('../models/Item');
const User = require('../models/User');
const mockDb = require('../utils/mockDb');
const { getDistanceInMeters } = require('../utils/geo');

const isMongoConnected = () => mongoose.connection.readyState === 1;

// Create new listing item
exports.createItem = async (req, res) => {
  try {
    const { name, description, category, condition, rentalPrice, deposit, allowFree, address, coordinates, images: bodyImages } = req.body;

    let parsedRentalPrice = { amount: 0, period: 'day' };
    if (typeof rentalPrice === 'string') {
      try { parsedRentalPrice = JSON.parse(rentalPrice); } catch(e) {}
    } else if (rentalPrice) {
      parsedRentalPrice = rentalPrice;
    }

    let parsedCoordinates = [79.8711, 12.1697];
    if (typeof coordinates === 'string') {
      try {
        const obj = JSON.parse(coordinates);
        parsedCoordinates = [parseFloat(obj.longitude || obj.lng), parseFloat(obj.latitude || obj.lat)];
      } catch(e) {}
    } else if (coordinates && coordinates.longitude) {
      parsedCoordinates = [parseFloat(coordinates.longitude), parseFloat(coordinates.latitude)];
    }

    let imageList = [];
    if (req.files && req.files.length > 0) {
      // In production Cloudinary handles upload; locally or fallback we can save relative/placeholder path
      imageList = req.files.map(f => `/uploads/${f.filename}`);
    } else if (Array.isArray(bodyImages) && bodyImages.length > 0) {
      imageList = bodyImages;
    } else {
      imageList = ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'];
    }

    if (isMongoConnected()) {
      const item = new Item({
        ownerId: req.userId,
        name,
        description,
        category: category || 'Tools',
        condition: condition || 'Good',
        images: imageList,
        location: {
          address: address || 'Local Neighborhood',
          coordinates: {
            type: 'Point',
            coordinates: parsedCoordinates
          }
        },
        rentalPrice: parsedRentalPrice,
        deposit: deposit ? parseFloat(deposit) : 0,
        allowFree: allowFree === true || allowFree === 'true',
        status: 'AVAILABLE'
      });

      await item.save();

      // Populate owner
      await item.populate('ownerId', 'firstName lastName profileImage trustScore');

      return res.status(201).json({ message: 'Item created successfully', item });
    } else {
      await mockDb.initMockData();
      const items = mockDb.getItems();
      const users = mockDb.getUsers();
      const owner = users.find(u => u._id.toString() === req.userId.toString()) || users[0];

      const newItem = {
        _id: '65b' + Date.now().toString().slice(-21),
        ownerId: {
          _id: owner._id,
          firstName: owner.firstName,
          lastName: owner.lastName,
          profileImage: owner.profileImage,
          trustScore: owner.trustScore
        },
        name,
        description,
        category: category || 'Tools',
        condition: condition || 'Good',
        images: imageList,
        location: {
          address: address || owner.location.address,
          coordinates: {
            type: 'Point',
            coordinates: parsedCoordinates
          }
        },
        rentalPrice: parsedRentalPrice,
        deposit: deposit ? parseFloat(deposit) : 0,
        allowFree: allowFree === true || allowFree === 'true',
        status: 'AVAILABLE',
        rating: { average: 5.0, count: 1 },
        views: 1,
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      items.unshift(newItem);
      return res.status(201).json({ message: 'Item created successfully', item: newItem });
    }
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ message: 'Failed to create item', error: error.message });
  }
};

// Get items near user coordinates
exports.getNearbyItems = async (req, res) => {
  try {
    const { longitude = 79.8711, latitude = 12.1697, distance = 50000, category, search, allowFree } = req.query;

    const userCoord = [parseFloat(longitude), parseFloat(latitude)];
    const maxDistMeters = parseFloat(distance);

    if (isMongoConnected()) {
      let query = {};
      if (category) query.category = category;
      if (allowFree === 'true') query.allowFree = true;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      const rawItems = await Item.find(query)
        .populate('ownerId', 'firstName lastName profileImage trustScore')
        .sort({ createdAt: -1 });

      const itemsWithDistance = rawItems.map(item => {
        const itemObj = item.toObject();
        const coords = item.location?.coordinates?.coordinates || [79.8711, 12.1697];
        itemObj.distance = getDistanceInMeters(userCoord, coords);
        return itemObj;
      }).filter(item => item.distance <= maxDistMeters);

      return res.json(itemsWithDistance);
    } else {
      await mockDb.initMockData();
      let rawItems = [...mockDb.getItems()];

      if (category) {
        rawItems = rawItems.filter(i => i.category.toLowerCase() === category.toLowerCase());
      }
      if (allowFree === 'true') {
        rawItems = rawItems.filter(i => i.allowFree);
      }
      if (search) {
        const s = search.toLowerCase();
        rawItems = rawItems.filter(i => i.name.toLowerCase().includes(s) || i.description.toLowerCase().includes(s));
      }

      const itemsWithDistance = rawItems.map(item => {
        const coords = item.location?.coordinates?.coordinates || [79.8711, 12.1697];
        const dist = getDistanceInMeters(userCoord, coords);
        return {
          ...item,
          distance: dist
        };
      }).filter(i => i.distance <= maxDistMeters);

      return res.json(itemsWithDistance);
    }
  } catch (error) {
    console.error('Error fetching nearby items:', error);
    res.status(500).json({ message: 'Failed to fetch items', error: error.message });
  }
};

// Get item by ID
exports.getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      const item = await Item.findById(id).populate('ownerId', 'firstName lastName profileImage trustScore bio phone location');
      if (!item) return res.status(404).json({ message: 'Item not found' });
      item.views += 1;
      await item.save();
      return res.json(item);
    } else {
      await mockDb.initMockData();
      const items = mockDb.getItems();
      const item = items.find(i => i._id.toString() === id.toString());
      if (!item) return res.status(404).json({ message: 'Item not found' });
      item.views = (item.views || 0) + 1;
      return res.json(item);
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch item details', error: error.message });
  }
};

// Get current user's items
exports.getUserItems = async (req, res) => {
  try {
    if (isMongoConnected()) {
      const items = await Item.find({ ownerId: req.userId }).sort({ createdAt: -1 });
      return res.json(items);
    } else {
      await mockDb.initMockData();
      const items = mockDb.getItems().filter(i => {
        const ownerId = typeof i.ownerId === 'object' ? i.ownerId._id : i.ownerId;
        return ownerId.toString() === req.userId.toString();
      });
      return res.json(items);
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user items' });
  }
};

// Update item
exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      const item = await Item.findById(id);
      if (!item) return res.status(404).json({ message: 'Item not found' });
      if (item.ownerId.toString() !== req.userId.toString()) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      Object.assign(item, req.body);
      await item.save();
      return res.json({ message: 'Item updated successfully', item });
    } else {
      await mockDb.initMockData();
      const items = mockDb.getItems();
      const item = items.find(i => i._id.toString() === id.toString());
      if (!item) return res.status(404).json({ message: 'Item not found' });

      Object.assign(item, req.body, { updatedAt: new Date() });
      return res.json({ message: 'Item updated successfully', item });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update item' });
  }
};

// Delete item
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      const item = await Item.findById(id);
      if (!item) return res.status(404).json({ message: 'Item not found' });
      if (item.ownerId.toString() !== req.userId.toString()) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      await Item.deleteOne({ _id: id });
      return res.json({ message: 'Item deleted successfully' });
    } else {
      await mockDb.initMockData();
      const items = mockDb.getItems();
      const index = items.findIndex(i => i._id.toString() === id.toString());
      if (index !== -1) {
        items.splice(index, 1);
      }
      return res.json({ message: 'Item deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete item' });
  }
};

// Availability calendar
exports.getItemAvailability = async (req, res) => {
  try {
    const { itemId } = req.params;
    if (isMongoConnected()) {
      const item = await Item.findById(itemId);
      if (!item) return res.status(404).json({ message: 'Item not found' });
      return res.json({ itemId: item._id, availability: item.availability });
    } else {
      await mockDb.initMockData();
      const item = mockDb.getItems().find(i => i._id.toString() === itemId.toString());
      if (!item) return res.status(404).json({ message: 'Item not found' });
      return res.json({ itemId: item._id, availability: item.availability || { available: true, calendar: [] } });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch availability' });
  }
};
