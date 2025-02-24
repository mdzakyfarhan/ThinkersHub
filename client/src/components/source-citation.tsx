import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface SourceCitationProps {
  source: string;
}

export function SourceCitation({ source }: SourceCitationProps) {
  const isUrl = source.startsWith("http");

  return (
    <Card className="bg-muted">
      <CardContent className="py-3 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Source: {isUrl ? (
            <a
              href={source}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center"
            >
              {source}
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          ) : (
            source
          )}
        </div>
      </CardContent>
    </Card>
  );
}
