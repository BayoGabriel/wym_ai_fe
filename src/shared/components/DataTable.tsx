import { useMemo, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Columns3 } from 'lucide-react';
import { Skeleton } from './Skeleton';
import { EmptyState } from './States';
import { Dropdown } from './Dropdown';
import { usePrefs } from '../prefs/prefs';
import './DataTable.css';

export type ColumnDef<T> = {
  key: string;
  header: ReactNode;
  render?: (row: T) => ReactNode;
  /** Maps to a server sort param; enables the header sort toggle */
  sortKey?: string;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  defaultHidden?: boolean;
  hideable?: boolean;
};

export type SortState = { key: string; dir: 'asc' | 'desc' } | null;

type Props<T> = {
  columns: ColumnDef<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  skeletonRows?: number;
  empty?: { icon?: ReactNode; title: string; message?: string; action?: ReactNode };
  sort?: SortState;
  onSort?: (s: SortState) => void;
  selection?: Set<string>;
  onSelectionChange?: (s: Set<string>) => void;
  /** Rendered inside the floating bar while selection is non-empty */
  bulkActions?: (selected: Set<string>) => ReactNode;
  /** Persist column visibility per user (localStorage prefs) */
  persistKey?: string;
  onRowClick?: (row: T) => void;
  caption?: string;
};

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading,
  skeletonRows = 6,
  empty,
  sort,
  onSort,
  selection,
  onSelectionChange,
  bulkActions,
  persistKey,
  onRowClick,
  caption,
}: Props<T>) {
  const [prefs, setPref] = usePrefs();
  const [localHidden, setLocalHidden] = useState<string[] | null>(null);

  const defaultVisible = useMemo(
    () => columns.filter((c) => !c.defaultHidden).map((c) => c.key),
    [columns]
  );
  const visibleKeys: string[] = persistKey
    ? (prefs.tableColumns[persistKey] ?? defaultVisible)
    : (localHidden ?? defaultVisible);

  const visible = columns.filter((c) => visibleKeys.includes(c.key) || c.hideable === false);

  const setVisible = (keys: string[]) => {
    if (persistKey) setPref('tableColumns', { ...prefs.tableColumns, [persistKey]: keys });
    else setLocalHidden(keys);
  };

  const toggleColumn = (key: string) => {
    const next = visibleKeys.includes(key)
      ? visibleKeys.filter((k) => k !== key)
      : [...visibleKeys, key];
    setVisible(next);
  };

  const selectable = !!selection && !!onSelectionChange;
  const allSelected = selectable && rows.length > 0 && rows.every((r) => selection!.has(rowKey(r)));
  const someSelected = selectable && selection!.size > 0;
  const headRef = (el: HTMLInputElement | null) => {
    if (el) el.indeterminate = someSelected && !allSelected;
  };

  const toggleAll = () => {
    const next = new Set(selection);
    if (allSelected) rows.forEach((r) => next.delete(rowKey(r)));
    else rows.forEach((r) => next.add(rowKey(r)));
    onSelectionChange!(next);
  };

  const sortIcon = (c: ColumnDef<T>) => {
    if (!c.sortKey) return null;
    if (sort?.key === c.sortKey)
      return sort.dir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
    return <ArrowUpDown size={12} className="dt-sort__idle" />;
  };

  return (
    <div className="dt-wrap">
      <div className="dt-toolbar">
        {bulkActions && someSelected ? (
          <div className="dt-bulk" role="toolbar" aria-label="Bulk actions">
            <span className="dt-bulk__count">{selection!.size} selected</span>
            {bulkActions(selection!)}
          </div>
        ) : null}
        <div className="dt-toolbar__end">
          {columns.some((c) => c.hideable !== false) && (
            <Dropdown
              align="end"
              trigger={
                <button className="status-select dt-cols-btn" type="button">
                  <Columns3 size={13} /> Columns
                </button>
              }
              items={columns
                .filter((c) => c.hideable !== false)
                .map((c) => ({
                  type: 'custom' as const,
                  node: (
                    <label className="dt-col-toggle" key={c.key}>
                      <input
                        type="checkbox"
                        checked={visibleKeys.includes(c.key)}
                        onChange={() => toggleColumn(c.key)}
                      />
                      {c.header}
                    </label>
                  ),
                }))}
            />
          )}
        </div>
      </div>
      <div className="dt-scroll">
        <table className="ops-table dt-table">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr>
              {selectable && (
                <th className="dt-check">
                  <input
                    ref={headRef}
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {visible.map((c) => (
                <th
                  key={c.key}
                  style={{
                    width: c.width,
                    textAlign: c.align ?? 'left',
                  }}
                  aria-sort={
                    sort && sort.key === c.sortKey
                      ? sort.dir === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                >
                  {c.sortKey && onSort ? (
                    <button
                      className="dt-sort"
                      onClick={() =>
                        onSort(
                          sort && sort.key === c.sortKey && sort.dir === 'desc'
                            ? { key: c.sortKey!, dir: 'asc' }
                            : { key: c.sortKey!, dir: 'desc' }
                        )
                      }
                    >
                      {c.header}
                      {sortIcon(c)}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: skeletonRows }).map((_, i) => (
                  <tr key={`sk-${i}`}>
                    {selectable && (
                      <td className="dt-check">
                        <Skeleton w={14} h={14} />
                      </td>
                    )}
                    {visible.map((c) => (
                      <td key={c.key}>
                        <Skeleton w={`${70 + ((i + c.key.length) % 3) * 10}%`} h={12} />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map((row) => {
                  const key = rowKey(row);
                  return (
                    <tr
                      key={key}
                      className={onRowClick ? 'dt-row--click' : undefined}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      data-selected={selectable && selection!.has(key) ? true : undefined}
                    >
                      {selectable && (
                        <td className="dt-check">
                          <input
                            type="checkbox"
                            checked={selection!.has(key)}
                            onChange={() => {
                              const next = new Set(selection);
                              if (next.has(key)) next.delete(key);
                              else next.add(key);
                              onSelectionChange!(next);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            aria-label="Select row"
                          />
                        </td>
                      )}
                      {visible.map((c) => (
                        <td key={c.key} style={{ textAlign: c.align ?? 'left' }}>
                          {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? '')}
                        </td>
                      ))}
                    </tr>
                  );
                })}
          </tbody>
        </table>
        {!loading && rows.length === 0 && empty && (
          <EmptyState
            icon={empty.icon}
            title={empty.title}
            message={empty.message}
            action={empty.action}
          />
        )}
      </div>
    </div>
  );
}
