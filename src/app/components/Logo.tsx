import Image from 'next/image';

export default function Logo({ size = 48 }: { size?: number }) {
  return (
    <div className="flex items-center">
      <Image
        src="/logo.png"
        alt="SF Dashboard Logo"
        width={size}
        height={size}
        priority
        className="rounded-md shadow-none"
      />
    </div>
  );
}
