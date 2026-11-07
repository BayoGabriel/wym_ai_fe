import { Kbd } from '../../shared/components/Kbd';
import { Modal } from '../../shared/components/Modal';

const ROWS: [string, string][] = [
  ['⌘K / Ctrl K', 'Search & command palette'],
  ['?', 'This cheat sheet'],
  ['[', 'Collapse / expand sidebar'],
  ['g then d', 'Go to Overview'],
  ['g then c', 'Conversations'],
  ['g then h', 'Handoffs'],
  ['g then l', 'Leads'],
  ['g then a', 'Appointments'],
  ['g then k', 'Knowledge'],
  ['g then r', 'Reports'],
  ['g then s', 'Assistant Studio'],
  ['g then t', 'Team'],
];

export function ShortcutsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Keyboard shortcuts"
      description="Work the dashboard without touching the mouse."
    >
      <table className="shortcut-table">
        <tbody>
          {ROWS.map(([keys, desc]) => (
            <tr key={keys}>
              <td>
                <Kbd>{keys}</Kbd>
              </td>
              <td>{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Modal>
  );
}
