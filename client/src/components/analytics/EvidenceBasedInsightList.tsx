import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle2, Lightbulb } from 'lucide-react';
import { ComponentSpec } from '../../types/workspace';

interface Insight {
  id: string;
  title: string;
  detail: string;
  evidence: string;
}

export const EvidenceBasedInsightList: React.FC<{ spec: ComponentSpec }> = () => {
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    Promise.all([
      axios.get('/api/data/usage-metrics'),
      axios.get('/api/data/feature-adoption'),
      axios.get('/api/data/releases'),
      axios.get('/api/data/support-incidents'),
    ])
      .then(([usageResponse, featureResponse, releaseResponse, incidentResponse]) => {
        const usage = [...usageResponse.data]
          .filter(row => row.date && Number.isFinite(Number(row.dailyActiveUsers)))
          .sort((a, b) => String(a.date).localeCompare(String(b.date)));
        const features = featureResponse.data as Array<{ name?: string; weeklyGrowthPercent?: number }>;
        const releases = releaseResponse.data as Array<{ version?: string; title?: string; deployedAt?: string }>;
        const incidents = incidentResponse.data as Array<{ ticketNumber?: string; title?: string; priority?: string; status?: string }>;
        const nextInsights: Insight[] = [];

        if (usage.length > 1) {
          const first = usage[0];
          const latest = usage[usage.length - 1];
          const startValue = Number(first.dailyActiveUsers);
          const endValue = Number(latest.dailyActiveUsers);
          const change = startValue ? ((endValue - startValue) / startValue) * 100 : 0;
          nextInsights.push({
            id: 'usage-period-change',
            title: 'Usage change across the uploaded period',
            detail: `Daily active users ${change < 0 ? 'decreased' : 'increased'} from ${startValue.toLocaleString()} to ${endValue.toLocaleString()} (${change > 0 ? '+' : ''}${change.toFixed(1)}%).`,
            evidence: `${usage.length} telemetry records from ${first.date} through ${latest.date}.`,
          });

          let largestDrop: { date: string; percent: number } | undefined;
          for (let index = 1; index < usage.length; index++) {
            const previous = Number(usage[index - 1].dailyActiveUsers);
            const current = Number(usage[index].dailyActiveUsers);
            if (previous <= 0 || current >= previous) continue;
            const percent = ((current - previous) / previous) * 100;
            if (!largestDrop || percent < largestDrop.percent) {
              largestDrop = { date: String(usage[index].date), percent };
            }
          }
          if (largestDrop) {
            const nearestRelease = releases
              .filter(release => release.deployedAt)
              .map(release => ({
                ...release,
                distance: Math.abs(new Date(release.deployedAt!).getTime() - new Date(largestDrop!.date).getTime()),
              }))
              .sort((a, b) => a.distance - b.distance)[0];
            if (nearestRelease && nearestRelease.distance <= 7 * 24 * 60 * 60 * 1000) {
              nextInsights.push({
                id: 'release-timing',
                title: 'Release timing near the largest usage drop',
                detail: `${nearestRelease.title || nearestRelease.version || 'A release'} was deployed near a ${largestDrop.percent.toFixed(1)}% daily-active-user drop. Timing alone does not establish cause.`,
                evidence: `Usage drop: ${largestDrop.date}; release: ${nearestRelease.deployedAt}.`,
              });
            }
          }
        }

        const decliningFeature = features
          .filter(feature => Number.isFinite(Number(feature.weeklyGrowthPercent)))
          .sort((a, b) => Number(a.weeklyGrowthPercent) - Number(b.weeklyGrowthPercent))[0];
        if (decliningFeature && Number(decliningFeature.weeklyGrowthPercent) < 0) {
          nextInsights.push({
            id: 'feature-adoption',
            title: 'Feature adoption decline',
            detail: `${decliningFeature.name || 'A feature'} has the largest negative weekly adoption change (${decliningFeature.weeklyGrowthPercent}%).`,
            evidence: `${features.length} feature-adoption records were reviewed.`,
          });
        }

        const activeIncidents = incidents.filter(incident =>
          ['critical', 'high'].includes(String(incident.priority).toLowerCase()) &&
          !['resolved', 'closed', 'done'].includes(String(incident.status).toLowerCase())
        );
        if (activeIncidents.length > 0) {
          nextInsights.push({
            id: 'active-incidents',
            title: 'Open high-priority support records',
            detail: `${activeIncidents.length} open high- or critical-priority support record(s) are present in the uploaded data.`,
            evidence: activeIncidents.slice(0, 3).map(incident =>
              `${incident.ticketNumber || incident.title || 'Untitled incident'} (${incident.priority})`
            ).join('; '),
          });
        }

        setInsights(nextInsights);
      })
      .catch(console.error);
  }, []);

  if (insights.length === 0) {
    return <div className="py-6 text-center text-xs text-gray-400">Not enough uploaded usage, release, feature, or incident data to derive an insight yet.</div>;
  }

  return (
    <div className="space-y-3">
      {insights.map(item => (
        <article
          key={item.id}
          className="space-y-1.5 rounded-xl border border-primary/20 bg-plum-900/40 p-3 text-xs transition-all hover:border-primary/40"
        >
          <div className="flex items-center gap-1.5 font-semibold text-white">
            <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
            {item.title}
          </div>
          <p className="text-[11px] leading-relaxed text-gray-300">{item.detail}</p>
          <div className="flex items-center gap-1 border-t border-border/40 pt-1.5 font-mono text-[10px] text-teal-300">
            <CheckCircle2 className="h-3 w-3 shrink-0 text-teal-400" />
            Evidence: {item.evidence}
          </div>
        </article>
      ))}
    </div>
  );
};
