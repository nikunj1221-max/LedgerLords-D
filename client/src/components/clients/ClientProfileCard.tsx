import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Building2, User, Mail, Phone, Calendar, HeartHandshake, ShieldCheck, Tag } from 'lucide-react';
import { ComponentSpec } from '../../types/workspace';

interface Client {
  id: string;
  name: string;
  shortName: string;
  industry: string;
  tier: string;
  status: string;
  mrr: number;
  healthScore: number;
  healthTrend: string;
  contractRenewalDate: string;
  primaryContact: {
    name: string;
    title: string;
    email: string;
    phone: string;
  };
  accountExecutiveName: string;
  customerSuccessName: string;
  tags: string[];
  summary: string;
}

export const ClientProfileCard: React.FC<{ spec: ComponentSpec }> = ({ spec }) => {
  const clientId = spec.config?.clientId || 'client-acme-corp';
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    axios
      .get(`/api/data/clients?clientId=${clientId}`)
      .then(res => setClient(res.data))
      .catch(console.error);
  }, [clientId]);

  if (!client) {
    return <div className="text-xs text-gray-400 py-4">Loading client dossier...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Top Banner with Health & Tier */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">{client.name}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/20 text-primary border border-primary/30">
              {client.tier}
            </span>
          </div>
          <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-gray-500" />
            {client.industry}
          </div>
        </div>

        {/* Health score badge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-gray-400">Health Score</div>
            <div className="text-base font-bold text-teal-400 flex items-center justify-end gap-1">
              <HeartHandshake className="w-4 h-4" />
              {client.healthScore}/100
            </div>
          </div>
          <div className="text-right pl-3 border-l border-border/50">
            <div className="text-xs text-gray-400">Monthly Contract</div>
            <div className="text-base font-bold text-white">
              ${(client.mrr / 1000).toFixed(1)}k <span className="text-[10px] font-normal text-gray-400">/mo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Contact & Team Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-plum-900/40 border border-border/50">
          <div className="font-semibold text-gray-300 flex items-center gap-1.5 mb-2">
            <User className="w-3.5 h-3.5 text-primary" />
            Primary Client Contact
          </div>
          <div className="font-medium text-white">{client.primaryContact.name}</div>
          <div className="text-gray-400 text-[11px]">{client.primaryContact.title}</div>
          <div className="mt-2 space-y-1 text-gray-300 text-[11px]">
            <div className="flex items-center gap-1.5 text-teal-300">
              <Mail className="w-3 h-3" />
              <a href={`mailto:${client.primaryContact.email}`} className="hover:underline">
                {client.primaryContact.email}
              </a>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400">
              <Phone className="w-3 h-3" />
              {client.primaryContact.phone}
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-plum-900/40 border border-border/50">
          <div className="font-semibold text-gray-300 flex items-center gap-1.5 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-teal" />
            Account Team
          </div>
          <div className="text-[11px] text-gray-400">
            Account Executive: <strong className="text-gray-200">{client.accountExecutiveName}</strong>
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            Customer Success Lead: <strong className="text-gray-200">{client.customerSuccessName}</strong>
          </div>
          <div className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            Renewal Date: <strong className="text-amber-300">{client.contractRenewalDate}</strong>
          </div>
        </div>
      </div>

      {/* Account Context & Summary */}
      <div className="p-3 rounded-lg bg-canvas/60 border border-border/40 text-xs text-gray-300 leading-relaxed">
        <strong className="text-gray-200 font-medium">Account Context: </strong>
        {client.summary}
      </div>

      {/* Tags */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <Tag className="w-3.5 h-3.5 text-gray-500" />
        {client.tags.map(tag => (
          <span
            key={tag}
            className="px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-gray-300"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};
