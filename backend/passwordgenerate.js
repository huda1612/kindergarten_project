// hash-password.js
import bcrypt from 'bcrypt' 

const password = '1234'; // ← غيّرها للكلمة اللي بدك تشفرها
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        console.error('hashing error :', err);
        return;
    }

    console.log(' password hash :', hash);
});
