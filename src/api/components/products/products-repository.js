const { Product } = require('../../../models');

/**
 * Repository merupakan fungsi yang digunakan untuk berinteraksi secara langsung dengan basis data (database).
 */

/**
 * Get a list of products
 * @returns {Promise}
 */
async function getProducts() {
  return Product.find({});
}

/**
 * Get product detail
 * @param {string} id - Product ID
 * @returns {Promise}
 */
async function getProduct(id) {
  return Product.findById(id);
}

/**
 * Get information count field on document
 * @param {string} query Query
 * @returns
 */
async function searchQuery(query) {
  return await Product.countDocuments(query);
}

/**
 * Get Product with query
 * @param {string} query Query
 * @param {string} sortField
 * @param {string} sortDirection
 * @param {number} skip
 * @param {number} page_size
 * @returns
 */
async function getProductsWithQuery(
  query,
  sortField,
  sortDirection,
  skip,
  page_size
) {
  return await Product.find(query)
    .sort({ [sortField]: sortDirection })
    .skip(skip)
    .limit(page_size);
}

/**
 * Create new product
 * @param {string} name - Name
 * @param {string} description - Description
 * @param {string} category - Category
 * @param {number} stock - Stock
 * @param {number} price - Price
 * @returns {Promise}
 */
async function createProduct(name, description, category, stock, price) {
  return Product.create({
    name,
    description,
    category,
    stock,
    price,
  });
}

/**
 * Update existing product
 * @param {string} id - Product ID
 * @param {string} name - Name
 * @param {string} description - Description
 * @param {string} category - Category
 * @param {number} stock - Stock
 * @param {number} price - Price
 * @returns {Promise}
 */
async function updateProduct(id, name, description, category, stock, price) {
  return Product.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        name,
        description,
        category,
        stock,
        price,
      },
    }
  );
}

/**
 * Update stock product
 * @param {string} productId Product Id
 * @param {number} stock Stock
 * @returns
 */
async function updateStockProduct(productId, stock) {
  return Product.updateOne(
    {
      _id: productId,
    },
    {
      $set: {
        stock: stock,
      },
    }
  );
}

/**
 * Delete a product
 * @param {string} id - Product ID
 * @returns {Promise}
 */
async function deleteProduct(id) {
  return Product.deleteOne({ _id: id });
}

module.exports = {
  getProducts,
  getProduct,
  searchQuery,
  getProductsWithQuery,
  createProduct,
  updateProduct,
  updateStockProduct,
  deleteProduct,
};
