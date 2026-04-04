// src/app/stage/[stageId]/input/page.tsx
'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import { VALID_STAGES } from '@/lib/frameworkRegistry';

import Stage0Input from '@/components/stages/Stage0Input';
import Stage1Input from '@/components/stages/Stage1Input';
import Stage2Input from '@/components/stages/Stage2Input';

const INPUT_MAP: Record<string, React.ComponentType> = {
  '0': Stage0Input,
  '1': Stage1Input,
  '2': Stage2Input,
};

interface Props {
  params: Promise<{ stageId: string }>;
}

export default function StageInputPage({ params }: Props) {
  const { stageId } = use(params);

  if (!VALID_STAGES.includes(stageId)) {
    notFound();
  }

  const Component = INPUT_MAP[stageId];
  if (!Component) {
    notFound();
  }

  return <Component />;
}
