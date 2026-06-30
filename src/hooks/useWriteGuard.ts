import toast from "react-hot-toast";
import { useCanWrite } from "@/lib/plan-context";

export function useWriteGuard() {
  const canWrite = useCanWrite();

  const guard = (
    action: () => void,
    message = "Tu cuenta está en solo lectura. Activa un plan para continuar.",
  ) => {
    if (!canWrite) {
      toast.error(message);
      return;
    }
    action();
  };

  return { canWrite, guard };
}
