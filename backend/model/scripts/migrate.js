// scripts/migrate.js
require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trading_platform';

async function runMigrations() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB for migrations');
    
    console.log('🔄 Running migrations...');
    
    // Add migration functions here as needed
    await addNewFieldsToUsers();
    await updateAssetCategories();
    
    console.log('✅ All migrations completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

async function addNewFieldsToUsers() {
  const User = require('../models/User');
  
  try {
    await User.updateMany(
      { winRate: { $exists: false } },
      { 
        $set: { 
          winRate: 0,
          totalProfit: 0,
          totalTrades: 0
        }
      }
    );
    console.log('✅ Added new fields to users');
  } catch (error) {
    console.error('❌ Error adding fields to users:', error);
  }
}

async function updateAssetCategories() {
  const Asset = require('../models/Asset');
  
  try {
    // Update any existing assets with new categories if needed
    await Asset.updateMany(
      { category: { $exists: false } },
      { $set: { category: 'forex' } }
    );
    console.log('✅ Updated asset categories');
  } catch (error) {
    console.error('❌ Error updating asset categories:', error);
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };