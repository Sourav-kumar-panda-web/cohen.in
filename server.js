// ---------- DEPENDENCIES ----------
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// ---------- PATH SETUP ----------
const rootDir = __dirname;
const dbDir = path.join(rootDir, 'database');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir);

const dbPath = path.join(dbDir, 'students.db');
const viewsPath = path.join(rootDir, 'views');
const adminViewsPath = path.join(rootDir, 'admin-portal');
const assetsPath = path.join(rootDir, 'assets');

// ---------- MIDDLEWARE ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 60 * 60 * 1000 }
  
}));

// Static Files
app.use(express.static(viewsPath));
app.use('/css', express.static(path.join(assetsPath, 'css')));
app.use('/js', express.static(path.join(assetsPath, 'js')));
app.use('/images', express.static(path.join(assetsPath, 'images')));
app.use(express.static('assets'));
// ---------- DATABASE INIT ----------
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) return console.error('❌ DB error:', err.message);
  console.log('✅ Connected to SQLite database');
});
db.configure("busyTimeout", 5000);

// ---------- CREATE TABLES ----------
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT, email TEXT UNIQUE, username TEXT,
      password TEXT, address TEXT, phone TEXT UNIQUE,
      school TEXT, class TEXT, division TEXT,
      percentage REAL, subjects TEXT, hobbies TEXT,
      parent_phone TEXT UNIQUE,
      math_progress INTEGER DEFAULT 0,
      science_progress INTEGER DEFAULT 0,
      english_progress INTEGER DEFAULT 0,
      lastLogin TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_phone TEXT,
      title TEXT,
      status TEXT DEFAULT 'Pending'
    )
  `);
});

// ---------- DEFAULT ADMIN ----------
const defaultAdminEmail = "admin@school.com";
const defaultAdminPassword = "admin123";
bcrypt.hash(defaultAdminPassword, 10, (err, hash) => {
  if (!err) {
    db.run(`INSERT OR IGNORE INTO admins (email, password) VALUES (?, ?)`, [defaultAdminEmail, hash]);
  }
});

// ---------- AUTH MIDDLEWARE ----------
function adminAuth(req, res, next) {
  if (req.session?.adminId) return next();
  res.status(401).json({ error: 'Unauthorized admin' });
}
function studentAuth(req, res, next) {
  if (req.session?.studentId) return next();
  res.status(401).json({ error: 'Unauthorized student' });
}

// ---------- STATIC ROUTES ----------
app.get("/", (req, res) => res.redirect("/login"));
app.get("/login", (req, res) => res.sendFile(path.join(viewsPath, "login.html")));
app.get("/register", (req, res) => res.sendFile(path.join(viewsPath, "register.html")));
app.get("/admin-login", (req, res) => res.sendFile(path.join(adminViewsPath, "adminLogin.html")));
app.get("/index.html", studentAuth, (req, res) => res.sendFile(path.join(viewsPath, "index.html")));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html'); // serve your homepage
});
// ---------- STUDENT REGISTRATION ----------
app.post('/register-student', async (req, res) => {
  try {
    const {
      name, email, username, password, address, phone,
      school, studentClass, division, percentage,
      subjects, hobbies, parent_phone,
      progress_math, progress_science, progress_english
    } = req.body;

    if (!name || !email || !username || !password) {
      return res.status(400).send("Required fields are missing.");
    }

    const hashedPassword = await bcrypt.hash(password.trim(), 10);
    const stmt = db.prepare(`
      INSERT INTO students (
        name, email, username, password, address, phone,
        school, class, division, percentage, subjects,
        hobbies, parent_phone, math_progress, science_progress, english_progress
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run([
      name.trim(), email.trim(), username.trim(), hashedPassword, address.trim(), phone.trim(),
      school.trim(), studentClass.trim(), division.trim(), parseFloat(percentage), subjects.trim(),
      hobbies.trim(), parent_phone.trim(), progress_math || 0, progress_science || 0, progress_english || 0
    ], function (err) {
      if (err) {
        console.error("❌ Registration error:", err.message);
        return res.status(500).send("Error registering student.");
      }
      res.status(200).send("Student registered successfully.");
    });
  } catch (err) {
    console.error("❌ Hashing error:", err.message);
    res.status(500).send("Server error");
  }
});

// ---------- STUDENT LOGIN ----------
app.post('/login-student', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM students WHERE username = ?', [username], async (err, user) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      req.session.studentId = user.id;
      req.session.userType = "student";
      res.json({ success: true, message: 'Login successful' });
    } else {
      res.status(401).json({ success: false, message: 'Incorrect password' });
    }
  });
});

// ---------- SESSION CHECK ----------
app.get('/check-login', (req, res) => {
  if (req.session?.userType === 'student') {
    res.json({ loggedIn: true, type: 'student' });
  } else if (req.session?.userType === 'admin') {
    res.json({ loggedIn: true, type: 'admin' });
  } else {
    res.json({ loggedIn: false });
  }
});

// ---------- STUDENT DASHBOARD ----------
app.get('/student-dashboard-data', studentAuth, (req, res) => {
  db.get('SELECT * FROM students WHERE id = ?', [req.session.studentId], (err, student) => {
    if (err || !student) return res.json({ success: false });

    db.all('SELECT * FROM assignments WHERE student_phone = ?', [student.phone], (err2, assignments) => {
      if (err2) return res.json({ success: false });

      res.json({
        success: true,
        student,
        assignments,
        progress: {
          math: student.math_progress,
          science: student.science_progress,
          english: student.english_progress
        },
        examScores: [60, 70, 80] // example scores
      });
    });
  });
});

// ---------- UPDATE PROGRESS ----------
app.post('/update-progress', studentAuth, (req, res) => {
  const { math, science, english } = req.body;
  db.run(`
    UPDATE students
    SET math_progress = ?, science_progress = ?, english_progress = ?
    WHERE id = ?
  `, [math, science, english, req.session.studentId], (err) => {
    if (err) return res.json({ success: false, message: 'DB error' });
    res.json({ success: true, message: 'Progress updated' });
  });
});

// ---------- ADMIN LOGIN ----------
app.post('/admin-login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM admins WHERE email = ?', [email], (err, admin) => {
    if (err || !admin) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    bcrypt.compare(password, admin.password, (err, result) => {
      if (result) {
        req.session.adminId = admin.id;
        req.session.userType = "admin";
        res.json({ success: true });
      } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    });
  });
});

// ---------- ADMIN DASHBOARD ----------
app.get('/admin-dashboard-data', adminAuth, (req, res) => {
  db.all('SELECT id, name, school, phone FROM students', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to load students' });
    res.json(rows);
  });
});

app.get('/admin-users', adminAuth, (req, res) => {
  db.all(`SELECT id, name, school, phone FROM students`, [], (err, rows) => {
    if (err) return res.status(500).send('Error loading users');
    res.json(rows);
  });
});

// ---------- ASSIGNMENTS ----------
app.post('/assign-task', adminAuth, (req, res) => {
  const { student_phone, title } = req.body;
  db.run(`INSERT INTO assignments (student_phone, title) VALUES (?, ?)`, [student_phone, title], (err) => {
    if (err) return res.json({ success: false, message: 'DB Error' });
    res.json({ success: true, message: 'Task assigned' });
  });
});

app.get('/all-assignments', adminAuth, (req, res) => {
  db.all(`SELECT * FROM assignments`, (err, rows) => {
    if (err) return res.json([]);
    res.json(rows);
  });
});

app.post('/edit-assignment', adminAuth, (req, res) => {
  const { id, title } = req.body;
  db.run(`UPDATE assignments SET title = ? WHERE id = ?`, [title, id], (err) => {
    if (err) return res.json({ success: false, message: 'Update error' });
    res.json({ success: true, message: 'Updated successfully' });
  });
});

app.post('/delete-assignment', adminAuth, (req, res) => {
  const { id } = req.body;
  db.run(`DELETE FROM assignments WHERE id = ?`, [id], (err) => {
    if (err) return res.json({ success: false, message: 'Delete error' });
    res.json({ success: true, message: 'Deleted successfully' });
  });
});

// ---------- STUDENT DETAILS ----------
app.get('/student-details/:id', adminAuth, (req, res) => {
  db.get('SELECT * FROM students WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Fetch error' });
    res.json(row);
  });
});

// ---------- LOGOUT ----------
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send('Logout failed');
    res.redirect('/');
  });
});

// ---------- START SERVER ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

