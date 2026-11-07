import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  CircleAlert,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { assistApi, type KnowledgeItem } from '../api/assist-api';
import { assistQueries } from '../queries';
import { PageHeader } from '../../../shared/components/PageHeader';
import { ErrorState, EmptyState } from '../../../shared/components/States';
import { TableSkeleton, CardSkeleton } from '../../../shared/components/Skeleton';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';
import { useCan } from '../../../shared/auth/use-permission';
import { useToast } from '../../../shared/components/toast-context';
import { useDebounced } from '../../../shared/utils/useDebounced';
import { Tabs } from '../../../shared/components/Tabs';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Select } from '../../../shared/components/Select';
import { ProgressRing } from '../../../shared/components/ProgressRing';
import { KnowledgeForm } from '../components/KnowledgeForm';
import { KNOWLEDGE_CATEGORIES } from '../components/knowledge-categories';
import { KnowledgeUpload } from '../components/KnowledgeUpload';
import { KnowledgeTable } from '../components/KnowledgeTable';
import '../styles/knowledge.css';

const CATEGORY_LABEL: Record<string, string> = {
  GENERAL: 'General',
  FAQ: 'FAQ',
  EVENTS: 'Events',
  FEATURES: 'Features',
  COMPANY_INFO: 'Company info',
  SERVICES: 'Services',
  POLICIES: 'Policies',
  PRICING: 'Pricing',
  PROCEDURES: 'Procedures',
};

function HealthScore({ items }: { items: KnowledgeItem[] }) {
  const active = items.filter((i) => i.status === 'ACTIVE').length;
  const failed = items.filter((i) => i.status === 'ACTIVE' && i.processingStatus === 'FAILED').length;
  const ready = items.filter(
    (i) => i.status === 'ACTIVE' && i.processingStatus === 'COMPLETED'
  ).length;
  const score = items.length ? Math.round((ready / Math.max(active, 1)) * 100) : 0;
  return (
    <Card className="kb-health">
      <ProgressRing value={score / 100} size={64} label={`${score}%`} />
      <div>
        <div className="kb-health__title">Knowledge health</div>
        <div className="kb-health__sub">
          {ready} of {active} active items processed
          {failed > 0 && ` · ${failed} failed`}
        </div>
      </div>
    </Card>
  );
}

function GapList({ onAnswer }: { onAnswer: (q: string) => void }) {
  const gaps = useQuery({ queryKey: ['knowledge', 'gaps'], queryFn: () => assistApi.listKnowledgeGaps() });
  const items = gaps.data?.items ?? [];
  if (gaps.isPending) return <CardSkeleton lines={4} />;
  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Sparkles size={18} />}
        title="No knowledge gaps"
        message="Every visitor question the assistant couldn't ground will land here."
      />
    );
  }
  return (
    <Card title="Knowledge gaps" subtitle="Questions the assistant answered ungrounded — most frequent first." pad="none">
      <ul className="kb-gaps">
        {items.map((g, i) => (
          <li key={i}>
            <div className="kb-gap__q">{g.question}</div>
            <div className="kb-gap__meta">
              <span>{g.times}×</span>
              <a href={`/dashboard/assist/conversations/${g.conversationId}`}>thread</a>
              <button onClick={() => onAnswer(g.question)}>Answer this</button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function Playground() {
  const [text, setText] = useState('');
  const [history, setHistory] = useState<{ q: string; a: string; grounded: boolean; sources: number }[]>([]);
  const ask = useMutation({
    mutationFn: (m: string) => assistApi.aiRespond({ message: m }),
    onSuccess: (res, m) =>
      setHistory((h) => [...h, { q: m, a: res.message, grounded: res.grounded, sources: res.sources?.length ?? 0 }]),
  });
  return (
    <Card
      title="Test the assistant"
      subtitle="Ask questions against the live knowledge base before publishing."
      className="kb-play"
    >
      <div className="kb-play__log">
        {history.length === 0 && <p className="muted small">Ask something your customers would ask…</p>}
        {history.map((t, i) => (
          <div key={i} className="kb-play__turn">
            <div className="kb-play__q">{t.q}</div>
            <div className="kb-play__a">
              {t.a}
              <span className={`msg-tag ${t.grounded ? 'msg-tag--ok' : 'msg-tag--warn'}`}>
                {t.grounded ? `Grounded · ${t.sources} sources` : 'Ungrounded'}
              </span>
            </div>
          </div>
        ))}
        {ask.isPending && <div className="kb-play__a muted">Thinking…</div>}
      </div>
      <form
        className="kb-play__form"
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) {
            ask.mutate(text.trim());
            setText('');
          }
        }}
      >
        <input
          className="input"
          placeholder="e.g. What are your opening hours?"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button type="submit" size="sm" loading={ask.isPending}>
          Ask
        </Button>
      </form>
      {ask.isError && <p className="form-error">{ask.error.message}</p>}
    </Card>
  );
}

export function KnowledgePage() {
  useDocumentTitle('Knowledge base');
  const canWrite = useCan('knowledge.write');
  const toast = useToast();
  const qc = useQueryClient();
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState('all');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search, 220);
  const [form, setForm] = useState<{ title: string; category: string } | null>(
    params.get('new') ? { title: params.get('title') ?? '', category: 'FAQ' } : null
  );

  const filters = useMemo(
    () => ({
      status: tab === 'all' ? undefined : tab.toUpperCase(),
      category: category || undefined,
      search: debouncedSearch || undefined,
    }),
    [tab, category, debouncedSearch]
  );
  const query = useQuery(assistQueries.knowledge(filters));
  const all = useQuery(assistQueries.knowledge({}));
  const refresh = () => void qc.invalidateQueries({ queryKey: ['knowledge'] });

  const process = useMutation({
    mutationFn: (id: string) => assistApi.processKnowledge(id),
    onSuccess: refresh,
    onError: (e) => toast({ title: 'Re-process failed', description: e.message, kind: 'error' }),
  });

  const answerGap = (q: string) => setForm({ title: q.length > 80 ? `${q.slice(0, 80)}…` : q, category: 'FAQ' });
  const closeForm = () => {
    setForm(null);
    if (params.get('new')) setParams({}, { replace: true });
  };

  const failedCount = (all.data?.items ?? []).filter(
    (i) => i.status === 'ACTIVE' && i.processingStatus === 'FAILED'
  ).length;

  return (
    <>
      <PageHeader
        title="Knowledge base"
        subtitle="The approved information your assistant answers from."
        actions={
          canWrite && (
            <Button size="sm" icon={<Plus size={14} />} onClick={() => setForm({ title: '', category: 'FAQ' })}>
              New item
            </Button>
          )
        }
      />
      <div className="kb-layout">
        <div className="kb-main">
          <div className="kb-toolbar">
            <Tabs
              tabs={[
                { value: 'all', label: 'All' },
                { value: 'active', label: 'Active' },
                { value: 'draft', label: 'Draft' },
                { value: 'archived', label: 'Archived' },
                { value: 'gaps', label: 'Gaps', icon: <CircleAlert size={13} /> },
              ]}
              value={tab}
              onChange={setTab}
            />
            <div className="kb-toolbar__right">
              <div className="leads-search">
                <Search size={13} />
                <input placeholder="Search knowledge…" value={search} onChange={(e) => setSearch(e.target.value)} />
                {search && (
                  <button aria-label="Clear" onClick={() => setSearch('')}>
                    <X size={12} />
                  </button>
                )}
              </div>
              <Select
                size="sm"
                value={category || '__all__'}
                onChange={(v) => setCategory(v === '__all__' ? '' : v)}
                ariaLabel="Category"
                options={[
                  { value: '__all__', label: 'All categories' },
                  ...KNOWLEDGE_CATEGORIES.map((c) => ({
                    value: c,
                    label: CATEGORY_LABEL[c] ?? c,
                  })),
                ]}
              />
            </div>
          </div>

          {failedCount > 0 && (
            <div className="kb-warning">
              <CircleAlert size={13} /> {failedCount} active item{failedCount === 1 ? '' : 's'} failed
              processing —{' '}
              {all.data?.items
                .filter((i) => i.status === 'ACTIVE' && i.processingStatus === 'FAILED')
                .map((i) => (
                  <button key={i.id} onClick={() => process.mutate(i.id)} disabled={process.isPending}>
                    <RefreshCw size={11} /> retry {i.title.slice(0, 24)}
                  </button>
                ))}
            </div>
          )}

          {tab === 'gaps' ? (
            <GapList onAnswer={canWrite ? answerGap : () => undefined} />
          ) : (
            <>
              {query.isPending && <TableSkeleton />}
              {query.isError && <ErrorState message={query.error.message} />}
              {query.data &&
                (query.data.items.length === 0 ? (
                  <EmptyState
                    icon={<BookOpen size={18} />}
                    title={search || category || tab !== 'all' ? 'Nothing matches' : 'No knowledge yet'}
                    message={
                      search || category || tab !== 'all'
                        ? 'Try different filters.'
                        : 'Add FAQs, policies, services — the assistant only answers from approved items.'
                    }
                  />
                ) : (
                  <section className="card card--pad0">
                    <div className="table-wrap">
                      <KnowledgeTable items={query.data.items} />
                    </div>
                  </section>
                ))}
            </>
          )}
          {canWrite && <KnowledgeUpload onUploaded={refresh} />}
        </div>
        <aside className="kb-side">
          <HealthScore items={all.data?.items ?? []} />
          <Playground />
          {form && (
            <div className="kb-form">
              <KnowledgeForm
                initialTitle={form.title}
                initialCategory={form.category}
                onCreated={() => {
                  closeForm();
                  refresh();
                  toast({ title: 'Knowledge saved as draft', kind: 'success' });
                }}
              />
              <button className="kb-form__close" onClick={closeForm}>
                <X size={13} /> Close form
              </button>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
