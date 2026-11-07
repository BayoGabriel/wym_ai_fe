import { useMemo, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragEndEvent,
  DragOverlay,
} from '@dnd-kit/core';
import { Mail, Phone } from 'lucide-react';
import type { Lead } from '../api/assist-api';
import { EmptyState } from '../../../shared/components/States';
import { LEAD_STAGES } from './lead-stages';

const STAGE_META: Record<string, { label: string; cls: string }> = {
  NEW: { label: 'New', cls: 'kb-col--new' },
  CONTACTED: { label: 'Contacted', cls: 'kb-col--contacted' },
  QUALIFIED: { label: 'Qualified', cls: 'kb-col--qualified' },
  CONVERTED: { label: 'Converted', cls: 'kb-col--converted' },
  LOST: { label: 'Lost', cls: 'kb-col--lost' },
};

function LeadCard({ lead, overlay, onOpen }: { lead: Lead; overlay?: boolean; onOpen: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    data: { lead },
    disabled: overlay,
  });
  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => onOpen(lead.id)}
      className={`kb-card${isDragging ? ' is-dragging' : ''}${overlay ? ' is-overlay' : ''}`}
      style={
        transform && !overlay
          ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
          : undefined
      }
    >
      <span className="kb-card__name">{lead.name ?? 'Unnamed lead'}</span>
      <span className="kb-card__sub">
        {lead.enquiryCategory ?? lead.source.toLowerCase().replace('_', ' ')}
      </span>
      <span className="kb-card__contact">
        {lead.email && (
          <span>
            <Mail size={11} /> {lead.email}
          </span>
        )}
        {lead.phone && (
          <span>
            <Phone size={11} /> {lead.phone}
          </span>
        )}
      </span>
    </button>
  );
}

function Column({
  stage,
  leads,
  onOpen,
}: {
  stage: string;
  leads: Lead[];
  onOpen: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `col:${stage}`, data: { stage } });
  const meta = STAGE_META[stage];
  return (
    <div ref={setNodeRef} className={`kb-col ${meta.cls}${isOver ? ' is-over' : ''}`}>
      <div className="kb-col__head">
        <span className="kb-col__dot" />
        {meta.label}
        <span className="kb-col__count">{leads.length}</span>
      </div>
      <div className="kb-col__cards">
        {leads.map((l) => (
          <LeadCard key={l.id} lead={l} onOpen={onOpen} />
        ))}
        {leads.length === 0 && <div className="kb-col__empty">Drop leads here</div>}
      </div>
    </div>
  );
}

export function LeadKanban({
  leads,
  onMove,
  onOpen,
}: {
  leads: Lead[];
  onMove: (id: string, status: string) => void;
  onOpen: (id: string) => void;
}) {
  const [active, setActive] = useState<Lead | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const byStage = useMemo(() => {
    const map = new Map<string, Lead[]>(LEAD_STAGES.map((s) => [s, []]));
    for (const l of leads) {
      const list = map.get(l.status) ?? map.get('NEW');
      list?.push(l);
    }
    return map;
  }, [leads]);

  const onDragEnd = (e: DragEndEvent) => {
    setActive(null);
    const lead = e.active.data.current?.lead as Lead | undefined;
    const stage = (e.over?.data.current as { stage?: string } | undefined)?.stage;
    if (lead && stage && stage !== lead.status) onMove(lead.id, stage);
  };

  if (leads.length === 0) {
    return (
      <EmptyState
        title="No leads yet"
        message="Leads appear when visitors share contact details. Drag cards between stages once they arrive."
      />
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(e) => setActive((e.active.data.current as { lead: Lead }).lead)}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActive(null)}
    >
      <div className="kb-board">
        {LEAD_STAGES.map((s) => (
          <Column key={s} stage={s} leads={byStage.get(s) ?? []} onOpen={onOpen} />
        ))}
      </div>
      <DragOverlay>{active ? <LeadCard lead={active} overlay onOpen={() => undefined} /> : null}</DragOverlay>
    </DndContext>
  );
}
