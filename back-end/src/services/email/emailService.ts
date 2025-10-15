import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
function getDateString(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
): Promise<void> => {
  const mailOptions = {
    from: `"Hola Rental" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

export const sendExtendedMail = async (
  to: string,
  tenantName: string,
  roomNumber: string,
  housingName: string,
  newEndDate: Date,
): Promise<void> => {
  const html = `
  <div style="
    font-family: Arial, sans-serif; 
    max-width: 600px; 
    margin: auto; 
    background: #fff; 
    border: 1px solid #e0e0e0; 
    border-radius: 10px; 
    padding: 24px;
  ">
    <h2 style="text-align: center; color: #2e7d32;">
      ✅ Hợp đồng đã được gia hạn
    </h2>
    <p>Xin chào <strong>${tenantName}</strong>,</p>
    <p>
      Hợp đồng thuê phòng <strong>${roomNumber}</strong> tại khu trọ
      <strong>${housingName}</strong> của bạn đã được
      <strong>gia hạn thành công</strong>.
    </p>
    <p>Ngày kết thúc mới của hợp đồng là: <strong>${getDateString(
    newEndDate,
  )}</strong>.</p>
    <p>Vui lòng kiểm tra lại thông tin hợp đồng nếu cần thiết.</p>
    <p style="margin-top: 24px;">
      Trân trọng,<br><strong>Đội ngũ Hola Rental</strong>
    </p>
  </div>
`;

  await sendEmail(to, "✅ Hợp đồng đã được gia hạn", html);
};

export const sendExpiredContractMail = async (
  to: string,
  tenantName: string,
  roomNumber: string,
  housingName: string,
  endDate: Date,
): Promise<void> => {
  const html = `
  <div style="
    font-family: Arial, sans-serif;
    max-width: 600px;
    margin: auto;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 24px;
  ">
    <h2 style="text-align: center; color: #f44336;">
      ⏰ Hợp đồng đã hết hạn
    </h2>

    <p>Xin chào <strong>${tenantName}</strong>,</p>

    <p>
      Hợp đồng thuê phòng <strong>${roomNumber}</strong> tại khu trọ
      <strong>${housingName}</strong> của bạn đã
      <strong>hết hạn vào ngày ${getDateString(endDate)}</strong>.
    </p>

    <p>
      Nếu bạn muốn tiếp tục thuê, vui lòng liên hệ với chủ trọ hoặc đăng nhập vào hệ thống
      để thực hiện gia hạn.
    </p>

    <p style="margin-top: 24px;">
      Trân trọng,<br><strong>Đội ngũ Hola Rental</strong>
    </p>
  </div>
`;

  await sendEmail(to, "⏰ Hợp đồng của bạn đã hết hạn", html);
};

export const sendContractAboutToExpireMail = async (
  to: string,
  tenantName: string,
  roomNumber: string,
  housingName: string,
  endDate: Date,
): Promise<void> => {
  const html = `
    <div style="
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: auto;
      border: 1px solid #ddd;
      padding: 24px;
      border-radius: 8px;
      background-color: #f9f9f9;">
      <h2 style="color: #333;">⏰ Thông báo hợp đồng sắp hết hạn</h2>
      <p>Xin chào người thuê <strong>${tenantName}</strong>,</p>
      <p>
        Hợp đồng thuê phòng <strong>${roomNumber}</strong> 
        thuộc khu trọ <strong>${housingName}</strong> 
        của bạn sẽ hết hạn vào ngày <strong>${getDateString(endDate)}</strong>.
      </p>
      <p>Vui lòng kiểm tra lại thông tin hoặc thực hiện gia hạn nếu cần thiết.</p>
      <hr style="
        border: none;
        border-top: 1px solid #ccc;
        margin: 20px 0;" />
      <p style="font-size: 14px; color: #666;">
        Mọi thắc mắc, bạn có thể liên hệ lại với chủ trọ hoặc trung tâm hỗ trợ của Hola Rental.
      </p>
      <p style="margin-top: 24px;">
        Trân trọng,<br/><strong>Đội ngũ Hola Rental</strong>
      </p>
    </div>
  `;

  await sendEmail(to, "⏰ Hợp đồng sắp hết hạn", html);
};

export const sendContractAboutToExpireToLandlord = async (
  to: string,
  landlordName: string,
  roomNumber: string,
  housingName: string,
  endDate: Date,
): Promise<void> => {
  const html = `
    <div style="
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: auto;
      border: 1px solid #ddd;
      padding: 24px;
      border-radius: 8px;
      background-color: #f9f9f9;">
      <h2 style="color: #333;">⏰ Hợp đồng sắp hết hạn</h2>
      <p>Xin chào chủ trọ <strong>${landlordName}</strong>,</p>
      <p>
        cho phòng <strong>${roomNumber}</strong> tại khu trọ <strong>${housingName}</strong> 
        sẽ hết hạn vào ngày <strong>${getDateString(endDate)}</strong>.
      </p>
      <p>Vui lòng kiểm tra lại thông tin và chủ động liên hệ với người thuê nếu cần.</p>
      <hr style="
        border: none;
        border-top: 1px solid #ccc;
        margin: 20px 0;" />
      <p style="font-size: 14px; color: #666;">
        Đây là email tự động từ hệ thống Hola Rental. Bạn không cần phản hồi lại email này.
      </p>
      <p style="margin-top: 24px;">
        Trân trọng,<br/><strong>Đội ngũ Hola Rental</strong>
      </p>
    </div>
  `;

  await sendEmail(to, "⏰ Hợp đồng thuê sắp hết hạn", html);
};

export const sendContractResolvedMail = async (
  tenantEmail: string,
  landlordEmail: string,
  tenantName: string,
  landlordName: string,
  roomNumber: string,
  housingName: string,
  resolvedBy: string,
  decision: "disputer_wins" | "rejected",
  reason: string,
): Promise<void> => {
  const decisionText =
    decision === "disputer_wins"
      ? "✅ Người khiếu nại đã thắng"
      : "❌ Admin đã từ chối khiếu nại";

  const htmlContent = (recipientName: string) => `
    <div style="
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: auto;
      border: 1px solid #ddd;
      padding: 24px;
      border-radius: 8px;
      background-color: #fefefe;
    ">
      <h2 style="color: #2196f3; text-align: center;">
        📄 Hợp đồng đã được giải quyết
      </h2>
      <p>Xin chào <strong>${recipientName}</strong>,</p>
      <p>
        Tranh chấp hợp đồng thuê phòng <strong>${roomNumber}</strong> tại khu trọ
        <strong>${housingName}</strong> đã được quản trị viên xử lý.
      </p>
      <p><strong>Kết quả:</strong> ${decisionText}</p>
      <p><strong>Lý do:</strong> ${reason}</p>
      <p><strong>Giải quyết bởi:</strong> ${resolvedBy}</p>
      <p style="margin-top: 24px;">
        Trân trọng,<br/><strong>Đội ngũ Hola Rental</strong>
      </p>
    </div>
  `;

  await sendEmail(
    tenantEmail,
    "📄 Kết quả giải quyết tranh chấp hợp đồng",
    htmlContent(tenantName),
  );

  await sendEmail(
    landlordEmail,
    "📄 Kết quả giải quyết tranh chấp hợp đồng",
    htmlContent(landlordName),
  );
};
export const sendHousingAreaApprovedMail = async (
  to: string,
  ownerName: string,
  housingName: string,
): Promise<void> => {
  const html = `
    <div style="
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: auto;
      border: 1px solid #ddd;
      padding: 24px;
      border-radius: 8px;
      background-color: #fefefe;
    ">
      <h2 style="color: #2e7d32; text-align: center;">
        🎉 Khu trọ của bạn đã được phê duyệt!
      </h2>
      <p>Xin chào <strong>${ownerName}</strong>,</p>
      <p>
        Chúc mừng! Khu trọ <strong>${housingName}</strong> mà bạn đã đăng tải 
        đã được quản trị viên kiểm duyệt và chính thức hiển thị trên hệ thống Hola Rental.
      </p>
      <p>
        Người dùng hiện đã có thể tìm thấy khu trọ này khi tìm kiếm trên nền tảng.
      </p>
      <p style="margin-top: 24px;">
        Trân trọng,<br/><strong>Đội ngũ Hola Rental</strong>
      </p>
    </div>
  `;

  await sendEmail(to, "🎉 Khu trọ đã được phê duyệt", html);
};

export const sendHousingAreaRejectedMail = async (
  to: string,
  ownerName: string,
  housingName: string,
  reason: string,
): Promise<void> => {
  const html = `
    <div style="
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: auto;
      border: 1px solid #ddd;
      padding: 24px;
      border-radius: 8px;
      background-color: #fff3f3;
    ">
      <h2 style="color: #d32f2f; text-align: center;">
        ❌ Khu trọ bị từ chối đăng
      </h2>
      <p>Xin chào <strong>${ownerName}</strong>,</p>
      <p>
        Khu trọ <strong>${housingName}</strong> bạn đã đăng đã <strong>bị từ chối</strong> 
        bởi quản trị viên sau quá trình kiểm duyệt.
      </p>
      <p><strong>Lý do từ chối:</strong> ${reason}</p>
      <p>
        Vui lòng kiểm tra lại nội dung đăng, chỉnh sửa và gửi lại nếu cần.
      </p>
      <p style="margin-top: 24px;">
        Trân trọng,<br/><strong>Đội ngũ Hola Rental</strong>
      </p>
    </div>
  `;

  await sendEmail(to, "❌ Khu trọ đã bị từ chối", html);
};

export const sendHousingAreaUpdateApprovedMail = async (
  to: string,
  ownerName: string,
  housingName: string,
): Promise<void> => {
  const html = `
    <div style="
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: auto;
      border: 1px solid #ddd;
      padding: 24px;
      border-radius: 8px;
      background-color: #f4fefc;
    ">
      <h2 style="color: #2e7d32; text-align: center;">
        ✅ Cập nhật khu trọ đã được phê duyệt
      </h2>
      <p>Xin chào <strong>${ownerName}</strong>,</p>
      <p>
        Bản cập nhật thông tin cho khu trọ <strong>${housingName}</strong> của bạn
        đã được quản trị viên duyệt thành công.
      </p>
      <p>
        Những thay đổi mới đã được áp dụng và sẽ hiển thị trên hệ thống Hola Rental.
      </p>
      <p style="margin-top: 24px;">
        Trân trọng,<br/><strong>Đội ngũ Hola Rental</strong>
      </p>
    </div>
  `;

  await sendEmail(to, "✅ Cập nhật khu trọ đã được phê duyệt", html);
};

export const sendHousingAreaUpdateRejectedMail = async (
  to: string,
  ownerName: string,
  housingName: string,
  reason: string,
): Promise<void> => {
  const html = `
    <div style="
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: auto;
      border: 1px solid #ddd;
      padding: 24px;
      border-radius: 8px;
      background-color: #fff3f3;
    ">
      <h2 style="color: #d32f2f; text-align: center;">
        ❌ Cập nhật khu trọ bị từ chối
      </h2>
      <p>Xin chào <strong>${ownerName}</strong>,</p>
      <p>
        Bản cập nhật thông tin cho khu trọ <strong>${housingName}</strong> của bạn 
        đã <strong>bị từ chối</strong> bởi quản trị viên.
      </p>
      <p><strong>Lý do từ chối:</strong> ${reason}</p>
      <p>
        Vui lòng kiểm tra lại nội dung cập nhật và gửi lại nếu cần thiết.
      </p>
      <p style="margin-top: 24px;">
        Trân trọng,<br/><strong>Đội ngũ Hola Rental</strong>
      </p>
    </div>
  `;

  await sendEmail(to, "❌ Bản cập nhật khu trọ bị từ chối", html);
};


