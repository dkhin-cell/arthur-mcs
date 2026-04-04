// src/lib/frameworkRegistry.ts
// Stage-to-component registry for dynamic route resolution
// Phase 2A: Stages 0-2 | Phase 2B adds 3-5 | Phase 2C adds 6-8

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
  // Phase 2B: Stages 3-5 will be added here
  // Phase 2C: Stages 6-8 will be added here
};

export const VALID_STAGES = Object.keys(STAGE_REGISTRY);

// Framework routes within each stage (for Phase 3)
export const FRAMEWORK_REGISTRY: Record<string, Record<string, () => Promise<{ default: ComponentType }>>> = {
  '0': {
    // Phase 3: SWOT, TAM, Competitive Matrix, etc.
  },
  '1': {
    // Phase 3: V2MOM, BMC, PESTLE, etc.
  },
  '2': {
    // Phase 3: JTBD Canvas, RWW, RICE, etc.
  },
};
