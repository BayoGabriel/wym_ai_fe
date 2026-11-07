import { Check } from 'lucide-react';
import './Stepper.css';

export type Step = { label: string; description?: string };

export function Stepper({
  steps,
  current,
  orientation = 'horizontal',
}: {
  steps: Step[];
  current: number;
  orientation?: 'horizontal' | 'vertical';
}) {
  return (
    <ol className={`ui-stepper ui-stepper--${orientation}`}>
      {steps.map((s, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'todo';
        return (
          <li key={s.label} className={`ui-step ui-step--${state}`} aria-current={i === current ? 'step' : undefined}>
            <span className="ui-step__dot">{state === 'done' ? <Check size={12} /> : i + 1}</span>
            <span className="ui-step__text">
              <span className="ui-step__label">{s.label}</span>
              {s.description && <span className="ui-step__desc">{s.description}</span>}
            </span>
            {i < steps.length - 1 && <span className="ui-step__line" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}
