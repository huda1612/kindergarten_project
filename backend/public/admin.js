//زر نقل الصف
  document.addEventListener('DOMContentLoaded', () => {
    const classTransbtns = document.querySelectorAll('.classTransbtn');

    classTransbtns.forEach(button => {
      button.addEventListener('click', () => {
        const card = button.closest('.teacherRow');
        const formDiv = card.querySelector('.classTransForm');

        button.style.display = 'none';
        formDiv.style.display = 'block';
      });
    });
  });

  //زر الغاء نقل الصف 
  document.addEventListener('DOMContentLoaded', () => {
    const cencelClassTransbtn = document.querySelectorAll('.cencelClassTransbtn');

    cencelClassTransbtn.forEach(button => {
      button.addEventListener('click', () => {
        const card = button.closest('.teacherRow');
        const formDiv = card.querySelector('.classTransForm');
        const classTransbtn = card.querySelector('.classTransbtn');

        formDiv.style.display = 'none';
        classTransbtn.style.display = 'inline-block';
      });
    });
  });
  
  //************************************************************
  //عرض تفاصيل معلم 
  document.addEventListener('DOMContentLoaded', () => {
    const teacherInfoBtns = document.querySelectorAll('.teacherInfoBtn');

    teacherInfoBtns.forEach(button => {
      button.addEventListener('click', () => {
        const card = button.closest('.teacherInfoRow');
        const div = card.querySelector('.teacherInfoDiv');

        button.style.display = 'none';
        div.style.display = 'block';
      });
    });
  });

  // الغاء عرض تفاصيل معلم  
  document.addEventListener('DOMContentLoaded', () => {
    const cencelTeacherInfoBtn = document.querySelectorAll('.cencelTeacherInfoBtn');

    cencelTeacherInfoBtn.forEach(button => {
      button.addEventListener('click', () => {
        const card = button.closest('.teacherInfoRow');
        const div = card.querySelector('.teacherInfoDiv');
        const teacherInfoBtn = card.querySelector('.teacherInfoBtn');

        div.style.display = 'none';
        teacherInfoBtn.style.display = 'inline-block';
      });
    });
  });
  //********************************************************************
 /*
 document.addEventListener("DOMContentLoaded", () => {
  const saveTeacherDatabtn = document.querySelectorAll('.saveTeacherDatabtn');

  saveTeacherDatabtn.forEach(button => {
  button.addEventListener('click', () => {
  const updateTeacherErrordiv = document.getElementById("updateTeacherError");
  const updateTeacherError =updateTeacherErrordiv.dataset.updateTeacherError;   
  if(updateTeacherError)alert(updateTeacherError);})
  })

<td class="teacherDate">
  <% const hasError = session.updateTeacherError && session.updateTeacherErrorId == teacher.id; %>

  <button type="submit" class="updateTeacherDatabtn" style= "<%= hasError ? 'display:none;' : '' %>">تعديل</button>

  <form action="/admin/updateTeacher" method="POST" style = "<%= hasError ? '' : 'display:none;' %> ; margin-left:10px; " class="teacherDataForm">
    <input type="hidden" name="teacherId" value="<%= teacher.id %>">
    <input type="text" name="first_name" value="<%= teacher.first_name %>" required>
    <input type="text" name="last_name" value="<%= teacher.last_name %>" required>
    <input type="text" name="phone" value="<%= teacher.phone %>" >
    <button type="submit" class="saveTeacherDatabtn">حفظ</button>   
    <button type="button" class="cencelUpdateTeacherDatabtn" >إلغاء</button> 
    <% if (hasError) { %>
      <p style="color:red;"><%= updateTeacherError %></p>
    <% } %>
  </form>
</td>

});
*/
/*
  //زر تعديل بيانات معلم
  document.addEventListener('DOMContentLoaded', () => {
    const updateTeacherDatabtn = document.querySelectorAll('.updateTeacherDatabtn');

    updateTeacherDatabtn.forEach(button => {
      button.addEventListener('click', () => {
        const card = button.closest('.teacherDate');
        const formDiv = card.querySelector('.teacherDataForm');

        button.style.display = 'none';
        formDiv.style.display = 'block';
      });
    });
  });

  //زر الغاء تعديل بيانات معلم 
  document.addEventListener('DOMContentLoaded', () => {
    const cencelUpdateTeacherDatabtn = document.querySelectorAll('.cencelUpdateTeacherDatabtn');

    cencelUpdateTeacherDatabtn.forEach(button => {
      button.addEventListener('click', () => {
        const card = button.closest('.teacherDate');
        const formDiv = card.querySelector('.teacherDataForm');
        const updateTeacherDatabtn = card.querySelector('.updateTeacherDatabtn');

        formDiv.style.display = 'none';
        updateTeacherDatabtn.style.display = 'inline-block';
      });
    });
  });
  */


 //لتغيير اسم الصف
  
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
        const changeEnglishBtn = card.querySelector('.showChangeEnglishBtn')



        button.style.display = 'none';
        formDiv.style.display = 'block';
         changeTeacherBtn.style.display ='none'
         changeEnglishBtn.style.display ='none'
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
        const changeEnglishBtn = card.querySelector('.showChangeEnglishBtn')

        formDiv.style.display = 'none';
        changeTeacherBtn.style.display ='block'
        changeEnglishBtn.style.display ='block'
        if (showBtn) showBtn.style.display = 'inline-block';
        if (deleteBtn) deleteBtn.style.display = 'inline-block';
        if (showStudentsBtn) showStudentsBtn.style.display = 'inline-block';
      });
    });
  });


//لتغيير ألمربية
  
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
        const changeEnglishBtn = card.querySelector('.showChangeEnglishBtn')



        formDiv.style.display = 'block';
        button.style.display = 'none';
        showNameBtn.style.display = 'none';
        changeEnglishBtn.style.display ='none'
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
        const changeEnglishBtn = card.querySelector('.showChangeEnglishBtn')


        formDiv.style.display = 'none';
        showNameBtn.style.display = 'block';
        changeEnglishBtn.style.display ='block'

        if (showBtn) showBtn.style.display = 'inline-block';
        if (deleteBtn) deleteBtn.style.display = 'inline-block';
        if (showStudentsBtn) showStudentsBtn.style.display = 'inline-block';
      });
    });
  });





//لتغيير معلمة الانجليزي
  document.addEventListener('DOMContentLoaded', () => {
    const showChangeEnglishButtons = document.querySelectorAll('.showChangeEnglishBtn');
    const cancelChangEnglishButtons = document.querySelectorAll('.cancelChangEnglishBtn');

    showChangeEnglishButtons.forEach(button => {
      button.addEventListener('click', () => {
        const card = button.closest('.class-card');
        const formDiv = card.querySelector('.englishChangeForm');
        const deleteBtn = card.querySelector('#deleteClassbutton');
        const showStudentsBtn = card.querySelector('#showStudentsbutton');
        const showNameBtn = card.querySelector('.showNameFormBtn')
        const changeTeacherBtn = card.querySelector('.showChangeTeacherBtn')


        formDiv.style.display = 'block';
        button.style.display = 'none';
        showNameBtn.style.display = 'none';
        changeTeacherBtn.style.display ='none';
        if (deleteBtn) deleteBtn.style.display = 'none';
        if (showStudentsBtn) showStudentsBtn.style.display = 'none';
      });
    });




    cancelChangEnglishButtons.forEach(button => {
      button.addEventListener('click', () => {
        const card = button.closest('.class-card');
        const formDiv = card.querySelector('.englishChangeForm');
        const showBtn = card.querySelector('.showChangeTeacherBtn');
        const showEnglishBtn = card.querySelector('.showChangeEnglishBtn');
        const deleteBtn = card.querySelector('#deleteClassbutton');
        const showStudentsBtn = card.querySelector('#showStudentsbutton');
        const showNameBtn = card.querySelector('.showNameFormBtn')


        formDiv.style.display = 'none';
        showNameBtn.style.display = 'block';

        if (showBtn) showBtn.style.display = 'inline-block';
        if (showEnglishBtn) showEnglishBtn.style.display = 'inline-block';
        if (deleteBtn) deleteBtn.style.display = 'inline-block';
        if (showStudentsBtn) showStudentsBtn.style.display = 'inline-block';
      });
    });
  });
