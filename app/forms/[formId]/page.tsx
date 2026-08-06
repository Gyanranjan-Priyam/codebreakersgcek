import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedFormByFormId } from "../actions";
import PublicForm from "../_components/public-form";

interface PublicFormPageProps {
  params: Promise<{ formId: string }>;
}

export async function generateMetadata({ params }: PublicFormPageProps): Promise<Metadata> {
  const { formId } = await params;
  return {
    title: `Form ${formId}`,
    description: "Submit a published form",
  };
}

export default async function PublicFormPage({ params }: PublicFormPageProps) {
  const { formId } = await params;
  const result = await getPublishedFormByFormId(formId);

  if (result.status !== "success") {
    notFound();
  }

  return <PublicForm form={result.data} />;
}
