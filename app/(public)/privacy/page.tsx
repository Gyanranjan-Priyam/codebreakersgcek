import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Clock, Mail, Phone, MapPin, Eye, Lock, Users, FileText } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">Privacy Policy</h1>
          </div>
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
            <Clock className="w-4 h-4" />
            <p>Last Updated: November 16, 2025</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="secondary">Event: CodeBreakers Techfest</Badge>
            <Badge variant="outline">Institution: Government College of Engineering Kalahandi, Bhawanipatna</Badge>
          </div>
        </div>

        <div className="space-y-6">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                1. Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                CodeBreakers ("we", "our", or "us") is the official technological festival of Government College of Engineering Kalahandi, Bhawanipatna. This Privacy Policy explains how we collect, use, store, and protect personal data of participants, volunteers, organizers, sponsors, and visitors who use our online platforms or register for the event.
              </p>
              <p>
                By accessing or using any CodeBreakers-related website, application, registration system, or communication channel, you consent to the practices described in this policy.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                2. Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p>We may collect the following types of personal and non-personal information:</p>
              
              <div>
                <h4 className="font-semibold mb-3">2.1 Personal Information</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Full Name</li>
                  <li>Email Address</li>
                  <li>Phone Number</li>
                  <li>College/Institution Name</li>
                  <li>Department, Year, and Course Details</li>
                  <li>Gender (optional)</li>
                  <li>Age/Date of Birth (if required for certain events)</li>
                  <li>Payment Information (for paid events or passes)</li>
                  <li>ID Proof or College ID (if required)</li>
                </ul>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">2.2 Technical & Usage Data</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>IP address</li>
                  <li>Browser type and device type</li>
                  <li>Operating system</li>
                  <li>Access time and usage logs</li>
                  <li>Clickstream data and interaction with website/app</li>
                </ul>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">2.3 Media & Content</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Photos, videos, or recordings taken during events</li>
                  <li>Submitted projects, presentations, or competition entries</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                3. How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Data collected is used strictly for legitimate fest-related purposes, including:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Event registration and participation tracking</li>
                <li>Verification and authentication of attendees</li>
                <li>Notifications and updates about events, schedules, and results</li>
                <li>Issuing certificates, awards, or participation benefits</li>
                <li>Safety, security, and access control within fest premises</li>
                <li>Improving website, app, and overall event experience</li>
                <li>Promoting CodeBreakers through photos or videos on media platforms</li>
              </ul>
            </CardContent>
          </Card>

          {/* How We Share Information */}
          <Card>
            <CardHeader>
              <CardTitle>4. How We Share Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We do not sell or rent your personal information. However, data may be shared with:</p>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="border border-border p-3 text-left font-semibold">Recipient Type</th>
                      <th className="border border-border p-3 text-left font-semibold">Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border p-3">Event Sponsors/Partners</td>
                      <td className="border border-border p-3">Limited recognition/validation for sponsored contests</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3">Technical service providers</td>
                      <td className="border border-border p-3">Hosting, registration systems, SMS/email communication</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3">Government or law enforcement</td>
                      <td className="border border-border p-3">Only if legally required</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3">College administration</td>
                      <td className="border border-border p-3">Event planning, reporting, and policy compliance</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p>Any third-party handling data is required to protect it as per standard safety practices.</p>
            </CardContent>
          </Card>

          {/* Data Storage & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                5. Data Storage & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We implement industry-standard security practices to safeguard user data, including:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Encrypted data transfer (HTTPS/SSL)</li>
                <li>Restricted access to authorized personnel only</li>
                <li>Secure storage servers and password-protected systems</li>
                <li>Regular monitoring and backups</li>
              </ul>
              <p className="text-muted-foreground">
                However, no online platform is 100% secure. Users participate and share information at their own discretion.
              </p>
            </CardContent>
          </Card>

          {/* Cookies & Tracking Technologies */}
          <Card>
            <CardHeader>
              <CardTitle>6. Cookies & Tracking Technologies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Our website/platform may use cookies for:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>User session management</li>
                <li>Saving login or preference settings</li>
                <li>Analytics and performance insights</li>
              </ul>
              <p>Users may disable cookies through browser settings, though some features may not function properly.</p>
            </CardContent>
          </Card>

          {/* Media, Photography & Consent */}
          <Card>
            <CardHeader>
              <CardTitle>7. Media, Photography & Consent</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>By participating in CodeBreakers, you acknowledge and consent that:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Photos, videos, and event recordings may include your image.</li>
                <li>These media may be used in promotional, digital, or printed materials.</li>
                <li>If you have objections, you may contact the organizing team to request exclusion where possible.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card>
            <CardHeader>
              <CardTitle>8. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We retain personal information only as long as necessary for:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Event operations and essential record keeping</li>
                <li>Certificate or award verification</li>
                <li>Legal or institutional reporting requirements</li>
              </ul>
              <p>Data that is no longer required will be securely deleted.</p>
            </CardContent>
          </Card>

          {/* Third-Party Links */}
          <Card>
            <CardHeader>
              <CardTitle>9. Third-Party Links</CardTitle>
            </CardHeader>
            <CardContent>
              <p>CodeBreakers platforms may contain links to external websites/apps. We are not responsible for the privacy practices or content of third-party platforms.</p>
            </CardContent>
          </Card>

          {/* Rights of Users */}
          <Card>
            <CardHeader>
              <CardTitle>10. Rights of Users</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>You may request the following (where applicable):</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Access to your stored personal information</li>
                <li>Correction of inaccurate or outdated data</li>
                <li>Deletion of data (unless legally or institutionally required to retain it)</li>
                <li>Opt-out of promotional or notification messages</li>
              </ul>
              <p>To request changes, contact the organizing committee using the details below.</p>
            </CardContent>
          </Card>

          {/* Children's Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>11. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p>CodeBreakers does not knowingly collect data from individuals below 16 years of age, unless submitting through a legal guardian or institutional authorization.</p>
            </CardContent>
          </Card>

          {/* Changes to This Policy */}
          <Card>
            <CardHeader>
              <CardTitle>12. Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p>We may update this Privacy Policy at any time. Changes will be posted with a revised "Last Updated" date. Continued use of CodeBreakers platforms implies acceptance of the updated policy.</p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                13. Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>For questions, concerns, or data-related requests, contact:</p>
              
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="font-semibold">CodeBreakers Organizing Committee</div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>Government College of Engineering Kalahandi, Bhawanipatna</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>Email: CodeBreakers.gcekbhawanipatna@gmail.com</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>Phone: 1234567890</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acknowledgment */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📌 Acknowledgment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">
                By accessing the CodeBreakers platform or registering for events, you acknowledge that you have read, understood, and agreed to this Privacy Policy.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t">
          <p className="text-muted-foreground">
            This Privacy Policy is designed to protect your data and ensure transparency in our data handling practices.
          </p>
        </div>
      </div>
    </div>
  );
}
