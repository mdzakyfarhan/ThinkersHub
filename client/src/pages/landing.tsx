import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TopicSelector } from "@/components/topic-selector";
import { useLocation } from "wouter";
import { Search, BookOpen, FileSearch, Settings } from "lucide-react";

export default function Landing() {
  const [_, navigate] = useLocation();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Knowledge Repository Platform
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover and connect issues with solutions through AI-powered analysis
          </p>
        </div>

        <Card className="p-6">
          <CardContent className="space-y-4">
            <TopicSelector onSelect={() => navigate("/repository")} />
            <div className="flex justify-center">
              <Button
                variant="default"
                size="lg"
                onClick={() => navigate("/repository")}
              >
                <Search className="mr-2 h-4 w-4" />
                Browse Repository
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Curated Content</h3>
              <p className="text-sm text-muted-foreground">
                Expert-reviewed articles and research papers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <FileSearch className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">AI-Powered Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Smart matching of issues with solutions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Settings className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Reliable Sources</h3>
              <p className="text-sm text-muted-foreground">
                Verified citations and references
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}