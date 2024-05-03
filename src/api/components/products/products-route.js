const express = require('express');

const authenticationMiddleware = require('../../middlewares/authentication-middleware');
const celebrate = require('../../../core/celebrate-wrappers');
const productControllers = require('./products-controller');
const productsValidator = require('./products-validator');

const route = express.Router();

/**
 * Route merupakan tempat untuk pendefinisian rute-rute HTTP yang akan digunakan, rute tersebut akan menentukan bagaimana permintaan (Request) dari client akan ditangani. Route ini teritegrasi dengan controller.
 */

module.exports = (app) => {
  app.use('/products', route);

  // Get list of product
  route.get('/', authenticationMiddleware, productControllers.getProducts);

  // Get user product
  route.get('/:id', authenticationMiddleware, productControllers.getProduct);

  // Create product
  route.post(
    '/',
    authenticationMiddleware,
    celebrate(productsValidator.createProduct),
    productControllers.createProduct
  );

  // Update product
  route.put(
    '/:id',
    authenticationMiddleware,
    celebrate(productsValidator.updateProduct),
    productControllers.updateProduct
  );

  // Delete product
  route.delete(
    '/:id',
    authenticationMiddleware,
    productControllers.deleteProduct
  );
};
