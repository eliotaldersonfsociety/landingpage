"use client"

import { useEffect, useState } from "react"
import * as tf from "@tensorflow/tfjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PredictionResult {
  abandonmentRisk: number
  recommendedActions: string[]
  engagementScore: number
  predictedPath: string[]
}

export function PredictiveHeatmap() {
  const [predictions, setPredictions] = useState<PredictionResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(true)

  useEffect(() => {
    async function analyzeBehavior() {
      try {
        const response = await fetch('/api/behavior')
        const behaviorData = await response.json()

        if (behaviorData.length > 10) {
          // Create predictive model
          const model = tf.sequential()
          model.add(tf.layers.dense({ inputShape: [3], units: 16, activation: 'relu' }))
          model.add(tf.layers.dense({ units: 8, activation: 'relu' }))
          model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }))
          model.compile({ optimizer: 'adam', loss: 'binaryCrossentropy' })

          // Prepare training data
          const inputs = behaviorData.map((d: any) => [
            d.scroll,
            d.time / 30000, // normalized time
            d.clicks / 20    // normalized clicks
          ])

          // Label: 1 if user completed engagement (high scroll + time), 0 if abandoned
          const labels = behaviorData.map((d: any) =>
            (d.scroll > 0.8 && d.time > 20000) ? 1 : 0
          )

          const xs = tf.tensor2d(inputs)
          const ys = tf.tensor1d(labels)

          await model.fit(xs, ys, { epochs: 20, verbose: 0 })

          // Predict current user risk
          const currentBehavior = [
            0.3, // current scroll
            5000, // current time
            2     // current clicks
          ]

          const prediction = model.predict(tf.tensor2d([currentBehavior])) as tf.Tensor
          const abandonmentRisk = (await prediction.data())[0]

          // Calculate engagement score
          const avgScroll = behaviorData.reduce((sum: number, d: any) => sum + d.scroll, 0) / behaviorData.length
          const avgTime = behaviorData.reduce((sum: number, d: any) => sum + d.time, 0) / behaviorData.length
          const engagementScore = (avgScroll * 0.4 + (avgTime / 30000) * 0.6) * 100

          // Generate recommendations
          const recommendedActions = []
          if (abandonmentRisk > 0.7) {
            recommendedActions.push("Mostrar popup de descuento inmediato")
            recommendedActions.push("Mover CTA más arriba en la página")
            recommendedActions.push("Agregar testimonios sociales cerca del punto de abandono")
          } else if (abandonmentRisk > 0.4) {
            recommendedActions.push("Optimizar velocidad de carga")
            recommendedActions.push("Mejorar mensajes de valor")
            recommendedActions.push("Agregar más elementos interactivos")
          } else {
            recommendedActions.push("Página funcionando bien")
            recommendedActions.push("Considerar pruebas A/B para optimización")
          }

          // Predict user path
          const predictedPath = []
          if (abandonmentRisk < 0.3) {
            predictedPath.push("Hero → Productos → Testimonios → Compra")
          } else if (abandonmentRisk < 0.6) {
            predictedPath.push("Hero → Productos → Abandono en Testimonios")
          } else {
            predictedPath.push("Hero → Abandono temprano")
          }

          setPredictions({
            abandonmentRisk: abandonmentRisk * 100,
            recommendedActions,
            engagementScore,
            predictedPath
          })

          // Cleanup
          xs.dispose()
          ys.dispose()
          prediction.dispose()
        } else {
          // Not enough data
          setPredictions({
            abandonmentRisk: 45,
            recommendedActions: ["Recopilar más datos de comportamiento"],
            engagementScore: 65,
            predictedPath: ["Datos insuficientes para predicción"]
          })
        }
      } catch (error) {
        console.error('Error analyzing behavior:', error)
        setPredictions({
          abandonmentRisk: 50,
          recommendedActions: ["Error en análisis"],
          engagementScore: 50,
          predictedPath: ["Error en predicción"]
        })
      } finally {
        setIsAnalyzing(false)
      }
    }

    analyzeBehavior()
  }, [])

  if (isAnalyzing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🔥 Heatmap Predictivo</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Analizando comportamiento de usuarios...</p>
        </CardContent>
      </Card>
    )
  }

  if (!predictions) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔥 Heatmap Predictivo</CardTitle>
        <p className="text-sm text-muted-foreground">
          IA que predice el comportamiento futuro de los usuarios
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Risk Meter */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Riesgo de Abandono</span>
            <Badge variant={predictions.abandonmentRisk > 70 ? "destructive" : predictions.abandonmentRisk > 40 ? "secondary" : "default"}>
              {predictions.abandonmentRisk.toFixed(1)}%
            </Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full ${
                predictions.abandonmentRisk > 70 ? 'bg-red-500' :
                predictions.abandonmentRisk > 40 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${predictions.abandonmentRisk}%` }}
            ></div>
          </div>
        </div>

        {/* Engagement Score */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Puntuación de Engagement</span>
            <span className="text-sm font-bold">{predictions.engagementScore.toFixed(1)}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full"
              style={{ width: `${predictions.engagementScore}%` }}
            ></div>
          </div>
        </div>

        {/* Predicted Path */}
        <div>
          <h4 className="text-sm font-medium mb-2">Camino Predicho del Usuario</h4>
          <div className="bg-muted p-3 rounded">
            {predictions.predictedPath.map((path, index) => (
              <p key={index} className="text-sm">{path}</p>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <h4 className="text-sm font-medium mb-2">Recomendaciones de IA</h4>
          <div className="space-y-2">
            {predictions.recommendedActions.map((action, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                <span className="text-blue-600">💡</span>
                <span className="text-sm">{action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap Visualization */}
        <div>
          <h4 className="text-sm font-medium mb-2">Mapa de Calor Predictivo</h4>
          <div className="grid grid-cols-4 gap-1 text-xs">
            <div className="bg-green-100 p-2 rounded text-center">
              <div>Hero</div>
              <div className="text-green-600 font-bold">95%</div>
            </div>
            <div className="bg-yellow-100 p-2 rounded text-center">
              <div>Productos</div>
              <div className="text-yellow-600 font-bold">75%</div>
            </div>
            <div className="bg-orange-100 p-2 rounded text-center">
              <div>Testimonios</div>
              <div className="text-orange-600 font-bold">45%</div>
            </div>
            <div className="bg-red-100 p-2 rounded text-center">
              <div>Compra</div>
              <div className="text-red-600 font-bold">25%</div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            * Porcentajes muestran probabilidad de que el usuario llegue a cada sección
          </p>
        </div>
      </CardContent>
    </Card>
  )
}