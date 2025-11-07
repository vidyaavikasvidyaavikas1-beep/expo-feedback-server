const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { Document, Packer, Paragraph, TextRun } = require("docx");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Path to the .docx file
const filePath = path.join(__dirname, "feedbacks.docx");

// Root route
app.get("/", (req, res) => {
  res.send("✅ Feedback server is running successfully!");
});

// POST route to save feedback
app.post("/save-feedback", async (req, res) => {
  try {
    const feedback = req.body.feedback;
    const name = req.body.name || "Anonymous";
    const date = new Date().toLocaleString();

    console.log("📝 New feedback received:", { name, feedback, date });

    // If the file exists, we’ll append to it
    let paragraphs = [];

    if (fs.existsSync(filePath)) {
      const existingContent = fs.readFileSync(filePath);
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "----------------------------------------",
              bold: true,
            }),
          ],
        })
      );
    }

    // Add the new feedback
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: `Name: ${name}`, bold: true }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `Feedback: ${feedback}` }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `Date: ${date}` }),
        ],
      }),
      new Paragraph("")
    );

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(filePath, buffer);

    console.log("✅ Feedback saved successfully!");
    res.status(200).send("Feedback saved successfully!");
  } catch (error) {
    console.error("❌ Error saving feedback:", error);
    res.status(500).send("Error saving feedback");
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
