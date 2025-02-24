import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Issue } from "@shared/schema";
import { useLocation } from "wouter";
import { ClockIcon } from "lucide-react";
import { format } from "date-fns";

interface IssueCardProps {
  issue: Issue;
}

export function IssueCard({ issue }: IssueCardProps) {
  const [_, navigate] = useLocation();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{issue.title}</CardTitle>
          {issue.approved && (
            <Badge variant="secondary">Verified</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground line-clamp-2 mb-4">
          {issue.description}
        </p>
        <div className="flex justify-between items-center">
          <div className="flex items-center text-sm text-muted-foreground">
            <ClockIcon className="h-4 w-4 mr-1" />
            {format(new Date(issue.createdAt), "MMM d, yyyy")}
          </div>
          <Button
            variant="outline"
            onClick={() => navigate(`/issue/${issue.id}`)}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}