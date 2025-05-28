const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      username TEXT UNIQUE,
      password TEXT,
      address TEXT,
      phone TEXT,
      school TEXT,
      class TEXT,
      division TEXT,
      percentage REAL,
      subjects TEXT,
      hobbies TEXT,
      parent_phone TEXT,
      math_progress INTEGER DEFAULT 0,
      science_progress INTEGER DEFAULT 0,
      english_progress INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_email TEXT,
      utr TEXT,
      status TEXT DEFAULT 'pending'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_phone TEXT,
      title TEXT,
      status TEXT DEFAULT 'Pending',
      FOREIGN KEY (student_phone) REFERENCES students(phone)
    )
  `);
});

module.exports = db;

