import { Mail } from "lucide-react";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | CodeBreakers",
  description: "Terms & Conditions for CodeBreakers - The official coding club of Government College of Engineering Kalahandi, Bhawanipatna",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <header className="mb-12 border-b pb-8">
          <div className="flex items-center justify-center gap-3 mb-1">
            <Image
              src="/assets/logo.png"
              alt="CodeBreakers Logo"
              width={70}
              height={70}
            />
            <h1 className="text-5xl font-bold text-foreground">CodeBreakers</h1>
          </div>
          <p className="text-3xl font-bold text-muted-foreground text-center mb-2">
            Government College of Engineering Kalahandi, Bhawanipatna
          </p>
          <h2 className="text-2xl font-bold text-center mb-4 text-primary">
            Terms & Conditions
          </h2>
          <p className="text-sm text-muted-foreground text-center">Last Updated: November 28, 2025</p>
        </header>

        {/* Content */}
        <article className="prose prose-slate dark:prose-invert max-w-none space-y-10">
          {/* Section 1 */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-foreground">1. Introduction</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                These Terms & Conditions ("Terms") govern your membership, participation, and involvement in{" "}
                <strong>CodeBreakers</strong>, the official coding and technical club of Government College of 
                Engineering Kalahandi, Bhawanipatna ("GCEK").
              </p>
              <p>
                By enrolling in the club, attending meetings, participating in activities, or engaging with any 
                CodeBreakers platform, you agree to abide by these Terms.
              </p>
              <p className="font-medium">
                If you do not agree with any part of these Terms, you should not participate in the club.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-foreground">2. Membership Eligibility</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>Membership is open to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Students currently enrolled at GCEK</li>
                <li>Students who meet club-specific criteria (year/branch may vary per event)</li>
                <li>Individuals approved by the club's faculty advisor or core committee</li>
              </ul>
              <p>
                All members must provide accurate information during registration. The club reserves the right to 
                verify details and reject or revoke membership at any time for non-compliance.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-foreground">3. Participation Expectations</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>Members are expected to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Attend meetings, workshops, and events regularly</li>
                <li>Respect timelines, deadlines, and event procedures</li>
                <li>Maintain professional conduct in all club activities</li>
                <li>Adhere to instructions issued by mentors, event coordinators, and faculty advisors</li>
              </ul>
              <p>
                The club may deny participation to members who violate guidelines or show repeated non-engagement.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-foreground">4. Code of Conduct</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Members must uphold integrity and professionalism. The following actions are strictly prohibited:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Harassment, discrimination, abusive language, or misconduct</li>
                <li>Cheating, plagiarism, or unethical practices in competitions</li>
                <li>Misuse or damage of club resources, property, or college assets</li>
                <li>Spreading misinformation or disrupting events</li>
                <li>Possession or use of alcohol, drugs, or illegal items</li>
              </ul>
              <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg mt-4">
                <p className="text-destructive font-medium">
                  Disciplinary actions may include warnings, suspension from events, termination of membership, 
                  or escalation to college authorities.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-foreground">5. Club Events, Competitions & Activities</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Events may include hackathons, coding contests, workshops, seminars, tech talks, and club projects.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Each event may have its own rules and criteria, which participants must follow.</li>
                <li><strong>Judges' decisions are final and binding.</strong></li>
                <li>
                  The club reserves the right to modify or cancel any event due to academic schedules, 
                  administrative requirements, or unforeseen circumstances.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-foreground">6. Intellectual Property</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <ul className="list-disc pl-6 space-y-2">
                <li>All submissions (projects, code, designs, presentations) must be original.</li>
                <li>
                  CodeBreakers may use event submissions for promotion, documentation, or publication, 
                  with credit to the creators.
                </li>
                <li>
                  Members retain ownership of their work unless otherwise stated in specific project agreements.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-foreground">7. Use of Technology and Equipment</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>Participants are responsible for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Their personal devices, tools, or equipment</li>
                <li>Safe and ethical use of software, platforms, and resources</li>
                <li>Adhering to lab and workshop safety regulations</li>
              </ul>
              <p className="italic">
                CodeBreakers and GCEK are not liable for lost, damaged, or stolen property.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-foreground">8. Attendance, Rewards & Certifications</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <ul className="list-disc pl-6 space-y-2">
                <li>Certificates (participation/achievement) are issued only to eligible and verified members.</li>
                <li>Rewards, prizes, and recognitions must be collected within the specified timeline.</li>
                <li>
                  The club is not obligated to reissue lost or unclaimed certificates or prizes after event closure.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-foreground">9. Media & Publicity Consent</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>By participating, members consent to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Being photographed or recorded during club activities</li>
                <li>Use of photos, recordings, or achievements for academic, promotional, or media purposes</li>
              </ul>
              <p className="font-medium">
                Members seeking exemption must submit a written request to the core committee.
              </p>
            </div>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-foreground">10. Data Usage & Privacy</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Basic personal information may be collected for club communication, event registration, 
                  and recordkeeping.
                </li>
                <li>Data will be used responsibly and only for official purposes.</li>
                <li>
                  The club is not responsible for data handled by third-party tools or platforms used during activities.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-foreground">11. Liability Disclaimer</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <ul className="list-disc pl-6 space-y-2">
                <li>Participation in CodeBreakers activities is voluntary and at the member's own risk.</li>
                <li>
                  CodeBreakers, GCEK, or its organizers are not responsible for injuries, health issues, 
                  accidents, or property loss occurring during club engagements.
                </li>
                <li>Activities may be moved, postponed, or cancelled due to academic or administrative reasons.</li>
              </ul>
            </div>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-foreground">12. Disciplinary Action & Termination</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>The club reserves the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Issue warnings</li>
                <li>Suspend participation</li>
                <li>Terminate membership</li>
                <li>Report severe misconduct to the college disciplinary committee</li>
              </ul>
              <p>
                Such actions may be taken without prior notice depending on the seriousness of the violation.
              </p>
            </div>
          </section>

          {/* Section 13 */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-foreground">13. Amendments to Terms</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                CodeBreakers may update or modify these Terms at any time. Updated Terms will be communicated 
                through official channels such as:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Notice boards</li>
                <li>Club meetings</li>
                <li>Official WhatsApp/Telegram groups</li>
                <li>CodeBreakers online platforms</li>
              </ul>
              <p>
                Continued participation after updates constitutes acceptance of the revised Terms.
              </p>
            </div>
          </section>

          {/* Section 14 */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-foreground">14. Governing Law</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                These Terms are governed by the rules and regulations of Government College of Engineering 
                Kalahandi and the applicable laws of the State of Odisha, India.
              </p>
              <p>
                Any disputes shall fall under the jurisdiction of appropriate courts in Odisha.
              </p>
            </div>
          </section>

          {/* Section 15 */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-foreground">15. Contact Information</h2>
            <p className="text-muted-foreground mb-4">For queries, support, or concerns, contact:</p>
            <div className="bg-muted/30 border-l-4 border-primary p-6 rounded-r-lg">
              <p className="font-semibold text-lg mb-2 text-foreground">CodeBreakers – Coding Club</p>
              <p className="text-muted-foreground mb-2">
                Government College of Engineering Kalahandi, Bhawanipatna
              </p>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <a href="mailto:codebreakersgcek@gmail.com" className="hover:text-primary transition-colors">
                  codebreakersgcek@gmail.com
                </a>
              </div>
            </div>
          </section>

          {/* Acknowledgment */}
          <section className="bg-primary/5 border border-primary/20 p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-foreground">📌 Acknowledgment</h2>
            <p className="text-muted-foreground leading-relaxed">
              By participating in CodeBreakers, you acknowledge that you have read, understood, 
              and agreed to these Terms & Conditions.
            </p>
          </section>
        </article>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t text-center">
          <p className="text-muted-foreground">
            These Terms & Conditions ensure professional conduct and protect the rights of all members and organizers.
          </p>
        </footer>
      </div>
    </div>
  );
}
