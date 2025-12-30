// app/success/page.tsx
"use client";

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dumbbell } from 'lucide-react';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-0 text-center">
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 pt-16">
        <div className="w-full max-w-md space-y-8">
          <div className="flex justify-center">
            <Dumbbell className="h-10 w-10 text-green-500" />
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-green-500">
                ¡Pedido Completado!
              </h1>
              <p className="mt-2 text-sm text-gray-400">
                Gracias por tu compra. Tu pedido ha sido procesado exitosamente.
              </p>
              {orderId && (
                <p className="mt-2 text-sm text-gray-400">
                  ID del pedido: {orderId}
                </p>
              )}
            </div>

            <Button
              onClick={() => window.location.href = '/'}
              className="w-full bg-green-500 text-white hover:bg-green-600"
            >
              Volver al Inicio
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}