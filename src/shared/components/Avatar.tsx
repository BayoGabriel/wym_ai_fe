import * as RadixAvatar from '@radix-ui/react-avatar';
import './Avatar.css';

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

export function Avatar({
  name,
  src,
  size = 32,
  platform,
}: {
  name: string;
  src?: string | null;
  size?: number;
  platform?: boolean;
}) {
  return (
    <RadixAvatar.Root
      className={`ui-avatar${platform ? ' ui-avatar--platform' : ''}`}
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.36) }}
    >
      {src && <RadixAvatar.Image className="ui-avatar__img" src={src} alt="" />}
      <RadixAvatar.Fallback className="ui-avatar__fallback" delayMs={src ? 300 : 0}>
        {initials(name) || '?'}
      </RadixAvatar.Fallback>
    </RadixAvatar.Root>
  );
}

export function AvatarGroup({ names, size = 26, max = 4 }: { names: string[]; size?: number; max?: number }) {
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  return (
    <span className="ui-avatar-group">
      {shown.map((n) => (
        <Avatar key={n} name={n} size={size} />
      ))}
      {rest > 0 && (
        <span className="ui-avatar ui-avatar--rest" style={{ width: size, height: size, fontSize: 10 }}>
          +{rest}
        </span>
      )}
    </span>
  );
}
