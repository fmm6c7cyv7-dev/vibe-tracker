import { NextResponse } from 'next/server';

export async function GET() {
  // Här kan vi framtidaanpassa med riktiga API-anrop mot OpenAI, Gemini, Vercel och GitHub om nycklar finns.
  // För närvarande returnerar vi strukturerad telemetridata som synkar med instrumentpanelens state.

  const telemetryData = [
    {
      id: 'openai',
      name: 'OpenAI API',
      provider: 'OPENAI',
      status: 'healthy',
      tokens24h: { prompt: 1420500, completion: 389200, total: 1809700 },
      burnRate: 142.5,
      costMonth: 342.8,
      budgetCap: 400.0,
      latencyMs: 320,
      latencyHistory: [310, 340, 290, 420, 315, 330, 295, 305, 360, 320],
      uptimePercent: 99.98
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      provider: 'GOOGLE',
      status: 'healthy',
      tokens24h: { prompt: 2840000, completion: 820000, total: 3660000 },
      burnRate: 268.0,
      costMonth: 184.2,
      budgetCap: 250.0,
      latencyMs: 245,
      latencyHistory: [260, 250, 240, 270, 230, 245, 238, 255, 240, 245],
      uptimePercent: 99.99
    },
    {
      id: 'vercel',
      name: 'Vercel Edge',
      provider: 'VERCEL',
      status: 'warning',
      tokens24h: { prompt: 620000, completion: 140000, total: 760000 },
      burnRate: 48.2,
      costMonth: 82.5,
      budgetCap: 90.0,
      latencyMs: 85,
      latencyHistory: [78, 82, 85, 110, 142, 95, 88, 84, 89, 85],
      uptimePercent: 99.85
    },
    {
      id: 'github',
      name: 'GitHub Copilot',
      provider: 'GITHUB',
      status: 'healthy',
      tokens24h: { prompt: 980000, completion: 410000, total: 1390000 },
      burnRate: 112.4,
      costMonth: 38.0,
      budgetCap: 50.0,
      latencyMs: 410,
      latencyHistory: [390, 420, 405, 430, 395, 415, 440, 400, 395, 410],
      uptimePercent: 99.94
    }
  ];

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    services: telemetryData
  });
}
