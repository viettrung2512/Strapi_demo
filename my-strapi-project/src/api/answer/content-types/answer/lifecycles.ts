import * as admin from "firebase-admin";

// Hàm helper để lấy ID user từ questionEntry
const getUserIdFromQuestion = (questionEntry: any): string | null => {
  if (!questionEntry) return null;
  // Xử lý cả 2 trường hợp:
  // 1. 'user' là một object đầy đủ (khi đã populate)
  if (
    questionEntry.user &&
    typeof questionEntry.user === "object" &&
    questionEntry.user.id
  ) {
    return String(questionEntry.user.id);
  }
  // 2. 'user' chỉ là một ID
  if (questionEntry.user && typeof questionEntry.user === "number") {
    return String(questionEntry.user);
  }
  return null;
};

export default {
  async afterCreate(event: any) {
    const { data } = event.params;
    const { result } = event;
    const relationData = data.question;
    let questionId = null;

    if (
      relationData &&
      relationData.connect &&
      relationData.connect.length > 0
    ) {
      questionId = relationData.connect[0].id;
    } else if (
      relationData &&
      relationData.set &&
      relationData.set.length > 0
    ) {
      questionId = relationData.set[0].id;
    } else if (typeof relationData === "number") {
      questionId = relationData;
    }

    if (!questionId) return;
    if (!result.publishedAt) {
      console.log(
        `Hook 'afterCreate': Entry ${result.id} là DRAFT. Không gửi thông báo.`
      );
      return;
    }

    const firebaseAdmin = (strapi as any).firebase;
    if (!firebaseAdmin) {
      console.error("LỖI NGHIÊM TRỌNG: Firebase Admin SDK chưa được khởi tạo.");
      return;
    }

    const firestoreDb = firebaseAdmin.firestore();

    // --- BẮT ĐẦU NÂNG CẤP ---

    let questionEntry = null;
    let userId = null;

    // --- BƯỚC A: Cập nhật Strapi DB VÀ LẤY THÔNG TIN USER ---
    try {
      // 1. LẤY thông tin question TRƯỚC KHI update
      // !! QUAN TRỌNG: Chúng ta phải 'populate' để lấy được 'user'
      questionEntry = await (strapi.entityService as any).findOne(
        "api::question.question",
        questionId,
        { populate: ["user"] }
      );

      // 2. Lấy User ID
      userId = getUserIdFromQuestion(questionEntry);

      // 3. Cập nhật Strapi DB
      await (strapi.entityService as any).update(
        "api::question.question",
        questionId,
        { data: { reqStatus: "Đã được phản hồi" } }
      );
    } catch (error) {
      console.error(
        `--- LỖI khi cập nhật Strapi DB cho Question ID: ${questionId} ---`,
        error
      );
      return;
    }
    const docId = questionEntry?.documentId;
    if (!docId) {
      console.error(
        `--- LỖI: Không tìm thấy documentId cho Question ID: ${questionId} ---`
      );
      return;
    }

    // --- BƯỚC B: Cập nhật Firestore (cho trang chi tiết) ---
    try {
      await firestoreDb
        .collection("questions")
        .doc(String(docId))
        .set(
          { status: "Đã được phản hồi", answer: data.message },
          { merge: true }
        );
    } catch (error) {
      console.error(
        `--- LỖI khi cập nhật Firestore 'questions' cho QID: ${questionId} ---`,
        error
      );
    }

    // --- BƯỚC C: Gửi FCM Push Notification (như cũ) ---
    try {
      if (questionEntry && questionEntry.fcmToken) {
        
      }
    } catch (error) {
      console.error(`--- LỖI khi gửi FCM cho QID: ${questionId} ---`, error);
    }

    // --- BƯỚC D: [MỚI] Tạo Document Notification cho "Chuông" ---
    if (userId) {
      try {
        const notifRef = firestoreDb
          .collection("user_notifications")
          .doc(userId)
          .collection("notifications");

        // const frontendUrl = "http://localhost:5173";

        // Tạo document thông báo mới
        await notifRef.add({
          title: "Admin đã phản hồi câu hỏi của bạn, nhấn vào để xem ngay!",
          link: `/questions/${docId}`,
          questionId: docId,
          isRead: false,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(
          `--- TẠO (Firestore Notification) THÀNH CÔNG cho User ID: ${userId} ---`
        );
      } catch (error) {
        console.error(
          `--- LỖI khi tạo Firestore Notification cho User ID: ${userId} ---`,
          error
        );
      }
    }
  },
};
