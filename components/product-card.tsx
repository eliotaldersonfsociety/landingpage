// components/product-card.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import type { Product } from "@/lib/store";
import { DynamicPricing } from "@/components/dynamic-pricing";

declare global {
  interface Window {
    paypal: any;
  }
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  const [paypalScriptLoaded, setPaypalScriptLoaded] = useState(false);
  const [paypalRendered, setPaypalRendered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ===============================
     OBSERVER: PRODUCT IN VIEW
  =============================== */
  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && !paypalScriptLoaded) {
          loadPayPalScript();
        }
      },
      { threshold: 0.6 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  /* ===============================
     LOAD PAYPAL SDK
  =============================== */
  const loadPayPalScript = () => {
    if (window.paypal) {
      setPaypalScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`;
    script.async = true;
    script.onload = () => setPaypalScriptLoaded(true);
    script.onerror = () => setError("Failed to load PayPal");
    document.body.appendChild(script);
  };

  /* ===============================
     RENDER PAYPAL BUTTON (when in view)
  =============================== */
  useEffect(() => {
    if (!inView || !paypalScriptLoaded || paypalRendered) return;

    const paypalContainer = document.getElementById(`paypal-button-container-${product.id}`);
    if (!paypalContainer) return;

    // Limpiar contenedor previo
    paypalContainer.innerHTML = "";

    interface PayPalDetails {
      id: string;
      payer?: {
      email_address?: string;
      name?: {
        given_name?: string;
        surname?: string;
      };
      };
    }

    interface OrderPayload {
      productId: string;
      productName: string;
      price: number;
      paypalOrderId: string;
      payerEmail?: string;
      payerName: string;
    }

    interface PayPalActions {
      order: {
      create: (config: {
        purchase_units: Array<{
        amount: { value: string };
        description: string;
        }>;
      }) => Promise<string>;
      capture: () => Promise<PayPalDetails>;
      };
    }

    window.paypal
      .Buttons({
      createOrder: (_: any, actions: PayPalActions) => {
        return actions.order.create({
        purchase_units: [
          {
          amount: { value: product.price.toFixed(2) },
          description: product.name,
          },
        ],
        });
      },
      onApprove: async (_: any, actions: PayPalActions) => {
        try {
        const details: PayPalDetails = await actions.order.capture();

        const orderPayload: OrderPayload = {
          productId: product.id,
          productName: product.name,
          price: product.price,
          paypalOrderId: details.id,
          payerEmail: details.payer?.email_address,
          payerName: `${details.payer?.name?.given_name || ""} ${details.payer?.name?.surname || ""}`.trim(),
        };

        const response = await fetch("/api/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload),
        });

        if (response.ok) {
          const data = await response.json();
          window.location.href = `/complete-profile?orderId=${data.orderId}`;
        } else {
          alert("Order created, but confirmation failed. Contact support.");
        }
        } catch (err: unknown) {
        console.error(err);
        alert("Payment succeeded, but order failed. Contact support.");
        }
      },
      onError: (err: Error) => {
        console.error("PayPal error:", err);
        setError("Payment failed. Please try again.");
      },
      })
      .render(paypalContainer);

    setPaypalRendered(true);
  }, [inView, paypalScriptLoaded, paypalRendered, product.id, product.name, product.price]);

  return (
    <div ref={ref}>
      <Card
        className={`
          group overflow-hidden transition-all duration-300
          ${inView ? "ring-[0.5px] ring-green-400 shadow-lg" : "hover:shadow-lg"}
        `}
      >
        <CardContent className="p-0">
          <div className="relative h-64 overflow-hidden bg-muted">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
            <Badge className="absolute top-3 right-3 bg-amber-400">
              {product.category}
            </Badge>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col items-center gap-3 p-6">
          <div className="flex-1 w-full text-center">
            <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {product.description}
            </p>

            <div className="mt-4 text-green-600 font-semibold">
              <DynamicPricing basePrice={product.price} productId={product.id} />
            </div>
          </div>

          {/* PAYPAL BUTTON CONTAINER */}
          <div
            id={`paypal-button-container-${product.id}`}
            className="w-full min-h-[50px] flex items-center justify-center"
          >
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {!paypalScriptLoaded && inView && (
              <p className="text-muted-foreground text-sm">Loading payment...</p>
            )}
          </div>

          {/* PAYMENT LOGOS — SOLO CUANDO ESTÁ EN VERDE */}
          {inView && (
            <>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span className="text-[11px]">Pay secure with</span>
                <Image src="/paypal.svg" alt="PayPal" width={32} height={20} />
                <Image src="/visa.svg" alt="Visa" width={32} height={20} />
                <Image src="/mastercard.svg" alt="Mastercard" width={32} height={20} />
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Truck />
                <span> Ships from <strong>Hot Springs, TX</strong> · 1 business day</span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                ✔ No hidden fees · ✔ Safe & encrypted payment
              </div>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}