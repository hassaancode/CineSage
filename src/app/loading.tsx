import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Loader2 className="h-16 w-16 animate-spin text-[#5D007A] dark:text-white" />
    </div>
  );
}
