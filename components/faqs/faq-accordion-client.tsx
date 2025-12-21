"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface FAQ {
  question: string
  answer: string
}

interface FAQAccordionClientProps {
  faqs: FAQ[]
}

export function FAQAccordionClient({ faqs }: FAQAccordionClientProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((faq, index) => (
        <AccordionItem key={index} value={`item-${index}`}>
          <AccordionTrigger className="text-lg text-left">
            {faq.question}
          </AccordionTrigger>

          <AccordionContent className="text-base text-left text-muted-foreground">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
