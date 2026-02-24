const Contact = require("../../models/ContactForm/contactModel");
const { sendMail } = require("../../middleware/sendMail");

const officialEmail = process.env.EMAIL || "kikstart2026@gmail.com";

const emailTemplate = (title, content) => {
  return `
  <div style="font-family: Arial; background:#f4f6f9; padding:30px;">
    <div style="max-width:600px; margin:auto; background:white; padding:30px; border-radius:12px;">
      <h2 style="color:#4f46e5;">${title}</h2>
      ${content}
      <hr style="margin:30px 0"/>
      <p style="font-size:14px; color:gray;">
        Made with 💙 by Team KikStart
      </p>
    </div>
  </div>
  `;
};

exports.createContact = async (req, res) => {
  try {
    const { name, email, subject, details } = req.body;

    // ===== Validation =====
    if (!name || !email || !subject || !details) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // ===== Save to DB =====
    const newContact = await Contact.create({
      name,
      email,
      subject,
      details,
    });

    // ===== Send Mail to Official Email =====
    await sendMail(
      officialEmail,
      `📩 New Contact Message: ${subject}`,
      emailTemplate(
        "New Contact Enquiry Received 🚀",
        `
        <p>Hello Team,</p>
        <p>You have received a new contact message from your website.</p>

        <div style="background:#f9fafb; padding:20px; border-radius:10px; margin-top:15px;">
          <p><strong>👤 Name:</strong> ${name}</p>
          <p><strong>📧 Email:</strong> ${email}</p>
          <p><strong>📝 Subject:</strong> ${subject}</p>
          <p><strong>💬 Message:</strong></p>
          <p style="background:#ffffff; padding:10px; border-radius:6px;">
            ${details}
          </p>
        </div>
        `
      )
    );

    // ===== Auto Reply to User =====
    await sendMail(
      email,
      "✨ We Received Your Message | KikStart",
      emailTemplate(
        "Thank You for Contacting Us 💙",
        `
        <p>Hi <b>${name}</b>,</p>
        <p>We have successfully received your message regarding:</p>
        <p><strong>${subject}</strong></p>
        <p>Our team will get back to you shortly.</p>
        <p>Thank you for connecting with KikStart 🚀</p>
        `
      )
    );

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newContact,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};