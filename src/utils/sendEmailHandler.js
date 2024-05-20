import sgMail  from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

import { VERIFIED_SENDGRID_EMAIL } from '../constants.js';

const sendEmail = async (userEmail, subject, text, html) => {

    try {
        const msg = {
            to: userEmail,
            from: VERIFIED_SENDGRID_EMAIL,
            subject,
            text,
            html
          };

        const userEmailRes = await sgMail.send(msg);
        if(userEmailRes) return "Email succesfully sent to user " + userEmail;

    } catch (err) {
        console.error("Error while sending an email to user "+err);
        return null;
    }
};

export { sendEmail };
