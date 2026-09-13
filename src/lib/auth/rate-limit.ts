import { NextRequest } from 'next/server';

interface RateLimitRecord { timestamps: number[]; }
const rateLimitStore = new Map<string, RateLimitRecord>();

if (typeof setInterval !== 'undefined') {
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore) {
      record.timestamps = record.timestamps.filter((timestamp: number) => now - timestamp < 3600000);
      if (record.timestamps.length === 0) rateLimitStore.delete(key);
    }
  }, 60000);
  if (typeof cleanupInterval.unref === 'function') cleanupInterval.unref();
}

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}

export function checkRateLimit(identifier: string, limit: number, windowMs: number): { allowed:boolean; remaining:number; resetTime:number } {
  const now=Date.now(); let record=rateLimitStore.get(identifier);
  if(!record){record={timestamps:[]};rateLimitStore.set(identifier,record);}
  record.timestamps=record.timestamps.filter((timestamp:number)=>now-timestamp<windowMs);
  if(record.timestamps.length>=limit){const oldest=record.timestamps[0]??now;return {allowed:false,remaining:0,resetTime:oldest+windowMs};}
  record.timestamps.push(now); return {allowed:true,remaining:limit-record.timestamps.length,resetTime:now+windowMs};
}
export function resetRateLimit(identifier:string):void{rateLimitStore.delete(identifier);}
