import { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/ui/page-header";
import ContactSupportForm from "./_components/contact-support-form";
import SupportTicketsList from "./_components/support-tickets-list";
import SupportTeamDetails from "./_components/support-team-details";

export const metadata: Metadata = {
  title: "Contact Support | Support Center",
  description: "Get help with your account, events, and any technical issues. Submit a support request and track your tickets.",
};

export default function ContactSupportPage() {
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex flex-col">
        <span className="text-4xl font-semibold">
          Contact Support
        </span>
        <span className="text-sm font-semibold text-muted-foreground mt-2">
          Need help? Submit a support request and we'll get back to you as soon as possible.
        </span>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Support Form */}
        <div className="space-y-6">
          <ContactSupportForm />
        </div>

        {/* Support Tickets List */}
        <div className="space-y-6">
          <SupportTicketsList />
          <SupportTeamDetails />
        </div>
      </div>
    </div>
  );
}
