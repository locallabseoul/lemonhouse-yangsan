export type ConsultationStatus = "new" | "contacted" | "scheduled" | "closed";

export type ConsultationRequest = {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  address: string | null;
  home_size: string | null;
  budget: string | null;
  message: string | null;
  status: ConsultationStatus;
  source: string | null;
};

export const consultationStatusLabels: Record<ConsultationStatus, string> = {
  new: "신규",
  contacted: "연락 완료",
  scheduled: "상담 예약",
  closed: "종료",
};
