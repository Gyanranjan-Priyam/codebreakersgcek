import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProjectReviews } from "./actions";
import { ReviewsList } from "./_components/reviews-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submission Projects - Admin",
  description: "Review project submissions from students",
};

export default async function SubmissionProjectsPage() {
  const result = await getProjectReviews();

  const pendingReviews = result.data.filter((r) => r.status === "pending");
  const approvedReviews = result.data.filter((r) => r.status === "approved");
  const rejectedReviews = result.data.filter((r) => r.status === "rejected");

  const reviewTypeCount = {
    review: result.data.filter((r) => r.reviewType === "review").length,
    collaboration: result.data.filter((r) => r.reviewType === "collaboration").length,
    publish: result.data.filter((r) => r.reviewType === "publish").length,
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl sm:text-3xl tracking-tight font-bold">Project Submissions</h1>
        <p className="text-muted-foreground mt-2">
          Review and manage project submissions from students
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Submissions</CardDescription>
            <CardTitle className="text-3xl">{result.data.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Review</CardDescription>
            <CardTitle className="text-3xl">{pendingReviews.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>For Review</CardDescription>
            <CardTitle className="text-3xl">{reviewTypeCount.review}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>For Collaboration</CardDescription>
            <CardTitle className="text-3xl">{reviewTypeCount.collaboration}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs for different statuses */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            Pending ({pendingReviews.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedReviews.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedReviews.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <ReviewsList reviews={pendingReviews} />
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <ReviewsList reviews={approvedReviews} />
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          <ReviewsList reviews={rejectedReviews} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

