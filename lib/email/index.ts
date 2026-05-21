import { Resend } from 'resend';
import { devisEmailHtml } from './email_template';

console.log(process.env.NEXT_RESEND_API_KEY!)

const resend = new Resend("re_ZaPQ1Lww_9qHLdzzqb1UyWdCudvVsvT2p");

export const sendDevisEmail = async (email:string) =>{
    const emailSent = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Retour demande de devis',
      html: devisEmailHtml
    });

    return emailSent
}
