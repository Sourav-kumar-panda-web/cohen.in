const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "database", "students.db");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
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
    progress_math INTEGER,
    progress_science INTEGER,
    progress_english INTEGER
  )`, (err) => {
    if (err) {
      console.error("Failed to create table:", err.message);
    } else {
      console.log("✅ students table created successfully");
    }
  });
});

db.close();
