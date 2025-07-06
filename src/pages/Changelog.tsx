import { useChangelog } from '@/hooks/useChangelog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Plus, Edit, AlertTriangle, Trash2, Bug, Shield } from 'lucide-react';
import { format } from 'date-fns';

const typeIcons = {
  added: Plus,
  changed: Edit,
  deprecated: AlertTriangle,
  removed: Trash2,
  fixed: Bug,
  security: Shield,
};

const typeColors = {
  added: 'bg-green-500/10 text-green-400 border-green-500/20',
  changed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  deprecated: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  removed: 'bg-red-500/10 text-red-400 border-red-500/20',
  fixed: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  security: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

export default function Changelog() {
  const { changelog, loading, error } = useChangelog();

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-6">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-4 w-96" />
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="border-border">
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center justify-center">
            <Card className="border-destructive/50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  <p>Failed to load changelog: {error}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Group changelog by version
  const groupedChangelog = changelog.reduce((acc, entry) => {
    if (!acc[entry.version]) {
      acc[entry.version] = {
        version: entry.version,
        release_date: entry.release_date,
        entries: [],
      };
    }
    acc[entry.version].entries.push(entry);
    return acc;
  }, {} as Record<string, { version: string; release_date: string; entries: typeof changelog }>);

  const versions = Object.values(groupedChangelog).sort((a, b) => 
    new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
  );

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
              Changelog
            </h1>
            <p className="text-muted-foreground text-lg">
              All notable changes to Infinite Game will be documented here.
            </p>
            <p className="text-sm text-muted-foreground">
              The format is based on{' '}
              <a 
                href="https://keepachangelog.com/en/1.0.0/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Keep a Changelog
              </a>
              , and this project adheres to{' '}
              <a 
                href="https://semver.org/spec/v2.0.0.html" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Semantic Versioning
              </a>
              .
            </p>
          </div>

          {/* Changelog Entries */}
          <div className="space-y-8">
            {versions.map(({ version, release_date, entries }) => (
              <Card key={version} className="border-border backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold text-primary">
                      {version}
                    </CardTitle>
                    <time className="text-sm text-muted-foreground">
                      {format(new Date(release_date), 'MMMM dd, yyyy')}
                    </time>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {entries.map((entry) => {
                    const Icon = typeIcons[entry.type];
                    return (
                      <div key={entry.id} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Badge className={`${typeColors[entry.type]} capitalize`}>
                            <Icon className="h-3 w-3 mr-1" />
                            {entry.type}
                          </Badge>
                          <h3 className="font-semibold text-foreground">{entry.title}</h3>
                        </div>
                        <div className="text-muted-foreground pl-6">
                          <p>{entry.content}</p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>

          {changelog.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No changelog entries found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}