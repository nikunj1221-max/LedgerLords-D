/**
 * Realistic, clearly labeled mock business datasets for Adaptive AI Workspace.
 * Each dataset has an approved source ID and audit metadata.
 */

export const approvedDataSources = {
  'project-overview': {
    id: 'project-overview',
    name: 'Project Overview & Objectives',
    type: 'project_management',
    lastUpdated: '2026-10-10T06:00:00Z',
    data: {
      projectName: 'NextGen Product Launch',
      status: 'Planning & Kickoff Phase',
      targetLaunchDate: '2026-11-20',
      estimatedBudget: '$180,000',
      spentBudget: '$15,000',
      currency: 'USD',
      objective: 'Launch the NextGen customer portal with self-service analytics and onboarding automation.',
      successCriteria: [
        'Cut customer onboarding cycle from 14 days to under 48 hours',
        'Achieve 99.9% uptime for core authentication and transaction pipelines',
        'Secure 500 active beta customers within the first 30 days post-launch'
      ],
      stakeholders: [
        { role: 'Project Owner', name: 'Elena Rostova', department: 'Product' },
        { role: 'Product Lead', name: 'Marcus Chen', department: 'Product' },
        { role: 'Engineering Lead', name: 'Devon Patel', department: 'Engineering' },
        { role: 'Design Lead', name: 'Aria Thorne', department: 'Product Design' },
        { role: 'Marketing Lead', name: 'Sarah Jenkins', department: 'Growth' },
        { role: 'Finance Partner', name: 'Lucas Meyer', department: 'Finance' },
      ],
      discussionQuestions: [
        'What is the core user pain point we must solve in MVP vs phase 2?',
        'Who are our primary target personas for initial rollout?',
        'What critical technical dependencies must be resolved before freeze?',
        'Can engineering meet the Nov 20 launch date with current team capacity?',
        'What regulatory or security compliance gates are mandatory?'
      ]
    }
  },

  'project-tasks': {
    id: 'project-tasks',
    name: 'Project Tasks & Dependency Graph',
    type: 'tasks',
    lastUpdated: '2026-10-10T06:00:00Z',
    data: [
      {
        id: 'TASK-1',
        name: 'Technical Architecture & API Specifications',
        startDate: '2026-10-12',
        dueDate: '2026-10-20',
        duration: 9,
        status: 'in_progress',
        progress: 60,
        owner: 'Devon Patel',
        priority: 'high',
        dependencies: [],
        milestone: false,
        critical: true,
      },
      {
        id: 'TASK-2',
        name: 'Core Backend Engine & Auth Service',
        startDate: '2026-10-21',
        dueDate: '2026-11-04',
        duration: 15,
        status: 'not_started',
        progress: 0,
        owner: 'Devon Patel',
        priority: 'critical',
        dependencies: ['TASK-1'],
        milestone: false,
        critical: true,
      },
      {
        id: 'TASK-3',
        name: 'Frontend UI Components & Design System',
        startDate: '2026-10-21',
        dueDate: '2026-11-02',
        duration: 13,
        status: 'not_started',
        progress: 0,
        owner: 'Aria Thorne',
        priority: 'medium',
        dependencies: ['TASK-1'],
        milestone: false,
        critical: false,
      },
      {
        id: 'TASK-4',
        name: 'Integration Testing & Security Audit',
        startDate: '2026-11-05',
        dueDate: '2026-11-13',
        duration: 9,
        status: 'not_started',
        progress: 0,
        owner: 'Devon Patel',
        priority: 'critical',
        dependencies: ['TASK-2', 'TASK-3'],
        milestone: false,
        critical: true,
      },
      {
        id: 'TASK-5',
        name: 'Production Deployment & Smoke Verification',
        startDate: '2026-11-14',
        dueDate: '2026-11-19',
        duration: 6,
        status: 'not_started',
        progress: 0,
        owner: 'Devon Patel',
        priority: 'critical',
        dependencies: ['TASK-4'],
        milestone: false,
        critical: true,
      },
      {
        id: 'TASK-6',
        name: 'Public Launch Milestone',
        startDate: '2026-11-20',
        dueDate: '2026-11-20',
        duration: 0,
        status: 'not_started',
        progress: 0,
        owner: 'Marcus Chen',
        priority: 'critical',
        dependencies: ['TASK-5'],
        milestone: true,
        critical: true,
      },
      {
        id: 'TASK-7',
        name: 'Marketing Launch Campaign & Press Assets',
        startDate: '2026-11-08',
        dueDate: '2026-11-18',
        duration: 11,
        status: 'not_started',
        progress: 0,
        owner: 'Sarah Jenkins',
        priority: 'medium',
        dependencies: ['TASK-3'],
        milestone: false,
        critical: false,
      }
    ]
  },

  'meeting-agenda': {
    id: 'meeting-agenda',
    name: 'Kickoff Meeting Agenda',
    type: 'agenda',
    lastUpdated: '2026-10-10T06:00:00Z',
    data: {
      totalDuration: 60,
      focus: 'General Project Kickoff',
      items: [
        { id: 'AG-1', title: 'Introduction and project vision', duration: 5, speaker: 'Project Owner', category: 'alignment' },
        { id: 'AG-2', title: 'Goals and success criteria', duration: 10, speaker: 'Product Lead', category: 'strategy' },
        { id: 'AG-3', title: 'Target audience and requirements', duration: 10, speaker: 'Product Lead', category: 'product' },
        { id: 'AG-4', title: 'Scope and feature priorities', duration: 10, speaker: 'Product Lead & Engineering', category: 'scope' },
        { id: 'AG-5', title: 'Technical feasibility and architecture', duration: 10, speaker: 'Engineering Lead', category: 'technical' },
        { id: 'AG-6', title: 'Risks, budget, and resources', duration: 10, speaker: 'Team Leads', category: 'risk' },
        { id: 'AG-7', title: 'Decisions and next steps', duration: 5, speaker: 'All Attendees', category: 'action' }
      ]
    }
  },

  'project-blockers': {
    id: 'project-blockers',
    name: 'Project Risks & Blockers',
    type: 'risks',
    lastUpdated: '2026-10-10T06:00:00Z',
    data: [
      {
        id: 'RSK-1',
        title: 'Single-engineer dependency on backend architecture',
        category: 'Resource',
        severity: 'high',
        likelihood: 'medium',
        impact: 'If Devon Patel is overcommitted or blocked, TASK-2 and TASK-4 stall downstream dates by up to 14 days.',
        status: 'open',
        mitigation: 'Pair a secondary senior backend engineer or decouple auth module into a standalone contract.',
        isHypothesis: false,
      },
      {
        id: 'RSK-2',
        title: 'Third-party Payment Gateway compliance approval delay',
        category: 'External',
        severity: 'critical',
        likelihood: 'medium',
        impact: 'Compliance sign-off typically requires 10 business days. Unverified vendor turnaround could pause public launch.',
        status: 'open',
        mitigation: 'Submit security audit package 14 days ahead of code freeze.',
        isHypothesis: true,
      },
      {
        id: 'RSK-3',
        title: 'Scope expansion into analytics dashboards before MVP launch',
        category: 'Scope',
        severity: 'medium',
        likelihood: 'high',
        impact: 'Adding advanced visualization to MVP would add ~12 engineering days.',
        status: 'monitored',
        mitigation: 'Strictly gate phase 2 analytics behind feature flags.',
        isHypothesis: false,
      }
    ]
  },

  'sales-summary': {
    id: 'sales-summary',
    name: 'Q3/Q4 Sales Performance & Metrics',
    type: 'sales',
    lastUpdated: '2026-10-10T06:00:00Z',
    data: {
      totalRevenue: '$1,248,500',
      revenueChange: '-14.2%',
      averageOrderValue: '$420',
      aovChange: '-6.8%',
      closedDeals: 142,
      dealsChange: '-18.4%',
      conversionRate: '3.1%',
      conversionChange: '-0.9%',
      activeRegion: 'All Regions',
      dateRange: 'Past 90 Days',
    }
  },

  'sales-history': {
    id: 'sales-history',
    name: 'Weekly Sales Revenue Trend',
    type: 'timeseries',
    lastUpdated: '2026-10-10T06:00:00Z',
    data: [
      { week: 'W1 (Aug 1)', revenue: 115000, target: 120000, orders: 280, churnRate: 1.8 },
      { week: 'W2 (Aug 8)', revenue: 118000, target: 120000, orders: 290, churnRate: 1.9 },
      { week: 'W3 (Aug 15)', revenue: 122000, target: 125000, orders: 305, churnRate: 2.0 },
      { week: 'W4 (Aug 22)', revenue: 119000, target: 125000, orders: 295, churnRate: 2.1 },
      { week: 'W5 (Aug 29)', revenue: 112000, target: 128000, orders: 270, churnRate: 2.4 },
      { week: 'W6 (Sep 5)', revenue: 104000, target: 128000, orders: 245, churnRate: 2.8 },
      { week: 'W7 (Sep 12)', revenue: 98000, target: 130000, orders: 230, churnRate: 3.2 },
      { week: 'W8 (Sep 19)', revenue: 95000, target: 130000, orders: 220, churnRate: 3.5 },
      { week: 'W9 (Sep 26)', revenue: 92000, target: 132000, orders: 212, churnRate: 3.9 },
      { week: 'W10 (Oct 3)', revenue: 89000, target: 132000, orders: 205, churnRate: 4.1 },
    ]
  },

  'sales-by-region': {
    id: 'sales-by-region',
    name: 'Regional Sales Breakdown',
    type: 'categorical',
    lastUpdated: '2026-10-10T06:00:00Z',
    data: [
      { region: 'North America - East', revenue: 480000, change: '-3.1%', deals: 58, quotaAttainment: 88 },
      { region: 'North America - West', revenue: 310000, change: '-24.6%', deals: 34, quotaAttainment: 62 },
      { region: 'Europe (EMEA)', revenue: 295000, change: '-8.5%', deals: 32, quotaAttainment: 79 },
      { region: 'Asia-Pacific (APAC)', revenue: 163500, change: '+4.2%', deals: 18, quotaAttainment: 96 }
    ]
  },

  'decision-options': {
    id: 'decision-options',
    name: 'Launch Strategy Trade-Off Options',
    type: 'decisions',
    lastUpdated: '2026-10-10T06:00:00Z',
    data: [
      {
        id: 'OPT-1',
        name: 'Option A: Delay Launch by 2 Weeks',
        description: 'Shift public rollout to Dec 4, 2026. Preserves complete feature scope and full QA cycle.',
        pros: ['Maintains 100% of planned MVP features', 'Zero team crunch or overtime burnout', 'Full 8-day security audit window retained'],
        cons: ['Marketing campaign slots need rescheduling ($12,000 reservation fee)', 'Competitor launch window overlap'],
        calculatedCostImpact: '+$14,500 (Contractor retention + ad rescheduling)',
        calculatedDateImpact: '+14 calendar days (Rollout Dec 4)',
        riskLevel: 'Low technical risk / Medium marketing risk',
        recommended: true,
      },
      {
        id: 'OPT-2',
        name: 'Option B: Reduce Scope (Defer Analytics to v1.1)',
        description: 'Keep Nov 20 launch deadline by removing self-service analytics from initial release.',
        pros: ['Meets Nov 20 public launch target exactly', 'Zero marketing reschedule penalties', 'Frees Devon Patel 6 working days'],
        cons: ['Customer feedback may note lack of dashboard reporting', 'Requires immediate v1.1 patch plan within 3 weeks'],
        calculatedCostImpact: '$0 direct budget change',
        calculatedDateImpact: '0 days change (Rollout Nov 20 on time)',
        riskLevel: 'Medium customer satisfaction risk / Low execution risk',
        recommended: false,
      },
      {
        id: 'OPT-3',
        name: 'Option C: Add Secondary Senior Contractor',
        description: 'Bring on external backend contractor to co-develop Core Backend Engine (TASK-2).',
        pros: ['Maintains both Nov 20 target date and 100% feature scope'],
        cons: ['Requires 3 days onboarding overhead', 'Contractor rate is $195/hr ($18,720 incremental)'],
        calculatedCostImpact: '+$18,720 direct budget increase',
        calculatedDateImpact: '-2 days on critical path (Rollout Nov 18)',
        riskLevel: 'Medium coordination risk / High budget impact',
        recommended: false,
      }
    ]
  }
};
