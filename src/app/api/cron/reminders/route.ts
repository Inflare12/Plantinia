import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/adapter';
import { getEmailProvider } from '@/lib/email';
import { getPlantWeatherAdvisory } from '@/lib/weather/open-meteo';

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (process.env.NODE_ENV === 'production') {
      if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) return NextResponse.json({ error: 'Unauthorized cron trigger' }, { status: 401 });
    } else if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized cron trigger' }, { status: 401 });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const users = await db.users.listAll();
    const weather = await getPlantWeatherAdvisory();
    const emailProvider = getEmailProvider();
    let processedCount = 0;

    for (const user of users) {
      const userTasks = await db.careTasks.listByUser(user.id);
      const pendingToday = userTasks.filter((t) => !t.isCompleted && t.dueDate <= todayStr);
      if (pendingToday.length === 0) continue;
      processedCount++;

      const taskListHtml = pendingToday.map((t) => `<li><strong>${escapeHtml(t.category.toUpperCase())}:</strong> ${escapeHtml(t.title)}</li>`).join('');
      const weatherNote = weather.frostAlert
        ? '<p style="color:#dc2626;font-weight:bold;">Frost Warning: Bring tropical plants indoors!</p>'
        : weather.fungalRisk === 'high'
          ? '<p style="color:#d97706;">High fungal risk: Avoid evening leaf spraying.</p>'
          : '';

      await emailProvider.sendEmail({
        to: user.email,
        subject: `🌱 Your Daily Plantinia Garden Digest (${pendingToday.length} tasks today)`,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:20px;"><h2 style="color:#059669;">Good morning, ${escapeHtml(user.name)}!</h2>${weatherNote}<h3>Today's Plant Care Tasks:</h3><ul>${taskListHtml}</ul><p><a href="https://plantinia.app/care-plans" style="color:#059669;font-weight:bold;">Open Plantinia Dashboard</a></p></div>`,
      });
    }

    return NextResponse.json({ success: true, timestamp: new Date().toISOString(), digestsDispatched: processedCount, weatherAlert: weather.frostAlert || weather.heatAlert });
  } catch (error) {
    console.error('Reminder cron error:', error);
    return NextResponse.json({ error: 'Reminder job failed' }, { status: 500 });
  }
}
