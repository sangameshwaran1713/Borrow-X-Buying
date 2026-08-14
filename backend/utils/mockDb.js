const bcrypt = require('bcryptjs');

let users = [];
let items = [];
let borrowRequests = [];
let reviews = [];
let notifications = [];

let isInitialized = false;

async function initMockData() {
  if (isInitialized) return;
  
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user1 = {
    _id: '65b123456789012345678901',
    firstName: 'Alex',
    lastName: 'Morgan',
    email: 'alex@example.com',
    password: hashedPassword,
    phone: '+1 555-0192',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    location: {
      address: '124 Maple Avenue, Downtown',
      coordinates: { type: 'Point', coordinates: [79.8711, 12.1697] }
    },
    trustScore: { overall: 94, trust: 96, availability: 92, condition: 95, response: 93 },
    bio: 'Avid DIY enthusiast, cyclist, and tech tinkerer. Happy to share my tools and gear!',
    totalBorrowings: 14,
    totalLendings: 22,
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const user2 = {
    _id: '65b123456789012345678902',
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'sarah@example.com',
    password: hashedPassword,
    phone: '+1 555-0144',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    location: {
      address: '88 Oak Lane, Westside',
      coordinates: { type: 'Point', coordinates: [79.8850, 12.1750] }
    },
    trustScore: { overall: 89, trust: 90, availability: 88, condition: 91, response: 87 },
    bio: 'Outdoor explorer & photography hobbyist. Love community sharing!',
    totalBorrowings: 9,
    totalLendings: 18,
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const user3 = {
    _id: '65b123456789012345678903',
    firstName: 'David',
    lastName: 'Kowalski',
    email: 'david@example.com',
    password: hashedPassword,
    phone: '+1 555-0188',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    location: {
      address: '45 Pine Street, North Suburb',
      coordinates: { type: 'Point', coordinates: [79.8600, 12.1600] }
    },
    trustScore: { overall: 96, trust: 98, availability: 95, condition: 96, response: 95 },
    bio: 'Home gardener and woodworker. Always willing to help neighbors with projects.',
    totalBorrowings: 5,
    totalLendings: 30,
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  users = [user1, user2, user3];

  items = [
    {
      _id: '65b222222222222222222201',
      ownerId: user1._id,
      name: 'DeWalt 20V Max Cordless Drill Combo',
      description: 'Heavy duty brushless hammer drill & impact driver set with 2 batteries, fast charger and rugged carrying case. Perfect for home renovation.',
      category: 'Tools',
      condition: 'Good',
      images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80'],
      location: user1.location,
      rentalPrice: { amount: 15, period: 'day' },
      deposit: 50,
      allowFree: false,
      status: 'AVAILABLE',
      rating: { average: 4.9, count: 12 },
      views: 84,
      isFeatured: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '65b222222222222222222202',
      ownerId: user2._id,
      name: 'Sony Alpha A7 III Mirrorless Camera',
      description: 'Full-frame mirrorless camera with 24-70mm f/2.8 lens. Excellent for event photography, video shoots, and weekend travel trips.',
      category: 'Electronics',
      condition: 'New',
      images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80'],
      location: user2.location,
      rentalPrice: { amount: 45, period: 'day' },
      deposit: 150,
      allowFree: false,
      status: 'AVAILABLE',
      rating: { average: 5.0, count: 18 },
      views: 142,
      isFeatured: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '65b222222222222222222203',
      ownerId: user3._id,
      name: 'Coleman 4-Person Waterproof Camping Tent',
      description: 'Easy setup dome tent with rainfly, sleeping pads, and ground tarp included. Clean, spacious, and weatherproof.',
      category: 'Sports',
      condition: 'Good',
      images: ['https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=800&q=80'],
      location: user3.location,
      rentalPrice: { amount: 20, period: 'day' },
      deposit: 40,
      allowFree: true,
      status: 'AVAILABLE',
      rating: { average: 4.8, count: 9 },
      views: 65,
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '65b222222222222222222204',
      ownerId: user1._id,
      name: 'Kärcher K3 Electric Pressure Washer',
      description: '1800 PSI pressure washer with dirt blaster spray wand. Great for driveway washing, patio cleaning, and car detailing.',
      category: 'HomeGoods',
      condition: 'Good',
      images: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80'],
      location: user1.location,
      rentalPrice: { amount: 25, period: 'day' },
      deposit: 60,
      allowFree: false,
      status: 'AVAILABLE',
      rating: { average: 4.7, count: 7 },
      views: 48,
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '65b222222222222222222205',
      ownerId: user2._id,
      name: 'Nintendo Switch OLED + 4 Controllers',
      description: 'OLED console loaded with Mario Kart 8, Super Smash Bros, and Overcooked. Includes dock and HDMI cable for party gaming.',
      category: 'Electronics',
      condition: 'Good',
      images: ['https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&w=800&q=80'],
      location: user2.location,
      rentalPrice: { amount: 20, period: 'day' },
      deposit: 80,
      allowFree: false,
      status: 'AVAILABLE',
      rating: { average: 4.9, count: 15 },
      views: 95,
      isFeatured: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  borrowRequests = [
    {
      _id: '65b333333333333333333301',
      itemId: items[0]._id,
      borrowerId: user2._id,
      ownerId: user1._id,
      startDate: new Date(Date.now() + 86400000),
      endDate: new Date(Date.now() + 86400000 * 3),
      requestMessage: 'Hi Alex! Building a bookshelf this weekend and need a solid drill. Will take extra care of it.',
      status: 'ACCEPTED',
      pricing: { rentalCost: 45, deposit: 50, totalCost: 95 },
      depositStatus: 'HELD',
      qrCode: 'BORROW-QR-DEMO-9981',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  notifications = [
    {
      _id: '65b444444444444444444401',
      userId: user1._id,
      type: 'REQUEST_RECEIVED',
      title: 'New Borrow Request',
      message: 'Sarah Chen requested to borrow your DeWalt 20V Drill Combo.',
      relatedId: borrowRequests[0]._id,
      isRead: false,
      createdAt: new Date()
    }
  ];

  isInitialized = true;
}

module.exports = {
  getUsers: () => users,
  getItems: () => items,
  getRequests: () => borrowRequests,
  getReviews: () => reviews,
  getNotifications: () => notifications,
  initMockData
};
