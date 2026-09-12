import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const location = req.nextUrl.searchParams.get('location') || 'all';
  const light = req.nextUrl.searchParams.get('light') || 'all';
  const petFriendly = req.nextUrl.searchParams.get('petFriendly') === 'true';

  const catalog = [
    {
      id: 'rec_snake_plant',
      name: 'Snake Plant (Sansevieria)',
      scientificName: 'Dracaena trifasciata',
      location: 'indoor',
      light: 'low',
      petSafe: false,
      wateringDays: 14,
      difficulty: 'easy',
      tagline: 'Nearly indestructible, purifies bedroom air overnight.',
      imageUrl: 'https://images.unsplash.com/photo-1593482892290-f54927ae1bf6?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'rec_spider_plant',
      name: 'Spider Plant',
      scientificName: 'Chlorophytum comosum',
      location: 'indoor',
      light: 'indirect',
      petSafe: true,
      wateringDays: 7,
      difficulty: 'easy',
      tagline: '100% pet-safe, produces adorable cascading spiderettes.',
      imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'rec_boston_fern',
      name: 'Boston Fern',
      scientificName: 'Nephrolepis exaltata',
      location: 'balcony',
      light: 'indirect',
      petSafe: true,
      wateringDays: 3,
      difficulty: 'moderate',
      tagline: 'Loves high humidity, great for shady balconies and bathrooms.',
      imageUrl: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'rec_rosemary',
      name: 'Tuscan Blue Rosemary',
      scientificName: 'Salvia rosmarinus',
      location: 'outdoor',
      light: 'direct',
      petSafe: true,
      wateringDays: 4,
      difficulty: 'easy',
      tagline: 'Culinary staple, thrives in full hot sun with aromatic foliage.',
      imageUrl: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=600&auto=format&fit=crop&q=80',
    },
  ];

  let filtered = catalog;
  if (location !== 'all') {
    filtered = filtered.filter((p) => p.location === location);
  }
  if (light !== 'all') {
    filtered = filtered.filter((p) => p.light === light);
  }
  if (petFriendly) {
    filtered = filtered.filter((p) => p.petSafe);
  }

  return NextResponse.json({ recommendations: filtered });
}
