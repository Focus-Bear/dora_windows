import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import type { Release } from "@shared/schema";

interface ReleaseModalProps {
  release: Release;
  onClose: () => void;
}

export default function ReleaseModal({ release, onClose }: ReleaseModalProps) {
  const formatReleaseBody = (body: string) => {
    // Basic markdown-like parsing for the release body
    const lines = body.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('##')) {
        return <h4 key={index} className="font-semibold text-lg mt-4 mb-2">{line.replace('##', '').trim()}</h4>;
      }
      if (line.startsWith('*')) {
        return <li key={index} className="ml-4 mb-1">{line.replace('*', '').trim()}</li>;
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return <p key={index} className="mb-2">{line}</p>;
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      data-testid="modal-release-details"
    >
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-auto border border-border">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground" data-testid="modal-release-version">
                Release {release.version}
              </h2>
              <p className="text-sm text-muted-foreground" data-testid="modal-release-date">
                Published {format(new Date(release.published_at), "MMMM d, yyyy")}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              data-testid="button-close-modal"
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Author</p>
              <p className="text-lg font-semibold text-foreground" data-testid="modal-release-author">
                {release.author}
              </p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Pull Requests</p>
              <p className="text-lg font-semibold text-foreground" data-testid="modal-release-pr-count">
                {release.pr_count} PRs
              </p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Time Since Last</p>
              <p className="text-lg font-semibold text-foreground" data-testid="modal-release-time-since">
                {release.time_since_last_release 
                  ? `${Math.abs(Math.round(release.time_since_last_release))} days`
                  : "N/A"
                }
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Release Notes</h3>
            <div className="bg-muted/20 rounded-lg p-4 prose prose-sm max-w-none text-foreground">
              <div data-testid="modal-release-body">
                {formatReleaseBody(release.body)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
