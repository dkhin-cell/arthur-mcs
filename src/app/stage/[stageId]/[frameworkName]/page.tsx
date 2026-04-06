// src/app/stage/[stageId]/[frameworkName]/page.tsx
'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import { VALID_STAGES } from '@/lib/frameworkRegistry';

// Stage 0 frameworks
import SwotAnalysis from '@/components/frameworks/SwotAnalysis';
import TamCalculator from '@/components/frameworks/TamCalculator';
import CompetitiveMatrix from '@/components/frameworks/CompetitiveMatrix';
import ValueProposition from '@/components/frameworks/ValueProposition';
import StrategyCanvas from '@/components/frameworks/StrategyCanvas';
import MomTestSynthesizer from '@/components/frameworks/MomTestSynthesizer';
import ForcesOfProgress from '@/components/frameworks/ForcesOfProgress';
import KanoModel from '@/components/frameworks/KanoModel';
import CompetingAgainstMap from '@/components/frameworks/CompetingAgainstMap';
import AssumptionTracker from '@/components/frameworks/AssumptionTracker';

// Stage 1 frameworks
import V2MOM from '@/components/frameworks/V2MOM';
import ProductStrategyCanvas from '@/components/frameworks/ProductStrategyCanvas';
import BusinessModelCanvas from '@/components/frameworks/BusinessModelCanvas';
import PestleAnalysis from '@/components/frameworks/PestleAnalysis';
import VisionClarityTest from '@/components/frameworks/VisionClarityTest';
import NorthStarSelector from '@/components/frameworks/NorthStarSelector';
import MetricMap from '@/components/frameworks/MetricMap';
import OKRBuilder from '@/components/frameworks/OKRBuilder';
import DACI from '@/components/frameworks/DACI';

// Stage 2 frameworks
import JTBDCanvas from '@/components/frameworks/JTBDCanvas';
import RWWEnhanced from '@/components/frameworks/RWWEnhanced';
import RICECalculator from '@/components/frameworks/RICECalculator';
import DVUFPlanner from '@/components/frameworks/DVUFPlanner';
import BeachheadMarket from '@/components/frameworks/BeachheadMarket';
import OpportunitySolutionTree from '@/components/frameworks/OpportunitySolutionTree';
import KanoModel2 from '@/components/frameworks/KanoModel2';
import AssumptionMap from '@/components/frameworks/AssumptionMap';
import BehavioralSignalTracker from '@/components/frameworks/BehavioralSignalTracker';
import HypothesisTemplate from '@/components/frameworks/HypothesisTemplate';
import MultiPerspectiveReview from '@/components/frameworks/MultiPerspectiveReview';

// Stage 3 frameworks
import CustomerJourneyMap from '@/components/frameworks/CustomerJourneyMap';
import UserFlowIA from '@/components/frameworks/UserFlowIA';
import UXHypothesisCanvas from '@/components/frameworks/UXHypothesisCanvas';
import PrototypeSpec from '@/components/frameworks/PrototypeSpec';
import UsabilityTestPlan from '@/components/frameworks/UsabilityTestPlan';

// Stage 4 frameworks
import LivingBriefEngine from '@/components/frameworks/LivingBriefEngine';
import Stage4Roadmap from '@/components/frameworks/Stage4Roadmap';
import Stage4DACI from '@/components/frameworks/Stage4DACI';
import Stage4OKR from '@/components/frameworks/Stage4OKR';
import DependencyMap from '@/components/frameworks/DependencyMap';
import UserStories from '@/components/frameworks/UserStories';
import AcceptanceCriteria from '@/components/frameworks/AcceptanceCriteria';

// Stage 5 frameworks
import Stage5BeachheadExecution from '@/components/frameworks/Stage5BeachheadExecution';
import Stage5MVPScope from '@/components/frameworks/Stage5MVPScope';
import Stage5LaunchMetrics from '@/components/frameworks/Stage5LaunchMetrics';
import Stage5FeedbackLoops from '@/components/frameworks/Stage5FeedbackLoops';
import Stage5KillCriteria from '@/components/frameworks/Stage5KillCriteria';

// Stage 6 frameworks
import Stage6Performance from '@/components/frameworks/Stage6Performance';
import Stage6UnitEconomics from '@/components/frameworks/Stage6UnitEconomics';
import Stage6Expansion from '@/components/frameworks/Stage6Expansion';
import Stage6CompetitiveResponse from '@/components/frameworks/Stage6CompetitiveResponse';
import Stage6ExperimentLog from '@/components/frameworks/Stage6ExperimentLog';

// Stage 7 frameworks
import Stage7HealthMonitor from '@/components/frameworks/Stage7HealthMonitor';
import Stage7SatisfactionTracker from '@/components/frameworks/Stage7SatisfactionTracker';
import Stage7FeatureDeprecation from '@/components/frameworks/Stage7FeatureDeprecation';
import Stage7CompetitiveLandscape from '@/components/frameworks/Stage7CompetitiveLandscape';
import Stage7RefreshStrategy from '@/components/frameworks/Stage7RefreshStrategy';

// Stage 8 frameworks
import Stage8PortfolioAllocation from '@/components/frameworks/Stage8PortfolioAllocation';
import Stage8OpportunityCost from '@/components/frameworks/Stage8OpportunityCost';
import Stage8KillCriteria from '@/components/frameworks/Stage8KillCriteria';
import Stage8InvestmentHorizon from '@/components/frameworks/Stage8InvestmentHorizon';
import Stage8OrgImpact from '@/components/frameworks/Stage8OrgImpact';

// Cross-cutting
import ConfidenceMeter from '@/components/frameworks/ConfidenceMeter';
import StageTimer from '@/components/frameworks/StageTimer';

const FRAMEWORK_MAP: Record<string, Record<string, React.ComponentType>> = {
  '0': {
    'swot': SwotAnalysis,
    'tam': TamCalculator,
    'competitive': CompetitiveMatrix,
    'value-prop': ValueProposition,
    'canvas': StrategyCanvas,
    'momtest': MomTestSynthesizer,
    'forces': ForcesOfProgress,
    'kano': KanoModel,
    'competing': CompetingAgainstMap,
    'assumptions': AssumptionTracker,
  },
  '1': {
    'v2mom': V2MOM,
    'strategy-canvas': ProductStrategyCanvas,
    'bmc': BusinessModelCanvas,
    'pestle': PestleAnalysis,
    'vision-test': VisionClarityTest,
    'north-star': NorthStarSelector,
    'metric-map': MetricMap,
    'okr': OKRBuilder,
    'daci': DACI,
  },
  '2': {
    'jtbd': JTBDCanvas,
    'rww': RWWEnhanced,
    'rice': RICECalculator,
    'dvuf': DVUFPlanner,
    'beachhead': BeachheadMarket,
    'ost': OpportunitySolutionTree,
    'kano': KanoModel2,
    'assumptions': AssumptionMap,
    'signals': BehavioralSignalTracker,
    'hypothesis': HypothesisTemplate,
    'multi-perspective': MultiPerspectiveReview,
  },
  '3': {
    'journey': CustomerJourneyMap,
    'userflow': UserFlowIA,
    'ux-hypothesis': UXHypothesisCanvas,
    'prototype': PrototypeSpec,
    'usability': UsabilityTestPlan,
  },
  '4': {
    'brief': LivingBriefEngine,
    'roadmap': Stage4Roadmap,
    'daci': Stage4DACI,
    'okr': Stage4OKR,
    'dependencies': DependencyMap,
    'stories': UserStories,
    'acceptance': AcceptanceCriteria,
  },
  '5': {
    'beachhead': Stage5BeachheadExecution,
    'mvp': Stage5MVPScope,
    'metrics': Stage5LaunchMetrics,
    'feedback': Stage5FeedbackLoops,
    'kill': Stage5KillCriteria,
  },
  '6': {
    'performance': Stage6Performance,
    'economics': Stage6UnitEconomics,
    'expansion': Stage6Expansion,
    'competitive': Stage6CompetitiveResponse,
    'experiments': Stage6ExperimentLog,
  },
  '7': {
    'health': Stage7HealthMonitor,
    'satisfaction': Stage7SatisfactionTracker,
    'deprecation': Stage7FeatureDeprecation,
    'competitive': Stage7CompetitiveLandscape,
    'refresh': Stage7RefreshStrategy,
  },
  '8': {
    'portfolio': Stage8PortfolioAllocation,
    'opportunity': Stage8OpportunityCost,
    'kill-criteria': Stage8KillCriteria,
    'horizon': Stage8InvestmentHorizon,
    'impact': Stage8OrgImpact,
  },
};

interface Props {
  params: Promise<{ stageId: string; frameworkName: string }>;
}

export default function FrameworkPage({ params }: Props) {
  const { stageId, frameworkName } = use(params);

  if (!VALID_STAGES.includes(stageId)) {
    notFound();
  }

  const stageFrameworks = FRAMEWORK_MAP[stageId];
  if (!stageFrameworks) {
    notFound();
  }

  const Component = stageFrameworks[frameworkName];
  if (!Component) {
    notFound();
  }

  return <Component />;
}
