import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER, 
        pass: process.env.SMTP_PASS?.replace(/\s/g, '')
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email Transporter Error:', error);
    } else {
        console.log('✅ Email Transporter is ready to send emails');
    }
});

export const sendVerificationEmail = async (toEmail: string, verificationToken: string) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4000';
    const verifyLink = `${frontendUrl}/auth/verify-email?token=${verificationToken}`;

    const mailOptions = {
        from: `"Chat App Support" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`, 
        to: toEmail,
        subject: '🚀 Welcome! Verify your email to start chatting',
        html: `
            <div style="background-color: #f4f7f9; padding: 50px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <div style="max-width: 550px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e1e8ed;">
                    <!-- Header with Branding -->
                    <div style="background: linear-gradient(135deg, #038edc 0%, #026ca7 100%); padding: 40px 20px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 32px; letter-spacing: -0.5px; font-weight: 800;">Chat App</h1>
                        <p style="color: rgba(255,255,255,0.8); margin-top: 10px; font-size: 16px;">Connecting people instantly</p>
                    </div>

                    <!-- Main Content -->
                    <div style="padding: 40px; color: #2c3e50; line-height: 1.6;">
                        <h2 style="margin: 0 0 20px; font-size: 22px; font-weight: 700; color: #1a2a3a;">One more step...</h2>
                        <p style="font-size: 16px; margin-bottom: 25px;">
                            Thanks for joining Chat App! To ensure the security of your new account and get you started with your first conversation, please confirm your email address below.
                        </p>
                        
                        <!-- Verfication Button -->
                        <div style="text-align: center; margin: 35px 0;">
                            <a href="${verifyLink}" style="background-color: #038edc; color: #ffffff; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 4px 14px rgba(3, 142, 220, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
                                Verify Email Address
                            </a>
                        </div>

                        <p style="font-size: 14px; color: #7f8c8d; background-color: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #038edc;">
                            <strong>Note:</strong> If you didn't sign up for an account, please disregard this email. The link will remain active for 24 hours.
                        </p>
                    </div>

                    <!-- Footer -->
                    <div style="background-color: #fafbfc; padding: 25px; text-align: center; border-top: 1px solid #eee;">
                        <p style="margin: 0; color: #bdc3c7; font-size: 13px;">
                            © 2026 Chat App Inc. <br/>
                            123 Connectivity Way, Tech City
                        </p>
                    </div>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${toEmail}`);
    } catch (error) {
        console.error(`Error sending email to ${toEmail}:`, error);
        throw new Error('Failed to send verification email');
    }
};
