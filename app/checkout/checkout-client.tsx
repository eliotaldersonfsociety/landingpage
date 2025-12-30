// app/checkout/checkout-client.tsx
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { OrderConfirmation } from "@/components/order-confirmation";
import { createOrderAction, createOrderItemsAction } from "@/lib/actions/orders";
import { cartStorage, CartItem } from "@/lib/store";
import { useConversionScore } from "@/hooks/useConversionScore";

declare global {
  interface Window {
    paypal: any;
  }
}

export default function CheckoutClient() {
  const { setTheme } = useTheme();
  const score = useConversionScore();
  const paypalContainerRef = useRef<HTMLDivElement>(null);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>(""); // ✅ nuevo campo opcional
  const [additionalInfo, setAdditionalInfo] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [orderConfirmed, setOrderConfirmed] = useState<boolean>(false);
  const [scriptLoaded, setScriptLoaded] = useState<boolean>(false);
  const [paypalRendered, setPaypalRendered] = useState<boolean>(false);

  useEffect(() => {
    setTheme("light");
    setCartItems(cartStorage.get());
  }, [setTheme]);

  const total = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }, [cartItems]);

  const orderItems = cartItems.flatMap((item) =>
    Array(item.quantity).fill({
      name: item.name,
      price: item.price,
    })
  );

  useEffect(() => {
    if (window.paypal) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`;
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => setError("Failed to load PayPal");

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (!scriptLoaded || total <= 0 || paypalRendered || !paypalContainerRef.current) return;

    window.paypal
      .Buttons({
        createOrder: (_: any, actions: any) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: { value: total.toFixed(2) },
              },
            ],
          });
        },

        onApprove: async (_: any, actions: any) => {
          try {
            const details = await actions.order.capture();

            // ✅ Email: usa el del formulario o el de PayPal
            let finalEmail = email.trim();
            if (!finalEmail) {
              finalEmail = details.payer?.email_address?.trim() || "";
            }

            // ✅ Nombre: usa el del formulario o el de PayPal
            let finalName = name.trim();
            if (!finalName) {
              finalName = (details.payer?.name?.given_name || "") + " " + (details.payer?.name?.surname || "");
              finalName = finalName.trim();
            }

            // ✅ Validar email
            if (!finalEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(finalEmail)) {
              setError("We need a valid email to send your receipt. Please enter one or log in to PayPal.");
              return;
            }

            const orderFormData = new FormData();
            orderFormData.append("total", total.toString());
            orderFormData.append("status", "completed");
            orderFormData.append("paymentMethod", "paypal");
            orderFormData.append("paypalOrderId", details.id);
            orderFormData.append("customerEmail", finalEmail);
            if (finalName) orderFormData.append("customerName", finalName);
            orderFormData.append("additionalInfo", additionalInfo);

            const orderResult = await createOrderAction(orderFormData);
            if (!orderResult.success) throw new Error(orderResult.error);

            const orderId = orderResult.data?.order?.id;
            if (!orderId) throw new Error("Order ID missing");

            const itemsFormData = new FormData();
            itemsFormData.append("orderId", orderId.toString());
            itemsFormData.append("items", JSON.stringify(orderItems));

            const itemsResult = await createOrderItemsAction(itemsFormData);
            if (!itemsResult.success) throw new Error(itemsResult.error);

            cartStorage.clear();
            setOrderConfirmed(true);
          } catch (err: any) {
            setError(err.message || "Payment failed. Please try again.");
          }
        },

        onError: () => {
          setError("PayPal error. Please try again.");
        },
      })
      .render(paypalContainerRef.current);

    setPaypalRendered(true);
  }, [scriptLoaded, total, paypalRendered, orderItems, additionalInfo, email, name]);

  if (orderConfirmed) {
    const confirmationItems = cartItems.map((item) => ({
      name: `${item.name} x${item.quantity}`,
      price: (item.price * item.quantity).toFixed(2),
    }));

    return (
      <div className="min-h-screen container mx-auto px-4 flex items-center justify-center">
        <OrderConfirmation items={confirmationItems} />
      </div>
    );
  }

  return (
    <div className="min-h-screen container mx-auto px-4 py-10">
      <h1 className="text-4xl font-black text-center uppercase mb-6">
        Complete your <span className="text-[#FF8A00]">purchase</span>
      </h1>

      {score < 0.35 && (
        <p className="text-red-600 text-center font-semibold">
          ⚠️ High demand — limited stock
        </p>
      )}
      {score >= 0.35 && score < 0.7 && (
        <p className="text-orange-500 text-center">🔥 Customers are buying right now</p>
      )}
      {score >= 0.7 && (
        <p className="text-green-600 text-center">✅ Secure checkout</p>
      )}

      <div className="max-w-2xl mx-auto space-y-6 mt-6">
        {/* EMAIL & NAME */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                We’ll send your receipt here. If left blank, we’ll use your PayPal email.
              </p>
            </div>

            <div>
              <Label htmlFor="name">Name (optional)</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Leave blank to use your PayPal name.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* SUMMARY */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {cartItems.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              <>
                {cartItems.map((item, i) => (
                  <div key={i} className="flex justify-between py-1">
                    <span>{item.name} × {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold mt-3 pt-3 border-t">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* PAYPAL */}
        <Card>
          <CardHeader>
            <CardTitle>Payment</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div ref={paypalContainerRef} className="flex justify-center" />
            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
          </CardContent>
        </Card>

        {/* NOTES */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="e.g., gift message, delivery instructions"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}