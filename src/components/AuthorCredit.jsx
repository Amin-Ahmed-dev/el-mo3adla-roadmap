import Icon from './Icon.jsx';

/**
 * Author credit — professional sidebar signature.
 * Avatar monogram + "By Amin Ahmed" + tagline.
 */
export default function AuthorCredit({ variant = 'sidebar' }) {
  const cls = variant === 'dock' ? 'credit credit-dock' : 'credit credit-side';
  return (
    <div className={cls} aria-label="Made by Amin Ahmed">
      <span className="credit-avatar" aria-hidden="true">AA</span>
      <span className="credit-text">
        <span className="credit-made">
          By <b>Amin Ahmed</b>
        </span>
        <span className="credit-tag">El Mo3adla · Study roadmap 2027</span>
      </span>
    </div>
  );
}
