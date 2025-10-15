import { Badge } from "@/components/ui/badge";
import {
  HOUSING_AREA_STATUS_COLORS,
  HOUSING_AREA_STATUS_LABELS,
  HousingAreaStatus,
} from "@/utils/constants/housing-area-status";

export default function HousingStatus({
  status,
}: {
  status: HousingAreaStatus;
}) {
  return (
    <Badge className={HOUSING_AREA_STATUS_COLORS[status]}>
      {HOUSING_AREA_STATUS_LABELS[status] || status}
    </Badge>
  );
}
