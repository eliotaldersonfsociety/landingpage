"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, MessageCircle, Clock } from "lucide-react"
import { sendContactEmail } from "@/lib/actions/contact"

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    const formDataToSend = new FormData()
    formDataToSend.append('name', formData.name)
    formDataToSend.append('email', formData.email)
    formDataToSend.append('subject', formData.subject)
    formDataToSend.append('message', formData.message)

    const result = await sendContactEmail(formDataToSend)

    if (result.success) {
      setMessage("Message sent successfully!")
      setFormData({ name: "", email: "", subject: "", message: "" })
    } else {
      setMessage(result.error || "Failed to send message")
    }

    setLoading(false)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <>
      {/* CONTACT SECTION */}
      <section className="py-10 px-4">
        <div className="mx-auto max-w-6xl space-y-12">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white text-center">
              CONTACT <span className="text-orange-500">US</span>
            </h1>
            <p className="mt-3 text-muted-foreground text-center">
              Get in touch with our support team. We're here to help!
            </p>
          </div>

          {/* Content */}
          <div className="grid gap-8 md:grid-cols-2">
            {/* Left info */}
            <div className="space-y-6">
              <InfoCard
                icon={<Mail />}
                title="Email Support"
                description="Get help with your orders and technical issues"
              >
                <p className="font-medium text-white">
                  support@tiendatexas.com
                </p>
                <p className="text-xs text-muted-foreground">
                  Response time: 24–48 hours
                </p>
              </InfoCard>

              <InfoCard
                icon={<MessageCircle />}
                title="Live Chat"
                description="Instant support for urgent issues"
              >
                <p className="text-white">
                  Available 24/7 on our Discord server
                </p>
                <p className="text-xs text-muted-foreground">
                  Join our community for real-time help
                </p>
              </InfoCard>

              <InfoCard
                icon={<Clock />}
                title="Business Hours"
                description="When our team is available"
              >
                <p className="text-sm text-muted-foreground">
                  Monday – Friday: 9:00 AM – 6:00 PM EST
                </p>
                <p className="text-sm text-muted-foreground">
                  Saturday: 10:00 AM – 4:00 PM EST
                </p>
                <p className="text-sm text-muted-foreground">
                  Sunday: Emergency support only
                </p>
              </InfoCard>
            </div>

            {/* Right form */}
            <Card className="border-neutral-800 bg-neutral-900">
              <CardHeader>
                <CardTitle className="text-white">
                  Send us a Message
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Fill out the form and we’ll get back to you as soon as possible.
                </p>
              </CardHeader>

              <CardContent>
                {message && (
                  <p className={`text-sm ${message.includes('success') ? 'text-green-500' : 'text-red-500'}`}>
                    {message}
                  </p>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Name</Label>
                      <Input
                        name="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={handleChange}
                        className="focus-visible:ring-orange-500"
                        required
                      />
                    </div>

                    <div>
                      <Label>Email</Label>
                      <Input
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="focus-visible:ring-orange-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Subject</Label>
                    <Input
                      name="subject"
                      placeholder="How can we help?"
                      value={formData.subject}
                      onChange={handleChange}
                      className="focus-visible:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <Label>Message</Label>
                    <Textarea
                      name="message"
                      placeholder="Tell us more about your inquiry..."
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      className="focus-visible:ring-orange-500"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-orange-500 text-black hover:bg-orange-600"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white">
              FREQUENTLY ASKED <span className="text-orange-500">QUESTIONS</span>
            </h2>
            <p className="mt-3 text-muted-foreground">
              Everything you need to know about our viral products
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <FaqCard
              title="How long does shipping take?"
              text="Orders are processed within 24–48 hours. Delivery usually takes 3–7 business days depending on your location."
            />
            <FaqCard
              title="Are the products original?"
              text="Yes. All products sold at Tienda Texas are 100% original and carefully selected viral items."
            />
            <FaqCard
              title="Can I return or exchange a product?"
              text="We offer a 30-day return policy for unused products in original packaging."
            />
            <FaqCard
              title="What payment methods do you accept?"
              text="We accept credit & debit cards, Zelle, Cash App and cash payments depending on availability."
            />
            <FaqCard
              title="Are these products for kids and adults?"
              text="Yes. Our viral products are perfect for both kids and adults."
            />
            <FaqCard
              title="Is my information secure?"
              text="Yes. We use industry-standard encryption and security practices."
            />
          </div>

          <div className="pt-10 text-center">
            <p className="text-sm text-muted-foreground">
              Still have questions?
            </p>
            <p className="mt-2 font-semibold text-orange-500 hover:underline cursor-pointer">
              Contact our support team
            </p>
          </div>
        </div>
      </section>
    </>
  )
}

/* INFO CARD */
function InfoCard({
  icon,
  title,
  description,
  children
}: {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <Card className="border-neutral-800 bg-neutral-900">
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20 text-orange-500">
          {icon}
        </div>
        <div>
          <CardTitle className="text-white">{title}</CardTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

/* FAQ CARD */
function FaqCard({
  title,
  text
}: {
  title: string
  text: string
}) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 transition hover:border-orange-500/40">
      <h3 className="mb-3 text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  )
}
