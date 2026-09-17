import { NextResponse } from 'next/server';

export async function GET() {
  // Central datainsamling (telemetry ingestion layer) som tillhandahåller fullständig rådata
  const telemetryData = [
    {
      id: 'openai',
      name: 'OpenAI API',
      provider: 'OPENAI',
      status: 'healthy',
      tier: 'Usage tier 1',
      creditBalance: 2.80,
      spendLimit: 10.00,
      autoReload: false,
      tokens24h: { prompt: 1420500, completion: 389200, total: 1809700 },
      burnRate: 142.5,
      costMonth: 2.80,
      budgetCap: 10.00,
      latencyMs: 320,
      latencyHistory: [310, 340, 290, 420, 315, 330, 295, 305, 360, 320],
      uptimePercent: 99.98
    },
    {
      id: 'github',
      name: 'GitHub Copilot',
      provider: 'GITHUB',
      status: 'healthy',
      subscription: 'Copilot Max',
      monthlyPrice: 100.0,
      aiCredits: {
        used: 8876,
        total: 20000,
        resetDate: '2026-10-01'
      },
      meteredUsage: 116.29,
      includedUsage: 109.29,
      tokens24h: { prompt: 980000, completion: 410000, total: 1390000 },
      burnRate: 112.4,
      costMonth: 100.0,
      budgetCap: 100.0,
      latencyMs: 410,
      latencyHistory: [390, 420, 405, 430, 395, 415, 440, 400, 395, 410],
      uptimePercent: 99.94
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      provider: 'GOOGLE',
      status: 'healthy',
      tier: 'Developer API',
      tokens24h: { prompt: 2840000, completion: 820000, total: 3660000 },
      burnRate: 268.0,
      costMonth: 8.40,
      budgetCap: 30.0,
      latencyMs: 245,
      latencyHistory: [260, 250, 240, 270, 230, 245, 238, 255, 240, 245],
      uptimePercent: 99.99
    },
    {
      id: 'vercel',
      name: 'Vercel Edge',
      provider: 'VERCEL',
      status: 'healthy',
      plan: 'Hobby',
      tokens24h: { prompt: 620000, completion: 140000, total: 760000 },
      burnRate: 48.2,
      costMonth: 0.0,
      budgetCap: 0.0,
      latencyMs: 85,
      latencyHistory: [78, 82, 85, 110, 95, 95, 88, 84, 89, 85],
      uptimePercent: 99.85
    }
  ];

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    services: telemetryData
  });
}
