const express = require('express');

const authenticationMiddleware = require('../../middlewares/authentication-middleware');
const celebrate = require('../../../core/celebrate-wrappers');
const transactionControllers = require('./transaction-controller');
const transactionValidator = require('./transaction-validator');

const route = express.Router();

/**
 * Route merupakan tempat untuk pendefinisian rute-rute HTTP yang akan digunakan, rute tersebut akan menentukan bagaimana permintaan (Request) dari client akan ditangani. Route ini teritegrasi dengan controller.
 */

module.exports = (app) => {
  app.use('/purchase', route);

  // Get list of purchase
  route.get(
    '/',
    authenticationMiddleware,
    transactionControllers.getTransactions
  );

  // Get purchase detail
  route.get(
    '/:id',
    authenticationMiddleware,
    transactionControllers.getTransaction
  );

  // Create purchase
  route.post(
    '/',
    authenticationMiddleware,
    celebrate(transactionValidator.createTransaction),
    transactionControllers.createTransaction
  );

  // Update purchase
  route.put(
    '/:id',
    authenticationMiddleware,
    celebrate(transactionValidator.updateTransaction),
    transactionControllers.updateTransaction
  );

  // Delete purchase
  route.delete(
    '/:id',
    authenticationMiddleware,
    transactionControllers.deleteTransaction
  );
};
