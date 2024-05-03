const productsRepository = require('./products-repository');

/**
 * Service merupakan kumpulan berbagai fungsi yang menampung berbagai Bisnis Logic serta menyiapkan data yan akan diteruskan ke controller, Service ini berinteraksi dengan Repository.
 */

/**
 * Get list of products
 * @returns {Array}
 */
async function getProducts() {
  return await productsRepository.getProducts();
}

/**
 * Get product detail
 * @param {string} id - Product ID
 * @returns {Object}
 */
async function getProduct(id) {
  const product = await productsRepository.getProduct(id);

  // Product not found
  if (!product) {
    return null;
  }

  return product;
}

/**
 * Get information count field on document
 * @param {string} query Query
 * @returns
 */
async function searchQuery(query) {
  try {
    return await productsRepository.searchQuery(query);
  } catch (error) {
    return null;
  }
}
/**
 * Get product with query
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
  return await productsRepository.getProductsWithQuery(
    query,
    sortField,
    sortDirection,
    skip,
    page_size
  );
}

/**
 * Create new product
 * @param {string} name - Name
 * @param {string} description - Description
 * @param {string} category - Category
 * @param {number} stock - Stock
 * @param {number} price - Price
 * @returns {boolean}
 */
async function createProduct(name, description, category, stock, price) {
  try {
    await productsRepository.createProduct(
      name,
      description,
      category,
      stock,
      price
    );
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing product
 * @param {string} id - Product ID
 * @param {string} name - Name
 * @param {string} description - Description
 * @param {string} category - Category
 * @param {number} stock - Stock
 * @param {number} price - Price
 * @returns {boolean}
 */
async function updateProduct(id, name, description, category, stock, price) {
  const product = await productsRepository.getProduct(id);

  // Product not found
  if (!product) {
    return null;
  }

  try {
    await productsRepository.updateProduct(
      id,
      name,
      description,
      category,
      stock,
      price
    );
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete product
 * @param {string} id - Product ID
 * @returns {boolean}
 */
async function deleteProduct(id) {
  const product = await productsRepository.getProduct(id);

  // Product not found
  if (!product) {
    return null;
  }

  try {
    await productsRepository.deleteProduct(id);
  } catch (err) {
    return null;
  }

  return true;
}

module.exports = {
  getProducts,
  getProduct,
  searchQuery,
  getProductsWithQuery,
  createProduct,
  updateProduct,
  deleteProduct,
};
