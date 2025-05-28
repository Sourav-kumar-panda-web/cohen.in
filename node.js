db.run(`ALTER TABLE students ADD COLUMN password TEXT`, err => {
  if (err) {
    if (err.message.includes("duplicate column name")) {
      console.log('Password column already exists');
    } else {
      console.error('Failed to add password column:', err);
    }
  } else {
    console.log('✅ Password column added successfully.');
  }
});
