import { Resend } from 'resend';
import { devisEmailHtml } from './email_template';

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY!);

export const sendDevisEmail = async (email:string, id_devis:string) =>{
    const emailSent = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Retour demande de devis',
      html: devisEmailHtml(id_devis),
    });

    return emailSent
}
