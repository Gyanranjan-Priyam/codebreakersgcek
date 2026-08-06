import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFormByFormId } from "../../actions";
import { PageHeader } from "@/components/ui/page-header";
import ResponsesClient from "./_components/responses-client";

interface ResponsesPageProps {
  params: Promise<{ formId: string }>;
}

export async function generateMetadata({ params }: ResponsesPageProps): Promise<Metadata> {
  const { formId } = await params;
  return {
    title: `Responses — ${formId} | Admin Panel`,
    description: `View and manage responses for form ${formId}`,
  };
}

export default async function FormResponsesPage({ params }: ResponsesPageProps) {
  const { formId } = await params;
  const result = await getFormByFormId(formId);

  if (result.status !== "success") {
    notFound();
  }

  const form = result.data;

  return (
    <div className="container mx-auto px-2 sm:px-4 lg:px-2 py-3 sm:py-6 max-w-8xl">
      <PageHeader
        title={`Responses — ${form.title}`}
        description={`${form._count.responses} total response${form._count.responses !== 1 ? "s" : ""} for this form.`}
        showBackButton={false}
      />

      <div className="mt-6 sm:mt-8">
        <ResponsesClient form={form} />
      </div>
    </div>
  );
}
