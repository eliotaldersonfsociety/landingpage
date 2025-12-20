import { Receipt, CheckCircle, FileCheck, Truck, Smile } from "lucide-react"

export function OrderProcess() {
  const steps = [
    { icon: Receipt, label: "Order Received" },
    { icon: CheckCircle, label: "Payment Approved" },
    { icon: FileCheck, label: "Order Processed" },
    { icon: Truck, label: "Order Shipped" },
    { icon: Smile, label: "Happy Customer" },
  ]

  return (
    <div className="flex items-center justify-center gap-8 py-2">
      {steps.map((step, index) => (
        <div key={index} className={`flex flex-col items-center gap-2 relative ${index >= 3 ? 'hidden md:flex' : ''}`}>
          <div className="flex items-center justify-center w-16 h-16 rounded-full text-white">
            <step.icon className="w-8 h-8" />
          </div>
          <span className="text-sm font-medium text-center">{step.label}</span>
          {index < steps.length - 1 && (
            <div className={`absolute top-8 left-full w-8 h-0.5 bg-yellow-500 transform -translate-x-1/2 ${index >= 2 ? 'hidden md:block' : ''}`}></div>
          )}
        </div>
      ))}
    </div>
  )
}