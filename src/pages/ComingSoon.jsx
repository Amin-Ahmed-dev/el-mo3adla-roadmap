import Icon from '../components/Icon.jsx';

export default function ComingSoon({ subject }) {
  return (
    <div className={`empty c-${subject.color}`}>
      <span style={{ color: 'var(--c)' }}><Icon name={subject.icon} size={34} /></span>
      <h1 className="h2" style={{ marginTop: 10 }}>{subject.title} is coming soon</h1>
      <p className="small">The lessons for this subject are being prepared.</p>
      <a className="btn" href="#/">Back to home</a>
    </div>
  );
}
