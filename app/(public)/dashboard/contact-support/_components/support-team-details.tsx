import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";

export default function SupportTeamDetails() {
  return (
    <>
      <Card>
         <CardHeader>
            <span className="text-lg font-semibold">Support Team Details</span>
            <CardDescription>
               Our support team is dedicated to assisting you with any issues or questions you may have. We strive to provide timely and effective solutions to ensure your satisfaction.
            </CardDescription>
         </CardHeader>
         <CardContent>
            <div className="space-y-4">
               <div>
                  <h3 className="font-medium mb-2">Contact Information</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                     <li>• Email: codebreakersgcek@gmail.com</li>
                     <li>• Alternate Email: contact.codebreakersgcek@gmail.com</li>
                  </ul>
               </div>
               
               <div>
                  <h3 className="font-medium mb-2">Support Team</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                     <li>
                        <strong>Technical Support:</strong><br />
                        • Gyanranjan Priyam - +91 88952 20675<br />
                        • Email: codebreakersgcek@gmail.com<br />
                        • Alternate Email: web.gyanranjan@gmail.com
                     </li>
                     <li>
                        <strong>Club Leads</strong><br />
                        • Biswajit - +91 12345 67890<br />
                        • R. Reddy - +91 12345 67890<br />
                        • Email: codebreakersgcek@gmail.com
                     </li>
                     <li>
                        <strong>General Inquiries:</strong><br />
                        • Smruti - +91 12345 67890<br />
                        • Email: codebreakersgcek@gmail.com
                     </li>
                  </ul>
               </div>
            </div>
         </CardContent>
      </Card>
    </>
  );
}
