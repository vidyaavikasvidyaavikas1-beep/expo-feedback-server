const express = require("express");
const fs = require("fs");
const path = require("path");
const { Document, Packer, Paragraph, TextRun } = require("docx");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // allows local HTML to talk to server
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

const feedbackJsonPath = path.join(__dirname, "feedbacks.json");
const feedbackDocxPath = path.join(__dirname, "feedbacks.docx");

// POST endpoint to save feedback
app.post("/save-feedback", async (req, res) => {
  console.log("Received feedback:", req.body); // debug line
  const { name, feedback, time } = req.body;

  if (!feedback) return res.status(400).json({ success: false, message: "Feedback is required" });

  try {
    // 1️⃣ Load existing feedbacks
    let allFeedbacks = [];
    if (fs.existsSync(feedbackJsonPath)) {
      const data = fs.readFileSync(feedbackJsonPath, "utf-8");
      allFeedbacks = JSON.parse(data);
    }

    // 2️⃣ Add new feedback
    allFeedbacks.push({ name: name || "Anonymous", feedback, time });

    // 3️⃣ Save JSON backup
    fs.writeFileSync(feedbackJsonPath, JSON.stringify(allFeedbacks, null, 2));

    // 4️⃣ Generate Word file
    const paragraphs = [];
    allFeedbacks.forEach(fb => {
      paragraphs.push(new Paragraph({ children: [new TextRun({ text: `Name: ${fb.name}`, bold: true })] }));
      paragraphs.push(new Paragraph(`Feedback: ${fb.feedback}`));
      paragraphs.push(new Paragraph(`Time: ${fb.time}`));
      paragraphs.push(new Paragraph("---------------------------------------------------"));
    });

    const doc = new Document({ sections: [{ children: paragraphs }] });
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(feedbackDocxPath, buffer);

    res.json({ success: true });
    console.log(`💾 Feedback saved from ${name || "Anonymous"}`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
