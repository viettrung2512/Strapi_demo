// import type { Core } from '@strapi/strapi';
import * as admin from "firebase-admin";
import path from "path";
export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    // -----------------------------------------------------------------
    // KHỞI TẠO FIREBASE ADMIN (ĐÃ SỬA)
    // -----------------------------------------------------------------

    // 'process.cwd()' sẽ trỏ đến thư mục gốc của dự án Strapi
    // nơi chứa file package.json và thư mục 'config'
    const serviceAccountPath = path.resolve(
      process.cwd(), // <-- Sửa ở đây
      "config",
      "firebase-service-account.json" // Tên file bạn đã tải về
    );

    try {
      // Khởi tạo app
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
      });
      console.log("✅ Firebase Admin SDK đã được khởi tạo thành công.");

      // Gán 'admin' vào 'strapi' để dùng ở chỗ khác
      (strapi as any).firebase = admin;
    } catch (e) {
      console.error(
        "❌ Lỗi khởi tạo Firebase Admin SDK:",
        (e as Error).message
      );
      // In ra lỗi chi tiết hơn nếu đường dẫn file .json bị sai
      if ((e as Error).message.includes("service account")) {
        console.error(
          'Kiểm tra lại: File "firebase-service-account.json" có nằm đúng trong thư mục "config" ở gốc dự án không?'
        );
      }
    }
  },

  /**
   * An asynchronous bootstrap function that runs after
   * your application gets initialized.
   */
  bootstrap(/*{ strapi }*/) {},
};
