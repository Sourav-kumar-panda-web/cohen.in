// adminmodel.js
const bcrypt = require('bcrypt');

// For demo, only one admin user with hashed password
// You should hash "admin123" in advance and paste the hash here:
const adminUser = {
  username: "admin",
  // hash for password 'admin123' (generate with bcrypt)
  passwordHash: "$2b$10$e/5twhXT4N6V8FzxF0AxV.BjF6OJKAVmR8MLGZHH62uCGclX9P0T6"
};

function authenticateAdmin(username, password, callback) {
  if (username !== adminUser.username) return callback(null, false);
  bcrypt.compare(password, adminUser.passwordHash, (err, res) => {
    if (err) return callback(err);
    if (res) return callback(null, adminUser);
    return callback(null, false);
  });
}

module.exports = { authenticateAdmin };

