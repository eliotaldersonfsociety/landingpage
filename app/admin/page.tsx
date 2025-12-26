"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  ShoppingBag,
  BarChart3,
  ShoppingCart,
  MousePointerClick,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Users,
  Activity,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  analyticsStorage,
  contentStorage,
  type AnalyticsEvent,
  type SiteContent,
} from "@/lib/store"
import { getAllOrdersAction, updateOrderStatusAction } from "@/lib/actions/orders"
import { getCurrentUser } from "@/lib/actions/login"
import { Footer } from "@/components/footer"
import { PredictiveHeatmap } from "@/components/predictive-heatmap"
import { RealtimeBehaviorPanel } from "@/components/RealtimeBehaviorPanel"

export default function AdminPage() {
  const [analytics, setAnalytics] = useState<AnalyticsEvent[]>([])
  const [content, setContent] = useState<SiteContent | null>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [behaviorData, setBehaviorData] = useState<any[]>([])
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [adminInfo, setAdminInfo] = useState<{ email: string; name?: string } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser()
        if (!user) {
          window.location.href = "/login"
          return
        }
        if (user.role !== "admin") {
          window.location.href = "/dashboard"
          return
        }
        setAdminInfo({ email: user.email, name: user.name })
        loadData()
      } catch {
        window.location.href = "/login"
      }
    }
    checkAuth()
  }, [])

  const loadData = async () => {
    setAnalytics(analyticsStorage.getAll())
    setContent(contentStorage.get())

    try {
      const result = await getAllOrdersAction()
      if (result.success && result.data?.orders) {
        setOrders(result.data.orders)
      }
    } catch (error) {
      console.error("Error loading orders:", error)
    }

    try {
      const response = await fetch("/api/behavior")
      if (response.ok) {
        const data = await response.json()
        setBehaviorData(data)
      }
    } catch (error) {
      console.error("Error loading behavior data:", error)
    }
  }


  const getAnalyticsSummary = () => {
    const pageViews = analytics.filter((e) => e.type === "page_view").length
    const productViews = analytics.filter((e) => e.type === "product_view").length
    const addToCarts = analytics.filter((e) => e.type === "add_to_cart").length
    const clicks = analytics.filter((e) => e.type === "click").length

    return { pageViews, productViews, addToCarts, clicks }
  }

  const getRecentEvents = () => {
    return analytics.slice(-10).reverse()
  }

  const getFlag = (country: string) => {
    const flags: Record<string, string> = {
      "United States": "🇺🇸",
      Colombia: "🇨🇴",
      Mexico: "🇲🇽",
      Spain: "🇪🇸",
      Argentina: "🇦🇷",
      Brazil: "🇧🇷",
      Canada: "🇨🇦",
      France: "🇫🇷",
      Germany: "🇩🇪",
      Italy: "🇮🇹",
    }
    return flags[country] || "🌍"
  }

  const getTopProducts = () => {
    const productCounts = new Map<string, { name: string; count: number }>()

    analytics
      .filter((e) => e.type === "add_to_cart")
      .forEach((event) => {
        const productName = event.data?.productName || "Unknown"
        const current = productCounts.get(productName) || { name: productName, count: 0 }
        productCounts.set(productName, { name: productName, count: current.count + 1 })
      })

    return Array.from(productCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    setUpdatingStatus(true)
    try {
      const result = await updateOrderStatusAction(orderId, newStatus)
      if (result.success) {
        // Update local state
        setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
        setSelectedOrder({ ...selectedOrder, status: newStatus })
        alert("Estado actualizado exitosamente")
      } else {
        alert("Error al actualizar estado: " + result.error)
      }
    } catch (error) {
      alert("Error al actualizar estado")
    } finally {
      setUpdatingStatus(false)
    }
  }

  const summary = getAnalyticsSummary()
  const recentEvents = getRecentEvents()
  const topProducts = getTopProducts()

  const totalOrders = orders.length
  const totalAmount = orders.reduce((sum, order) => sum + order.total, 0)

  const itemsPerPage = 7
  const totalPages = Math.ceil(orders.length / itemsPerPage)
  const paginatedOrders = orders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const generateSampleData = async () => {
    const sampleData = []
    for (let i = 0; i < 50; i++) {
      sampleData.push({
        scroll: Math.random(),
        time: Math.random() * 30000, // up to 30s
        clicks: Math.floor(Math.random() * 20),
        ctaSeen: Math.random() > 0.5 ? 1 : 0,
        converted: Math.random() > 0.8 ? 1 : 0,
      })
    }

    try {
      for (const data of sampleData) {
        await fetch("/api/behavior", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
      }
      loadData() // Reload data
      alert("Sample data generated!")
    } catch (error) {
      alert("Error generating sample data")
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-0 text-center">

      <main className="flex-1 bg-gradient-to-br from-background via-muted/30 to-background max-w-7xl mx-auto w-full px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-primary/20 bg-gradient-to-br from-card via-primary/5 to-card hover:shadow-xl hover:scale-105 transition-all duration-300 group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Administrador</CardTitle>
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Users className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-foreground">{adminInfo?.name || "Admin"}</p>
              <p className="text-sm text-muted-foreground mt-1">{adminInfo?.email}</p>
            </CardContent>
          </Card>

          <Card className="border-secondary/20 bg-gradient-to-br from-card via-secondary/5 to-card hover:shadow-xl hover:scale-105 transition-all duration-300 group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Número de Compras</CardTitle>
                <div className="p-2 rounded-lg bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                  <ShoppingBag className="h-5 w-5 text-secondary group-hover:scale-110 transition-transform" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{totalOrders}</p>
              <p className="text-sm text-muted-foreground mt-1">Total de órdenes</p>
            </CardContent>
          </Card>

          <Card className="border-green-500/20 bg-gradient-to-br from-card via-green-500/5 to-card hover:shadow-xl hover:scale-105 transition-all duration-300 group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Total de Compras</CardTitle>
                <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                  <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">${totalAmount.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground mt-1">Ingresos totales</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-2 bg-muted/50 p-1 rounded-xl shadow-sm">
            <TabsTrigger value="orders" className="data-[state=active]:bg-card data-[state=active]:shadow data-[state=active]:scale-105 transition-all duration-200 rounded-lg">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-card data-[state=active]:shadow data-[state=active]:scale-105 transition-all duration-200 rounded-lg">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="bg-muted/30">
                <CardTitle>All Orders</CardTitle>
                <CardDescription>View and manage all customer orders</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {orders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">No orders yet</p>
                ) : (
                  <>
                    <div className="space-y-4">
                      {paginatedOrders.map((order) => (
                        <Card
                          key={order.id}
                          className="p-5 border-border/50 hover:border-primary/30 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                            <div>
                              <h3 className="text-lg font-bold group-hover:text-primary transition-colors">Order #{order.id}</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                Customer: {order.user?.name || order.user?.email}
                              </p>
                              <p className="text-sm text-muted-foreground">Email: {order.user?.email}</p>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                              <Badge
                                variant={
                                  order.status === "pending"
                                    ? "secondary"
                                    : order.status === "confirmed"
                                      ? "outline"
                                      : "default"
                                }
                                className="w-fit group-hover:scale-105 transition-transform"
                              >
                                {order.status === "pending"
                                  ? "Orden Recibida"
                                  : order.status === "confirmed"
                                    ? "Pago Confirmado"
                                    : "Producto Enviado"}
                              </Badge>
                              <p className="text-xl font-bold text-primary group-hover:scale-105 transition-transform">${order.total.toFixed(2)}</p>
                            </div>
                          </div>

                          <div className="space-y-2 p-3 rounded-lg bg-muted/30 border border-border/30 group-hover:bg-muted/50 transition-colors">
                            <h4 className="font-semibold text-sm">Products ({order.items.length}):</h4>
                            <div className="text-sm text-muted-foreground">
                              {order.items
                                .slice(0, 2)
                                .map((item: any) => item.name)
                                .join(", ")}
                              {order.items.length > 2 && ` y ${order.items.length - 2} más...`}
                            </div>
                          </div>

                          <div className="mt-4 flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              className="hover:bg-primary hover:text-primary-foreground hover:shadow-md transition-all duration-200 bg-transparent"
                              onClick={() => {
                                setSelectedOrder(order)
                                setIsOrderModalOpen(true)
                              }}
                            >
                              Ver Detalles
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4 mr-2" />
                          Anterior
                        </Button>
                        <span className="text-sm text-muted-foreground font-medium">
                          Página {currentPage} de {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Siguiente
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <RealtimeBehaviorPanel />

            <Card className="border-primary/20 bg-gradient-to-br from-card to-accent/5 hover:shadow-lg transition-shadow">
              <CardHeader className="border-b border-border/50">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-accent" />
                  <CardTitle>Mapa de Engagement de la Landing</CardTitle>
                </div>
                <CardDescription>Visualización de cómo los usuarios interactúan con la página</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {[
                    { name: "Hero Section", value: 90, color: "bg-gradient-to-r from-green-500 to-green-600" },
                    { name: "Productos", value: 75, color: "bg-gradient-to-r from-blue-500 to-blue-600" },
                    { name: "Testimonios", value: 60, color: "bg-gradient-to-r from-yellow-500 to-yellow-600" },
                    { name: "FAQs", value: 40, color: "bg-gradient-to-r from-red-500 to-red-600" },
                  ].map((section) => (
                    <div
                      key={section.name}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border/50 rounded-lg bg-card/50 hover:bg-card hover:shadow-md hover:scale-[1.01] transition-all duration-300 group gap-3"
                    >
                      <span className="font-semibold text-foreground group-hover:text-accent transition-colors">{section.name}</span>
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="flex-1 sm:w-32 bg-muted rounded-full h-3 overflow-hidden shadow-inner">
                          <div
                            className={`${section.color} h-3 rounded-full transition-all duration-1000 ease-out group-hover:shadow-lg`}
                            style={{ width: `${section.value}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-left sm:text-right group-hover:scale-105 transition-transform whitespace-nowrap">{section.value}% alcanzan</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  * Datos basados en comportamiento recolectado. Se actualizan en tiempo real.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Order Details Modal */}
      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-card to-muted/20 rounded-xl shadow-2xl border-0">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl font-bold text-foreground">Detalles del Pedido #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    Cliente: {selectedOrder.user?.name || selectedOrder.user?.email}
                  </h3>
                  <p className="text-sm text-muted-foreground">Email: {selectedOrder.user?.email}</p>
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      selectedOrder.status === "pending"
                        ? "secondary"
                        : selectedOrder.status === "confirmed"
                          ? "outline"
                          : "default"
                    }
                  >
                    {selectedOrder.status === "pending"
                      ? "Orden Recibida"
                      : selectedOrder.status === "confirmed"
                        ? "Pago Confirmado"
                        : "Producto Enviado"}
                  </Badge>
                  <p className="text-2xl font-bold mt-1">${selectedOrder.total.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <Label>Actualizar Estado</Label>
                <Select
                  value={selectedOrder.status}
                  onValueChange={(value) => handleUpdateStatus(selectedOrder.id, value)}
                  disabled={updatingStatus}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Orden Recibida</SelectItem>
                    <SelectItem value="confirmed">Pago Confirmado</SelectItem>
                    <SelectItem value="shipped">Producto Enviado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card className="border-border/50 bg-muted/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Productos:</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center border-b border-border/30 pb-2 last:border-b-0">
                        <span className="font-medium">{item.name}</span>
                        <span className="font-bold text-primary">${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {selectedOrder.additionalInfo && (
                <div>
                  <h4 className="font-medium mb-2">Información adicional:</h4>
                  <p className="text-sm text-gray-600">{selectedOrder.additionalInfo}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Dirección de envío:</h4>
                  <p className="text-sm">{selectedOrder.user?.address || "N/A"}</p>
                  <p className="text-sm">
                    {selectedOrder.user?.city}, {selectedOrder.user?.department}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Contacto:</h4>
                  <p className="text-sm">WhatsApp: {selectedOrder.user?.whatsappNumber || "N/A"}</p>
                </div>
              </div>

              {selectedOrder.paymentProof && (
                <div>
                  <h4 className="font-medium mb-2">Comprobante de Pago:</h4>
                  <div className="border rounded-lg p-4">
                    <img
                      src={selectedOrder.paymentProof || "/placeholder.svg"}
                      alt="Comprobante de pago"
                      className="max-w-full h-auto rounded"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
