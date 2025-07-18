
  document.addEventListener('DOMContentLoaded', () => {
    const showNameButtons = document.querySelectorAll('.showNameFormBtn');
    const cancelNameButtons = document.querySelectorAll('.cancelNameFormBtn');

    showNameButtons.forEach(button => {
      button.addEventListener('click', () => {
        const card = button.closest('.class-card');
        const formDiv = card.querySelector('.NameForm');
        const deleteBtn = card.querySelector('#deleteClassbutton');
        const showStudentsBtn = card.querySelector('#showStudentsbutton');
        const changeTeacherBtn = card.querySelector('.showChangeTeacherBtn')

        button.style.display = 'none';
        formDiv.style.display = 'block';
         changeTeacherBtn.style.display ='none'
        if (deleteBtn) deleteBtn.style.display = 'none';
        if (showStudentsBtn) showStudentsBtn.style.display = 'none';
      });
    });

    cancelNameButtons.forEach(button => {
      button.addEventListener('click', () => {
        const card = button.closest('.class-card');
        const formDiv = card.querySelector('.NameForm');
        const showBtn = card.querySelector('.showNameFormBtn');
        const deleteBtn = card.querySelector('#deleteClassbutton');
        const showStudentsBtn = card.querySelector('#showStudentsbutton');
        const changeTeacherBtn = card.querySelector('.showChangeTeacherBtn')

        formDiv.style.display = 'none';
        changeTeacherBtn.style.display ='block'

        if (showBtn) showBtn.style.display = 'inline-block';
        if (deleteBtn) deleteBtn.style.display = 'inline-block';
        if (showStudentsBtn) showStudentsBtn.style.display = 'inline-block';
      });
    });
  });


//لتغيير المعلم
  
  document.addEventListener('DOMContentLoaded', () => {
    const showChangeTeacherButtons = document.querySelectorAll('.showChangeTeacherBtn');
    const cancelChangeTeacherButtons = document.querySelectorAll('.cancelChangeTeacherBtn');

    showChangeTeacherButtons.forEach(button => {
      button.addEventListener('click', () => {
        const card = button.closest('.class-card');
        const formDiv = card.querySelector('.teacherChangeForm');
        const deleteBtn = card.querySelector('#deleteClassbutton');
        const showStudentsBtn = card.querySelector('#showStudentsbutton');
        const showNameBtn = card.querySelector('.showNameFormBtn')


        formDiv.style.display = 'block';
        button.style.display = 'none';
        showNameBtn.style.display = 'none';
        if (deleteBtn) deleteBtn.style.display = 'none';
        if (showStudentsBtn) showStudentsBtn.style.display = 'none';
      });
    });

    cancelChangeTeacherButtons.forEach(button => {
      button.addEventListener('click', () => {
        const card = button.closest('.class-card');
        const formDiv = card.querySelector('.teacherChangeForm');
        const showBtn = card.querySelector('.showChangeTeacherBtn');
        const deleteBtn = card.querySelector('#deleteClassbutton');
        const showStudentsBtn = card.querySelector('#showStudentsbutton');
        const showNameBtn = card.querySelector('.showNameFormBtn')


        formDiv.style.display = 'none';
        showNameBtn.style.display = 'block';

        if (showBtn) showBtn.style.display = 'inline-block';
        if (deleteBtn) deleteBtn.style.display = 'inline-block';
        if (showStudentsBtn) showStudentsBtn.style.display = 'inline-block';
      });
    });
  });


