import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});
// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
export async function sendRegistrationEmail(userEmail, name) {
  const subject = "Welcome to GenAI Resume Analyzer & Interview Prep System";

  const text = `Hello ${name},

Thank you for registering at GenAI Resume Analyzer & Interview Prep System.

We are excited to have you on board! With our AI-powered platform, you can upload your resume, add your self description and job description, and get a complete career preparation report.

You can generate:
- ATS-friendly resume report
- Resume vs job match score
- Technical interview questions with answers
- Behavioral interview questions with answers
- Skill gap analysis
- Personalized preparation plan

Start your interview preparation journey today.

Best regards,
The GenAI Resume Analyzer Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2>Welcome to GenAI Resume Analyzer & Interview Prep System</h2>

      <p>Hello ${name},</p>

      <p>
        Thank you for registering at <strong>GenAI Resume Analyzer & Interview Prep System</strong>.
        We are excited to have you on board!
      </p>

      <p>
        With our AI-powered platform, you can upload your resume, add your self description
        and job description, and get a complete career preparation report.
      </p>

      <p><strong>You can generate:</strong></p>

      <ul>
        <li>ATS-friendly resume report</li>
        <li>Resume vs job match score</li>
        <li>Technical interview questions with answers</li>
        <li>Behavioral interview questions with answers</li>
        <li>Skill gap analysis</li>
        <li>Personalized preparation plan</li>
      </ul>

      <p>Start your interview preparation journey today.</p>

      <p>
        Best regards,<br />
        <strong>The GenAI Resume Analyzer Team</strong>
      </p>
    </div>
  `;

  await sendEmail(userEmail, subject, text, html);
}