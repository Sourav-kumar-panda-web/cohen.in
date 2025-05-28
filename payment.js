// models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: {
    type: String,
    required: true,
    match: /^\d{10}$/
  },
  email: { type: String, required: true },
  utr: {
    type: String,
    required: true,
    unique: true,
    match: /^\d{12}$/
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Payment', paymentSchema);
const form = document.getElementById('utrForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const data = {
        fullName: form.fullName.value,
        phone: form.phone.value,
        email: form.email.value,
        utr: form.utr.value
      };

      const res = await fetch('/submit-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      document.getElementById('resultMsg').textContent = result.message;
      document.getElementById('resultMsg').style.color = result.success ? 'green' : 'red';
    });