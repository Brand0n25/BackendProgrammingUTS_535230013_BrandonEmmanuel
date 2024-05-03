const joi = require('joi');

/**
 * Validator merupakan fungsi yang berfungsi sebagai filter data untuk menangani permintaan (Request) yang dilakukan oleh pengguna. Dengan ini data yang dikirimkan harus memiliki kesamaan dengan ketentuan yang sudah ditetapkan.
 */
module.exports = {
  createProduct: {
    body: {
      name: joi.string().min(1).max(100).required().label('Name'),
      description: joi.string().required().label('Description'),
      category: joi.string().required().label('Category'),
      stock: joi.number().required().label('Stock'),
      price: joi.number().required().label('Price'),
    },
  },

  updateProduct: {
    body: {
      name: joi.string().min(1).max(100).required().label('Name'),
      description: joi.string().required().label('Description'),
      category: joi.string().required().label('Category'),
      stock: joi.number().required().label('Stock'),
      price: joi.number().required().label('Price'),
    },
  },
};
