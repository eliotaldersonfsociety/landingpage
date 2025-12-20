import * as tf from "@tensorflow/tfjs"

export function createModel() {
  const model = tf.sequential()

  model.add(tf.layers.dense({
    inputShape: [3], // scroll, time, clicks
    units: 8,
    activation: "relu",
  }))

  model.add(tf.layers.dense({
    units: 1,
    activation: "sigmoid",
  }))

  model.compile({
    optimizer: "adam",
    loss: "binaryCrossentropy",
  })

  return model
}
