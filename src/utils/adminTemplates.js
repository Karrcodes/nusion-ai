export const getAppReceivedEmail = (restaurantName) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; padding-bottom: 30px; border-bottom: 1px solid #eee; }
        .logo { font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #000; }
        .content { padding: 30px 0; }
        .status-badge { background: #e3f2fd; color: #1565c0; padding: 5px 12px; border-radius: 15px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
        .footer { text-align: center; color: #888; font-size: 12px; margin-top: 40px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">NUSION AI</div>
        </div>
        <div class="content">
            <p>Dear ${restaurantName},</p>
            
            <p>Thank you for applying to join the Nusion AI Culinary Network. We have successfully received your restaurant profile and menu data.</p>
            
            <p><strong>Application Status:</strong> <span class="status-badge">Under Review</span></p>
            
            <p>Our curation team is currently reviewing your inventory quality and menu semantic integrity to ensure it meets our platform's standards for generative gastronomy.</p>
            
            <p>We aim to complete all reviews within <strong>24 hours</strong>. You will receive a follow-up email once your dashboard is fully activated.</p>
            
            <p>In the meantime, you can log in to your dashboard to refine your profile details.</p>
            
            <p>Welcome to the future of dining.</p>
            
            <p>Sincerely,<br>The Nusion Team</p>
        </div>
        <div class="footer">
            &copy; ${new Date().getFullYear()} Studio Aikin Karr. All rights reserved.
        </div>
    </div>
</body>
</html>
    `;
};
