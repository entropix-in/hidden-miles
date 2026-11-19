import type { EnquiryStatus } from "./types";

export const enquiryStatusLabels: Record<EnquiryStatus, string> = {
  new: "New", contacted: "Contacted", closed: "Closed",
};
