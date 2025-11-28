import { Mail } from "lucide-react";
import Image from "next/image";

export default function PrivacyPage() {
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
                    Privacy Policy
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
                This Privacy Policy describes how <strong>CodeBreakers</strong>, the official coding club of 
                Government College of Engineering Kalahandi (GCEK), collects, uses, stores, shares, and protects 
                personal information of its members, participants, and visitors ("Users").
              </p>
              <p>
                By registering for club membership, participating in events, or using any CodeBreakers-operated 
                platform, you consent to the practices described in this policy.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-foreground">2. Information We Collect</h2>
            <p className="text-muted-foreground mb-4">We may collect the following categories of information:</p>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">2.1 Personal Information</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Full name</li>
                  <li>Email address</li>
                  <li>Phone number</li>
                  <li>Academic details (branch, year, roll number, college)</li>
                  <li>Profile photo (if submitted)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">2.2 Technical & Usage Information</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Device details (type, browser, OS)</li>
                  <li>IP address</li>
                  <li>Activity logs on event registration platforms or club applications</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">2.3 Event-Related Information</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Registration details</li>
                  <li>Project submissions</li>
                  <li>Code files, documents, or presentations</li>
                  <li>Attendance records</li>
                  <li>Competition performance, rankings, and achievements</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-foreground">3. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-4">Your information may be used for:</p>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">3.1 Administration & Membership</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Maintaining member records</li>
                  <li>Verifying identity and eligibility</li>
                  <li>Internal communication regarding meetings, updates, and announcements</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">3.2 Event Management</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Organizing workshops, contests, hackathons, and technical sessions</li>
                  <li>Allocating resources and managing event logistics</li>
                  <li>Issuing certificates, rewards, or recognitions</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">3.3 Communication</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Sending updates, reminders, schedules, and announcements</li>
                  <li>Outreach regarding upcoming opportunities or collaborations</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">3.4 Promotion & Publications</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Sharing event photos and highlights</li>
                  <li>Publishing achievements or project showcases</li>
                  <li>Creating content for social media or promotional materials</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">3.5 Club Development</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Improving club operations, events, and member experience</li>
                  <li>Statistical analysis and performance evaluation</li>
                </ul>
              </div>
            </div>

            <p className="mt-6 text-muted-foreground font-medium">
              We do not sell, rent, or commercially exploit your personal data.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-foreground">4. Sharing of Information</h2>
            <p className="text-muted-foreground mb-4">
              We may share personal information only under the following circumstances:
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">4.1 Internal Use</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>With club coordinators, core members, and faculty advisors</li>
                  <li>For event administration or project coordination</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">4.2 Third-Party Tools</h3>
                <p className="text-muted-foreground mb-2">We may use third-party services for:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Registration forms</li>
                  <li>Certificates</li>
                  <li>Online competitions</li>
                  <li>Communication platforms</li>
                </ul>
                <p className="mt-3 text-muted-foreground italic">
                  These third-party platforms operate under their own privacy policies. CodeBreakers is not 
                  responsible for their data practices.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">4.3 Legal or Safety Requirements</h3>
                <p className="text-muted-foreground mb-2">Information may be disclosed if required:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>By college administration</li>
                  <li>To comply with legal or disciplinary procedures</li>
                  <li>To ensure safety and security of participants</li>
                </ul>
              </div>
            </div>

            <p className="mt-6 text-muted-foreground font-medium">
              We never share personal data externally without valid purpose or authorization.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-foreground">5. Media, Photography & Recordings</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                During club activities, photographs and recordings may be taken. These may be used for:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Event documentation</li>
                <li>Educational content</li>
                <li>Club promotions, newsletters, or social media</li>
              </ul>
              <p className="font-medium">
                Users who wish to opt-out of media usage must notify the core committee in writing, 
                prior to the event if possible.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-foreground">6. Data Storage & Security</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>We take reasonable measures to protect your personal information by:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Restricting access to authorized members</li>
                <li>Using secure platforms for data storage</li>
                <li>Avoiding unnecessary retention of sensitive details</li>
              </ul>
              <p className="italic">
                However, no digital platform or transmission is 100% secure. CodeBreakers is not liable for 
                breaches caused by third-party systems, network issues, or user negligence.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-foreground">7. Data Retention</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>We retain user information only for as long as required for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Event certification</li>
                <li>Club records</li>
                <li>Academic-year reporting</li>
                <li>Legal or administrative obligations</li>
              </ul>
              <p>
                Unnecessary data may be archived or permanently deleted at the end of each academic cycle.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-foreground">8. User Rights</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>Users may request:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Correction of inaccurate information</li>
                <li>Deletion of optional personal data</li>
                <li>Exemption from promotional materials or media use</li>
              </ul>
              <p>
                To submit a request, contact the club via the details below. Certain academic or administrative 
                data cannot be removed if required for official records.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-foreground">9. External Links</h2>
            <p className="text-muted-foreground">
              CodeBreakers platforms may contain links to external websites or tools. We are not responsible 
              for the privacy practices, content, or security of third-party services.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-foreground">10. Updates to This Privacy Policy</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>This policy may be updated periodically to reflect:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Institutional guidelines</li>
                <li>Legal requirements</li>
                <li>Club operational changes</li>
              </ul>
              <p>
                Revisions will be posted through official communication channels. Continued participation after 
                updates implies acceptance.
              </p>
            </div>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-foreground">11. Contact Information</h2>
            <p className="text-muted-foreground mb-4">
              For questions, data-related requests, or concerns, contact:
            </p>
            <div className="bg-muted/30 border-l-4 border-primary p-6 rounded-r-lg">
              <p className="font-semibold text-lg mb-2 text-foreground">CodeBreakers – Coding Club</p>
              <p className="text-muted-foreground mb-2">
                Government College of Engineering Kalahandi, Bhawanipatna
              </p>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <a href="mailto:CodeBreakers.gcekbhawanipatna@gmail.com" className="hover:text-primary transition-colors">
                  CodeBreakers.gcekbhawanipatna@gmail.com
                </a>
              </div>
            </div>
          </section>

          {/* Acknowledgment */}
          <section className="bg-primary/5 border border-primary/20 p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-foreground">📌 Acknowledgment</h2>
            <p className="text-muted-foreground leading-relaxed">
              By participating in CodeBreakers or using any of its platforms, you acknowledge that you have read 
              and understood this Privacy Policy and consent to the described data practices.
            </p>
          </section>
        </article>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t text-center">
          <p className="text-muted-foreground">
            This Privacy Policy is designed to protect your data and ensure transparency in our data handling practices.
          </p>
        </footer>
      </div>
    </div>
  );
}
