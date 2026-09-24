import { cn } from '../utils/cn';

interface BookCoverProps {
  title: string;
  author?: string;
  src?: string;
  className?: string;
}

export function BookCover({ title, author, src, className }: BookCoverProps) {
  return (
    <div
      className={cn(
        'relative aspect-[2/3] w-full overflow-hidden rounded-xs border border-line bg-neutral-100',
        className
      )}
    >
      {src ? (
        <img src={src} alt={`Cover of ${title}`} loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full flex-col justify-end bg-accent-deep p-3">
          <p className="font-serif text-small font-medium leading-snug text-paper">{title}</p>
          {author && <p className="mt-0.5 text-x-small text-neutral-300">{author}</p>}
        </div>
      )}
    </div>
  );
}