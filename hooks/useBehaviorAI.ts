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

const TRAINING_STEPS = Array.from({ length: 100 }, (_, i) => {
  const min = i === 0 ? 1 : Math.floor(10 * Math.pow(1.5, i - 1))
  const epochs = Math.min(50, 5 + i * 2)
  const levels = [
    "Principiante", "Aprendiz", "Novato", "Iniciado", "Explorador",
    "Aficionado", "Entusiasta", "Dedicado", "Comprometido", "Avanzado",
    "Experto", "Maestro", "Gurú", "Leyenda", "Mítico",
    "Divino", "Supremo", "Élite", "Campeón", "Titán",
    "Coloso", "Gigante", "Behemoth", "Leviatán", "Fenómeno",
    "Prodigio", "Genio", "Sabio", "Oráculo", "Visionario",
    "Innovador", "Pionero", "Revolucionario", "Transformador", "Catalizador",
    "Arquitecto", "Creador", "Artífice", "Forjador", "Escultor",
    "Alquimista", "Mago", "Hechicero", "Nigromante", "Invocador",
    "Conjurador", "Ilusionista", "Prestidigitador", "Taumaturgo", "Teúrgo",
    "Chamán", "Druida", "Elementalista", "Necromante", "Demonólogo",
    "Angelólogo", "Serafín", "Querubín", "Trono", "Dominación",
    "Virtud", "Potestad", "Principado", "Arcángel", "Arcángel Supremo",
    "Serafín Mayor", "Querubín Mayor", "Trono Mayor", "Dominación Mayor",
    "Virtud Mayor", "Potestad Mayor", "Principado Mayor", "Arcángel Mayor", "Dios",
    "Dios Supremo", "Creador Universal", "Señor de Todo", "Omnipotente", "Todopoderoso",
    "Infinito", "Eterno", "Absoluto", "Supremo Ser", "Entidad Suprema",
    "Ser Cósmico", "Entidad Cósmica", "Ser Universal", "Entidad Universal", "Ser Multiversal",
    "Entidad Multiversal", "Ser Omniversal", "Entidad Omniversal", "Ser Transcendental", "Entidad Transcendental",
    "Ser Metafísico", "Entidad Metafísica", "Ser Hiperdimensional", "Entidad Hiperdimensional", "Ser Ultradimensional",
    "Entidad Ultradimensional", "Ser Paradójico", "Entidad Paradójica", "Ser Cuántico", "Entidad Cuántica"
  ]
  const level = levels[Math.min(i, levels.length - 1)]
  return { min, epochs, level }
})

export function useBehaviorAI(data: BehaviorSample[]) {
  const modelRef = useRef<tf.Sequential | null>(null)
  const trainedStepsRef = useRef<Set<number>>(new Set())

  const [ready, setReady] = useState(false)
  const [training, setTraining] = useState(false)
  const [level, setLevel] = useState("Principiante")
  const [nextLevel, setNextLevel] = useState<string | null>(null)
  const [eventsToNext, setEventsToNext] = useState<number | null>(null)

  useEffect(() => {
    const count = data.length
    if (count < 1) {
      setLevel("Principiante")
      setNextLevel(TRAINING_STEPS[0].level)
      setEventsToNext(TRAINING_STEPS[0].min - count)
      return
    }

    if (!modelRef.current) {
      modelRef.current = createIntentModel()
    }

    const step = TRAINING_STEPS.findLast((s) => count >= s.min)
    if (!step) return
    if (trainedStepsRef.current.has(step.min)) {
      // Still update next level
    } else {
      trainedStepsRef.current.add(step.min)
    }
    setLevel(step.level)

    // Set next level
    const nextIndex = TRAINING_STEPS.indexOf(step) + 1
    if (nextIndex < TRAINING_STEPS.length) {
      const nextStep = TRAINING_STEPS[nextIndex]
      setNextLevel(nextStep.level)
      setEventsToNext(nextStep.min - count)
    } else {
      setNextLevel(null)
      setEventsToNext(null)
    }
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

  return { ready, training, predict, level, nextLevel, eventsToNext }
}
