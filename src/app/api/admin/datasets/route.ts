import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const datasets = [
      {
        id: 'ds_solanaceae_blight_2026',
        name: 'Solanaceae Leaf Blight & Canker Master Set',
        format: 'YOLOv8 / PyTorch',
        imagesCount: 38450,
        classes: ['healthy', 'early_blight', 'late_blight', 'bacterial_canker', 'septoria'],
        sizeMB: 1420,
        license: 'CC-BY-4.0',
        lastUpdated: '2026-09-01T10:00:00Z',
      },
      {
        id: 'ds_aroid_houseplants_2026',
        name: 'Indoor Aroids & Tropical Pests Detection',
        format: 'COCO JSON + Images',
        imagesCount: 22100,
        classes: ['thrips', 'spider_mites', 'mealybugs', 'edema', 'chlorosis'],
        sizeMB: 980,
        license: 'Plantinia Commercial AI License',
        lastUpdated: '2026-08-20T14:30:00Z',
      },
      {
        id: 'ds_citrus_pathology_2026',
        name: 'Citrus Greening & Melanose Diagnostic Archive',
        format: 'Pascal VOC / TFRecord',
        imagesCount: 15600,
        classes: ['citrus_canker', 'greening_hlb', 'black_spot', 'scab'],
        sizeMB: 760,
        license: 'Plantinia Commercial AI License',
        lastUpdated: '2026-07-15T09:15:00Z',
      },
    ];

    return NextResponse.json({ datasets });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
