const { Transaction, TransactionDetail } = require('../../../models');

/**
 * Repository merupakan fungsi yang digunakan untuk berinteraksi secara langsung dengan basis data (database).
 */

/**
 * Get a list of Transaction
 * @returns {Promise}
 */
async function getTransactions() {
  return Transaction.find({});
}

/**
 * Get Transaction By Id
 * @param {string} id - Transaction ID
 * @returns {Promise}
 */
async function getTransaction(id) {
  return Transaction.findById(id);
}

/**
 * Get Transaction detail
 * @param {string} id - Transaction ID
 * @returns {Promise}
 */
async function getTransactionDetail(id) {
  return TransactionDetail.find({ transactionId: id });
}

/**
 * Get Transaction detail by Product id
 * @param {string} id - Product ID
 * @returns {Promise}
 */
async function getTransactionDetailByProduct(id) {
  return TransactionDetail.findOne({ productId: id });
}

/**
 * Get information count field on document
 * @param {string} query Query
 * @returns
 */
async function searchQuery(query) {
  return await Transaction.countDocuments(query);
}

/**
 * Get User transactions query
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
  return await Transaction.find(query)
    .sort({ [sortField]: sortDirection })
    .skip(skip)
    .limit(page_size);
}

/**
 * Create new Transaction
 * @param {string} orderId - OrderId
 * @param {string} cashier - Cashier
 * @param {number} total - Total
 * @param {number} createdAt - CreatedAt
 * @returns {Promise}
 */
async function createTransaction(orderId, cashier, total, createdAt) {
  return Transaction.create({
    orderId,
    cashier,
    total,
    createdAt,
  });
}

/**
 * Create new Transaction detail
 * @param {object} products - Products
 * @returns {Promise}
 */
async function createTransactionDetail(products) {
  return TransactionDetail.create(products);
}

/**
 * Update quanity and total transaction detailby product id
 * @param {string} productId Product Id
 * @param {number} quantity Quantity
 * @returns
 */
async function updateQuantityAndTotalTransactionDetailByProductId(
  productId,
  quantity,
  total
) {
  return TransactionDetail.updateOne(
    {
      productId: productId,
    },
    {
      $set: {
        quantity: quantity,
        total: total,
      },
    }
  );
}

/**
 * Update Total Transaction
 * @param {string} transactionId Transaction Id
 * @param {string} newTotal New Total
 * @returns
 */
async function updateTotalTransaction(transactionId, newTotal) {
  return Transaction.updateOne(
    {
      _id: transactionId,
    },
    {
      $set: {
        total: newTotal,
      },
    }
  );
}

/**
 * Update cashier transaction
 * @param {string} transactionId Transaction Id
 * @param {string} cashierId Cashier Id
 */
async function updateCashierTransaction(transactionId, cashierId) {
  return Transaction.updateOne(
    {
      _id: transactionId,
    },
    {
      $set: {
        cashier: cashierId,
      },
    }
  );
}

/**
 * Delete a transaction
 * @param {string} id - Transaction ID
 * @returns {Promise}
 */
async function deleteTransaction(id) {
  await TransactionDetail.deleteMany({ transactionId: id });
  return Transaction.deleteOne({ _id: id });
}

module.exports = {
  getTransactions,
  getTransaction,
  getTransactionDetail,
  getTransactionDetailByProduct,
  searchQuery,
  getTransactionWithQuery,
  createTransaction,
  createTransactionDetail,
  updateQuantityAndTotalTransactionDetailByProductId,
  updateTotalTransaction,
  updateCashierTransaction,
  deleteTransaction,
};
