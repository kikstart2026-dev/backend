const enq = require("../../models/EnquiryForm/enquiryModel");
const {sendMail} = require("../../middleware/sendMail");
const email = process.env.EMAIL || "kikstart2026@gmail.com";

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

exports.createEnq = async (req, res) => {
  try {
    const { school, contactPerson, schoolEmail, schoolPhone } = req.body;

    // ===== Basic Validation =====
    if (!school || !contactPerson || !schoolEmail || !schoolPhone) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // ===== Check Duplicate Email or Phone =====
    const existing = await enq.findOne({
      $or: [{ schoolEmail }, { schoolPhone }],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "School email or phone already exists",
      });
    }

    // ===== Save to Database =====
    const newEnquiry = await enq.create({
      school,
      contactPerson,
      schoolEmail,
      schoolPhone,
    });

    // ===== Structured Email Content =====
    await sendMail(
      email,
      "📩 New School Enquiry | KikStart",
      emailTemplate(
        "New School Enquiry Received 🎉",
        `
        <p>Hello Team,</p>
        <p>You have received a new school enquiry. Here are the details:</p>

        <div style="background:#f9fafb; padding:20px; border-radius:10px; margin-top:15px;">
          <p><strong>🏫 School Name:</strong> ${school}</p>
          <p><strong>👤 Contact Person:</strong> ${contactPerson}</p>
          <p><strong>📧 School Email:</strong> ${schoolEmail}</p>
          <p><strong>📞 School Phone:</strong> ${schoolPhone}</p>
        </div>

        <p style="margin-top:20px;">Please follow up accordingly.</p>
        `
      )
    );

    return res.status(201).json({
      success: true,
      message: "Enquiry submitted successfully",
      data: newEnquiry,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};