/**
 * Client-facing query layer for the CV domain. Defines the serializable DTOs
 * (the shape that crosses the route -> client boundary) and the React Query
 * `queryOptions` consumed by `useQuery`. The same DTOs are produced server-side
 * by the mappers in `cv-reads.ts`, so server prefetch and client fetch hydrate
 * cleanly.
 */
import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { fetchJson } from "@/lib/query/fetch";
import type { ResumeData } from "./types";
import type { ShareInfo } from "./share-service";

export type { ShareInfo };

/** A CV as rendered on the dashboard grid (dates serialized to ISO strings). */
export interface CvListItem {
  id: string;
  title: string;
  templateId: string;
  updatedAt: string;
  data: ResumeData;
  accentColor: string;
  fontFamily: string;
  isPublic: boolean;
}

/** A CV document used to seed the editor store. */
export interface CvDetail {
  cvId: string;
  title: string;
  templateId: string;
  accentColor: string;
  fontFamily: string;
  data: ResumeData;
}

export function cvListOptions() {
  return queryOptions({
    queryKey: queryKeys.cvs.list(),
    queryFn: () => fetchJson<CvListItem[]>("/api/cvs"),
  });
}

export function cvDetailOptions(cvId: string) {
  return queryOptions({
    queryKey: queryKeys.cvs.detail(cvId),
    queryFn: () => fetchJson<CvDetail>(`/api/cvs/${cvId}`),
  });
}

export function shareInfoOptions(cvId: string, enabled = true) {
  return queryOptions({
    queryKey: queryKeys.cvs.share(cvId),
    queryFn: () => fetchJson<ShareInfo>(`/api/cvs/${cvId}/share`),
    enabled,
  });
}
