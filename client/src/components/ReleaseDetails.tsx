import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import type { Release } from "@shared/schema";

interface ReleaseDetailsProps {
  releases: Release[];
  selectedRelease: Release | null;
  onReleaseSelect: (release: Release) => void;
}

export default function ReleaseDetails({ releases, selectedRelease, onReleaseSelect }: ReleaseDetailsProps) {
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

  if (!selectedRelease) {
    return (
      <Card className="shadow-xl border-0 bg-gradient-to-br from-gray-50 to-white">
        <CardContent className="p-8 text-center text-muted-foreground">
          No release selected
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl border-0 bg-gradient-to-br from-gray-50 to-white">
      <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center shadow-sm">
              <svg className="h-5 w-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">Release Details</h3>
              <p className="text-sm text-muted-foreground">Comprehensive release information and notes</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Select 
              value={selectedRelease.release_id} 
              onValueChange={(releaseId) => {
                const release = releases.find(r => r.release_id === releaseId);
                if (release) onReleaseSelect(release);
              }}
            >
              <SelectTrigger className="w-56 h-11 bg-white/50 dark:bg-slate-800/50 border-border hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 shadow-sm" data-testid="select-release">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {releases.map(release => (
                  <SelectItem key={release.release_id} value={release.release_id}>
                    {release.version}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-2" data-testid="release-version">
              Release {selectedRelease.version}
            </h2>
            <p className="text-gray-600 font-medium" data-testid="release-date">
              Published {format(new Date(selectedRelease.published_at), "MMMM d, yyyy")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100 hover:shadow-lg transition-all duration-300">
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">Author</p>
            <p className="text-xl font-bold text-gray-900" data-testid="release-author">
              {selectedRelease.author}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-5 border border-purple-100 hover:shadow-lg transition-all duration-300">
            <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2">Pull Requests</p>
            <p className="text-xl font-bold text-gray-900" data-testid="release-pr-count">
              {selectedRelease.pr_count} PRs
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-5 border border-orange-100 hover:shadow-lg transition-all duration-300">
            <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-2">Time Since Last</p>
            <p className="text-xl font-bold text-gray-900" data-testid="release-time-since">
              {selectedRelease.time_since_last_release 
                ? `${Math.abs(Math.round(selectedRelease.time_since_last_release))} days`
                : "N/A"
              }
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Release Notes</h3>
          <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-6 border border-slate-200 prose prose-sm max-w-none max-h-[60vh] overflow-y-auto">
            <div data-testid="release-body" className="text-gray-800">
              {formatReleaseBody(selectedRelease.body)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}