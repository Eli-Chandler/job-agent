import type {JobListingDTO} from "@/api/models";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Link} from "react-router";
import {Building2, ExternalLink} from "lucide-react";
import {ScrollArea} from "@/components/ui/scroll-area.tsx";
import DOMPurify from 'dompurify';

interface JobCardProps {
  job: JobListingDTO
}

export function JobCard({job}: JobCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>{job.title}</span>
          <Link to={job.application_url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
          </Link>
        </CardTitle>
        <CardDescription className="flex items-center gap-1 text-muted-foreground">
          <Building2 className="h-4 w-4" />
          {job.company}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {job.description && (
          <ScrollArea className="h-40">
              <SafeHTML html={job.description} />
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

const SafeHTML = ({ html }: { html: string }) => {
  const cleanHTML = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'p', 'ul', 'li', 'b', 'i', 'strong', 'em', 'br'],
    ALLOWED_ATTR: [],
  });

  return (
    <div
      className="prose"
      dangerouslySetInnerHTML={{ __html: cleanHTML }}
    />
  );
};
