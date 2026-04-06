// src/lib/frameworkRegistry.ts
// Stage-to-component registry for dynamic route resolution
// Phase 2 Complete: All 9 stages (0-8)

import type { ComponentType } from 'react';

export interface StageConfig {
  landing: () => Promise<{ default: ComponentType }>;
  input: () => Promise<{ default: ComponentType }>;
  gate: () => Promise<{ default: ComponentType }>;
}

export const STAGE_REGISTRY: Record<string, StageConfig> = {
  '0': {
    landing: () => import('@/components/stages/Stage0Landing'),
    input: () => import('@/components/stages/Stage0Input'),
    gate: () => import('@/components/stages/Stage0Gate'),
  },
  '1': {
    landing: () => import('@/components/stages/Stage1Landing'),
    input: () => import('@/components/stages/Stage1Input'),
    gate: () => import('@/components/stages/Stage1Gate'),
  },
  '2': {
    landing: () => import('@/components/stages/Stage2Landing'),
    input: () => import('@/components/stages/Stage2Input'),
    gate: () => import('@/components/stages/Stage2Gate'),
  },
  '3': {
    landing: () => import('@/components/stages/Stage3Landing'),
    input: () => import('@/components/stages/Stage3Input'),
    gate: () => import('@/components/stages/Stage3Gate'),
  },
  '4': {
    landing: () => import('@/components/stages/Stage4Landing'),
    input: () => import('@/components/stages/Stage4Input'),
    gate: () => import('@/components/stages/Stage4Gate'),
  },
  '5': {
    landing: () => import('@/components/stages/Stage5Landing'),
    input: () => import('@/components/stages/Stage5Input'),
    gate: () => import('@/components/stages/Stage5Gate'),
  },
  '6': {
    landing: () => import('@/components/stages/Stage6Landing'),
    input: () => import('@/components/stages/Stage6Input'),
    gate: () => import('@/components/stages/Stage6Gate'),
  },
  '7': {
    landing: () => import('@/components/stages/Stage7Landing'),
    input: () => import('@/components/stages/Stage7Input'),
    gate: () => import('@/components/stages/Stage7Gate'),
  },
  '8': {
    landing: () => import('@/components/stages/Stage8Landing'),
    input: () => import('@/components/stages/Stage8Input'),
    gate: () => import('@/components/stages/Stage8Gate'),
  },
};

export const VALID_STAGES = Object.keys(STAGE_REGISTRY);

// Framework routes within each stage (for Phase 3)
export const FRAMEWORK_REGISTRY: Record<string, Record<string, () => Promise<{ default: ComponentType }>>> = {
  '0': {}, '1': {}, '2': {}, '3': {}, '4': {}, '5': {}, '6': {}, '7': {}, '8': {},
};
