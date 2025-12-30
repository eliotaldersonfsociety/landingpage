// app/complete-profile/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { Dumbbell } from "lucide-react";
import { NavigationMenu } from "@/components/ui/navigation-menu";

function CompleteProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [department, setDepartment] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/complete-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          name,
          address,
          city,
          department,
          whatsappNumber,
        }),
      });

      if (response.ok) {
        // ✅ Redirige a página de éxito
        router.push(`/success?orderId=${orderId}`);
      } else {
        throw new Error("Failed to update order");
      }
    } catch (error) {
      toast({ title: "Error", description: "Could not save your info. Try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-0 text-center">
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 pt-16">
        <div className="w-full max-w-md space-y-8">
          <div className="flex justify-center">
            <Dumbbell className="h-10 w-10 text-orange-500" />
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-orange-500">
                Complete Your <span className="text-purple-600">Order</span>
              </h1>
              <p className="mt-2 text-sm text-gray-400">
                Please provide your shipping details
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-purple-600">Full Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-purple-600">Address *</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="text-purple-600">City *</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department" className="text-purple-600">Department *</Label>
                <Input
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsappNumber" className="text-purple-600">WhatsApp Number *</Label>
                <Input
                  id="whatsappNumber"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-500 text-white hover:bg-orange-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Complete Order"}
              </Button>
            </form>
          </div>
        </div>
      </div>
      <NavigationMenu />
    </div>
  );
}

export default function CompleteProfile() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CompleteProfileContent />
    </Suspense>
  );
}