let allStudentsData = []; // To store all students fetched from the server
let selectedStudentIds = []; // لتخزين الطلاب اللي تم اختيارهم



document.addEventListener('DOMContentLoaded', () => {
  // Ensure modal is hidden on initial page load to prevent flicker
  const modal = document.getElementById('linkStudentsModal');
  if (modal) {
    modal.style.display = 'none';
  }

  // Event listener for search input
  const searchInput = document.getElementById('studentSearchInput');
  if (searchInput) {
    searchInput.addEventListener('keyup', filterStudents);
  }
});

async function openLinkStudentModal(guardianId) {
  document.getElementById('currentGuardianId').value = guardianId;
  document.getElementById('linkStudentsModal').style.display = 'block';
  document.getElementById('studentSearchInput').value = ''; // Clear search input
  await fetchStudentsForGuardian(guardianId);
}

function closeLinkStudentModal() {
  document.getElementById('linkStudentsModal').style.display = 'none';
}

async function fetchStudentsForGuardian(guardianId) {
  try {
    const response = await fetch(`/admin/guardians/getStudentsForLinking/${guardianId}`);
    const data = await response.json();
    if (data.success) {
      allStudentsData = data.students; // Store all students for filtering
      populateStudentsInModal(allStudentsData, guardianId);
    } else {
      alert('خطأ في جلب بيانات الطلاب: ' + data.message);
    }
  } catch (error) {
    console.error('Error fetching students:', error);
    alert('حدث خطأ أثناء جلب الطلاب.');
  }
}

function populateStudentsInModal(studentsToDisplay, guardianId) {
  const container = document.getElementById('studentsCheckboxes');
  const checkboxes = document.querySelectorAll('#studentsCheckboxes input[type="checkbox"]');
checkboxes.forEach(cb => {
  if (cb.checked && !selectedStudentIds.includes(cb.value)) {
    selectedStudentIds.push(cb.value);
  }
});

  container.innerHTML = ''; // Clear previous content

  const relations = [
    { value: 'parent', text: 'أب/أم' },
    { value: 'grandparent', text: 'جد/جدة' },
    { value: 'uncle', text: 'عم/خال' },
    { value: 'aunt', text: 'عمة/خالة' },
    { value: 'sibling', text: 'أخ/أخت' },
    { value: 'other', text: 'أخرى' }
  ];

  if (studentsToDisplay.length === 0) {
    container.innerHTML = '<p class="no-results">لا يوجد طلاب مطابقون للبحث.</p>';
    return;
  }

  studentsToDisplay.forEach(student => {
    const studentItem = document.createElement('div');
    studentItem.className = 'student-item';

    const studentInfo = document.createElement('div');
    studentInfo.className = 'student-info';

    const checkboxId = `student-${student.id}`;
    const isLinked = student.linked_to_current_guardian || selectedStudentIds.includes(student.id.toString());

    studentInfo.innerHTML = `
      <input type="checkbox" id="${checkboxId}" value="${student.id}" ${isLinked ? 'checked' : ''}>
      <label for="${checkboxId}">
        ${student.first_name} ${student.last_name} 
        ${student.class_name ? `(${student.class_name})` : ''}
      </label>
    `;

    const relationContainer = document.createElement('div');
    relationContainer.className = 'relation-select-container';

    const selectElement = document.createElement('select');
    selectElement.className = 'relation-select';
    selectElement.name = `relation-${student.id}`;
    selectElement.disabled = !isLinked; // Disable if not linked

    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'اختر العلاقة';
    selectElement.appendChild(defaultOption);

    // Add relation options
    relations.forEach(rel => {
      const option = document.createElement('option');
      option.value = rel.value;
      option.textContent = rel.text;
      if (isLinked && student.relation === rel.value) {
        option.selected = true;
      }
      selectElement.appendChild(option);
    });

    relationContainer.appendChild(selectElement);
    
    studentItem.appendChild(studentInfo);
    studentItem.appendChild(relationContainer);
    container.appendChild(studentItem);

    // Add event listener to enable/disable relation select based on checkbox
    document.getElementById(checkboxId).addEventListener('change', function() {
      selectElement.disabled = !this.checked;
      if (!this.checked) {
        selectElement.value = ''; // Reset relation if unlinked
      } else {
        // If linking, try to set a default or previously chosen relation
        if (student.relation) {
          selectElement.value = student.relation;
        } else {
          selectElement.value = 'parent'; // Default to 'parent' if newly linked and no prior relation
        }
      }
    });
  });
}

function filterStudents() {
  const searchTerm = document.getElementById('studentSearchInput').value.toLowerCase();
  const guardianId = document.getElementById('currentGuardianId').value;

  const filtered = allStudentsData.filter(student => {
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
    return fullName.includes(searchTerm);
  });

  populateStudentsInModal(filtered, guardianId);
}

async function saveStudentLinks() {
  const guardianId = document.getElementById('currentGuardianId').value;
  const studentCheckboxes = document.querySelectorAll('#studentsCheckboxes input[type="checkbox"]:checked');
  const studentLinks = [];

  studentCheckboxes.forEach(checkbox => {
    const studentId = checkbox.value;
    const relationSelect = document.querySelector(`.relation-select[name="relation-${studentId}"]`);
    const relation = relationSelect ? relationSelect.value : 'parent'; // Default to 'parent'
    studentLinks.push({ studentId: Number(studentId), relation: relation });
  });

  try {
    const response = await fetch('/admin/guardians/updateStudentLinks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guardianId: Number(guardianId), studentLinks })
    });
    const data = await response.json();
    if (data.success) {
      closeLinkStudentModal(); // Close modal immediately
      alert('تم تحديث الروابط بنجاح!');
      setTimeout(() => {
        window.location.reload(); // Reload page after a slight delay
      }, 100); 
    } else {
      alert('خطأ في حفظ الروابط: ' + data.message);
    }
  } catch (error) {
    console.error('Error saving links:', error);
    alert('حدث خطأ أثناء حفظ الروابط.');
  }
}