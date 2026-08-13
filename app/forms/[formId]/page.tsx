import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedFormByFormId } from "../actions";
import PublicForm from "../_components/public-form";

interface PublicFormPageProps {
  params: Promise<{ formId: string }>;
}

export async function generateMetadata({ params }: PublicFormPageProps): Promise<Metadata> {
  const { formId } = await params;
  const result = await getPublishedFormByFormId(formId);

  const title = result.status === "success" && result.data.title
    ? result.data.title
    : `Form ${formId}`;
  const description = result.status === "success" && result.data.description
    ? result.data.description
    : "Fill out this form published by CodeBreakers GCEK.";
  const formUrl = `https://www.codebreakersgcek.tech/forms/${formId}`;

  return {
    title,
    description,
    openGraph: {
      type: "website",
      url: formUrl,
      title,
      description,
      siteName: "CodeBreakers GCEK",
      images: [
        {
          url: "/assets/logo.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/assets/logo.png"],
      creator: "@codebreakers_gcek",
    },
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
