import Icon from './Icon.jsx';

const TAGS = {
  yes: <span className="tag">Required</span>,
  rec: <span className="tag rec">Recommended</span>,
  opt: <span className="tag opt">Optional</span>,
};

/** One video or PDF resource row with clear visual distinction and hover states */
export default function ResourceRow({ r }) {
  const isPdf = r.k === 'pdf';
  return (
    <li className={`res-item ${isPdf ? 'is-pdf' : 'is-video'}`}>
      <span className={`ric ${isPdf ? 'pdf-ric' : 'video-ric'}`}>
        <Icon name={isPdf ? 'file' : 'play'} size={17} />
      </span>
      <span className="grow">
        <b className="res-title">{r.t}</b>
        <span className="res-meta-line">
          {TAGS[r.req]}
          <span className="res-kind-badge">{isPdf ? 'PDF Book' : 'Video Lesson'}</span>
        </span>
      </span>
      {r.u ? (
        <a
          className={`btn sm ${isPdf ? 'pdf-btn' : 'video-btn'}`}
          href={r.u}
          target="_blank"
          rel="noopener noreferrer"
          title={isPdf ? `Open ${r.t} PDF` : `Watch ${r.t} on YouTube`}
        >
          <Icon name={isPdf ? 'file' : 'play'} size={14} />
          <span>{isPdf ? 'Open PDF' : 'Watch Video'}</span>
          <Icon name="ext" size={12} stroke={2.5} />
        </a>
      ) : (
        <span className="btn sm off" aria-disabled="true">
          Link coming soon
        </span>
      )}
    </li>
  );
}
