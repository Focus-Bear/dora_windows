import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Release } from "@shared/schema";

interface ReleaseTableProps {
  releases: Release[];
  onReleaseSelect: (release: Release) => void;
}

export default function ReleaseTable({ releases, onReleaseSelect }: ReleaseTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVersion, setSelectedVersion] = useState<string>("all");

  const filteredReleases = releases.filter(release => {
    const matchesSearch = !searchQuery || 
      release.version.toLowerCase().includes(searchQuery.toLowerCase()) ||
      release.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      release.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesVersion = !selectedVersion || selectedVersion === "all" || release.version === selectedVersion;
    
    return matchesSearch && matchesVersion;
  });

  const uniqueVersions = Array.from(new Set(releases.map(r => r.version)));

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Release Details</h3>
            <p className="text-sm text-muted-foreground">Detailed release information and metrics</p>
          </div>
          <div className="flex items-center space-x-3">
            <Select value={selectedVersion} onValueChange={setSelectedVersion}>
              <SelectTrigger className="w-40" data-testid="select-release-version">
                <SelectValue placeholder="All Releases" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Releases</SelectItem>
                {uniqueVersions.map(version => (
                  <SelectItem key={version} value={version}>{version}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search releases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
                data-testid="input-search-releases"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto max-h-96 scrollbar-thin">
          <table className="w-full">
            <thead className="bg-muted/50 sticky top-0">
              <tr className="text-left">
                <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Version
                </th>
                <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Published
                </th>
                <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  PRs
                </th>
                <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Days Since Last
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredReleases.map((release) => (
                <tr
                  key={release.release_id}
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => onReleaseSelect(release)}
                  data-testid={`row-release-${release.release_id}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-2 w-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm font-medium text-foreground">
                        {release.version}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {release.author}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(release.published_at), { addSuffix: true })}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {release.pr_count}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {release.time_since_last_release 
                      ? `${Math.abs(Math.round(release.time_since_last_release))} days`
                      : "N/A"
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredReleases.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No releases found matching your criteria
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
