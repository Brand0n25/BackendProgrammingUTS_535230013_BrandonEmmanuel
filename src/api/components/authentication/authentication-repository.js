const { User } = require('../../../models');
const { Login } = require('../../../models');

/**
 * Get user by email for login information
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return User.findOne({ email });
}

/**
 * Get User Attemp
 * @param {string} userId User ID
 * @returns {Promise}
 */
async function getUserAttempt(email) {
  return await Login.findOne({ email });
}

/**
 * Create attempt user
 * @param {string} email Email
 * @param {number} attempt Attempt
 * @param {number} timeLock Time Lock
 * @returns
 */
async function createUserAttempt(email, attempt, timeLock) {
  return await Login.create({
    email,
    attempt,
    timeLock,
  });
}

/**
 * Update attempt user
 * @param {string} email Email
 * @param {number} attempt Attempt
 * @param {number} timeLock Time Lock
 * @returns
 */
async function updateUserAttempt(email, attempt, timeLock) {
  return await Login.updateOne(
    {
      email,
    },
    {
      $set: {
        attempt,
        timeLock,
      },
    }
  );
}

/**
 * Detele attempt user
 * @param {string} email Email
 * @returns
 */
async function deleteUserAttempt(email) {
  return await Login.deleteOne({ email });
}

module.exports = {
  getUserByEmail,
  getUserAttempt,
  createUserAttempt,
  updateUserAttempt,
  deleteUserAttempt,
};
