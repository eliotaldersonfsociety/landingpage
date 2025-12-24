"use client";

import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import { createIntentModel } from "@/lib/ai/intent-model";

export type BehaviorSample = {
  scroll: number;
  time: number;
  clicks: number;
  ctaSeen: number;
  addToCart: number; // label (0 or 1)
};

// Lista de nombres de niveles (puedes extenderla si quieres más de ~60 únicos)
const LEVEL_NAMES = [
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
  "Virtud", "Potestad", "Principado", "Arcángel", "Arcángel Supremo"
];

function getLevelName(levelIndex: number): string {
  if (levelIndex < LEVEL_NAMES.length) {
    return LEVEL_NAMES[levelIndex];
  }
  // Si se excede la lista, usar "Nivel X" (o extiende LEVEL_NAMES si prefieres)
  return `Nivel ${levelIndex + 1}`;
}

// Constante: 1 millón de eventos = nivel máximo (ajustable)
const MAX_EVENTS = 1_000_000;
const MAX_LEVEL_INDEX = 100; // nivel 100 = 1M eventos → (100)^2 * 100 = 1,000,000

export function useBehaviorAI(data: BehaviorSample[]) {
  const modelRef = useRef<tf.Sequential | null>(null);
  const isTrainingRef = useRef(false);
  const lastTrainedCountRef = useRef(0);

  const [ready, setReady] = useState(false);
  const [training, setTraining] = useState(false);
  const [level, setLevel] = useState("Principiante");
  const [nextLevel, setNextLevel] = useState<string | null>(null);
  const [eventsToNext, setEventsToNext] = useState<number | null>(null);

  useEffect(() => {
    const count = data.length;

    // Calcular nivel actual: nivel = floor(sqrt(count / 100))
    const levelIndex = Math.min(
      MAX_LEVEL_INDEX,
      Math.max(0, Math.floor(Math.sqrt(count / 100)))
    );

    const levelName = getLevelName(levelIndex);
    setLevel(levelName);

    // Calcular próximo nivel
    if (levelIndex < MAX_LEVEL_INDEX) {
      const nextIndex = levelIndex + 1;
      const eventsForNext = nextIndex * nextIndex * 100; // (nivel)^2 * 100
      const toNext = Math.max(0, eventsForNext - count);
      setNextLevel(getLevelName(nextIndex));
      setEventsToNext(toNext);
    } else {
      setNextLevel(null);
      setEventsToNext(null);
    }

    // No entrenar si no hay datos
    if (count === 0) {
      setReady(false);
      return;
    }

    // Inicializar modelo si no existe
    if (!modelRef.current) {
      modelRef.current = createIntentModel();
      // Añadimos una propiedad personalizada para rastrear entrenamiento
      (modelRef.current as any).lastTrainedCount = 0;
    }

    // Evitar reentrenamiento innecesario:
    // - Solo entrenar si hay al menos 5 nuevos datos (o si es muy poca data)
    const lastTrained = (modelRef.current as any).lastTrainedCount || 0;
    const shouldRetrain =
      count <= 20 || // Siempre entrenar si pocos datos
      count - lastTrained >= Math.min(10, Math.max(5, Math.floor(count * 0.05)));

    if (!shouldRetrain || isTrainingRef.current) {
      return;
    }

    // ✅ Iniciar entrenamiento
    isTrainingRef.current = true;
    setTraining(true);

    // Normalizar datos
    const X = tf.tensor2d(
      data.map((d) => [
        d.scroll,               // asumido normalizado (0–1 o %)
        d.time / 30000,        // normalizado (~0.5 min = 1)
        d.clicks / 20,         // normalizado
        d.ctaSeen,             // 0 o 1
      ])
    );

    const y = tf.tensor2d(data.map((d) => [d.addToCart])); // binario

    // Ajustar épocas: más datos → más épocas (hasta 50)
    const epochs = Math.min(50, 3 + Math.floor(Math.sqrt(count)));

    modelRef.current
      .fit(X, y, {
        epochs,
        batchSize: Math.min(32, Math.max(4, Math.floor(count / 5))),
        shuffle: true,
      })
      .then(() => {
        (modelRef.current as any).lastTrainedCount = count;
        setReady(true);
      })
      .catch((error) => {
        console.error("AI Training error:", error);
      })
      .finally(() => {
        X.dispose();
        y.dispose();
        setTraining(false);
        isTrainingRef.current = false;
      });
  }, [data]);

  const predict = (input: Omit<BehaviorSample, "addToCart">): number => {
    if (!modelRef.current || !ready) return 0.0;

    const tensor = tf.tensor2d([[
      input.scroll,
      input.time / 30000,
      input.clicks / 20,
      input.ctaSeen,
    ]]);

    const result = modelRef.current.predict(tensor) as tf.Tensor;
    const score = Math.max(0, Math.min(1, result.dataSync()[0])); // clamp 0–1

    tensor.dispose();
    result.dispose();

    return score;
  };

  return {
    ready,
    training,
    predict,
    level,
    nextLevel,
    eventsToNext,
  };
}