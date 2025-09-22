// Modal logic
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const closeLogin = document.getElementById('closeLogin');
const closeRegister = document.getElementById('closeRegister');
const switchToRegister = document.getElementById('switchToRegister');

// Open modals
loginBtn.onclick = () => {
    loginModal.style.display = "flex";
    registerModal.style.display = "none";
};
registerBtn.onclick = () => {
    registerModal.style.display = "flex";
    loginModal.style.display = "none";
};
if (switchToRegister) {
    switchToRegister.onclick = function(e) {
        e.preventDefault();
        loginModal.style.display = "none";
        registerModal.style.display = "flex";
    }
}

// Close modals
closeLogin.onclick = () => loginModal.style.display = "none";
closeRegister.onclick = () => registerModal.style.display = "none";

// Close modals when clicking outside content
window.onclick = function(event) {
    if (event.target === loginModal) loginModal.style.display = "none";
    if (event.target === registerModal) registerModal.style.display = "none";
}

// Dummy login/register logic 
document.getElementById('loginForm').onsubmit = function(e) {
    e.preventDefault();
    alert('เข้าสู่ระบบสำเร็จ!');
    loginModal.style.display = "none";
};
document.getElementById('registerForm').onsubmit = function(e) {
    e.preventDefault();
    alert('ลงทะเบียนสำเร็จ!');
    registerModal.style.display = "none";
};

// สมมติว่ามี hidden input สำหรับ gender (ควรมีใน <form> ของคุณ)
let selectedGender = '';

document.querySelectorAll('.register-icon-col').forEach(function(col, idx) {
    col.addEventListener('click', function() {
        // เอา selected ออกจากทุกไอคอน
        document.querySelectorAll('.register-icon-col').forEach(function(c) {
            c.classList.remove('selected');
        });
        // ใส่ selected ให้ไอคอนที่คลิก
        col.classList.add('selected');
        // เก็บค่า gender ในตัวแปรหรือ hidden input
        if(idx === 0) {
            selectedGender = 'female';
        } else if(idx === 1) {
            selectedGender = 'male';
        }
        // หากมี hidden input <input type="hidden" name="gender" id="genderInput">
        const genderInput = document.getElementById('genderInput');
        if (genderInput) {
            genderInput.value = selectedGender;
        }
    });
});

// Add-account page timer logic 
document.addEventListener('DOMContentLoaded', function () {
    const sendBtn = document.getElementById('sendBtn');
    const resendBtn = document.getElementById('resendBtn');
    const timerSpan = document.getElementById('timer');
    const codeInput = document.getElementById('code');
    const verifyBtn = document.getElementById('verifyBtn');
    let timer = null;
    let timeLeft = 60;

    function startTimer() {
        timeLeft = 60;
        timerSpan.textContent = timeLeft + " วินาที";
        timerSpan.style.color = "#47a9ff";
        sendBtn.disabled = true;
        resendBtn.disabled = true;
        codeInput.disabled = false;
        timer = setInterval(() => {
            timeLeft--;
            timerSpan.textContent = timeLeft + " วินาที";
            if (timeLeft <= 0) {
                clearInterval(timer);
                resendBtn.disabled = false;
                timerSpan.textContent = "หมดเวลา";
                timerSpan.style.color = "#ea5555";
                sendBtn.disabled = false;
            }
        }, 1000);
    }

    if (sendBtn) {
        sendBtn.addEventListener('click', function () {
            startTimer();
        });
    }
    if (resendBtn) {
        resendBtn.addEventListener('click', function () {
            startTimer();
        });
    }
    if (verifyBtn) {
        verifyBtn.addEventListener('click', function () {
            if (codeInput.value.length > 0) {
                alert('ยืนยันสำเร็จ');
            } else {
                alert('กรุณากรอกโค้ดยืนยัน');
            }
        });
    }
});

function updateMarketTime() {
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const timeStr = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const el = document.getElementById('current-time');
    if(el) el.textContent = timeStr;
}
updateMarketTime();
setInterval(updateMarketTime, 1000);

function updateBuyTime() {
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const timeStr = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const el = document.getElementById('current-time-buy');
    if(el) el.textContent = timeStr;
}
updateBuyTime();
setInterval(updateBuyTime, 1000);

document.querySelector('.buy-form').addEventListener('submit', function(e){
    e.preventDefault();
    alert('ส่งข้อมูลสำเร็จ');
});

function updateTimeBankCard() {
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const timeStr = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const el = document.getElementById('current-time-bc');
    if(el) el.textContent = timeStr;
}
updateTimeBankCard();
setInterval(updateTimeBankCard, 1000);

// Add/edit/delete (dummy logic for demo)
document.querySelector('.add-card-btn').onclick = () => {
    alert('ฟีเจอร์นี้สำหรับเพิ่มบัตรใหม่ (Demo)');
};
document.querySelector('.edit-btn').onclick = () => {
    alert('ฟีเจอร์แก้ไขบัตร (Demo)');
};
document.querySelector('.delete-btn').onclick = () => {
    if(confirm('ลบบัตรนี้?')) alert('ลบสำเร็จ (Demo)');
};


function updateTimeSetting() {
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const timeStr = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const el = document.getElementById('current-time-set');
    if(el) el.textContent = timeStr;
}
updateTimeSetting();
setInterval(updateTimeSetting, 1000);

// Demo click logic for setting rows
document.querySelectorAll('.setting-row').forEach(row => {
    row.onclick = () => {
        alert('ฟีเจอร์นี้อยู่ระหว่างพัฒนา (Demo)');
    };
});


function updateTimeProfile() {
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const timeStr = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const el = document.getElementById('current-time-profile');
    if(el) el.textContent = timeStr;
}
updateTimeProfile();
setInterval(updateTimeProfile, 1000);

function updateTimeJoin() {
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const timeStr = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const el = document.getElementById('current-time-join');
    if(el) el.textContent = timeStr;
}
updateTimeJoin();
setInterval(updateTimeJoin, 1000);

function updateTimeTH() {
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const timeStr = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const el = document.getElementById('current-time-th');
    if(el) el.textContent = timeStr;
}
updateTimeTH();
setInterval(updateTimeTH, 1000);

// login
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getDatabase, ref, set } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js'; 
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";


const firebaseConfig = {
  apiKey: "AIzaSyCmrCEiO2kVl5j3VlwPycOYABoEiA0Kkts",
  authDomain: "kudthong-f67a2.firebaseapp.com",
  databaseURL: "https://kudthong-f67a2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "kudthong-f67a2",
  storageBucket: "kudthong-f67a2.appspot.com",
  messagingSenderId: "140418020508",
  appId: "1:140418020508:web:1d2feb2b7b1bd9ea0ee959"
}; 

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

async function registerUser(email, password, username, realName, year, month, gender) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await set(ref(database, 'usersID/' + user.uid), {
            email: email,
            username: username,
            realName: realName,
            birthYear: year,
            birthMonth: month,
            gender: gender,
            createdAt: new Date().toISOString(),
            uid: user.uid
        });

        showNotification('สมัครสมาชิกสำเร็จ!', 'success');
        setTimeout(() => {
            window.location.href = "index.html";
        }, 800);

    } catch (error) {
        
    }
}




