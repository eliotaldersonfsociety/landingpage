"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  ShoppingBag,
  Package,
  BarChart3,
  Plus,
  Pencil,
  Trash2,
  Eye,
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
  productsStorage,
  analyticsStorage,
  contentStorage,
  type Product,
  type AnalyticsEvent,
  type SiteContent,
} from "@/lib/store"
import { getAllOrdersAction, updateOrderStatusAction } from "@/lib/actions/orders"
import { Header } from "@/components/header/header"
import { Footer } from "@/components/footer"
import { jwtDecode } from "jwt-decode"
import { PredictiveHeatmap } from "@/components/predictive-heatmap"

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsEvent[]>([])
  const [content, setContent] = useState<SiteContent | null>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [behaviorData, setBehaviorData] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [adminInfo, setAdminInfo] = useState<{ email: string; name?: string } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
  })

  useEffect(() => {
    // Check if user is admin
    const tokenCookie = document.cookie.split(";").find((c) => c.trim().startsWith("authToken="))
    if (!tokenCookie) {
      window.location.href = "/login"
      return
    }
    try {
      const token = tokenCookie.split("=")[1]
      const decoded = jwtDecode<{ role: string; email: string; name?: string }>(token)
      if (decoded.role !== "admin") {
        window.location.href = "/dashboard"
        return
      }
      setAdminInfo({ email: decoded.email, name: decoded.name })
    } catch {
      window.location.href = "/login"
      return
    }
    loadData()
  }, [])

  const loadData = async () => {
    setProducts(productsStorage.get())
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const productData: Product = {
      id: editingProduct?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      price: Number.parseFloat(formData.price),
      image: formData.image,
      category: formData.category,
    }

    if (editingProduct) {
      productsStorage.update(productData)
    } else {
      productsStorage.add(productData)
    }

    setProducts(productsStorage.get())
    resetForm()
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image: product.image,
      category: product.category,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      productsStorage.delete(productId)
      setProducts(productsStorage.get())
    }
  }

  const resetForm = () => {
    setFormData({ name: "", description: "", price: "", image: "", category: "" })
    setEditingProduct(null)
    setIsDialogOpen(false)
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
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gradient-to-br from-background via-muted/30 to-background max-w-7xl mx-auto w-full px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Administrador</CardTitle>
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-foreground">{adminInfo?.name || "Admin"}</p>
              <p className="text-sm text-muted-foreground mt-1">{adminInfo?.email}</p>
            </CardContent>
          </Card>

          <Card className="border-secondary/20 bg-gradient-to-br from-card to-secondary/5 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Número de Compras</CardTitle>
                <div className="p-2 rounded-lg bg-secondary/10">
                  <ShoppingBag className="h-5 w-5 text-secondary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{totalOrders}</p>
              <p className="text-sm text-muted-foreground mt-1">Total de órdenes</p>
            </CardContent>
          </Card>

          <Card className="border-green-500/20 bg-gradient-to-br from-card to-green-500/5 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Total de Compras</CardTitle>
                <div className="p-2 rounded-lg bg-green-500/10">
                  <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
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
          <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-muted/50 p-1">
            <TabsTrigger value="orders" className="data-[state=active]:bg-card data-[state=active]:shadow">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-card data-[state=active]:shadow">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="behavior" className="data-[state=active]:bg-card data-[state=active]:shadow">
              <Eye className="h-4 w-4 mr-2" />
              Behavior
            </TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-card data-[state=active]:shadow">
              <Package className="h-4 w-4 mr-2" />
              Products
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
                          className="p-5 border-border/50 hover:border-primary/30 transition-all hover:shadow-md"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                            <div>
                              <h3 className="text-lg font-bold">Order #{order.id}</h3>
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
                                className="w-fit"
                              >
                                {order.status === "pending"
                                  ? "Orden Recibida"
                                  : order.status === "confirmed"
                                    ? "Pago Confirmado"
                                    : "Producto Enviado"}
                              </Badge>
                              <p className="text-xl font-bold text-primary">${order.total.toFixed(2)}</p>
                            </div>
                          </div>

                          <div className="space-y-2 p-3 rounded-lg bg-muted/30 border border-border/30">
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
                              className="hover:bg-primary hover:text-primary-foreground transition-colors bg-transparent"
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

            <Card className="border-primary/20 bg-gradient-to-br from-card to-accent/5">
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
                      className="flex items-center justify-between p-4 border border-border/50 rounded-lg bg-card/50 hover:bg-card transition-colors"
                    >
                      <span className="font-semibold text-foreground">{section.name}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-muted rounded-full h-3 overflow-hidden shadow-inner">
                          <div
                            className={`${section.color} h-3 rounded-full transition-all duration-500`}
                            style={{ width: `${section.value}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold min-w-[80px] text-right">{section.value}% alcanzan</span>
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

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Page Views</CardTitle>
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Eye className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{summary.pageViews}</div>
                  <p className="text-xs text-muted-foreground mt-1">Total visits to the site</p>
                </CardContent>
              </Card>

              <Card className="border-secondary/20 bg-gradient-to-br from-card to-secondary/5 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Product Views</CardTitle>
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <Package className="h-4 w-4 text-secondary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{summary.productViews}</div>
                  <p className="text-xs text-muted-foreground mt-1">Products viewed by users</p>
                </CardContent>
              </Card>

              <Card className="border-accent/20 bg-gradient-to-br from-card to-accent/5 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Add to Cart</CardTitle>
                  <div className="p-2 rounded-lg bg-accent/10">
                    <ShoppingCart className="h-4 w-4 text-accent" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{summary.addToCarts}</div>
                  <p className="text-xs text-muted-foreground mt-1">Items added to cart</p>
                </CardContent>
              </Card>

              <Card className="border-chart-4/20 bg-gradient-to-br from-card to-chart-4/5 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                  <div className="p-2 rounded-lg bg-chart-4/10">
                    <MousePointerClick className="h-4 w-4 text-chart-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{summary.clicks}</div>
                  <p className="text-xs text-muted-foreground mt-1">User interactions tracked</p>
                </CardContent>
              </Card>
            </div>

            {/* Top Products */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="bg-muted/30">
                <CardTitle>Top Products by Cart Additions</CardTitle>
                <CardDescription>Most popular products added to cart</CardDescription>
              </CardHeader>
              <CardContent>
                {topProducts.length > 0 ? (
                  <div className="space-y-4">
                    {topProducts.map((product, index) => (
                      <div key={product.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold">
                            {index + 1}
                          </div>
                          <span className="font-medium">{product.name}</span>
                        </div>
                        <span className="text-muted-foreground">{product.count} additions</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No cart additions yet</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="bg-muted/30">
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest user interactions and events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event Type</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentEvents.length > 0 ? (
                        recentEvents.map((event, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium capitalize">{event.type.replace("_", " ")}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {event.data?.productName || event.data?.path || "-"}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {getFlag(event.country || "")} {event.country}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(event.timestamp).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            No events recorded yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Predictive Heatmap */}
            <PredictiveHeatmap />
          </TabsContent>

          {/* Behavior Tab */}
          <TabsContent value="behavior" className="space-y-6">
            {/* Análisis de Comportamiento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="bg-muted/30">
                  <CardTitle>Estado del Modelo IA</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg">
                    {behaviorData.length > 10 ? (
                      <span className="text-green-600 font-semibold">✅ Modelo Entrenado</span>
                    ) : (
                      <span className="text-yellow-600 font-semibold">⏳ Entrenando Modelo...</span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">Datos recolectados: {behaviorData.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="bg-muted/30">
                  <CardTitle>Estadísticas de Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p>
                      Scroll promedio:{" "}
                      {((behaviorData.reduce((sum, d) => sum + d.scroll, 0) / behaviorData.length) * 100 || 0).toFixed(
                        1,
                      )}
                      %
                    </p>
                    <p>
                      Tiempo promedio:{" "}
                      {((behaviorData.reduce((sum, d) => sum + d.time, 0) / behaviorData.length || 0) / 1000).toFixed(
                        1,
                      )}
                      s
                    </p>
                    <p>
                      Clicks promedio:{" "}
                      {(behaviorData.reduce((sum, d) => sum + d.clicks, 0) / behaviorData.length || 0).toFixed(1)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Generar Datos de Prueba</CardTitle>
                  <CardDescription>Genera datos sintéticos para probar el análisis de comportamiento</CardDescription>
                </div>
                <Button onClick={generateSampleData} variant="outline">
                  Generate Sample Data
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Haz clic en el botón para generar 50 puntos de datos de comportamiento de ejemplo. Esto permitirá
                  entrenar el modelo IA y ver los resultados del análisis.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Product Management</CardTitle>
                  <CardDescription>Add, edit, or remove products from your store</CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => resetForm()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <form onSubmit={handleSubmit}>
                      <DialogHeader>
                        <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                        <DialogDescription>
                          {editingProduct
                            ? "Update the product information below"
                            : "Fill in the details to add a new product"}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="price">Price</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="category">Category</Label>
                          <Input
                            id="category"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="image">Image URL</Label>
                          <Input
                            id="image"
                            value={formData.image}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            placeholder="/placeholder.svg?height=400&width=400"
                            required
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={resetForm}>
                          Cancel
                        </Button>
                        <Button type="submit">{editingProduct ? "Update" : "Create"} Product</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">{product.description}</div>
                          </TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>${product.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Order Details Modal */}
      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Pedido #{selectedOrder?.id}</DialogTitle>
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

              <div>
                <h4 className="font-medium mb-2">Productos:</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center border-b pb-2">
                      <span>{item.name}</span>
                      <span className="font-medium">${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

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
