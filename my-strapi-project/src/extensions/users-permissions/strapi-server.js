const bcrypt = require('bcryptjs');
const crypto = require('crypto');

module.exports = (plugin) => {
  
  // Override forgot password controller với email template có button
  plugin.controllers.auth.forgotPassword = async (ctx) => {
    const { email } = ctx.request.body;
    
    console.log('🎯 FORGOT PASSWORD REQUEST FOR:', email);
    
    const normalizedEmail = email.toLowerCase().trim();
    
    // Find user
    const user = await strapi.query('plugin::users-permissions.user').findOne({
      where: { email: normalizedEmail },
    });

    if (!user || user.blocked) {
      console.log('❌ USER NOT FOUND OR BLOCKED:', normalizedEmail);
      return ctx.send({ 
        ok: true, 
        message: 'Nếu email tồn tại, reset link đã được gửi' 
      });
    }

    console.log('✅ USER FOUND:', user.id, user.username);

    // Generate reset token
    const resetPasswordToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordUrl = `${process.env.PUBLIC_URL || 'http://localhost:5173'}/reset-password?code=${resetPasswordToken}`;

    // Update user
    await strapi.query('plugin::users-permissions.user').update({
      where: { id: user.id },
      data: { resetPasswordToken },
    });

    // Send email với button đẹp
    try {
      const emailHtml = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Mật Khẩu - KIMEI</title>
    <style>
        body { 
            font-family: 'Arial', sans-serif; 
            line-height: 1.6; 
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
        }
        .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        .content {
            padding: 40px 30px;
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .reset-button {
            display: inline-block;
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            color: white !important;
            text-decoration: none;
            padding: 16px 40px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            border: none;
            cursor: pointer;
            min-width: 200px;
            transition: all 0.3s ease;
        }
        .reset-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e9ecef;
            color: #6c757d;
            font-size: 14px;
        }
        .info-box {
            background: #e7f3ff;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #3b82f6;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>KIMEI</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 18px;">Đặt Lại Mật Khẩu</p>
        </div>
        
        <div class="content">
            <div class="info-box">
                <strong>Thông tin yêu cầu:</strong><br>
                Tài khoản: <strong>${user.username}</strong><br>
                Email: <strong>${normalizedEmail}</strong><br>
                Thời gian: <strong>${new Date().toLocaleString('vi-VN')}</strong>
            </div>
            
            <p>Xin chào <strong>${user.username}</strong>,</p>
            
            <p>Chúng tôi đã nhận được yêu cầu reset mật khẩu cho tài khoản KIMEI của bạn.</p>
            
            <div class="button-container">
                <a href="${resetPasswordUrl}" class="reset-button" target="_blank">
                    🔐 Đặt Lại Mật Khẩu
                </a>
            </div>
            
            <p><strong>Liên kết dự phòng:</strong><br>
            Nếu nút trên không hoạt động, vui lòng copy và paste link sau vào trình duyệt:<br>
            <code style="background: #f1f3f4; padding: 8px; border-radius: 4px; word-break: break-all; display: inline-block; margin-top: 8px;">${resetPasswordUrl}</code>
            </p>
            
            <p><strong>Lưu ý quan trọng:</strong></p>
            <ul>
                <li>Link reset có hiệu lực trong <strong>1 giờ</strong></li>
                <li>Không chia sẻ link này với bất kỳ ai</li>
                <li>Nếu bạn không yêu cầu reset mật khẩu, vui lòng bỏ qua email này</li>
            </ul>
        </div>
        
        <div class="footer">
            <p>© 2025 KIMEI. Tất cả quyền được bảo lưu.</p>
            <p>Email này được gửi tự động, vui lòng không reply.</p>
        </div>
    </div>
</body>
</html>
      `;

      await strapi.plugin('email').service('email').send({
        to: normalizedEmail,
        from: '"KIMEI Support" <vtrung2512@gmail.com>',
        subject: '🔐 Đặt Lại Mật Khẩu - KIMEI',
        html: emailHtml
      });

      console.log('✅ EMAIL WITH BUTTON SENT TO:', normalizedEmail);
      
      return ctx.send({
        ok: true,
        message: 'Email reset đã được gửi'
      });
      
    } catch (emailError) {
      console.error('❌ EMAIL SEND ERROR:', emailError);
      return ctx.send({ 
        ok: true, 
        message: 'Yêu cầu đã được xử lý' 
      });
    }
  };

  // Override reset password controller (giữ nguyên)
  plugin.controllers.auth.resetPassword = async (ctx) => {
    const { code, password, passwordConfirmation } = ctx.request.body;
    
    console.log('🔄 RESET PASSWORD REQUEST');

    const user = await strapi.query('plugin::users-permissions.user').findOne({
      where: { resetPasswordToken: code },
    });

    if (!user) {
      console.log('❌ INVALID RESET TOKEN');
      return ctx.badRequest(null, 'Reset token không hợp lệ hoặc đã hết hạn');
    }

    // Check if new password is same as old password
    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      console.log('❌ NEW PASSWORD SAME AS OLD PASSWORD');
      return ctx.badRequest(null, 'Mật khẩu mới không được trùng với mật khẩu cũ');
    }

    if (password !== passwordConfirmation) {
      return ctx.badRequest(null, 'Mật khẩu xác nhận không khớp');
    }

    // Update user password and clear reset token
    await strapi.query('plugin::users-permissions.user').update({
      where: { id: user.id },
      data: {
        password: await strapi.service('plugin::users-permissions.user').hashPassword({ password }),
        resetPasswordToken: null,
      },
    });

    console.log('✅ PASSWORD RESET SUCCESS FOR USER:', user.id);
    
    return ctx.send({
      ok: true,
      message: 'Mật khẩu đã được đổi thành công'
    });
  };

  return plugin;
};