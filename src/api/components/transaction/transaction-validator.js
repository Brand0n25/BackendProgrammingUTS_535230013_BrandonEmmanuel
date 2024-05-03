const joi = require('joi');

/**
 * Validator merupakan fungsi yang berfungsi sebagai filter data untuk menangani permintaan (Request) yang dilakukan oleh pengguna. Dengan ini data yang dikirimkan harus memiliki kesamaan dengan ketentuan yang sudah ditetapkan.
 */
module.exports = {
  createTransaction: {
    body: {
      cashier: joi.string().required().label('Name'),
      products: joi
        .array()
        .items(
          joi.object({
            id: joi.string().required().label('Id Product'),
            quantity: joi
              .number()
              .integer()
              .min(1)
              .required()
              .label('Quantity'),
          })
        )
        .label('Products'),
    },
  },
  updateTransaction: {
    body: {
      cashier: joi.string().required().label('Name'),
      products: joi
        .array()
        .items(
          joi.object({
            id: joi.string().required().label('Id Product'),
            quantity: joi
              .number()
              .integer()
              .min(1)
              .required()
              .label('Quantity'),
          })
        )
        .label('Products'),
    },
  },
};
