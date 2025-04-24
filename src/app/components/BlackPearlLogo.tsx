import Image from 'next/image';

export default function BlackPearlLogo() {
  return (
    <div className="fixed bottom-4 right-4 z-10">
      <Image
        src="/blackpearl-logo.svg"
        alt="BLACKPEARL Logo"
        width={120}
        height={30}
        priority
      />
    </div>
  );
} 