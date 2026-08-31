import { AppService } from "@/constants/services";
import { SectorDefinition } from "@/constants/ecosystemSectors";

export interface CivicSubServiceFormProps {
  agency: SectorDefinition;
  service: AppService;
  onSuccess: (orderId: string, otpCode?: string) => void;
  onCancel: () => void;
}
