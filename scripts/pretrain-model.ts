import * as tf from "@tensorflow/tfjs";

// Datos simulados de entrenamiento
// scroll, tiempo normalizado, clicks, ctaSeen -> converted
const X = tf.tensor2d([
  [0.1, 1, 0, 1],
  [0.5, 3, 2, 0],
  [0.9, 5, 1, 1],
  [0.3, 2, 1, 0],
  [0.7, 4, 3, 1],
  [0.2, 1, 0, 0],
  [0.8, 5, 2, 1],
]);

const Y = tf.tensor2d([
  [1],
  [0],
  [1],
  [0],
  [1],
  [0],
  [1],
]);

// Modelo simple
const model = tf.sequential();
model.add(tf.layers.dense({ inputShape: [4], units: 8, activation: "relu" }));
model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));

model.compile({ optimizer: "adam", loss: "binaryCrossentropy", metrics: ["accuracy"] });

// Entrenamiento
async function trainAndSave() {
  await model.fit(X, Y, { epochs: 50 });

  // Guardar el modelo en IndexedDB en lugar de filesystem
  await model.save("indexeddb://pretrained-model");
  console.log("Modelo preentrenado guardado en IndexedDB");

  // También puedes exportarlo como archivos descargables en JSON/Weights
  // await model.save("downloads://pretrained-model");
}

trainAndSave();