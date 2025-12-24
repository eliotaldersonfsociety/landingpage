"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 text-sm leading-relaxed">
            
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Information We Collect and Sources Thereof</h2>
              <p>
                TiendaTexas ("we," "us," "our") may collect, store, process, and utilize a wide array of information about you ("Personal Information" or "Data") through multiple channels, including but not limited to: (a) information you voluntarily provide when registering an account, placing an order, subscribing to newsletters, filling out forms, participating in surveys, contacting customer support, or otherwise interacting with our website (tiendatexas.com) or affiliated platforms; such information may include your full legal name, email address, postal or shipping address, billing address, telephone number, payment card details (processed securely via third-party payment processors and not stored on our servers), date of birth, gender, preferences, feedback, and any other data you choose to submit; (b) automatically collected technical data gathered through your device and browser when accessing our website, including your IP address, device type, operating system, browser type and version, unique device identifiers, mobile network information, geolocation data (with your consent where required), browsing behavior, page views, clickstream data, session duration, referral URLs, and cookies or similar tracking technologies; (c) information obtained from third-party sources such as social media platforms (if you log in via Facebook, Google, or other providers), advertising networks, analytics providers, data brokers, or business partners, which may include demographic data, inferred interests, purchase history, or online behavioral patterns; and (d) publicly available information from government records, commercial databases, or other lawful sources. By using our website or services, you expressly consent to the collection, processing, and retention of all such information, regardless of its sensitivity or origin, and acknowledge that some data may be collected even if you do not complete a transaction or create an account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Purposes of Processing and Legal Bases</h2>
              <p>
                We use the Personal Information we collect for a variety of business, operational, legal, and security purposes, including but not limited to: (i) providing, operating, maintaining, securing, and improving our website, products, services, and user experience; (ii) processing and fulfilling your orders, managing payments (through PCI-compliant third-party gateways such as Stripe or PayPal), handling shipping logistics, and communicating order status; (iii) personalizing content, recommendations, advertisements, and user interface elements based on your preferences and behavior; (iv) conducting internal research, analytics, and reporting to understand user trends, optimize performance, and develop new features; (v) sending administrative communications such as service announcements, security alerts, policy updates, or responses to your inquiries; (vi) preventing, detecting, investigating, and mitigating fraudulent, abusive, illegal, or unauthorized activities, including account takeovers, payment fraud, or violations of our Terms of Service; (vii) complying with applicable laws, regulations, legal processes, governmental requests, or industry standards, which may include retaining data for tax, audit, or legal hold purposes; and (viii) any other purpose disclosed to you at the time of collection or for which you have provided explicit consent. Our legal bases for processing include contractual necessity (to fulfill your orders), legitimate interests (such as fraud prevention and service improvement), legal compliance, and, where required by law, your explicit consent. You acknowledge that certain features of the website may not function properly if you restrict or disable data collection.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Disclosure and Sharing of Information with Third Parties</h2>
              <p>
                While we do not sell, rent, or trade your Personal Information to unrelated third parties for their own marketing purposes without your affirmative opt-in consent where legally required, we may disclose or share your data in the following circumstances: (a) with service providers, vendors, and business partners who perform functions on our behalf, such as payment processors (e.g., Stripe, PayPal), shipping carriers (e.g., FedEx, UPS), cloud hosting providers (e.g., AWS, Vercel), email delivery services (e.g., Resend, SendGrid), customer support platforms, marketing automation tools, analytics providers (e.g., Google Analytics, Meta Pixel), and fraud detection services; these third parties are contractually obligated to use your data only as instructed by us and in compliance with applicable data protection laws; (b) in connection with any merger, acquisition, reorganization, sale of assets, bankruptcy, or insolvency event, where your information may be transferred as part of the business assets; (c) to comply with legal obligations, court orders, subpoenas, or government investigations, or to protect our rights, property, safety, or the rights of others; (d) with your explicit consent or at your direction, such as when you choose to share content via social media; and (e) in aggregated or anonymized form that cannot reasonably be used to identify you, for statistical, research, or marketing purposes. Please note that once your data is shared with third parties, their use of it is governed by their own privacy policies, over which we exercise no control and assume no responsibility.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. International Data Transfers and Storage</h2>
              <p>
                Your Personal Information may be transferred to, processed in, and stored on servers located in the United States of America or other jurisdictions whose data protection laws may not be deemed equivalent to those in your country of residence (including but not limited to the European Economic Area, the United Kingdom, or Colombia). By using our website and providing your information, you explicitly consent to such international transfers and acknowledge that your data will be subject to the laws of the United States, including provisions that may permit access by U.S. government authorities under national security or surveillance frameworks such as FISA Section 702 or Executive Order 12333. We implement appropriate safeguards, such as Standard Contractual Clauses (SCCs) where applicable, to protect your data during cross-border transfers; however, you understand and agree that absolute data sovereignty cannot be guaranteed in a global digital environment, and you waive any claims arising from such transfers to the fullest extent permitted by law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Data Retention and Deletion Policies</h2>
              <p>
                We retain your Personal Information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law (such as for tax, accounting, or legal compliance purposes). For example, transaction records may be retained for up to seven (7) years to comply with financial regulations, while account information may be kept until you request deletion or for a reasonable period thereafter to prevent abuse or re-registration by banned users. After the retention period expires, we will either securely delete or anonymize your data so that it can no longer be associated with you. However, we may retain non-identifiable, aggregated, or backup copies of your data indefinitely for analytical, archival, or legal purposes. You acknowledge that complete and immediate deletion of all data across all systems (including backups, logs, and third-party platforms) may not be technically feasible, and we disclaim any liability for residual data that persists due to standard IT operational practices.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Cookies, Tracking Technologies, and Behavioral Advertising</h2>
              <p>
                We and our third-party partners use cookies, web beacons, pixel tags, local storage, and similar tracking technologies ("Tracking Technologies") to collect data about your online activities across our website and other sites over time. These technologies help us recognize your browser or device, remember your preferences, analyze traffic patterns, measure marketing campaign effectiveness, and deliver targeted advertisements. We categorize these as: (i) strictly necessary cookies (required for basic site functionality, which cannot be disabled); (ii) performance/analytics cookies (used to understand how visitors interact with our site); (iii) functional cookies (to remember choices like language or region); and (iv) advertising/targeting cookies (to build a profile of your interests and show relevant ads). While you may manage cookie preferences through your browser settings or via our cookie consent banner (if implemented), please note that disabling non-essential cookies may degrade your user experience, prevent access to certain features, or render parts of the website non-functional. Additionally, third-party advertisers may use their own tracking mechanisms independent of our control, and we are not responsible for their practices. Do Not Track (DNT) signals sent by your browser are not currently honored by our systems.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Your Rights and How to Exercise Them (With Limitations)</h2>
              <p>
                Depending on your jurisdiction, you may have certain rights regarding your Personal Information, including the right to access, correct, delete, restrict processing, object to processing, or request data portability. To exercise these rights, you may contact us at privacy@tiendatexas.com with sufficient identification to verify your identity and prevent unauthorized disclosure. However, please be advised that these rights are not absolute and may be limited or denied in accordance with applicable law — for example, if fulfilling your request would violate legal obligations, compromise security, infringe upon the rights of others, or be technically infeasible. We may also charge a reasonable fee or refuse repeated or manifestly unfounded requests. Requests for deletion do not apply to data we are required to retain for legal or legitimate business purposes. Furthermore, we are under no obligation to respond to requests submitted through automated means, third parties, or without proper verification. We aim to respond to valid requests within thirty (30) days, though this period may be extended by an additional sixty (60) days where necessary, with notice to you. You also have the right to unsubscribe from marketing emails by clicking the "unsubscribe" link in any such message, though this will not affect transactional or service-related communications.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Security Measures and Disclaimers</h2>
              <p>
                We employ a combination of administrative, technical, and physical safeguards designed to protect your Personal Information from unauthorized access, use, disclosure, alteration, or destruction, including encryption in transit (via TLS 1.2+), secure authentication protocols, firewalls, access controls, and regular security assessments. However, you acknowledge and agree that no data transmission over the internet or electronic storage system can be guaranteed to be 100% secure, and we explicitly disclaim any warranty, express or implied, regarding the absolute security of your data. In the unlikely event of a data breach that poses a risk to your rights and freedoms, we will notify affected users and relevant authorities as required by law, but we shall not be liable for any damages resulting from such a breach, including but not limited to financial loss, identity theft, or reputational harm, to the maximum extent permitted by applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Changes to This Privacy Policy</h2>
              <p>
                We reserve the right to modify, amend, or update this Privacy Policy at any time, for any reason, without prior notice to you, except where advance notice is required by law. Changes will be effective immediately upon posting the revised policy on this page with an updated "Last updated" date. Your continued use of the TiendaTexas website after such modifications constitutes your acceptance of the updated terms. We encourage you to review this page periodically for the latest information on our privacy practices. Historical versions of this policy will not be maintained, and all references shall be to the current version only.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Contact Information and Dispute Resolution</h2>
              <p>
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, you may contact our Privacy Team exclusively via email at privacy@tiendatexas.com. Please allow up to ten (10) business days for a response. Note that we do not accept legal notices, data subject requests, or formal complaints via social media, phone, postal mail, or in-person communication. All disputes arising from this Privacy Policy shall be governed by the Terms and Conditions of TiendaTexas, including mandatory binding arbitration and waiver of class actions, as further detailed therein. By using our website, you agree that electronic communication satisfies any legal requirement for written notice.
              </p>
            </section>

            <section className="pt-6 border-t">
              <p className="text-xs text-muted-foreground italic">
                Last updated: December 24, 2025. This Privacy Policy is intentionally comprehensive, protective of TiendaTexas interests, and subject to unilateral modification.
              </p>
            </section>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}