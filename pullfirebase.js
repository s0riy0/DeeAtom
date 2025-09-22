// Import SDK ที่จำเป็น
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// (ใส่ Firebase Config ของคุณที่นี่)
const firebaseConfig = {
  apiKey: "AIzaSyCmrCEiO2kVl5j3VlwPycOYABoEiA0Kkts",
  authDomain: "kudthong-f67a2.firebaseapp.com",
  databaseURL: "https://kudthong-f67a2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "kudthong-f67a2",
  storageBucket: "kudthong-f67a2.appspot.com",
  messagingSenderId: "140418020508",
  appId: "1:140418020508:web:1d2feb2b7b1bd9ea0ee959",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// ใช้ onAuthStateChanged เพื่อให้แน่ใจว่าเรารู้ว่า user คนไหนกำลัง login อยู่
onAuthStateChanged(auth, (user) => {
  if (user) {
    // เมื่อมี user login อยู่, เราจะได้ user object ซึ่งมี uid อยู่ข้างใน
    const uid = user.uid;
    console.log("ผู้ใช้ที่ล็อกอินอยู่คือ:", uid);

    // 1. สร้าง Reference ไปยังข้อมูล profile ของ user คนนี้
    const userProfileRef = ref(database, 'usersID/' + uid + '/profile');

    // 2. ใช้ onValue เพื่อดึงข้อมูลและคอยฟังการเปลี่ยนแปลง
    onValue(userProfileRef, (snapshot) => {
      // snapshot คือข้อมูลทั้งหมดที่ตำแหน่งนั้นๆ
      const data = snapshot.val();

      if (data) {
        // 3. ตอนนี้ 'data' คือ object ที่มีข้อมูลทั้งหมดใน profile
        console.log("ข้อมูลโปรไฟล์ที่ได้รับ:", data);

        // เราสามารถดึงค่าแต่ละอย่างออกมาได้เลย
        const realName = data.realName;
        const DeeCoin = data.DeeCoin;
        // นำข้อมูลไปแสดงผลบนหน้าเว็บ
        document.getElementById('name').innerText = `${realName}`;
        document.getElementById('deeBalance').innerText = `${DeeCoin}`;
        
      } else {
        console.log("ไม่พบข้อมูลโปรไฟล์สำหรับผู้ใช้นี้");
      }
    });

  } else {
    // ไม่มี user login อยู่
    console.log("ไม่มีผู้ใช้ล็อกอินอยู่");
    // อาจจะ redirect ไปหน้า login
    // window.location.href = 'login.html';
  }
});