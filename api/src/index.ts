import express, { Request, Response } from "express";
import multer from "multer";
import { extname, join } from "path";
import { createReadStream, renameSync } from "fs";
import cors from "cors";
import FormData from "form-data";
import axios from "axios";
import {  initializeDB } from './db';
import { apiKeyService } from "./apikeys.service";
import { initCronJob } from "./apikeys.cron";

const app = express();
const upload = multer({ dest: "uploads/" });

async function freeStrategy(imagePath: string) {
  const url = `http://phantom/plate-reader?file=${imagePath}`;
  return (await axios.get(url)).data;
}

async function paidStrategy(imagePath: string) {
  const apiKey = await apiKeyService.getRandomApi()
  console.log(apiKey)
  const url = "https://api.platerecognizer.com/v1/plate-reader/";
  const formData = new FormData();
  formData.append("upload", createReadStream(imagePath));
  const config = {
    headers: {
      "content-type": "multipart/form-data",
      Authorization: `Token ${apiKey.authKey}`,
    },
  };
  await apiKeyService.incrementCounter(apiKey);
  console.log(`EmailKeyUsed:${apiKey.email}`)
  return (await axios.post(url, formData, config)).data;
}

app.use(cors());

// Ruta para subir la foto
app.post(
  "/upload",
  upload.single("photo"),
  async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).send("No se ha subido ninguna foto.");
    }
    const imageExt = extname(req.file.originalname);
    const imageName = req.file.filename + imageExt;
    const imagePath = join("uploads/", imageName);
    renameSync(req.file.path, imagePath);
    let plates;
    try {
      plates = await freeStrategy(imagePath);
    } catch (error) {
      console.error(`Error al procesar la foto con ALPR: ${error}`);
      plates = [];
    }
    if (plates.length > 0) {
      return res
        .status(200)
        .send({ strategy: "free", plates, result: plates[0]?.plate });
    }
    plates = await paidStrategy(imagePath);
    const result = plates.results
      .find(
        (i: any) =>
          /^[A-Z]{2}\d{3}[A-Z]{2}$/.test(i.plate.toUpperCase()) ||
          /^[A-Z]{3}\d{3}$/.test(i.plate.toUpperCase())
      )
      ?.plate.toUpperCase();
    return res.status(200).send({ strategy: "paid", plates, result });
  }
);

// Iniciar el servidor en el puerto 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Servidor Express escuchando en el puerto ${PORT}`);
  await initializeDB()
  initCronJob()
});
