// src/app/stage/[stageId]/page.tsx
'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import { VALID_STAGES } from '@/lib/frameworkRegistry';

import Stage0Landing from '@/components/stages/Stage0Landing';
import Stage1Landing from '@/components/stages/Stage1Landing';
import Stage2Landing from '@/components/stages/Stage2Landing';
import Stage3Landing from '@/components/stages/Stage3Landing';
import Stage4Landing from '@/components/stages/Stage4Landing';
import Stage5Landing from '@/components/stages/Stage5Landing';
import Stage6Landing from '@/components/stages/Stage6Landing';
import Stage7Landing from '@/components/stages/Stage7Landing';
import Stage8Landing from '@/components/stages/Stage8Landing';

const LANDING_MAP: Record<string, React.ComponentType> = {
  '0': Stage0Landing, '1': Stage1Landing, '2': Stage2Landing,
  '3': Stage3Landing, '4': Stage4Landing, '5': Stage5Landing,
  '6': Stage6Landing, '7': Stage7Landing, '8': Stage8Landing,
};

interface Props { params: Promise<{ stageId: string }>; }

export default function StageLandingPage({ params }: Props) {
  const { stageId } = use(params);
  if (!VALID_STAGES.includes(stageId)) notFound();
  const Component = LANDING_MAP[stageId];
  if (!Component) notFound();
  return <Component />;
}
