import { MockKnowledge } from './MockKnowledge';
import { MockConversation } from './MockConversation';
import '../../styles/mocks.css';

/** Composite illustration: approved knowledge feeding a real WymAssist thread. */
export function AssistMock() {
  return (
    <figure
      className="mock-frame"
      aria-label="Illustration of a WymAssist conversation grounded in approved knowledge"
    >
      <div className="mock-frame__bar">
        <span className="mock-frame__dot" />
        <span className="mock-frame__dot" />
        <span className="mock-frame__dot" />
        <span className="mock-frame__title">wymassist — organization workspace</span>
      </div>
      <div className="mock-app">
        <div className="mock-nav" aria-hidden>
          <span className="mock-nav__item mock-nav__item--active" />
          <span className="mock-nav__item" />
          <span className="mock-nav__item" />
          <span className="mock-nav__item" />
        </div>
        <div className="mock-body">
          <MockKnowledge />
          <MockConversation />
        </div>
      </div>
    </figure>
  );
}
