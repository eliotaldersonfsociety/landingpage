import * as tf from "@tensorflow/tfjs";
import fs from "fs";
import path from "path";

function weightDataToBuffer(weightData: tf.io.WeightData): Buffer {
  if (weightData instanceof ArrayBuffer) {
    return Buffer.from(new Uint8Array(weightData));
  }
  if (ArrayBuffer.isView(weightData)) {
    return Buffer.from(
      weightData.buffer,
      weightData.byteOffset,
      weightData.byteLength
    );
  }
  return Buffer.from(weightData as any);
}

async function train() {
  console.log("🚀 Entrenando modelo de pricing dinámico...");

  const xs = tf.tensor2d([
    [0.1, 0.1, 0.0],
    [0.2, 0.2, 0.1],
    [0.4, 0.4, 0.3],
    [0.6, 0.5, 0.6],
    [0.8, 0.7, 0.9],
    [1.0, 1.0, 1.0],
    [0.3, 0.2, 0.0],
    [0.5, 0.6, 0.4],
    [0.9, 0.9, 0.7],
  ]);

  const ys = tf.tensor2d([
    [0],
    [0],
    [0],
    [1],
    [1],
    [1],
    [0],
    [1],
    [1],
  ]);

  const model = tf.sequential();
  model.add(tf.layers.dense({ inputShape: [3], units: 8, activation: "relu" }));
  model.add(tf.layers.dense({ units: 4, activation: "relu" }));
  model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));

  model.compile({
    optimizer: tf.train.adam(0.01),
    loss: "binaryCrossentropy",
    metrics: ["accuracy"],
  });

  await model.fit(xs, ys, { epochs: 120, batchSize: 4, shuffle: true });

  await model.save(
    tf.io.withSaveHandler(async (artifacts) => {
      if (!artifacts.weightData) {
        throw new Error("weightData no encontrado");
      }
      const modelDir = path.join(process.cwd(), "public", "model");
      fs.mkdirSync(modelDir, { recursive: true });
      const weightsBuffer = weightDataToBuffer(artifacts.weightData);
      const modelJSON = {
        modelTopology: artifacts.modelTopology,
        format: artifacts.format,
        generatedBy: artifacts.generatedBy,
        convertedBy: artifacts.convertedBy,
        trainingConfig: artifacts.trainingConfig,
        weightsManifest: [
          {
            paths: ["weights.bin"],
            weights: artifacts.weightSpecs,
          },
        ],
      };
      fs.writeFileSync(path.join(modelDir, "model.json"), JSON.stringify(modelJSON, null, 2));
      fs.writeFileSync(path.join(modelDir, "weights.bin"), weightsBuffer);
      return {
        modelArtifactsInfo: {
          dateSaved: new Date(),
          modelTopologyType: "JSON",
          modelTopologyBytes: JSON.stringify(modelJSON).length,
          weightDataBytes: weightsBuffer.byteLength,
        },
      };
    })
  );

  xs.dispose();
  ys.dispose();
  console.log("✅ Modelo entrenado y guardado en /public/model");
}

train().catch((err) => {
  console.error("❌ Error entrenando el modelo:", err);
});
