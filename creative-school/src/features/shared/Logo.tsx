import { Sparkles } from 'lucide-react';
import { Link } from 'wouter';

export function Logo({ light = false }: { light?: boolean }) {
  return <Link href="/" className={`flex items-center gap-2.5 ${light ? 'text-[#f2efe5]' : 'text-foreground'}`}><span className="grid h-8 w-8 place-items-center rounded-[9px] bg-primary text-primary-foreground shadow-sm"><Sparkles size={16} strokeWidth={2.5} /></span><span className="font-display text-[17px] font-semibold tracking-[-.04em]">creative school<span className="text-primary">.</span></span></Link>;
}