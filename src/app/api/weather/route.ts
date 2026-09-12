import { NextRequest, NextResponse } from 'next/server';
import { getPlantWeatherAdvisory } from '@/lib/weather/open-meteo';

export async function GET(req: NextRequest) {
  try {
    const latParam = req.nextUrl.searchParams.get('lat');
    const lonParam = req.nextUrl.searchParams.get('lon');
    const locationParam = req.nextUrl.searchParams.get('loc') || 'Local Garden';

    const lat = latParam ? parseFloat(latParam) : 28.6139;
    const lon = lonParam ? parseFloat(lonParam) : 77.2090;

    const advisory = await getPlantWeatherAdvisory(lat, lon, locationParam);
    return NextResponse.json({ advisory });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
