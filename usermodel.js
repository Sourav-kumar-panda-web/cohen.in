// usermodel.js
const bcrypt = require('bcrypt');
const db = require('./database');
const saltRounds = 10;

// Register new student with password hashing
function registerStudent(studentData, callback) {
  bcrypt.hash(studentData.password, saltRounds, (err, hash) => {
    if (err) return callback(err);

    const sql = `INSERT INTO students 
      (name, email, phone, dob, parent_name, parent_job, school_name, school_address, password) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [
      studentData.name,
      studentData.email,
      studentData.phone,
      studentData.dob,
      studentData.parent_name,
      studentData.parent_job,
      studentData.school_name,
      studentData.school_address,
      hash
    ], function(err) {
      if (err) return callback(err);
      callback(null, { id: this.lastID });
    });
  });
}

// Authenticate student login
function authenticateStudent(email, password, callback) {
  db.get("SELECT * FROM students WHERE email = ?", [email], (err, row) => {
    if (err) return callback(err);
    if (!row) return callback(null, false); // no user

    bcrypt.compare(password, row.password, (err, res) => {
      if (err) return callback(err);
      if (res) {
        // Remove password from returned user object
        delete row.password;
        return callback(null, row);
      } else {
        return callback(null, false);
      }
    });
  });
}

module.exports = { registerStudent, authenticateStudent };

