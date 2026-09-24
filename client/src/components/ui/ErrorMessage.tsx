interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className="rounded-xs border border-danger bg-danger-soft px-4 py-3 text-small text-danger"
    >
      {message}
    </div>
  );
}