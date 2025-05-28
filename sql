DROP TABLE IF EXISTS students;

CREATE TABLE students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  address TEXT,
  phone TEXT,
  name TEXT,
  email TEXT,
  password TEXT,
  school TEXT,
  class TEXT,
  division TEXT,
  percentage REAL,
  subjects TEXT,
  hobbies TEXT,
  parent_phone TEXT
);
