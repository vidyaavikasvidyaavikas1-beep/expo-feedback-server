import express from "express";
import cors from "cors";   // <-- ADD THIS LINE
import fs from "fs";
import { Document, Packer, Paragraph, TextRun } from "docx";

const app = express();
app.use(cors());  // <-- ADD THIS LINE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import express from "express";
import fs from "fs";
import { Document, Packer, Paragraph, TextRun } from "docx";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const feedbackFile = "feedbacks.docx";
const backupFile = "feedbacks.json";

// ✅ Load existing feedbacks
let feedbacks = [];
if (fs.existsSync(backupFile)) {
  const data = fs.readFileSync(backupFile, "utf-8");
  feedbacks = JSON.parse(data || "[]");
}

// ✅ Save both JSON + DOCX
function saveFeedbacksToFiles() {
  fs.writeFileSync(backupFile, JSON.stringify(feedbacks, null, 2));

  const doc = new Document({
    sections: [
      {
        children: feedbacks.map(
          (f, i) =>
            new Paragraph({
              children: [
                new TextRun({
                  text: `Feedback ${i + 1}: ${f.name} - ${f.feedback}`,
                  bold: true,
                }),
              ],
            })
        ),
      },
    ],
  });

  const buffer = Packer.toBuffer(doc);
  buffer.then((data) => {
    fs.writeFileSync(feedbackFile, data);
  });
}

// ✅ POST endpoint to receive feedback
app.post("/save-feedback", (req, res) => {
  const { name, feedback } = req.body;

  if (!name || !feedback) {
    return res.status(400).json({ message: "Missing name or feedback" });
  }

  feedbacks.push({ name, feedback });
  saveFeedbacksToFiles();
  res.status(200).json({ message: "Feedback saved successfully!" });
});

// ✅ Root route (optional)
app.get("/", (req, res) => {
  res.send("✅ Feedback server is running successfully!");
});

// ✅ Render uses PORT from environment variables
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
