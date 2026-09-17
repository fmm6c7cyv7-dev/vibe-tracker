'use client';

import dynamic from 'next/dynamic';

const VibeTrackerDashboard = dynamic(
  () => import('@/components/dashboard/VibeTrackerDashboard'),
  { ssr: false }
);

export default function Page() {
  return (
    <main className="w-screen h-screen overflow-hidden bg-[#08090c]">
      <VibeTrackerDashboard />
    </main>
  );
}
