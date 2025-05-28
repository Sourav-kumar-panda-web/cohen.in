const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('school.db');

// Replace with your desired admin username and password
const username = 'admin';
const password = 'admin123';

// ✅ Step 1: Create table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT
  )
`, err => {
  if (err) {
    console.error('❌ Error creating table:', err.message);
    return db.close();
  }

  // ✅ Step 2: Insert admin after table exists
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error('❌ Bcrypt error:', err.message);
      return db.close();
    }

    db.run('INSERT INTO admins (username, password) VALUES (?, ?)', [username, hash], function (err) {
      if (err) {
        console.error('❌ Error inserting admin:', err.message);
      } else {
        console.log(`✅ Admin account created. Username: ${username}`);
      }
      db.close();
    });
  });
});

