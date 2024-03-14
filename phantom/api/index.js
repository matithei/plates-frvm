const express = require("express");
const app = express();
const cors = require("cors");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

async function freeStrategy(imagePath) {
  const regions = ["us", "au", "eu", "auwide", "kr", "sg", "mx", "br"];
  for (let i = 0; i < regions.length; i++) {
    const region = regions[i];
    const response = await executeRec(region, imagePath);
    if (response.length > 0) {
      return response
    }
  }
  return [];
}

app.use(cors());

// Ruta para subir la foto
app.get("/plate-reader", async (req, res) => {
  if (!req.query.file) {
    return res.status(400).send("No se ha subido ninguna foto.");
  }
  let plates;
  try {
    plates = await freeStrategy(req.query.file);
    return res.status(200).send(plates)
  } catch (error) {
    console.log(error)
    return res.status(500).send(error.message)
  }
});

const executeRec = async (region, imagePath) => {
  console.log(`alpr -c ${region} ./${imagePath}`);
  const { stdout, stderr } = await exec(`alpr -c ${region} ./${imagePath}`);
  if (stderr) {
    return [];
  }
  const results = JSON.parse(stdout);
  return results
    ? results.results.filter((result) =>
        /^[A-Z]{2}\d{3}[A-Z]{2}$/.test(result.plate)
      )
    : [];
};

// Iniciar el servidor en el puerto 3000
const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`Servidor Express escuchando en el puerto ${PORT}`);
});
