export default ({ env }) => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST', 'smtp.gmail.com'),
        port: env('SMTP_PORT', 587),
        auth: {
          user: env('SMTP_USERNAME'),
          pass: env('SMTP_PASSWORD'),
        },
        secure: false,
        requireTLS: true,
      },
      settings: {
        defaultFrom: env('SMTP_FROM_EMAIL'),
        defaultReplyTo: env('SMTP_FROM_EMAIL'),
      },
    },
  },
  
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '7d',
      },
    },
  },
});