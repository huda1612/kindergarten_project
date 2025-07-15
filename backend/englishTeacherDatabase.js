import {executeQuery} from './database.js'

export async function getEnglishTeacherClasses(teacherId) {
    //التأكد انها معلمة انجليزي 
    try{
    const [check] = await executeQuery(`
        SELECT role FROM teachers WHERE id = ? 
        `, [teacherId]);
    if(check.role != 'english')
        throw new Error(" ليست معلمة انجليزي");

    //بجيب الصفوف اللي عم تدرسها

    const classes = await executeQuery(`
        SELECT id , class_name FROM classes WHERE english_teacher_id = ?
        ` ,[teacherId]) ;
    //الناتج[{id : .... , class_name = ....} , .....]

    if(!classes)
        return [];
    return classes ; 

    }catch(err){
    console.error("فشل احضار الصفوف :", err.message);
    throw err;
  }
}

