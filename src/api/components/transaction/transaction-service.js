const transactionRepository = require('./transaction-repository');
const productsRepository = require('../products/products-repository');
const usersRepository = require('../users/users-repository');
const _ = require('lodash');

/**
 * Service merupakan kumpulan berbagai fungsi yang menampung berbagai Bisnis Logic serta menyiapkan data yan akan diteruskan ke controller, Service ini berinteraksi dengan Repository.
 */

/**
 * Get list of Transaction
 * @returns {Array}
 */
async function getTransactions() {
  return await transactionRepository.getTransactions();
}

/**
 * Get Transaction By Id
 * @param {string} id - Transaction ID
 * @returns {Object}
 */
async function getTransaction(id) {
  const transaction = await transactionRepository.getTransaction(id);

  // Transaction not found
  if (!transaction) {
    return null;
  }

  // Get Cashier Detail
  const _cashier = await usersRepository.getUser(transaction.cashier);
  // Get Transaction Detail
  const _transactionDetail = await transactionRepository.getTransactionDetail(
    transaction._id
  );

  // Set new object transaction detail
  const transactionDetail = {
    _id: transaction._id,
    orderId: transaction.orderId,
    cashier: {
      _id: _cashier._id,
      name: _cashier.name,
    },
    total: transaction.total,
    createdAt: transaction.createdAt,
    products: _transactionDetail,
  };

  return transactionDetail;
}

/**
 * Get information count field on document
 * @param {string} query Query
 * @returns
 */
async function searchQuery(query) {
  try {
    return await transactionRepository.searchQuery(query);
  } catch (error) {
    return null;
  }
}
/**
 * Get transaction with query
 * @param {string} query Query
 * @param {string} sortField
 * @param {string} sortDirection
 * @param {number} skip
 * @param {number} page_size
 * @returns
 */
async function getTransactionWithQuery(
  query,
  sortField,
  sortDirection,
  skip,
  page_size
) {
  return await transactionRepository.getTransactionWithQuery(
    query,
    sortField,
    sortDirection,
    skip,
    page_size
  );
}

/**
 * Generate OrderID
 * @returns {string}
 */
async function generateOrderID() {
  return `${'MID'}-${Math.floor(Math.random() * 90000) + 10000}`;
}

/**
 * Generate Epoch Time
 * @returns {string}
 */
async function generateEpochTime() {
  return Math.floor(Date.now() / 1000);
}

/**
 * Generate new object products with key transaction id
 * @param {string} transactionId Transaction ID
 * @param {object} products Products
 * @returns {object}
 */
async function generateProductWithTransactionId(transactionId, products) {
  const _products = [];
  for (let index = 0; index < products.length; index++) {
    _products.push({
      ...products[index],
      transactionId,
    });
  }
  return _products;
}

/**
 * Check Exist Products And Get Total Price
 * @param {object} products Products
 * @returns
 */
async function checkExistProductsAndGetTotalPrice(products) {
  try {
    let _products = [];
    let total = 0;
    for (let index = 0; index < products.length; index++) {
      // Get product detail
      const productResult = await productsRepository.getProduct(
        products[index].id
      );
      // Check product is exist
      if (productResult) {
        // Check stock is avaible
        if (productResult.stock != 0) {
          // Check request stock is valid
          const stockAfterTransaction =
            productResult.stock - products[index].quantity;
          if (stockAfterTransaction < 0) {
            throw 'Product quantity exceeds stock';
          }
          // Create object transaction detail
          _products.push({
            productId: productResult.id,
            name: productResult.name,
            price: productResult.price,
            quantity: products[index].quantity,
            total: productResult.price * products[index].quantity,
          });
          // Create total transaction
          total += productResult.price * products[index].quantity;
          // Update Stock Product
          await productsRepository.updateStockProduct(
            productResult.id,
            stockAfterTransaction
          );
        } else {
          throw 'Product Stock Out';
        }
      } else {
        throw 'Product Not Exist';
      }
    }
    return {
      _products,
      total,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Create new Transaction
 * @param {string} cashier - Cashier
 * @param {object} products - Products
 * @returns {boolean}
 */
async function createTransaction(cashier, products) {
  try {
    // Check cashier is valid
    const _cashier = await usersRepository.getUser(cashier);
    if (_cashier) {
      // Generate order id
      const orderId = await generateOrderID();

      // Check Exist Product and Get Total Amount Price
      const existAndTotalProducts =
        await checkExistProductsAndGetTotalPrice(products);

      // Generate Epoch Time
      const createdAt = await generateEpochTime();

      // Check when product is valid
      if (existAndTotalProducts) {
        // Create transaction
        const _transaction = await transactionRepository.createTransaction(
          orderId,
          cashier,
          existAndTotalProducts.total,
          createdAt
        );

        // Generate new object products with key transaction id
        const _products = await generateProductWithTransactionId(
          _transaction._id,
          existAndTotalProducts._products
        );

        // Create transaction detail
        await transactionRepository.createTransactionDetail(_products);

        // Create object response transaction with detail
        _transaction.products = _products;
        return _transaction;
      } else {
        throw 'Product Not Exits';
      }
    } else {
      throw 'Cashier Not Exits';
    }
  } catch (err) {
    return null;
  }
}

/**
 * Update transaction
 * @param {string} productId Product Id
 * @param {number} stock Stock
 * @returns
 */
async function updateTransaction(id, cashier, products) {
  try {
    // Check transaction is exits
    const _transaction = await transactionRepository.getTransaction(id);
    if (!_transaction)
      throw {
        status: null,
        message: 'Transaction Not Exits!',
      };

    // Check cashier is exist
    let _stateCashier = true;
    if (_transaction.cashier != cashier) {
      const _cashier = await usersRepository.getUser(cashier);
      if (!_cashier) {
        throw {
          status: null,
          message: 'Cashier Not Exits!',
        };
      } else {
        // update cashier
        await transactionRepository.updateCashierTransaction(id, cashier);
        _stateCashier = false;
      }
    }

    // Check same data products input and products on data transaction;
    let _stateProducts = true;
    const transactionDetailData =
      await transactionRepository.getTransactionDetail(id);
    const productInputAndProductTransactionDetailIsSame = _.isEqual(
      products.map((item) => ({ id: item.id, quantity: item.quantity })),
      transactionDetailData.map((item) => ({
        id: item.productId,
        quantity: item.quantity,
      }))
    );
    if (!productInputAndProductTransactionDetailIsSame) {
      _stateProducts = false;
    }

    // When cashier & products not change
    if (_stateCashier && _stateProducts) {
      return {
        status: 'OK',
        message: 'Successfully updated the transaction without change data',
      };
    }

    // Check when data product is change
    if (!_stateProducts) {
      // Check avaibility products
      let productIsValid = 'TRUE';
      for (let i = 0; i < products.length; i++) {
        const _product = await productsRepository.getProduct(products[i].id);
        // When product not valid
        if (!_product) {
          productIsValid = 'Product not valid';
          break;
        }
      }

      // Check products is valid
      if (productIsValid != 'TRUE')
        throw {
          status: null,
          message: productIsValid,
        };

      // new total
      let newTotal = 0;
      // Check one by one product
      for (let j = 0; j < products.length; j++) {
        // Search product on detail transaction
        const findProduct =
          await transactionRepository.getTransactionDetailByProduct(
            products[j].id
          );
        // get product data
        const productData = await productsRepository.getProduct(products[j].id);
        // Product Id match
        if (findProduct) {
          // Check quantity value, when not match, update.
          if (products[j].quantity != findProduct.quantity) {
            // If new data quantity >
            if (products[j].quantity > findProduct.quantity) {
              // update stock on product
              const startStock = findProduct.quantity + productData.stock;
              const newStock = startStock - products[j].quantity;

              // Check whether stock demand exceeds product stock
              if (products[j].quantity > startStock) {
                throw {
                  status: null,
                  message: `Stock demand exceeds product ${productData.name} stock`,
                };
              }

              await productsRepository.updateStockProduct(
                products[j].id,
                newStock
              );
              // update quantity on transaction detail
              await transactionRepository.updateQuantityAndTotalTransactionDetailByProductId(
                products[j].id,
                products[j].quantity,
                products[j].quantity * productData.price
              );
              // update total trasnaction
              newTotal += productData.price * products[j].quantity;
            } else {
              // If new data quantity <
              // update stock on product
              const startStock = findProduct.quantity + productData.stock;
              const newStock = startStock - products[j].quantity;

              // Check whether stock demand exceeds product stock
              if (products[j].quantity > startStock) {
                throw {
                  status: null,
                  message: `Stock demand exceeds product ${productData.name} stock`,
                };
              }

              await productsRepository.updateStockProduct(
                products[j].id,
                newStock
              );
              // update quantity on transaction detail
              await transactionRepository.updateQuantityAndTotalTransactionDetailByProductId(
                products[j].id,
                products[j].quantity,
                products[j].quantity * productData.price
              );
              // update total trasnaction
              newTotal += productData.price * products[j].quantity;
            }
          }
        } else {
          // When Product not found on transaction detail
          // Create transaction detail
          await transactionRepository.createTransactionDetail([
            {
              transactionId: id,
              productId: products[j].id,
              name: productData.name,
              price: productData.price,
              quantity: products[j].quantity,
              total: productData.price * products[j].quantity,
            },
          ]);
          // update stock on product
          await productsRepository.updateStockProduct(
            products[j].id,
            productData.stock - products[j].quantity
          );
          // update total trasnaction
          newTotal += productData.price * products[j].quantity;
        }
      }

      // update new total transaction
      await transactionRepository.updateTotalTransaction(id, newTotal);
    }

    return {
      status: 'OK',
      message: 'Successfully updated the transaction',
    };
  } catch (error) {
    return {
      status: null,
      message: error.message,
    };
  }
}

/**
 * Delete a transaction
 * @param {string} id - Transaction ID
 * @returns {Promise}
 */
async function deleteTransaction(id) {
  try {
    const transaction = await transactionRepository.getTransaction(id);

    // Transaction not found
    if (!transaction) {
      return null;
    }
    await transactionRepository.deleteTransaction(id);
    return true;
  } catch (err) {
    return null;
  }
}

module.exports = {
  getTransactions,
  getTransaction,
  searchQuery,
  getTransactionWithQuery,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
