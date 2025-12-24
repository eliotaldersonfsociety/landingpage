"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { getUserOrdersAction } from "@/lib/actions/orders"
import { getCurrentUser } from "@/lib/actions/login"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header/header"
import { Footer } from "@/components/footer"

interface Order {
  id: number
  total: number
  status: string
  paymentProof?: string | null
  paymentMethod?: string | null
  paypalOrderId?: string | null
  additionalInfo?: string | null
  items: Array<{
    id: number
    name: string
    price: number
  }>
}

export default function DashboardPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResult, ordersResult] = await Promise.all([
          getCurrentUser(),
          getUserOrdersAction()
        ])

        if (userResult) {
          setCurrentUser(userResult)
        } else {
          // Redirect to login if no user
          router.push('/login')
          return
        }

        if (ordersResult.success && ordersResult.data?.orders) {
          setOrders(ordersResult.data.orders)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-0 text-center">
      <Header />
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground">My <span className="text-orange-500">Dashboard</span></h1>
          <p className="mt-2 text-lg text-gray-600">Welcome back, {currentUser?.name || currentUser?.email}</p>
        </div>

        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">{currentUser?.name || "Not specified"}</p>
              <p className="text-sm text-gray-600">{currentUser?.email}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Number of Purchases</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{orders.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Purchase History */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Purchase History</h2>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">You haven't made any purchases yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.map((order) => (
                <Card key={order.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
                  setSelectedOrder(order)
                  setModalOpen(true)
                }}>
                  <CardHeader>
                    <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                    <Badge variant={order.status === 'pending' ? 'secondary' : order.status === 'completed' ? 'default' : order.status === 'confirmed' ? 'outline' : 'default'}>
                      {order.status === 'pending' ? 'Order Received' : order.status === 'completed' ? 'Payment Completed' : order.status === 'confirmed' ? 'Payment Confirmed' : 'Product Shipped'}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-600">${order.total.toFixed(2)}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {order.items.length} product{order.items.length !== 1 ? 's' : ''}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details #{selectedOrder?.id}</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Badge variant={selectedOrder.status === 'pending' ? 'secondary' : selectedOrder.status === 'completed' ? 'default' : selectedOrder.status === 'confirmed' ? 'outline' : 'default'}>
                    {selectedOrder.status === 'pending' ? 'Order Received' : selectedOrder.status === 'completed' ? 'Payment Completed' : selectedOrder.status === 'confirmed' ? 'Payment Confirmed' : 'Product Shipped'}
                  </Badge>
                  <p className="text-2xl font-bold">${selectedOrder.total.toFixed(2)}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Products:</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center border-b pb-2">
                        <span>{item.name}</span>
                        <span className="font-medium">${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {(selectedOrder.paymentMethod || selectedOrder.paypalOrderId) && (
                  <div>
                    <h4 className="font-medium mb-2">Payment Information:</h4>
                    <div className="space-y-1 text-sm">
                      {selectedOrder.paymentMethod && (
                        <p><span className="font-medium">Payment Method:</span> {selectedOrder.paymentMethod === 'paypal' ? 'PayPal' : selectedOrder.paymentMethod}</p>
                      )}
                      {selectedOrder.paypalOrderId && (
                        <p><span className="font-medium">PayPal Order ID:</span> {selectedOrder.paypalOrderId}</p>
                      )}
                    </div>
                  </div>
                )}

                {selectedOrder.additionalInfo && (
                  <div>
                    <h4 className="font-medium mb-2">Additional Information:</h4>
                    <p className="text-sm text-gray-600">{selectedOrder.additionalInfo}</p>
                  </div>
                )}

                {selectedOrder.paymentProof && (
                  <div>
                    <h4 className="font-medium mb-2">Payment Proof:</h4>
                    <div className="border rounded-lg p-4">
                      <Image
                        src={selectedOrder.paymentProof}
                        alt="Payment proof"
                        width={400}
                        height={300}
                        className="w-full h-auto rounded"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
        </div>
      </main>
      <Footer />
    </div>
  )
}