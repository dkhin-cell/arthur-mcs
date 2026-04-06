// src/app/stage/[stageId]/gate/page.tsx
'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import { VALID_STAGES } from '@/lib/frameworkRegistry';

import Stage0Gate from '@/components/stages/Stage0Gate';
import Stage1Gate from '@/components/stages/Stage1Gate';
import Stage2Gate from '@/components/stages/Stage2Gate';
import Stage3Gate from '@/components/stages/Stage3Gate';
import Stage4Gate from '@/components/stages/Stage4Gate';
import Stage5Gate from '@/components/stages/Stage5Gate';
import Stage6Gate from '@/components/stages/Stage6Gate';
import Stage7Gate from '@/components/stages/Stage7Gate';
import Stage8Gate from '@/components/stages/Stage8Gate';

const GATE_MAP: Record<string, React.ComponentType> = {
  '0': Stage0Gate, '1': Stage1Gate, '2': Stage2Gate,
  '3': Stage3Gate, '4': Stage4Gate, '5': Stage5Gate,
  '6': Stage6Gate, '7': Stage7Gate, '8': Stage8Gate,
};

interface Props { params: Promise<{ stageId: string }>; }

export default function StageGatePage({ params }: Props) {
  const { stageId } = use(params);
  if (!VALID_STAGES.includes(stageId)) notFound();
  const Component = GATE_MAP[stageId];
  if (!Component) notFound();
  return <Component />;
}
