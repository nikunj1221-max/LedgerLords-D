import { UIPlan, ChangeSummary } from '../../schemas/uiPlan';

export function computeWorkspaceDiff(
  previousPlan: UIPlan | null | undefined,
  newPlan: Partial<UIPlan>
): ChangeSummary {
  if (!previousPlan || !previousPlan.components || previousPlan.components.length === 0) {
    return {
      added: (newPlan.components || []).map(c => c.title || c.type),
      updated: [],
      retained: [],
      removed: [],
      reason: `Initialized workspace for goal: "${newPlan.title || newPlan.intentLabel}"`
    };
  }

  const prevCompMap = new Map(previousPlan.components.map(c => [c.id, c]));
  const prevTypes = new Set(previousPlan.components.map(c => c.type));

  const newComponents = newPlan.components || [];
  const newCompMap = new Map(newComponents.map(c => [c.id, c]));
  const newTypes = new Set(newComponents.map(c => c.type));

  const added: string[] = [];
  const updated: string[] = [];
  const retained: string[] = [];
  const removed: string[] = [];

  for (const newComp of newComponents) {
    const prevComp = prevCompMap.get(newComp.id);
    if (!prevComp) {
      // Check if same type existed
      if (prevTypes.has(newComp.type)) {
        updated.push(newComp.title);
      } else {
        added.push(newComp.title);
      }
    } else {
      // It existed. Check if config/filters changed
      const filtersChanged = JSON.stringify(prevComp.filters) !== JSON.stringify(newComp.filters);
      const titleChanged = prevComp.title !== newComp.title;
      if (filtersChanged || titleChanged) {
        updated.push(newComp.title);
      } else {
        retained.push(newComp.title);
      }
    }
  }

  for (const prevComp of previousPlan.components) {
    if (!newCompMap.has(prevComp.id) && !newTypes.has(prevComp.type)) {
      removed.push(prevComp.title);
    }
  }

  // Generate clear reason
  let reason = '';
  if (previousPlan.intent !== newPlan.intent) {
    reason = `Primary goal transitioned from "${previousPlan.intentLabel}" to "${newPlan.intentLabel}".`;
  } else if (added.length > 0) {
    reason = `Extended current workspace with additional context (${added.join(', ')}).`;
  } else if (updated.length > 0) {
    reason = `Refined workspace criteria and component filters.`;
  } else {
    reason = `Workspace layout adapted to prioritize active context.`;
  }

  return {
    added,
    updated,
    retained,
    removed,
    reason
  };
}
