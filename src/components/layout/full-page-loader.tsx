import { LoaderCircle } from "lucide-react";

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
      <LoaderCircle className="w-12 h-12 animate-spin text-primary" />
    </div>
  );
}
