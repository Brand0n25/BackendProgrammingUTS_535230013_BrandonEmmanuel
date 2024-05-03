const authenticationRepository = require('./authentication-repository');
const { generateToken } = require('../../../utils/session-token');
const { passwordMatched } = require('../../../utils/password');
const logger = require('../../../core/logger')('app');

/**
 * Generate Epoch Time
 * @returns {string}
 */
function generateEpochTime() {
  return Math.floor(Date.now() / 1000);
}

/**
 * Check username and password for login.
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {object} An object containing, among others, the JWT token if the email and password are matched. Otherwise returns null.
 */
async function checkLoginCredentials(email, password) {
  // Get user by email
  const user = await authenticationRepository.getUserByEmail(email);

  // Check user is exist
  if (!user)
    return {
      status: null,
      message: 'Wrong email or password',
    };

  // Check user attempt
  const timeNow = generateEpochTime();
  const userAttempt = await authenticationRepository.getUserAttempt(email);

  if (userAttempt) {
    if (userAttempt.attempt == 5 && userAttempt.timeLock > timeNow) {
      logger.info(
        'Mencoba login, namun mendapat error 403 karena telah melebihi limit attempt.'
      );
      return {
        status: null,
        message:
          'Tried to log in, but got error 403 because the attempt limit had been exceeded.',
        attemptsLeft: 5 - userAttempt.attempt,
      };
    }
  }

  // Check password
  const passwordChecked = await passwordMatched(password, user.password);

  // Handle when password incorrect
  if (!passwordChecked) {
    if (userAttempt) {
      // Lock user when user attempt == 4
      if (userAttempt.attempt == 4) {
        await authenticationRepository.updateUserAttempt(
          email,
          userAttempt.attempt + 1,
          timeNow + 1800
        );
        logger.info(
          `User ${email} gagal login. Attempt = ${userAttempt.attempt + 1}. Limit reached.`
        );
        return {
          status: null,
          message: 'Wrong email or password',
          attemptsLeft: 4 - userAttempt.attempt,
        };
      } else {
        if (userAttempt.attempt != 5) {
          await authenticationRepository.updateUserAttempt(
            email,
            userAttempt.attempt + 1,
            0
          );
          logger.info(
            `User ${userAttempt.email} gagal login. Attempt = ${userAttempt.attempt + 1}.`
          );

          return {
            status: null,
            message: 'Wrong email or password',
            attemptsLeft: 4 - userAttempt.attempt,
          };
        }
      }

      // Reset attempt when user attempt == 5 & timeLock < timeNow
      if (userAttempt.attempt === 5 && userAttempt.timeLock < timeNow) {
        await authenticationRepository.updateUserAttempt(email, 1, 0);
        logger.info(
          `User ${userAttempt.email}  bisa mencoba login kembali karena sudah lebih dari 30 menit sejak pengenaan limit. Attempt di-reset kembali ke ${1}.`
        );
        logger.info(`User ${userAttempt.email} gagal login. Attempt = ${1}.`);
        return {
          status: null,
          message: 'Wrong email or password',
          attemptsLeft: 4,
        };
      }
    } else {
      // When user attempt not register
      await authenticationRepository.createUserAttempt(email, 1, 0);
      logger.info(`User ${email} gagal login. Attempt = ${1}.`);
      return {
        status: null,
        message: 'Wrong email or password',
        attemptsLeft: 4,
      };
    }
  }

  // Handle when user email & password correct
  if (user && passwordChecked) {
    // Remove user attempt from list
    await authenticationRepository.deleteUserAttempt(email);
    logger.info(`berhasil login.`);
    return {
      email: user.email,
      name: user.name,
      user_id: user.id,
      token: generateToken(user.email, user.id),
    };
  }
}

module.exports = {
  checkLoginCredentials,
};
