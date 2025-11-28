import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Trophy, 
  Users, 
  Calendar, 
  Shield, 
  Target, 
  BookOpen, 
  Award,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Heart,
  Megaphone,
  DollarSign,
  Leaf,
  FileText,
  Handshake
} from "lucide-react";

export default function EventsGuidelinesPage() {
  return (
    <div className="min-h-screen py-4 sm:py-8 lg:py-10 bg-linear-to-b from-background to-muted/20">
      <div className="container mx-auto px-3 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-linear-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-3 sm:mb-4 leading-tight">
            CodeBreakers Techfest
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl font-semibold text-muted-foreground mb-2 px-2">
            Comprehensive Event Guidelines
          </p>
          <Badge variant="outline" className="text-xs sm:text-sm font-medium">
            Government College of Engineering Kalahandi, Bhawanipatna
          </Badge>
        </div>

        {/* Introduction */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
              Introduction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              CodeBreakers is the official annual technical festival of Government College of Engineering Kalahandi, Bhawanipatna. 
              These guidelines define the structure, expectations, responsibilities, and standard procedures to ensure smooth and 
              successful execution of all events under the festival.
            </p>
          </CardContent>
        </Card>

        {/* Objectives */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Target className="h-5 w-5 sm:h-6 sm:w-6" />
              Objectives of CodeBreakers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
              <div className="flex items-start gap-2 sm:gap-3">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-0.5 shrink-0" />
                <p className="text-xs sm:text-sm">Promote innovation, creativity, and technical excellence.</p>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-0.5 shrink-0" />
                <p className="text-xs sm:text-sm">Provide a platform for students to showcase technical and managerial skills.</p>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-0.5 shrink-0" />
                <p className="text-xs sm:text-sm">Encourage collaboration, problem‑solving, and hands‑on learning.</p>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-0.5 shrink-0" />
                <p className="text-xs sm:text-sm">Establish interaction between students, industry experts, and academicians.</p>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-0.5 shrink-0" />
                <p className="text-xs sm:text-sm">Enhance the college's technical culture and public visibility.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organizational Structure */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Users className="h-5 w-5 sm:h-6 sm:w-6" />
              Organizational Structure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {/* Core Committee */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 flex items-center gap-2">
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
                Core Committee
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">Responsible for overall planning, administration, and decision‑making.</p>
              <div className="grid gap-2 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { role: "Patron", person: "Principal, GCEK" },
                  { role: "Convenor", person: "Assigned faculty coordinator" },
                  { role: "Co‑Convenors", person: "Faculty representatives from each department" },
                  { role: "Student General Secretary", person: "Overall student lead" },
                  { role: "Treasurer", person: "Handles finances and approvals" }
                ].map((item, index) => (
                  <div key={index} className="border rounded-lg p-2 sm:p-3 bg-muted/30">
                    <div className="font-medium text-xs sm:text-sm">{item.role}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">{item.person}</div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Sub-Committees */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Sub‑Committees & Responsibilities</h3>
              <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                {[
                  { name: "Event Management Committee", desc: "scheduling, venue allocation, execution" },
                  { name: "Technical Committee", desc: "quality control of event content, judging criteria" },
                  { name: "Publicity & Outreach Committee", desc: "posters, social media, promotions" },
                  { name: "Design & Creative Team", desc: "branding, logos, banners, certificates" },
                  { name: "Hospitality & Logistics", desc: "accommodation, registration desk, refreshments" },
                  { name: "Sponsorship Committee", desc: "proposals to companies, follow-ups" },
                  { name: "Finance Committee", desc: "budgeting, expense records, vendor payments" },
                  { name: "Disciplinary & Security Committee", desc: "safety, discipline, crowd control" },
                  { name: "IT & Media Team", desc: "photography, videography, live updates, website/app support" }
                ].map((committee, index) => (
                  <div key={index} className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                    <div className="font-medium text-xs sm:text-sm mb-1 sm:mb-2">{committee.name}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">{committee.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event Categories */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
              Event Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { 
                  category: "Technical Competitions", 
                  events: "Coding, robotics, hackathons, circuit design, CAD, project expo",
                  icon: <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
                },
                { 
                  category: "Non‑Technical Events", 
                  events: "Quiz, debates, idea pitching, gaming competitions",
                  icon: <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                },
                { 
                  category: "Workshops & Seminars", 
                  events: "Industry talks, expert sessions, hands-on modules",
                  icon: <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                },
                { 
                  category: "Exhibitions", 
                  events: "Departmental innovations, student start‑ups, research demos",
                  icon: <Award className="h-4 w-4 sm:h-5 sm:w-5" />
                },
                { 
                  category: "Cultural Add‑ons", 
                  events: "Opening ceremony performances, closing events",
                  icon: <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                }
              ].map((category, index) => (
                <div key={index} className="border rounded-lg p-3 sm:p-4 bg-linear-to-br from-primary/5 to-blue-50/50">
                  <div className="flex items-center gap-2 mb-1 sm:mb-2">
                    {category.icon}
                    <div className="font-medium text-xs sm:text-sm">{category.category}</div>
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">{category.events}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Registration Guidelines */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
              Registration Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {[
                "Online and offline registrations must be open at least 10–14 days before the fest.",
                "Every participant must fill out the complete registration form.",
                "Entry fees (if applicable) must be pre-approved by the Core Committee.",
                "Registrations must close 24 hours before each event unless otherwise specified.",
                "Registration desk must stay active throughout the festival."
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-xs sm:text-sm text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Event Rules & Conduct */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
              Event Rules & Conduct
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
              <div className="space-y-2 sm:space-y-3">
                <h3 className="font-medium text-xs sm:text-sm flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
                  General Rules
                </h3>
                <div className="space-y-1 sm:space-y-2">
                  {[
                    "Participants must carry college ID cards.",
                    "Respect event coordinators, judges, and volunteers.",
                    "Misconduct, plagiarism, or rule‑breaking leads to disqualification.",
                    "Event‑specific rules must be clearly displayed and explained."
                  ].map((rule, index) => (
                    <div key={index} className="text-[10px] sm:text-xs text-muted-foreground">• {rule}</div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2 sm:space-y-3">
                <h3 className="font-medium text-xs sm:text-sm flex items-center gap-2">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  Time Management
                </h3>
                <div className="space-y-1 sm:space-y-2">
                  <div className="text-[10px] sm:text-xs text-muted-foreground">• All events must strictly follow the official schedule.</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">• Delays must be reported to the Core Committee immediately.</div>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <h3 className="font-medium text-xs sm:text-sm flex items-center gap-2">
                  <Award className="h-3 w-3 sm:h-4 sm:w-4" />
                  Judging & Results
                </h3>
                <div className="space-y-1 sm:space-y-2">
                  {[
                    "Judging criteria must be transparent and pre‑defined.",
                    "Decisions taken by judges are final.",
                    "Results must be recorded and forwarded to the Media team."
                  ].map((rule, index) => (
                    <div key={index} className="text-[10px] sm:text-xs text-muted-foreground">• {rule}</div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Guidelines Grid */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 mb-6 sm:mb-8">
          {/* Venue & Infrastructure */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                Venue & Infrastructure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <div>• Proper signage for event rooms, halls, and labs</div>
                <div>• Test technical equipment in advance</div>
                <div>• Arrange backup systems (power, internet, hardware)</div>
                <div>• Maintain venue cleanliness</div>
                <div>• Follow safety protocols strictly</div>
              </div>
            </CardContent>
          </Card>

          {/* Hospitality */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                Hospitality & Participant Care
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <div>• Provide water, seating, and help desks</div>
                <div>• Guide outstation participants properly</div>
                <div>• Medical assistance desk availability</div>
                <div>• First-aid box on-site</div>
              </div>
            </CardContent>
          </Card>

          {/* Branding & Publicity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Megaphone className="h-4 w-4 sm:h-5 sm:w-5" />
                Branding & Publicity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <div>• Use official CodeBreakers branding</div>
                <div>• Approve materials before publication</div>
                <div>• Timely, engaging social media content</div>
                <div>• Professional press releases and photography</div>
              </div>
            </CardContent>
          </Card>

          {/* Sponsorship */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                Sponsorship Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <div>• Use only approved sponsorship templates</div>
                <div>• No unauthorized commitments</div>
                <div>• Maintain transparency in dealings</div>
                <div>• Feature sponsors on banners and certificates</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Safety & Environmental */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 mb-6 sm:mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                Safety & Security Protocols
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <div>• Ensure fire safety and electrical safety</div>
                <div>• Monitor crowd movement</div>
                <div>• Display emergency contacts at key locations</div>
                <div>• Adhere to drone usage safety regulations</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Leaf className="h-4 w-4 sm:h-5 sm:w-5" />
                Environmental Responsibility
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <div>• Encourage minimal use of plastic</div>
                <div>• Ensure proper waste disposal</div>
                <div>• Promote digital materials over printed documents</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Closing & Reporting */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Trophy className="h-5 w-5 sm:h-6 sm:w-6" />
              Closing Ceremony & Post-Event Reporting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div>
              <h3 className="font-medium text-sm sm:text-base mb-2">Closing Ceremony & Awards</h3>
              <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                <div>• Include recognition of winners and volunteers</div>
                <div>• Check certificates for correct names and design consistency</div>
                <div>• Archive photos and videos for future promotion</div>
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="font-medium text-sm sm:text-base mb-2">Post‑Event Reporting</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-2">Each committee must submit a report covering:</p>
              <div className="grid gap-1 sm:gap-2 sm:grid-cols-2 text-xs sm:text-sm">
                <div>• Achievements</div>
                <div>• Participation statistics</div>
                <div>• Budget and expenditures</div>
                <div>• Challenges faced and suggestions for improvement</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Code of Conduct */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Handshake className="h-5 w-5 sm:h-6 sm:w-6" />
              Code of Conduct
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
              {[
                "Maintain professionalism and respectful behavior.",
                "Avoid conflict, discrimination, or harassment.",
                "Promote fairness and sportsmanship in all events.",
                "Follow college rules and maintain decorum throughout the fest."
              ].map((conduct, index) => (
                <div key={index} className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 mt-0.5 shrink-0" />
                  <p className="text-xs sm:text-sm text-muted-foreground">{conduct}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Conclusion */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
              Conclusion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-linear-to-r from-primary/10 to-blue-100/50 rounded-lg p-4 sm:p-6 text-center">
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
                These guidelines ensure that CodeBreakers remains an exceptional platform celebrating innovation, teamwork, and technical excellence. 
                All participants, volunteers, and coordinators are expected to adhere to them to make the festival successful and memorable.
              </p>
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-primary/20">
                <p className="text-xs sm:text-sm font-medium text-primary">
                  Prepared for: Government College of Engineering Kalahandi, Bhawanipatna
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
