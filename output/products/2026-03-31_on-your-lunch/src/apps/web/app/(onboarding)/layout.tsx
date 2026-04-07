'use client';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-[393px] flex-col bg-bg-primary">
      {children}
    </div>
  );
}
