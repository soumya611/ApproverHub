interface StageStepConnectorProps {
  className?: string;
}

export default function StageStepConnector({ className = "" }: StageStepConnectorProps) {
  return (
    <span
      className={`absolute left-1/2 top-full mt-1 h-4 w-px -translate-x-1/2 bg-[var(--color-primary-500)] ${className}`}
    />
  );
}
