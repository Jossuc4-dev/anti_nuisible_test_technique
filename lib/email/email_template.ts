export const devisEmailHtml = (id_devis:string)=>`
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Demande de devis reçue</title>
</head>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4f0;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#1a1a1a;border-radius:16px 16px 0 0;padding:36px 48px;text-align:center;">
              <p style="margin:0 0 8px 0;color:#f59e0b;font-size:11px;font-family:Arial,sans-serif;letter-spacing:3px;text-transform:uppercase;font-weight:700;">
                ProDératisation Paris
              </p>
              <p style="margin:0;font-size:28px;">🛡️</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:48px;border-left:1px solid #e5e5e5;border-right:1px solid #e5e5e5;">

              <!-- Success badge -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px auto;">
                <tr>
                  <td style="background:#fef3c7;border:1.5px solid #f59e0b;border-radius:100px;padding:8px 20px;text-align:center;">
                    <span style="color:#b45309;font-size:13px;font-family:Arial,sans-serif;font-weight:700;letter-spacing:1px;">
                      ✓ &nbsp;Demande reçue avec succès
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Identifiant de la demande -->
              <p style="margin:0 0 16px 0;font-size:13px;color:#9ca3af;font-family:Arial,sans-serif;text-align:center;">
                Votre identifiant de demande : <strong style="color:#1a1a1a;">${id_devis}</strong>
              </p>

              <h1 style="margin:0 0 16px 0;font-size:26px;color:#1a1a1a;font-family:Georgia,serif;font-weight:700;line-height:1.3;text-align:center;">
                Merci pour votre demande de devis
              </h1>
              <p style="margin:0 0 32px 0;font-size:15px;color:#6b6b6b;line-height:1.7;text-align:center;font-family:Arial,sans-serif;">
                Votre demande a bien été enregistrée.<br/>
                Notre équipe vous contactera <strong style="color:#1a1a1a;">sous 24h</strong> pour vous proposer une solution adaptée.
              </p>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #f0f0f0;margin:0 0 32px 0;"/>

              <!-- What's next -->
              <p style="margin:0 0 20px 0;font-size:11px;color:#9ca3af;font-family:Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;font-weight:700;">
                Prochaines étapes
              </p>

              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding:0 0 16px 0;">
                    <table cellpadding="0" cellspacing="0" width="100%" style="background:#fafafa;border:1px solid #f0f0f0;border-radius:10px;padding:16px 20px;">
                      <tr>
                        <td width="36" valign="top">
                          <span style="display:inline-block;width:28px;height:28px;background:#f59e0b;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;color:#1a1a1a;font-family:Arial,sans-serif;">1</span>
                        </td>
                        <td style="padding-left:12px;">
                          <p style="margin:0;font-size:14px;font-weight:700;color:#1a1a1a;font-family:Arial,sans-serif;">Analyse de votre demande</p>
                          <p style="margin:4px 0 0 0;font-size:13px;color:#6b6b6b;font-family:Arial,sans-serif;">Nos experts étudient votre situation et les nuisibles concernés.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 16px 0;">
                    <table cellpadding="0" cellspacing="0" width="100%" style="background:#fafafa;border:1px solid #f0f0f0;border-radius:10px;padding:16px 20px;">
                      <tr>
                        <td width="36" valign="top">
                          <span style="display:inline-block;width:28px;height:28px;background:#f59e0b;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;color:#1a1a1a;font-family:Arial,sans-serif;">2</span>
                        </td>
                        <td style="padding-left:12px;">
                          <p style="margin:0;font-size:14px;font-weight:700;color:#1a1a1a;font-family:Arial,sans-serif;">Prise de contact sous 24h</p>
                          <p style="margin:4px 0 0 0;font-size:13px;color:#6b6b6b;font-family:Arial,sans-serif;">Un conseiller vous rappelle pour préciser votre besoin.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table cellpadding="0" cellspacing="0" width="100%" style="background:#fafafa;border:1px solid #f0f0f0;border-radius:10px;padding:16px 20px;">
                      <tr>
                        <td width="36" valign="top">
                          <span style="display:inline-block;width:28px;height:28px;background:#f59e0b;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;color:#1a1a1a;font-family:Arial,sans-serif;">3</span>
                        </td>
                        <td style="padding-left:12px;">
                          <p style="margin:0;font-size:14px;font-weight:700;color:#1a1a1a;font-family:Arial,sans-serif;">Intervention rapide</p>
                          <p style="margin:4px 0 0 0;font-size:13px;color:#6b6b6b;font-family:Arial,sans-serif;">Nos techniciens interviennent selon le protocole adapté.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #f0f0f0;margin:32px 0;"/>

              <!-- Contact -->
              <p style="margin:0;font-size:14px;color:#6b6b6b;font-family:Arial,sans-serif;text-align:center;line-height:1.7;">
                Une question urgente ?<br/>
                <a href="tel:+33100000000" style="color:#f59e0b;font-weight:700;text-decoration:none;">📞 01 00 00 00 00</a>
                &nbsp;—&nbsp;disponible 7j/7
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f5f4f0;border:1px solid #e5e5e5;border-top:none;border-radius:0 0 16px 16px;padding:24px 48px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;font-family:Arial,sans-serif;line-height:1.6;">
                © 2024 ProDératisation Paris — Tous droits réservés<br/>
                Vous recevez cet e-mail car vous avez soumis une demande de devis sur notre site.
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