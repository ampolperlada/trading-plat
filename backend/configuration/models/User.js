const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  country: { type: String, required: true },
  phoneNumber: { type: String, required: false },
  balance: { type: Number, default: 10000 },
  isVerified: { type: Boolean, default: false },
  accountType: { type: String, enum: ['demo', 'real'], default: 'demo' },
  totalProfit: { type: Number, default: 0 },
  totalTrades: { type: Number, default: 0 },
  winRate: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
