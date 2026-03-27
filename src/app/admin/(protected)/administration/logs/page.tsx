"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Terminal, Activity, ShieldCheck } from "lucide-react";

export default function LogsPage() {
  const dummyLogs = [
    { id: 1, event: "SYSTEM_BOOT", user: "system", status: "success", timestamp: "2026-03-28 02:15:22", message: "Kernel initialization sequence complete." },
    { id: 2, event: "AUTH_LOGIN", user: "reyad", status: "success", timestamp: "2026-03-28 02:18:45", message: "Admin authenticated via command center." },
    { id: 3, event: "COUPON_CREATE", user: "reyad", status: "success", timestamp: "2026-03-28 02:22:10", message: "Verified coupon 'SUMMER25' registered to database." },
    { id: 4, event: "ORDER_CREATE", user: "pos_agent", status: "success", timestamp: "2026-03-28 02:30:05", message: "POS Transaction #POS-123456 finalized." },
    { id: 5, event: "DB_BACKUP", user: "system", status: "pending", timestamp: "2026-03-28 02:45:00", message: "Scheduled synchronization with cloud redundant storage." },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black font-headline uppercase tracking-tight">System Logs</h1>
        <p className="text-zinc-500 text-sm font-bold uppercase tracking-tight">Real-time activity and security audit trail.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-zinc-200">
           <div className="flex items-center gap-2 mb-4">
              <Activity className="h-4 w-4 text-orange-600" />
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">System Vitality</h3>
           </div>
           <p className="text-2xl sm:text-3xl font-black tracking-tighter">99.98%</p>
           <p className="text-[10px] font-bold text-green-600 uppercase mt-1">Operational Stable</p>
        </div>
        <div className="p-6 bg-white border border-zinc-200">
           <div className="flex items-center gap-2 mb-4">
              <Terminal className="h-4 w-4 text-blue-600" />
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Total Entries</h3>
           </div>
           <p className="text-2xl sm:text-3xl font-black tracking-tighter">12,842</p>
           <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1">Daily Log Rotation: On</p>
        </div>
        <div className="p-6 bg-white border border-zinc-200 sm:col-span-2 lg:col-span-1">
           <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="h-4 w-4 text-zinc-900" />
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Threat Levels</h3>
           </div>
           <p className="text-2xl sm:text-3xl font-black tracking-tighter">NOMINAL</p>
           <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1">Encryption: AES-256</p>
        </div>
      </div>

      <div className="border border-zinc-200 bg-white overflow-x-auto">
        <div className="min-w-[800px]">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50">
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Event Identity</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Authority</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Temporal Signature</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Action Payload</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-zinc-50 font-mono">
                  <TableCell className="text-[10px] font-black text-blue-600">{log.event}</TableCell>
                  <TableCell className="text-[10px] font-bold text-zinc-500 uppercase">{log.user}</TableCell>
                  <TableCell>
                    <Badge className={`rounded-none uppercase text-[8px] font-black tracking-widest ${log.status === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[9px] text-zinc-400 whitespace-nowrap">{log.timestamp}</TableCell>
                  <TableCell className="text-[10px] text-zinc-600 italic">"{log.message}"</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
