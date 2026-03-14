const otpTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f6f9f6; color: #333;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td align="center" style="background-color: #00ad5c; padding: 30px 0;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Ghoroa-bazar</h1>
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #1a1a1a; margin-top: 0; font-size: 24px; text-align: center;">Verify Your Email Address</h2>
                            <p style="font-size: 16px; line-height: 1.6; color: #555; text-align: center; margin-bottom: 30px;">
                                Thank you for choosing Ghoroa-bazar! To complete your registration and secure your account, please use the following one-time password (OTP).
                            </p>
                            
                            <!-- OTP Box -->
                            <div style="text-align: center; margin: 40px 0;">
                                <div style="display: inline-block; background-color: #f0faf4; border: 2px dashed #00ad5c; border-radius: 10px; padding: 20px 40px;">
                                    <span style="font-size: 48px; font-weight: 800; letter-spacing: 12px; color: #00ad5c; font-family: 'Courier New', Courier, monospace;">{{OTP}}</span>
                                </div>
                            </div>
                            
                            <p style="font-size: 14px; text-align: center; color: #888; margin-bottom: 5px;">
                                This OTP is valid for <strong>10 minutes</strong>.
                            </p>
                            <p style="font-size: 14px; text-align: center; color: #e74c3c; font-weight: 500;">
                                For security reasons, do not share this code with anyone.
                            </p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px; background-color: #fafafa; border-top: 1px solid #eeeeee; text-align: center;">
                            <p style="font-size: 12px; color: #999; margin: 0;">
                                If you didn't request this email, you can safely ignore it.
                            </p>
                            <p style="font-size: 12px; color: #999; margin: 10px 0 0 0;">
                                &copy; 2024 Ghoroa-bazar. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

module.exports = { otpTemplate };
