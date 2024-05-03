const transactionService = require('./transaction-service');
const { errorResponder, errorTypes } = require('../../../core/errors');

/**
 * Controller ini berfungsi sebagai pengelola permintaan (Request) dan memberikan respon (Response) ke pada pengguna, controller ini berintegrasi dengan Service yang sebagai Bisnis Logic.
 */

/**
 * Handle get list of transactions request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getTransactions(request, response, next) {
  try {
    let {
      page_number = 1,
      page_size = 5,
      search = '',
      sort = 'orderId:asc',
    } = request.query;

    // Parsing query params
    page_number = parseInt(page_number);
    page_size = parseInt(page_size);
    const sortOrder = sort.split(':');
    const sortField = sortOrder[0];
    const sortDirection = sortOrder[1] === 'asc' ? 1 : -1;
    const skip = (page_number - 1) * page_size;

    // Building search query product
    let query = {};
    if (search) {
      const searchParams = search.split(':');
      const searchField = searchParams[0];
      const searchValue = searchParams[1];
      query = { [searchField]: { $regex: searchValue, $options: 'i' } };
    }

    const totalTransaction = await transactionService.searchQuery(query);
    const totalPages = Math.ceil(totalTransaction / page_size);

    // Fetch data user
    const transactions = await transactionService.getTransactionWithQuery(
      query,
      sortField,
      sortDirection,
      skip,
      page_size
    );

    return response.status(200).json({
      page_number,
      page_size,
      count: transactions.length,
      total_pages: totalPages,
      has_previous_page: page_number > 1,
      has_next_page: page_number < totalPages,
      data: transactions,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get transaction detail request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getTransaction(request, response, next) {
  try {
    const product = await transactionService.getTransaction(request.params.id);

    if (!product) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Unknown transaction'
      );
    }

    return response.status(200).json(product);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle create transactions request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function createTransaction(request, response, next) {
  try {
    const cashier = request.body.cashier;
    const products = request.body.products;

    const success = await transactionService.createTransaction(
      cashier,
      products
    );

    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create transaction'
      );
    }

    return response.status(200).json(success);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle update transaction
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function updateTransaction(request, response, next) {
  try {
    const id = request.params.id;
    const cashier = request.body.cashier;
    const products = request.body.products;

    const success = await transactionService.updateTransaction(
      id,
      cashier,
      products
    );

    if (success.status != 'OK') {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, success.message);
    }

    return response
      .status(200)
      .json({ status: 'OK', message: success.message });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle delete transaction
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteTransaction(request, response, next) {
  try {
    const id = request.params.id;

    const success = await transactionService.deleteTransaction(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete transaction'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
