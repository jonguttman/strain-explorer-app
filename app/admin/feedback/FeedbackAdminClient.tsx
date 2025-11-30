"use client";

import { useState, useMemo } from "react";
import type { FeedbackEntry, AccessKey, TraitAxisId, AxisExperienceScores } from "@/lib/types";

type FeedbackAdminClientProps = {
  initialEntries: FeedbackEntry[];
  accessKeys: AccessKey[];
  strainNames: Record<string, string>;
};

type SortField = "date" | "radarMatch";
type SortDirection = "asc" | "desc";
type RadarMatchFilter = "all" | "very-close" | "some-variation" | "quite-different";

const TRAIT_AXES: TraitAxisId[] = [
  "visuals",
  "euphoria",
  "introspection",
  "creativity",
  "spiritual_depth",
  "sociability",
];

const AXIS_LABELS: Record<TraitAxisId, string> = {
  visuals: "Visuals",
  euphoria: "Euphoria",
  introspection: "Introspection",
  creativity: "Creativity",
  spiritual_depth: "Spiritual Depth",
  sociability: "Sociability",
};

/**
 * Compute average absolute delta between felt and expected axis values.
 * Returns null if either feltAxes or expectedAxes is missing or empty.
 */
function computeAvgDelta(
  feltAxes: AxisExperienceScores | undefined,
  expectedAxes: AxisExperienceScores | undefined
): number | null {
  if (!feltAxes || !expectedAxes) return null;
  
  const diffs: number[] = [];
  for (const axis of TRAIT_AXES) {
    const felt = feltAxes[axis];
    const expected = expectedAxes[axis];
    if (typeof felt === "number" && typeof expected === "number") {
      diffs.push(Math.abs(felt - expected));
    }
  }
  
  if (diffs.length === 0) return null;
  return diffs.reduce((sum, d) => sum + d, 0) / diffs.length;
}

/**
 * Get the radar match bucket based on avgDelta.
 */
function getRadarMatchBucket(avgDelta: number | null): RadarMatchFilter | null {
  if (avgDelta === null) return null;
  if (avgDelta < 1.0) return "very-close";
  if (avgDelta < 2.5) return "some-variation";
  return "quite-different";
}

/**
 * Get display text for radar match bucket.
 */
function getRadarMatchLabel(bucket: RadarMatchFilter | null): string {
  switch (bucket) {
    case "very-close": return "Very close";
    case "some-variation": return "Some variation";
    case "quite-different": return "Quite different";
    default: return "—";
  }
}

/**
 * Get color classes for radar match badge.
 */
function getRadarMatchColors(bucket: RadarMatchFilter | null): string {
  switch (bucket) {
    case "very-close": return "bg-emerald-50 text-emerald-700";
    case "some-variation": return "bg-amber-50 text-amber-700";
    case "quite-different": return "bg-red-50 text-red-700";
    default: return "bg-slate-100 text-slate-500";
  }
}

export function FeedbackAdminClient({
  initialEntries,
  accessKeys,
  strainNames,
}: FeedbackAdminClientProps) {
  const [entries] = useState<FeedbackEntry[]>(initialEntries);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [filterAccessKey, setFilterAccessKey] = useState<string>("all");
  const [filterStrain, setFilterStrain] = useState<string>("all");
  const [filterRadarMatch, setFilterRadarMatch] = useState<RadarMatchFilter>("all");

  // Pre-compute avgDelta for all entries
  const entriesWithDelta = useMemo(() => {
    return entries.map((entry) => ({
      entry,
      avgDelta: computeAvgDelta(entry.feltAxes, entry.expectedAxes),
    }));
  }, [entries]);

  // Get unique values for filters
  const uniqueAccessKeyIds = useMemo(() => {
    const ids = new Set<string>();
    entries.forEach((e) => {
      if (e.accessKeyId) ids.add(e.accessKeyId);
    });
    return Array.from(ids);
  }, [entries]);

  const uniqueStrainIds = useMemo(() => {
    const ids = new Set<string>();
    entries.forEach((e) => {
      if (e.strainId) ids.add(e.strainId);
    });
    return Array.from(ids);
  }, [entries]);

  // Apply filters and sorting
  const filteredEntries = useMemo(() => {
    let result = [...entriesWithDelta];

    // Filter by access key
    if (filterAccessKey !== "all") {
      if (filterAccessKey === "anonymous") {
        result = result.filter((e) => !e.entry.accessKeyId);
      } else {
        result = result.filter((e) => e.entry.accessKeyId === filterAccessKey);
      }
    }

    // Filter by strain
    if (filterStrain !== "all") {
      result = result.filter((e) => e.entry.strainId === filterStrain);
    }

    // Filter by radar match
    if (filterRadarMatch !== "all") {
      result = result.filter((e) => {
        const bucket = getRadarMatchBucket(e.avgDelta);
        return bucket === filterRadarMatch;
      });
    }

    // Sort
    result.sort((a, b) => {
      if (sortField === "date") {
        const dateA = new Date(a.entry.createdAt).getTime();
        const dateB = new Date(b.entry.createdAt).getTime();
        return sortDirection === "desc" ? dateB - dateA : dateA - dateB;
      } else {
        // Sort by radar match (avgDelta)
        // Nulls go to bottom regardless of direction
        if (a.avgDelta === null && b.avgDelta === null) return 0;
        if (a.avgDelta === null) return 1;
        if (b.avgDelta === null) return -1;
        return sortDirection === "desc" 
          ? b.avgDelta - a.avgDelta 
          : a.avgDelta - b.avgDelta;
      }
    });

    return result;
  }, [entriesWithDelta, filterAccessKey, filterStrain, filterRadarMatch, sortField, sortDirection]);

  // Compute axis insights from filtered entries
  const axisInsights = useMemo(() => {
    const entriesWithBothAxes = filteredEntries.filter(
      (e) => e.entry.feltAxes && e.entry.expectedAxes
    );

    if (entriesWithBothAxes.length === 0) return null;

    const insights: Array<{
      axis: TraitAxisId;
      label: string;
      avgExpected: number;
      avgFelt: number;
      delta: number;
    }> = [];

    for (const axis of TRAIT_AXES) {
      let sumExpected = 0;
      let sumFelt = 0;
      let count = 0;

      for (const { entry } of entriesWithBothAxes) {
        const expected = entry.expectedAxes?.[axis];
        const felt = entry.feltAxes?.[axis];
        if (typeof expected === "number" && typeof felt === "number") {
          sumExpected += expected;
          sumFelt += felt;
          count++;
        }
      }

      if (count > 0) {
        const avgExpected = sumExpected / count;
        const avgFelt = sumFelt / count;
        insights.push({
          axis,
          label: AXIS_LABELS[axis],
          avgExpected,
          avgFelt,
          delta: avgFelt - avgExpected,
        });
      }
    }

    return {
      insights,
      entryCount: entriesWithBothAxes.length,
    };
  }, [filteredEntries]);

  function getAccessKeyLabel(id?: string): string {
    if (!id) return "(anonymous)";
    const key = accessKeys.find((k) => k.id === id);
    return key ? key.label : id;
  }

  function getStrainName(id?: string): string {
    if (!id) return "-";
    return strainNames[id] || formatStrainId(id);
  }

  function formatStrainId(id: string): string {
    return id
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

  function handleSortByDate() {
    if (sortField === "date") {
      setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortField("date");
      setSortDirection("desc");
    }
  }

  function handleSortByRadarMatch() {
    if (sortField === "radarMatch") {
      setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortField("radarMatch");
      setSortDirection("desc");
    }
  }

  function truncate(text: string | undefined, maxLength: number): string {
    if (!text) return "-";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "…";
  }

  function getDeltaColor(delta: number): string {
    if (Math.abs(delta) < 0.5) return "text-slate-600";
    if (delta >= 0.5) return "text-emerald-600";
    return "text-amber-600";
  }

  function formatDelta(delta: number): string {
    const sign = delta >= 0 ? "+" : "";
    return `${sign}${delta.toFixed(1)}`;
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-600">No feedback entries yet.</p>
        <p className="mt-2 text-sm text-slate-500">
          Submissions from the kiosk will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Axis Insights Panel */}
      <div className="rounded-xl border border-slate-200 bg-[#faf8f5] p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 mb-1">
          Axis Insights
          <span className="ml-2 text-xs font-normal text-slate-500">
            (felt vs expected, 0–10 scale)
          </span>
        </h2>
        {axisInsights ? (
          <>
            <p className="text-xs text-slate-500 mb-4">
              Based on {axisInsights.entryCount} entr{axisInsights.entryCount === 1 ? "y" : "ies"} with radar data
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {axisInsights.insights.map(({ axis, label, avgExpected, avgFelt, delta }) => (
                <div
                  key={axis}
                  className="rounded-lg bg-white border border-slate-200 p-3 text-center"
                >
                  <p className="text-xs font-medium text-slate-700 mb-2">{label}</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Expected</span>
                      <span className="font-medium text-slate-700">{avgExpected.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Felt</span>
                      <span className="font-medium text-slate-700">{avgFelt.toFixed(1)}</span>
                    </div>
                    <div className={`pt-1 border-t border-slate-100 font-semibold ${getDeltaColor(delta)}`}>
                      {formatDelta(delta)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-500 italic">
            No axis-level data available yet. Submit feedback with radar ratings to see insights.
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="filter-access-key" className="text-sm text-slate-600">
            Access Key:
          </label>
          <select
            id="filter-access-key"
            value={filterAccessKey}
            onChange={(e) => setFilterAccessKey(e.target.value)}
            className="rounded border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
          >
            <option value="all">All</option>
            <option value="anonymous">(anonymous)</option>
            {uniqueAccessKeyIds.map((id) => (
              <option key={id} value={id}>
                {getAccessKeyLabel(id)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="filter-strain" className="text-sm text-slate-600">
            Strain:
          </label>
          <select
            id="filter-strain"
            value={filterStrain}
            onChange={(e) => setFilterStrain(e.target.value)}
            className="rounded border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
          >
            <option value="all">All</option>
            {uniqueStrainIds.map((id) => (
              <option key={id} value={id}>
                {getStrainName(id)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="filter-radar-match" className="text-sm text-slate-600">
            Radar Match:
          </label>
          <select
            id="filter-radar-match"
            value={filterRadarMatch}
            onChange={(e) => setFilterRadarMatch(e.target.value as RadarMatchFilter)}
            className="rounded border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
          >
            <option value="all">All</option>
            <option value="very-close">Very close</option>
            <option value="some-variation">Some variation</option>
            <option value="quite-different">Quite different</option>
          </select>
        </div>

        <div className="ml-auto text-sm text-slate-500">
          {filteredEntries.length} of {entries.length} entries
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 cursor-pointer hover:text-slate-700"
                  onClick={handleSortByDate}
                >
                  Date {sortField === "date" && (sortDirection === "desc" ? "↓" : "↑")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Strain
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Dose
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Access Key
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Rating
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Intensity
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 cursor-pointer hover:text-slate-700"
                  onClick={handleSortByRadarMatch}
                >
                  Radar Match {sortField === "radarMatch" && (sortDirection === "desc" ? "↓" : "↑")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Testimonial
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEntries.map(({ entry, avgDelta }) => {
                const bucket = getRadarMatchBucket(avgDelta);
                return (
                  <tr key={entry.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {new Date(entry.createdAt).toLocaleDateString()}{" "}
                      <span className="text-slate-400 text-xs">
                        {new Date(entry.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-900 font-medium">
                      {getStrainName(entry.strainId)}
                    </td>
                    <td className="px-4 py-3 text-slate-700 capitalize">
                      {entry.doseKey || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          entry.accessKeyId
                            ? "bg-blue-50 text-blue-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {getAccessKeyLabel(entry.accessKeyId)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {entry.overallExperience ? (
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">
                          {entry.overallExperience}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {entry.intensityRating ? (
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 text-purple-800 text-xs font-medium">
                          {entry.intensityRating}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getRadarMatchColors(bucket)}`}
                      >
                        {getRadarMatchLabel(bucket)}
                        {avgDelta !== null && (
                          <span className="ml-1 text-[10px] opacity-70">
                            ({avgDelta.toFixed(1)})
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-[200px]">
                      <span title={entry.testimonial || ""}>
                        {truncate(entry.testimonial, 50)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
