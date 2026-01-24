// Validation middleware

const validateEmail = (email) => {
  const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return regex.test(email);
};

const validatePassword = (password) => {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return regex.test(password);
};

const validateUsername = (username) => {
  if (!username || typeof username !== 'string') return false;
  const trimmed = username.trim();
  return trimmed.length >= 3 && trimmed.length <= 30;
};

const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim().substring(0, 1000); // Limit to 1000 chars
};

// Middleware functions
const validateSignup = (req, res, next) => {
  const { email, password, username, role, termsAgreed } = req.body;

  if (!email || !validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (!password || !validatePassword(password)) {
    return res.status(400).json({
      error: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.'
    });
  }

  if (!username || !validateUsername(username)) {
    return res.status(400).json({ error: 'Username must be between 3 and 30 characters' });
  }

  if (!role || !['parent', 'therapist', 'user', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  if (!termsAgreed) {
    return res.status(400).json({ error: 'Must accept terms and conditions' });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (!password || password.length === 0) {
    return res.status(400).json({ error: 'Password is required' });
  }

  next();
};

const validateGameSession = (req, res, next) => {
  const { gameType, score, duration } = req.body;

  if (!gameType || typeof gameType !== 'string' || gameType.length === 0) {
    return res.status(400).json({ error: 'Invalid game type' });
  }

  if (typeof score !== 'number' || score < 0 || score > 100) {
    return res.status(400).json({ error: 'Score must be a number between 0 and 100' });
  }

  if (typeof duration !== 'number' || duration < 0) {
    return res.status(400).json({ error: 'Duration must be a positive number' });
  }

  next();
};

module.exports = {
  validateEmail,
  validatePassword,
  validateUsername,
  sanitizeString,
  validateSignup,
  validateLogin,
  validateGameSession
};
