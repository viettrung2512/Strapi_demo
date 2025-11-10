export default {
  async afterCreate(event: any) {
    const { data } = event.params;
    // console.log("Dữ liệu (data) nhận được từ request:", data);

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

    // console.log("ID của Question được LIÊN KẾT THỰC SỰ là:", questionId);

    if (questionId) {
      try {
        await strapi.entityService.update(
          // @ts-ignore
          "api::question.question",
          questionId,
          {
            data: {
              reqStatus: "Đã phản hồi",
            },
          }
        );
        // console.log(`--- CẬP NHẬT THÀNH CÔNG Question ID: ${questionId} ---`);
      } catch (error) {
        console.error("Lỗi khi tự động cập nhật trạng thái question:", error);
      }
    } else {
      console.error("--- Không tìm thấy ID question để liên kết. ---");
    }
  },
};
