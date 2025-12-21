import * as tf from "@tensorflow/tfjs"

export function createModel() {
  const model = tf.sequential()

  model.add(
    tf.layers.dense({
      inputShape: [3],
      units: 8,
      activation: "relu"
    })
  )

  model.add(
    tf.layers.dense({
      units: 1,
      activation: "sigmoid"
    })
  )

  model.compile({
    optimizer: tf.train.adam(0.01),
    loss: "binaryCrossentropy",
    metrics: ["accuracy"]
  })

  return model
}
