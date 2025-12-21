import * as tf from "@tensorflow/tfjs"
import fs from "fs"
import path from "path"
import { createModel } from "../lib/tf-model"

// 🔹 Datos de entrenamiento (ejemplo)
const trainingData = [
  { scroll: 0.9, time: 0.8, clicks: 0.6, intent: 1 },
  { scroll: 0.2, time: 0.1, clicks: 0.0, intent: 0 },
  { scroll: 0.7, time: 0.6, clicks: 0.3, intent: 1 },
  { scroll: 0.3, time: 0.2, clicks: 0.1, intent: 0 },
  { scroll: 0.85, time: 0.9, clicks: 0.8, intent: 1 }
]

async function train() {
  const model = createModel()

  const xs = tf.tensor2d(
    trainingData.map(d => [d.scroll, d.time, d.clicks])
  )

  const ys = tf.tensor2d(
    trainingData.map(d => [d.intent])
  )

  await model.fit(xs, ys, {
    epochs: 40,
    batchSize: 4,
    shuffle: true
  })

  // 🔹 Guardar modelo como JSON
  const modelJson = await model.toJSON()

  const outputDir = path.join(process.cwd(), "ml")
  const outputPath = path.join(outputDir, "model-intent.json")

  fs.mkdirSync(outputDir, { recursive: true })
  fs.writeFileSync(outputPath, JSON.stringify(modelJson, null, 2))

  console.log("✅ Model trained and saved at ml/model-intent.json")

  xs.dispose()
  ys.dispose()
}

train().catch(console.error)
