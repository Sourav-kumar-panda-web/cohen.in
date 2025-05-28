// admin.js

document.addEventListener('DOMContentLoaded', () => {
  fetch('/admin/users', {
    method: 'GET',
    credentials: 'include',
  })
    .then(response => {
      if (!response.ok) throw new Error('Failed to load students');
      return response.json();
    })
    .then(students => {
      const tbody = document.querySelector('#students-table tbody');
      tbody.innerHTML = '';

      students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${student.id}</td>
          <td>${student.name}</td>
          <td>${student.email}</td>
          <td>${student.phone}</td>

          
          <td>${student.dob}</td>
          <td>${student.parent_name}</td>
          <td>${student.school_name}</td>
          <td>
            <button onclick="deleteStudent(${student.id})">Delete</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    })
    .catch(error => {
      console.error(error);
      document.querySelector('#students-table tbody').innerHTML =
        '<tr><td colspan="8">Error loading data</td></tr>';
    });
});

function deleteStudent(id) {
  if (!confirm('Are you sure you want to delete this student?')) return;

  fetch(`/admin/users/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  })
    .then(response => {
      if (!response.ok) throw new Error('Failed to delete student');
      return response.json();
    })
    .then(() => {
      alert('Student deleted');
      location.reload();
    })
    .catch(() => {
      alert('Delete failed');
    });
}




