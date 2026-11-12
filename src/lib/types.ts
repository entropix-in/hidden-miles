import type { Destination } from "@/data/destinations";
import type { Experience } from "@/data/experiences";
import type { Testimonial } from "@/data/site";
import type { Tour } from "@/data/tours";

export type DatabaseDoc = {
  _id: string;
  _creationTime: number;
};

export type AdminTour = Tour & DatabaseDoc;
export type AdminDestination = Destination & DatabaseDoc;
export type AdminExperience = Experience & DatabaseDoc;
export type AdminTestimonial = Testimonial & DatabaseDoc;

export type EnquiryStatus = "new" | "contacted" | "closed";

export type Enquiry = {
  type: string;
  name: string;
  email: string;
  phone: string;
  destination?: string;
  travellers?: string;
  travelMonth?: string;
  message?: string;
  tour?: string;
  source?: string;
  createdAt: number;
  status?: EnquiryStatus;
};

export type AdminEnquiry = Enquiry & DatabaseDoc;

export type BookingStatus = "pending" | "confirmed" | "cancelled";

export type TourDeparture = {
  _id: string;
  tourSlug: string;
  startDate: string;
  price: number;
  capacity: number;
  booked: number;
  seatsLeft: number;
  note?: string;
  createdAt?: number;
};

export type TourBooking = {
  _id: string;
  departureId?: string;
  tourSlug: string;
  tourTitle: string;
  startDate?: string;
  name: string;
  email: string;
  phone: string;
  travellers: number;
  amount: number;
  notes?: string;
  status: BookingStatus;
  createdAt: number;
};

export type ContentStatus = {
  configured: boolean;
  seeded: boolean;
  error?: string;
};
