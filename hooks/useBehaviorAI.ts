"use client"

import { useEffect, useRef, useState } from "react"
import * as tf from "@tensorflow/tfjs"
import { createIntentModel } from "@/lib/ai/intent-model"

export type BehaviorSample = {
  scroll: number
  time: number
  clicks: number
  ctaSeen: number
  addToCart: number // label
}

const TRAINING_STEPS = [
  { min: 1, epochs: 5 },
  { min: 5, epochs: 10 },
  { min: 10, epochs: 20 },
  { min: 20, epochs: 30 },
]

export function useBehaviorAI(data: BehaviorSample[]) {
  const modelRef = useRef<tf.Sequential | null>(null)
  const trainedStepsRef = useRef<Set<number>>(new Set())

  const [ready, setReady] = useState(false)
  const [training, setTraining] = useState(false)
  const [level, setLevel] = useState(0)

  useEffect(() => {
    const count = data.length
    if (count < 1) return

    if (!modelRef.current) {
      modelRef.current = createIntentModel()
    }

    const step = TRAINING_STEPS.findLast((s) => count >= s.min)
    if (!step) return
    if (trainedStepsRef.current.has(step.min)) return

    trainedStepsRef.current.add(step.min)
    setLevel(step.min)
    setTraining(true)

    const X = tf.tensor2d(
      data.map((d) => [
        d.scroll,
        d.time / 30000,
        d.clicks / 20,
        d.ctaSeen,
      ])
    )

    const y = tf.tensor2d(data.map((d) => [d.addToCart]))

    modelRef.current
      .fit(X, y, {
        epochs: step.epochs,
        batchSize: Math.min(8, count),
        shuffle: true,
      })
      .then(() => {
        setReady(true)
        setTraining(false)
        X.dispose()
        y.dispose()
      })
  }, [data])

  const predict = (input: Omit<BehaviorSample, "addToCart">): number => {
    if (!modelRef.current || !ready) return 0

    const tensor = tf.tensor2d([[
      input.scroll,
      input.time / 30000,
      input.clicks / 20,
      input.ctaSeen,
    ]])

    const result = modelRef.current.predict(tensor) as tf.Tensor
    const score = result.dataSync()[0]

    tensor.dispose()
    result.dispose()

    return score
  }

  return { ready, training, predict, level }
}
