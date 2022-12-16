import * as sgMail from '@sendgrid/mail';
export async function sendEmail(msg: any) {
  msg.from = { email: process.env.SENDGRID_FROM, name: 'NestRest' }; // Use the email address or domain you verified above
  sgMail.setApiKey(process.env.SENDGRID_API as string);
  //   msg = msg || {
  //     to: 'someoneelse@gmail.com',
  //     from: 'someone@gmail.com', // Use the email address or domain you verified above
  //     subject: 'Sending with Twilio SendGrid is Fun',
  //     text: 'and easy to do anywhere, even with Node.js',
  //     html: '<strong>and easy to do anywhere, even with Node.js</strong>',
  //   };

  return sgMail.send(msg);
}
