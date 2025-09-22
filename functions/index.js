// ใช้ синтаксис ใหม่ (v2) ในการ import
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const nodemailer = require('nodemailer');

// กำหนด region สำหรับทุกฟังก์ชันในไฟล์นี้ด้วยวิธีใหม่
setGlobalOptions({ region: "asia-southeast1" });

admin.initializeApp();

// --- การตั้งค่าสำหรับส่งอีเมล ---
const GMAIL_EMAIL = 'gamegold559@gmail.com';
const GMAIL_APP_PASSWORD = 'jocp aednrtbmgjit'; // App Password ที่สร้างจาก Google Account

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_EMAIL, pass: GMAIL_APP_PASSWORD },
});

/**
 * Cloud Function สำหรับส่งรหัสยืนยันทางอีเมล
 */
exports.sendVerificationCode = onCall(async (request) => {
    const email = request.data.email;
    if (!email) {
        throw new HttpsError('invalid-argument', 'ต้องระบุอีเมล');
    }
    try {
        await admin.auth().getUserByEmail(email);
        throw new HttpsError('already-exists', 'อีเมลนี้ถูกลงทะเบียนแล้ว');
    } catch (error) {
        if (error.code !== 'auth/user-not-found') {
            throw new HttpsError('internal', error.message);
        }
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const emailKey = email.replace(/\./g, ',');
    const mailOptions = {
        from: `ATOM INDUSTRY <${GMAIL_EMAIL}>`,
        to: email,
        subject: 'รหัสยืนยันสำหรับ ATOM INDUSTRY',
        html: `<p>รหัสยืนยันของคุณคือ: <b>${code}</b></p><p>รหัสนี้จะหมดอายุใน 5 นาที</p>`,
    };
    try {
        await admin.database().ref(`/verificationCodes/${emailKey}`).set({ code: code, timestamp: Date.now() });
        await transporter.sendMail(mailOptions);
        return { success: true, message: "รหัสยืนยันถูกส่งไปยังอีเมลของคุณแล้ว" };
    } catch (error) {
        console.error("Error sending email:", error);
        throw new HttpsError('internal', 'ไม่สามารถส่งรหัสยืนยันได้');
    }
});

/**
 * รับคำขอสร้างบัญชีย่อยจากผู้ใช้ และส่งให้แอดมินอนุมัติ
 */
exports.requestSubAccountCreation = onCall(async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'ต้องทำการล็อกอินก่อน');
    }
    const { code, newEmail } = request.data;
    const originalUid = request.auth.uid;
    const emailKey = newEmail.replace(/\./g, ',');

    const codeRef = admin.database().ref(`/verificationCodes/${emailKey}`);
    const snapshot = await codeRef.get();
    if (!snapshot.exists() || snapshot.val().code !== code) {
        throw new HttpsError('invalid-argument', 'รหัสยืนยันไม่ถูกต้อง');
    }
    await codeRef.remove();

    const requestsRef = admin.database().ref('subAccountRequests');
    await requestsRef.push({
        originalUid: originalUid,
        newEmail: newEmail,
        status: 'pending',
        timestamp: admin.database.ServerValue.TIMESTAMP
    });

    return { success: true, message: "คำขอสร้างบัญชีของคุณถูกส่งไปให้ผู้ดูแลระบบตรวจสอบแล้ว" };
});

/**
 * ให้แอดมินใช้ฟังก์ชันนี้ในการอนุมัติหรือปฏิเสธคำขอ
 */
exports.processSubAccountRequest = onCall(async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'ต้องทำการล็อกอินก่อน');
    }
    const adminRef = admin.database().ref(`admins/${request.auth.uid}`);
    const adminSnapshot = await adminRef.get();
    if (!adminSnapshot.exists() || adminSnapshot.val() !== true) {
        throw new HttpsError('permission-denied', 'คุณไม่มีสิทธิ์ดำเนินการ');
    }

    const { requestId, action } = request.data;
    const requestRef = admin.database().ref(`subAccountRequests/${requestId}`);
    const requestSnapshot = await requestRef.get();

    if (!requestSnapshot.exists()) {
        throw new HttpsError('not-found', 'ไม่พบคำขอดังกล่าว');
    }

    const reqData = requestSnapshot.val();
    if (reqData.status !== 'pending') {
        throw new HttpsError('already-exists', 'คำขอนี้ถูกจัดการไปแล้ว');
    }

    if (action === 'approve') {
        const { originalUid, newEmail } = reqData;
        const tempPassword = Math.random().toString(36).slice(-8);

        const userRecord = await admin.auth().createUser({
            email: newEmail,
            password: tempPassword,
        });
        const newUid = userRecord.uid;

        // --- สร้างข้อมูลเริ่มต้นที่ถูกต้อง ---
        const today = new Date().toISOString().slice(0, 10);
        const keyBag = `${newEmail.split("@")[0]}${Math.floor(100000 + Math.random() * 900000)}`;

        const initialUserData = {
            profile: {
                THBwallet: 0,
                KeyBag: keyBag,
                DeeCoin: 0,
                createAt: today,
                email: newEmail,
                haveAds: true,
                isAcceptPP: false,
                level: 0,
                nickname: `sub_${newEmail.split("@")[0]}`,
                realName: "",
                birthYear: "",
                birthMonth: "",
                gender: "",
                mainAccountUid: originalUid,
            },
            WalletBag: {},
        };
        await admin.database().ref(`usersID/${newUid}`).set(initialUserData);
        // ------------------------------------

        await admin.database().ref(`usersID/${originalUid}/subAccounts/${newUid}`).set(true);

        const mailOptions = {
            from: `ATOM INDUSTRY <${GMAIL_EMAIL}>`,
            to: newEmail,
            subject: 'บัญชีของคุณได้รับการอนุมัติแล้ว!',
            html: `<p>สวัสดี,</p><p>บัญชีย่อยสำหรับ ${newEmail} ถูกสร้างเรียบร้อยแล้ว</p><p>รหัสผ่านชั่วคราวของคุณคือ: <b>${tempPassword}</b></p><p>กรุณาลงชื่อเข้าใช้และเปลี่ยนรหัสผ่านในภายหลัง</p>`
        };
        await transporter.sendMail(mailOptions);
        await requestRef.update({ status: 'approved' });
        return { success: true, message: "อนุมัติและสร้างบัญชีสำเร็จ" };

    } else if (action === 'reject') {
        await requestRef.update({ status: 'rejected' });
        return { success: true, message: "ปฏิเสธคำขอเรียบร้อยแล้ว" };
    } else {
        throw new HttpsError('invalid-argument', 'การดำเนินการไม่ถูกต้อง');
    }
});

/**
 * (ใหม่) รับคำขอซื้อพร้อมสลิป แล้วส่งไปที่อีเมลแอดมินโดยตรง
 */
exports.sendPurchaseRequestWithSlip = onCall({ cors: true }, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'ต้องทำการล็อกอินก่อน');
    }

    const {
        purchaseData, // ข้อมูลการซื้อ
        slipBase64,   // ไฟล์สลิปที่แปลงเป็น Base64
        slipFileType  // ชนิดของไฟล์ เช่น 'image/jpeg'
    } = request.data;
    
    const adminEmail = 'soriyazun725@gmail.com'; // <<< อีเมลแอดมินของคุณ

    if (!purchaseData || !slipBase64 || !slipFileType) {
        throw new HttpsError('invalid-argument', 'ข้อมูลที่ส่งมาไม่ครบถ้วน');
    }

    try {
        const sellerProfileRef = admin.database().ref(`usersID/${purchaseData.sellerId}/profile`);
        const sellerSnapshot = await sellerProfileRef.get();
        const sellerEmail = sellerSnapshot.exists() ? sellerSnapshot.val().email : 'ไม่พบข้อมูล';
        
        const mailOptions = {
            from: `ATOM INDUSTRY <${GMAIL_EMAIL}>`,
            to: adminEmail,
            subject: `[คำสั่งซื้อใหม่] การซื้อ DeeCoin จาก ${purchaseData.buyerEmail}`,
            html: `
                <h2>มีคำสั่งซื้อใหม่เข้าระบบ</h2>
                <p>กรุณาตรวจสอบและอนุมัติในหน้า Admin Panel</p>
                <ul>
                    <li><strong>ผู้ซื้อ:</strong> ${purchaseData.buyerEmail}</li>
                    <li><strong>ผู้ขาย:</strong> ${sellerEmail}</li>
                    <li><strong>จำนวน DeeCoin:</strong> ${purchaseData.deeCoinAmount.toFixed(4)}</li>
                    <li><strong>ราคา (THB):</strong> ${purchaseData.thbAmount.toFixed(2)}</li>
                </ul>
                <p>สลิปการโอนเงินได้ถูกแนบมากับอีเมลนี้แล้ว</p>
            `,
            attachments: [
                {
                    filename: 'payment-slip.' + slipFileType.split('/')[1],
                    content: slipBase64.split(';base64,').pop(),
                    encoding: 'base64'
                }
            ]
        };

        await transporter.sendMail(mailOptions);
        
        const requestForDb = {
            ...purchaseData,
            status: "pending",
            timestamp: admin.database.ServerValue.TIMESTAMP,
            slipPath: "Sent via Email"
        };
        await admin.database().ref("marketPurchaseRequests").push(requestForDb);

        return { success: true, message: "ส่งคำสั่งซื้อและสลิปไปยังแอดมินเรียบร้อยแล้ว" };

    } catch (error) {
        console.error("Error sending purchase request email:", error);
        throw new HttpsError('internal', 'ไม่สามารถส่งอีเมลคำสั่งซื้อได้');
    }
});