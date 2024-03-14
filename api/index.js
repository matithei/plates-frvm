const express = require("express");
const multer = require("multer");
const path = require("path");
const app = express();
const upload = multer({ dest: "uploads/" });
const fs = require("fs");
const cors = require("cors");
const FormData = require("form-data");
const axios = require("axios");

async function freeStrategy(imagePath) {
  const url = `http://phantom/plate-reader?file=${imagePath}`;
  return (await axios.get(url)).data;
}

async function paidStrategy(imagePath) {
  const key = "5361be295fea717e5f25a72b26fc80dcdc460042";
  const url = "https://api.platerecognizer.com/v1/plate-reader/";
  const formData = new FormData();
  formData.append("upload", fs.createReadStream(imagePath));
  const config = {
    headers: {
      "content-type": "multipart/form-data",
      Authorization: `Token ${key}`,
    },
  };
  return (await axios.post(url, formData, config)).data;
}

app.use(cors());

// Ruta para subir la foto
app.post("/upload", upload.single("photo"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No se ha subido ninguna foto.");
  }
  const imageExt = path.extname(req.file.originalname);
  const imageName = req.file.filename + imageExt;
  const imagePath = path.join("uploads/", imageName);
  fs.renameSync(req.file.path, imagePath);
  let plates;
  try {
    plates = await freeStrategy(imagePath);
  } catch (error) {
    console.error(`Error al procesar la foto con ALPR: ${error}`);
    plates = [];
  }
  if (plates.length > 0) {
    return res.status(200).send({ strategy: "free", plates ,result:plates[0]?.plate});
  }
  plates = await paidStrategy(imagePath);
  const result = plates.results.find(
    (i) =>
      /^[A-Z]{2}\d{3}[A-Z]{2}$/.test(i.plate.toUpperCase()) ||
      /^[A-Z]{3}\d{3}$/.test(i.plate.toUpperCase())
  )?.plate.toUpperCase();
  return res.status(200).send({ strategy: "paid", plates, result });
});

// Iniciar el servidor en el puerto 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor Express escuchando en el puerto ${PORT}`);
});
