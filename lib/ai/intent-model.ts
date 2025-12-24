import * as tf from "@tensorflow/tfjs"

export function createIntentModel() {
  const model = tf.sequential()

  model.add(
    tf.layers.dense({
      inputShape: [4],
      units: 8,
      activation: "relu",
    }),
  )

  model.add(
    tf.layers.dense({
      units: 4,
      activation: "relu",
    }),
  )

  model.add(
    tf.layers.dense({
      units: 1,
      activation: "sigmoid", // score 0 → 1
    }),
  )

  model.compile({
    optimizer: tf.train.adam(0.01),
    loss: "binaryCrossentropy",
    metrics: ["accuracy"],
  })

  return model
}
