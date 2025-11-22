// backend/utils/fileUpload.js
const fs = require("fs").promises;
const path = require("path");

async function uploadToS3(file, folder) {
  // For development: save to local /uploads folder
  const uploadsDir = path.join(__dirname, "../uploads", folder);
  await fs.mkdir(uploadsDir, { recursive: true });

  const fileName = `${Date.now()}-${file.originalname}`;
  const filePath = path.join(uploadsDir, fileName);

  await fs.writeFile(filePath, file.buffer);

  // Return URL (serve from Express static)
  return `/uploads/${folder}/${fileName}`;
}

module.exports = { uploadToS3 };
