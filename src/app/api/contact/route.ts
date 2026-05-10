import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, contactInfo, orderId, type, message } = body;

    if (!name || !contactInfo || !message) {
      return NextResponse.json(
        { error: "ข้อมูลไม่ครบถ้วน กรุณากรอกข้อมูลที่จำเป็น" },
        { status: 400 }
      );
    }

    let typeText = "ทั่วไป";
    if (type === "food") typeText = "ปัญหาเกี่ยวกับอาหาร";
    else if (type === "service") typeText = "ปัญหาการบริการ";
    else if (type === "suggestion") typeText = "ข้อเสนอแนะ";

    // Send email using Resend
    const data = await resend.emails.send({
      from: "Krua Baan Gem <onboarding@resend.dev>", // Can be changed if domain is verified
      to: ["patham.sins@proton.me"],
      subject: `[${typeText}] การติดต่อใหม่จากคุณ ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;600&display=swap');
              body { font-family: 'Prompt', sans-serif; line-height: 1.6; color: #334155; margin: 0; padding: 0; background-color: #f8fafc; }
              .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 24px; overflow: hidden; shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
              .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px 20px; text-align: center; color: white; }
              .header h1 { margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.025em; }
              .header p { margin: 8px 0 0; opacity: 0.9; font-weight: 300; }
              .content { padding: 40px; }
              .badge { display: inline-block; padding: 6px 12px; border-radius: 99px; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 24px; }
              .badge-red { background-color: #fee2e2; color: #dc2626; }
              .section-title { font-size: 14px; font-weight: 600; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; margin-bottom: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
              .info-grid { display: grid; gap: 16px; margin-bottom: 32px; }
              .info-item { margin-bottom: 12px; }
              .info-label { font-size: 13px; color: #64748b; margin-bottom: 4px; }
              .info-value { font-size: 16px; font-weight: 400; color: #1e293b; }
              .message-box { background-color: #f8fafc; border-radius: 16px; padding: 24px; border: 1px solid #e2e8f0; color: #334155; font-size: 15px; white-space: pre-wrap; line-height: 1.8; }
              .footer { padding: 30px; text-align: center; background-color: #f8fafc; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>มีการติดต่อใหม่</h1>
                <p>ครัวบ้านเจ็ม (Krua Baan Gem)</p>
              </div>
              
              <div class="content">
                <div class="badge badge-red">${typeText}</div>
                
                <div class="section-title">ข้อมูลผู้ติดต่อ</div>
                <div class="info-grid">
                  <div class="info-item">
                    <div class="info-label">ชื่อลูกค้า</div>
                    <div class="info-value">คุณ ${name}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">ช่องทางติดต่อ</div>
                    <div class="info-value">${contactInfo}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">หมายเลขคำสั่งซื้อ</div>
                    <div class="info-value">${orderId || '<span style="color: #cbd5e1;">ไม่ระบุ</span>'}</div>
                  </div>
                </div>

                <div class="section-title" style="margin-top: 32px;">รายละเอียดข้อความ</div>
                <div class="message-box">${message}</div>
              </div>
              
              <div class="footer">
                อีเมลฉบับนี้ส่งโดยอัตโนมัติจากระบบหลังบ้าน ครัวบ้านเจ็ม<br>
                &copy; 2024 Krua Baan Gem. All rights reserved.
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (data.error) {
      console.error("Resend error:", data.error);
      return NextResponse.json(
        { error: "ไม่สามารถส่งอีเมลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data.data?.id });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดภายในระบบ" },
      { status: 500 }
    );
  }
}
