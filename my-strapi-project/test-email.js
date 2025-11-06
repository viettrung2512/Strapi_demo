const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'vtrung2512@gmail.com',
    pass: 'iejbbombnrpxnrau', 
  },
  requireTLS: true,
});

async function testEmail() {
  try {
    console.log('🔧 Testing SMTP connection...');
    
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP Server is ready');
    
    // Send test email
    const info = await transporter.sendMail({
      from: '"KIMEI" <vtrung2512@gmail.com>',
      to: 'vtrung2512@gmail.com', // Gửi cho chính bạn
      subject: 'Test SMTP Configuration - KIMEI',
      text: 'This is a test email from Strapi SMTP configuration.',
      html: '<h1>Test Email</h1><p>This is a test email from Strapi.</p>',
    });
    
    console.log('✅ Test email sent:', info.messageId);
    console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    
  } catch (error) {
    console.error('❌ SMTP Error:', error);
  }
}

testEmail();