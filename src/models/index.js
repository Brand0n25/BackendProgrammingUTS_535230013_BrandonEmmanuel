const mongoose = require('mongoose');
const config = require('../core/config');
const logger = require('../core/logger')('app');

const usersSchema = require('./users-schema');
const productSchema = require('./product-schema');
const transactionSchema = require('./transaction-schema');
const transactionDetailSchema = require('./transaction-detail-schema');
const loginSchema = require('./login-schema');

mongoose.connect(`${config.database.connection}/${config.database.name}`, {
  useNewUrlParser: true,
});

const db = mongoose.connection;
db.once('open', () => {
  logger.info('Successfully connected to MongoDB');
});

const Login = mongoose.model('login', mongoose.Schema(loginSchema));
const User = mongoose.model('users', mongoose.Schema(usersSchema));
const Product = mongoose.model('products', mongoose.Schema(productSchema));
const Transaction = mongoose.model(
  'transactions',
  mongoose.Schema(transactionSchema)
);
const TransactionDetail = mongoose.model(
  'transaction_detail',
  mongoose.Schema(transactionDetailSchema)
);

module.exports = {
  mongoose,
  Login,
  User,
  Product,
  Transaction,
  TransactionDetail,
};
