import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Clock, Mail, Phone, MapPin, Users, Shield, Gavel, Award, Camera, AlertTriangle, Settings } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FileText className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">Terms & Conditions</h1>
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
          {/* Acceptance of Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gavel className="w-5 h-5" />
                1. Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                By registering, attending, or participating in CodeBreakers ("Event"), you agree to abide by these Terms & Conditions, all event rules, and any guidelines issued by the Organizing Committee of CodeBreakers and Government College of Engineering Kalahandi, Bhawanipatna.
              </p>
              <p className="text-muted-foreground font-medium">
                If you do not agree to these terms, you should not participate in or engage with the event or its platforms.
              </p>
            </CardContent>
          </Card>

          {/* Eligibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                2. Eligibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Participation may be open to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Students of GCEK and other institutions</li>
                <li>Individuals/teams meeting event-specific criteria</li>
                <li>Guests, sponsors, speakers, and industry partners (as invited)</li>
              </ul>
              <p className="text-muted-foreground">
                Organizers reserve the right to verify eligibility and disqualify participants who provide false information.
              </p>
            </CardContent>
          </Card>

          {/* Registration & Participation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                3. Registration & Participation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc pl-6 space-y-2">
                <li>All participants must complete the official registration process.</li>
                <li>Information submitted must be accurate and truthful.</li>
                <li>Certain events may have limited seats and are confirmed on a first-come, first-served basis.</li>
                <li>Registration fees (if applicable) are non-refundable, unless the event is cancelled by organizers.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Conduct & Behavior */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                4. Conduct & Behavior
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Participants agree to maintain discipline and respectful behavior. The following are prohibited:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Harassment, abuse, discrimination, or offensive behavior</li>
                <li>Damage to venue, equipment, or property</li>
                <li>Possession or consumption of alcohol, drugs, or prohibited substances</li>
                <li>Plagiarism, cheating, or rule manipulation during events</li>
              </ul>
              <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
                <p className="text-destructive font-medium">
                  Violation may lead to disqualification, campus restrictions, or legal action if required.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Event Rules & Judging */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                5. Event Rules & Judging
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc pl-6 space-y-2">
                <li>Each competition or activity may have additional rules, which are binding.</li>
                <li><strong>Judges' decisions are final and not subject to dispute.</strong></li>
                <li>Any attempt to influence results unfairly may result in disqualification.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle>6. Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc pl-6 space-y-2">
                <li>Participants must submit original work for competitions.</li>
                <li>Entries may be used by organizers for event promotion, documentation, or showcasing achievements while giving due credit.</li>
                <li>Participants retain ownership of their work unless otherwise stated in specific event terms.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Photography, Videography & Media Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                7. Photography, Videography & Media Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>By attending CodeBreakers, participants consent to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Being photographed or recorded during the event</li>
                <li>Use of images/video in promotional, educational, or media publications</li>
                <li>Sharing event highlights on digital and social platforms</li>
              </ul>
              <p className="text-muted-foreground">
                To request exclusion from media use (where possible), participants must notify organizers in writing.
              </p>
            </CardContent>
          </Card>

          {/* Technology, Equipment & Safety */}
          <Card>
            <CardHeader>
              <CardTitle>8. Technology, Equipment & Safety</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc pl-6 space-y-2">
                <li>Participants are responsible for personal belongings, devices, and equipment.</li>
                <li>Organizers are not liable for lost, stolen, or damaged property.</li>
                <li>Participants must follow safety rules in labs, workshops, and technical arenas.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Liability & Disclaimer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                9. Liability & Disclaimer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc pl-6 space-y-2">
                <li>Participants attend the event at their own risk.</li>
                <li>Organizers are not responsible for injury, health issues, or property damage.</li>
                <li>Event schedules, speakers, sponsors, and rules may change without prior notice.</li>
                <li>If unforeseen circumstances occur (weather, emergencies, government orders), organizers may modify, postpone, or cancel events.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Third-Party Services & Links */}
          <Card>
            <CardHeader>
              <CardTitle>10. Third-Party Services & Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>CodeBreakers platforms may use/interact with systems provided by third parties for:</p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Registrations, payments, certificates, or communication</li>
              </ul>
              <p className="text-muted-foreground">
                Organizers are not responsible for third-party policies, outages, or data handling practices.
              </p>
            </CardContent>
          </Card>

          {/* Data Usage & Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>11. Data Usage & Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc pl-6 space-y-2">
                <li>Personal information may be collected for event administration and communication.</li>
                <li>By participating, you agree to our Privacy Policy and consent to authorized usage of your information for event purposes.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Certificates, Awards & Prizes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                12. Certificates, Awards & Prizes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc pl-6 space-y-2">
                <li>Certificates will be issued only to eligible and verified participants.</li>
                <li>Prizes must be claimed within deadlines announced by organizers.</li>
                <li>Organizers are not obligated to replace unclaimed awards after the event closes.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Cancellation & Refund Policy */}
          <Card>
            <CardHeader>
              <CardTitle>13. Cancellation & Refund Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc pl-6 space-y-2">
                <li>Organizers may cancel or change event details if required.</li>
                <li>Refunds (if applicable) are processed only when an event is cancelled by organizers.</li>
                <li><strong>No refunds for participant withdrawal or disqualification.</strong></li>
              </ul>
            </CardContent>
          </Card>

          {/* Governing Law & Jurisdiction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gavel className="w-5 h-5" />
                14. Governing Law & Jurisdiction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc pl-6 space-y-2">
                <li>These Terms & Conditions are governed by the laws and jurisdiction applicable to the Government of Odisha, India.</li>
                <li>Any disputes shall be resolved under jurisdiction of appropriate courts in Odisha.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                15. Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>For questions or concerns regarding these Terms & Conditions, contact:</p>
              
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
                By accessing the CodeBreakers portal, completing registration, or participating in any event, you acknowledge that you have read, understood, and agreed to these Terms & Conditions.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t">
          <p className="text-muted-foreground">
            These Terms & Conditions ensure fair participation and protect the rights of all participants and organizers.
          </p>
        </div>
      </div>
    </div>
  );
}
