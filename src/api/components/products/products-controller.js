const productsService = require('./products-service');
const { errorResponder, errorTypes } = require('../../../core/errors');

/**
 * Controller ini berfungsi sebagai pengelola permintaan (Request) dan memberikan respon (Response) ke pada pengguna, controller ini berintegrasi dengan Service yang sebagai Bisnis Logic.
 */

/**
 * Handle get list of products request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getProducts(request, response, next) {
  try {
    let {
      page_number = 1,
      page_size = 5,
      search = '',
      sort = 'name:asc',
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

    const totalProducts = await productsService.searchQuery(query);
    const totalPages = Math.ceil(totalProducts / page_size);

    // Fetch data product
    const products = await productsService.getProductsWithQuery(
      query,
      sortField,
      sortDirection,
      skip,
      page_size
    );

    return response.status(200).json({
      page_number,
      page_size,
      count: products.length,
      total_pages: totalPages,
      has_previous_page: page_number > 1,
      has_next_page: page_number < totalPages,
      data: products,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get product detail request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getProduct(request, response, next) {
  try {
    const product = await productsService.getProduct(request.params.id);

    if (!product) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Unknown product');
    }

    return response.status(200).json(product);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle create product request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function createProduct(request, response, next) {
  try {
    const name = request.body.name;
    const description = request.body.description;
    const category = request.body.category;
    const stock = request.body.stock;
    const price = request.body.price;

    const success = await productsService.createProduct(
      name,
      description,
      category,
      stock,
      price
    );
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create product'
      );
    }

    return response
      .status(200)
      .json({ name, description, category, stock, price });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle update product request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function updateProduct(request, response, next) {
  try {
    const id = request.params.id;
    const name = request.body.name;
    const description = request.body.description;
    const category = request.body.category;
    const stock = request.body.stock;
    const price = request.body.price;

    const success = await productsService.updateProduct(
      id,
      name,
      description,
      category,
      stock,
      price
    );
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update product'
      );
    }

    return response
      .status(200)
      .json({ id, name, description, category, stock, price });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle delete product
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteProduct(request, response, next) {
  try {
    const id = request.params.id;

    const success = await productsService.deleteProduct(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete product'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
