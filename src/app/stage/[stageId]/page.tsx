// src/app/stage/[stageId]/page.tsx
'use client';

import { use, lazy, Suspense } from 'react';
import { notFound } from 'next/navigation';
import { STAGE_REGISTRY, VALID_STAGES } from '@/lib/frameworkRegistry';

// Eagerly import landing components (they're the most visited pages)
import Stage0Landing from '@/components/stages/Stage0Landing';
import Stage1Landing from '@/components/stages/Stage1Landing';
import Stage2Landing from '@/components/stages/Stage2Landing';

const LANDING_MAP: Record<string, React.ComponentType> = {
  '0': Stage0Landing,
  '1': Stage1Landing,
  '2': Stage2Landing,
};

interface Props {
  params: Promise<{ stageId: string }>;
}

export default function StageLandingPage({ params }: Props) {
  const { stageId } = use(params);

  if (!VALID_STAGES.includes(stageId)) {
    notFound();
  }

  const Component = LANDING_MAP[stageId];
  if (!Component) {
    notFound();
  }

  return <Component />;
}
