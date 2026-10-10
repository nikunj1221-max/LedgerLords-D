/**
 * Deterministic Dependency-Aware Scheduling & Simulation Engine
 * Performs topological sort, cycle detection, forward scheduling pass,
 * and what-if scenario simulations.
 */

export class SchedulingEngine {
  /**
   * Helper: Add days to an ISO date string (YYYY-MM-DD)
   */
  static addDays(dateStr, days) {
    const d = new Date(dateStr + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().split('T')[0];
  }

  /**
   * Helper: Calculate calendar day difference between two dates
   */
  static daysDiff(startStr, endStr) {
    const s = new Date(startStr + 'T00:00:00Z');
    const e = new Date(endStr + 'T00:00:00Z');
    return Math.round((e - s) / (1000 * 60 * 60 * 24));
  }

  /**
   * Detect cycles in task dependency graph using DFS.
   * Returns { hasCycle: boolean, cyclePath: string[] }
   */
  static detectCycle(tasks) {
    const adj = new Map();
    tasks.forEach(t => adj.set(t.id, t.dependencies || []));

    const visited = new Set();
    const inStack = new Set();
    const path = [];

    const dfs = (node) => {
      visited.add(node);
      inStack.add(node);
      path.push(node);

      const neighbors = adj.get(node) || [];
      for (const next of neighbors) {
        if (!visited.has(next)) {
          if (dfs(next)) return true;
        } else if (inStack.has(next)) {
          path.push(next);
          return true;
        }
      }

      inStack.delete(node);
      path.pop();
      return false;
    };

    for (const task of tasks) {
      if (!visited.has(task.id)) {
        if (dfs(task.id)) {
          return { hasCycle: true, cyclePath: path };
        }
      }
    }

    return { hasCycle: false, cyclePath: [] };
  }

  /**
   * Recalculate schedule through topological order.
   * Propagates dates strictly through dependency relationships.
   */
  static computeSchedule(tasks, delayInjection = {}) {
    // 1. Detect cycles first
    const cycleCheck = this.detectCycle(tasks);
    if (cycleCheck.hasCycle) {
      throw new Error(`Invalid task graph: dependency cycle detected: ${cycleCheck.cyclePath.join(' -> ')}`);
    }

    // 2. Clone tasks and map by ID
    const taskMap = new Map();
    tasks.forEach(t => {
      taskMap.set(t.id, {
        ...t,
        dependencies: [...(t.dependencies || [])],
        simulatedStartDate: t.startDate,
        simulatedDueDate: t.dueDate,
        delayDays: 0,
        dependencyShift: 0,
        isAffected: false,
      });
    });

    // 3. Apply explicit delay injections (e.g. TASK-1 delayed by 14 days)
    Object.entries(delayInjection).forEach(([taskId, days]) => {
      const task = taskMap.get(taskId);
      if (task) {
        task.delayDays += days;
        task.isAffected = true;
      }
    });

    // 4. In-degree calculation for topological ordering
    const inDegree = new Map();
    const forwardAdj = new Map(); // parent -> children
    tasks.forEach(t => {
      inDegree.set(t.id, (t.dependencies || []).length);
      forwardAdj.set(t.id, []);
    });

    tasks.forEach(t => {
      (t.dependencies || []).forEach(depId => {
        if (forwardAdj.has(depId)) {
          forwardAdj.get(depId).push(t.id);
        }
      });
    });

    const queue = [];
    inDegree.forEach((deg, id) => {
      if (deg === 0) queue.push(id);
    });

    const topoOrder = [];
    while (queue.length > 0) {
      const curr = queue.shift();
      topoOrder.push(curr);
      (forwardAdj.get(curr) || []).forEach(child => {
        inDegree.set(child, inDegree.get(child) - 1);
        if (inDegree.get(child) === 0) queue.push(child);
      });
    }

    // 5. Forward propagation pass
    topoOrder.forEach(id => {
      const task = taskMap.get(id);

      // Earliest possible start date based on completion of all dependencies
      let earliestStart = task.startDate;
      let maxDepFinish = null;

      (task.dependencies || []).forEach(depId => {
        const dep = taskMap.get(depId);
        if (dep) {
          const nextAvailable = this.addDays(dep.simulatedDueDate, 1);
          if (!maxDepFinish || nextAvailable > maxDepFinish) {
            maxDepFinish = nextAvailable;
          }
        }
      });

      if (maxDepFinish && maxDepFinish > earliestStart) {
        earliestStart = maxDepFinish;
      }

      // Add direct delay injection to start date
      if (task.delayDays > 0) {
        earliestStart = this.addDays(earliestStart, task.delayDays);
      }

      task.simulatedStartDate = earliestStart;
      // Duration in days (if milestone, duration is 0)
      const duration = task.duration || 0;
      task.simulatedDueDate = duration > 0 ? this.addDays(earliestStart, duration - 1) : earliestStart;

      // Calculate total delta from original due date
      const totalShift = this.daysDiff(task.dueDate, task.simulatedDueDate);
      task.totalShiftDays = totalShift;
      if (totalShift > 0) {
        task.isAffected = true;
      }
    });

    return Array.from(taskMap.values());
  }

  /**
   * Run a what-if simulation comparing baseline with scenario.
   */
  static runSimulation(baselineTasks, scenarioType, params = {}) {
    let scenarioTasks = structuredClone(baselineTasks);
    let scenarioDescription = '';
    let assumptions = [];
    let limitations = [];
    let delayMap = {};
    let estimatedCostDelta = 0;

    switch (scenarioType) {
      case 'delay_launch': {
        const delayWeeks = params.weeks || 2;
        const delayDays = delayWeeks * 7;
        scenarioDescription = `Simulated ${delayWeeks}-week (${delayDays} days) delay applied to initial kickoff and technical specs (TASK-1).`;
        delayMap['TASK-1'] = delayDays;
        assumptions = [
          `Task durations remain constant without overtime compression.`,
          `No additional engineering headcount is allocated to parallelize TASK-2 or TASK-4.`,
          `Mandatory sequential dependencies between architecture, auth, and QA are strictly enforced.`,
          `Calendar days are used for projection (7 days/week).`
        ];
        limitations = [
          `Does not account for external holiday shutdowns.`,
          `Assumes contractor marketing availability shifts smoothly with a $12k reservation penalty.`
        ];
        estimatedCostDelta = delayWeeks * 7250; // $14,500 for 2 weeks
        break;
      }

      case 'reduce_scope': {
        scenarioDescription = `Scope reduction: defer self-service analytics to v1.1 release, cutting TASK-2 duration by 5 days.`;
        const task2 = scenarioTasks.find(t => t.id === 'TASK-2');
        if (task2) {
          task2.duration = Math.max(7, task2.duration - 5);
        }
        assumptions = [
          `MVP scope excluding analytics satisfies initial beta partner requirements.`,
          `Engineering team can deploy deferred features in a rapid follow-up patch (v1.1) within 21 days.`,
          `No delay to public launch date (Nov 20 target preserved).`
        ];
        limitations = [
          `Customer feedback metrics may show initial sentiment penalty of ~10% for missing visual reports.`
        ];
        estimatedCostDelta = 0;
        break;
      }

      case 'reassign_task': {
        scenarioDescription = `Reassign backend integration testing (TASK-4) to an available senior engineer, running in parallel with auth finalization.`;
        const task4 = scenarioTasks.find(t => t.id === 'TASK-4');
        if (task4) {
          task4.owner = 'Maya Lin (Senior QA Eng)';
          task4.duration = Math.max(4, task4.duration - 3);
          // Decouple full wait
          task4.dependencies = ['TASK-2'];
        }
        assumptions = [
          `Maya Lin has complete context on API specifications from day 1.`,
          `Frontend UI (TASK-3) mock contracts are accepted without blocking backend test suites.`
        ];
        limitations = [
          `Requires 16 hours of contract coordination between Devon and Maya.`
        ];
        estimatedCostDelta = 3200;
        break;
      }

      case 'add_resource': {
        scenarioDescription = `Add an external senior contractor to pair on Core Backend Engine (TASK-2).`;
        const task2 = scenarioTasks.find(t => t.id === 'TASK-2');
        if (task2) {
          task2.duration = Math.max(8, task2.duration - 6);
        }
        assumptions = [
          `Contractor can onboard in 2 business days.`,
          `Contractor rate is $195/hour with 96 billable hours.`
        ];
        limitations = [
          `Code review bandwidth on Devon Patel increases by 2 hours/day.`
        ];
        estimatedCostDelta = 18720;
        break;
      }

      default: {
        scenarioDescription = `Custom scenario evaluation.`;
        if (params.delayDays) {
          delayMap['TASK-1'] = params.delayDays;
        }
        assumptions = ['Default baseline parameters applied.'];
        limitations = ['Specific scenario variables not fully specified.'];
        break;
      }
    }

    // Run forward pass calculation
    const computedScenario = this.computeSchedule(scenarioTasks, delayMap);

    // Compute metrics
    const baselineMilestone = baselineTasks.find(t => t.milestone) || baselineTasks[baselineTasks.length - 1];
    const scenarioMilestone = computedScenario.find(t => t.milestone) || computedScenario[computedScenario.length - 1];

    const baselineDueDate = baselineMilestone?.dueDate || '2026-11-20';
    const simulatedDueDate = scenarioMilestone?.simulatedDueDate || '2026-11-20';
    const projectShiftDays = this.daysDiff(baselineDueDate, simulatedDueDate);

    const affectedTasks = computedScenario.filter(t => t.isAffected || t.totalShiftDays > 0);

    return {
      scenarioType,
      scenarioDescription,
      baselineMilestoneDate: baselineDueDate,
      simulatedMilestoneDate: simulatedDueDate,
      projectShiftDays,
      costImpact: estimatedCostDelta > 0 ? `+$${estimatedCostDelta.toLocaleString()}` : (estimatedCostDelta === 0 ? '$0' : `-$${Math.abs(estimatedCostDelta).toLocaleString()}`),
      affectedTasksCount: affectedTasks.length,
      affectedTasks: affectedTasks.map(t => ({
        id: t.id,
        name: t.name,
        originalDueDate: t.dueDate,
        simulatedDueDate: t.simulatedDueDate,
        shiftDays: t.totalShiftDays,
        owner: t.owner,
      })),
      tasks: computedScenario,
      assumptions,
      limitations,
      timestamp: new Date().toISOString(),
    };
  }
}
