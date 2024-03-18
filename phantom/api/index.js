const express = require("express");
const app = express();
const cors = require("cors");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const allSettled =
  ((promises) =>
    Promise.all(
      promises.map((p) =>
        p
          .then((value) => ({
            status: "fulfilled",
            value,
          }))
          .catch((reason) => ({
            status: "rejected",
            reason,
          }))
      )
    ));
async function freeStrategy(imagePath) {
  const regions = ["us", "au", "eu", "auwide", "kr", "sg", "mx", "br"];
  const responseSettled = (
    await allSettled(regions.map((region) => executeRec(region, imagePath)))
  )
    .filter((p) => p.status === "fulfilled")
    .map((result) => result.value)
  let response = []
  responseSettled.forEach((r) => {
    r.forEach(r2 => {
      response.push(r2)
    })
  });
  console.log(response)
 if (response.length > 0) {
   return response;
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
