import type { EnquiryStatus } from "@/lib/types";

export type SeedEnquiry = {
  type: string;
  name: string;
  email: string;
  phone: string;
  destination?: string;
  travellers?: string;
  travelMonth?: string;
  message: string;
  source: string;
  status: EnquiryStatus;
};

/**
 * Sample contact-form enquiries used by `pnpm db:seed`.
 * They are matched by email + source + message so safe seeds stay idempotent.
 */
export const seedEnquiries: SeedEnquiry[] = [
  {
    type: "enquiry",
    name: "Meera Joshi",
    email: "meera.joshi@example.com",
    phone: "+91 98200 21001",
    destination: "Kashmir",
    travellers: "2 adults",
    travelMonth: "March 2027",
    message:
      "Interested in: Group tour. We are planning a spring trip to Kashmir and would love the houseboat stay included.",
    source: "/contact",
    status: "new",
  },
  {
    type: "enquiry",
    name: "Arnav Kapoor",
    email: "arnav.kapoor@example.com",
    phone: "+91 98200 21002",
    destination: "Japan",
    travellers: "2 adults",
    travelMonth: "April 2027",
    message:
      "Interested in: Personalised holiday. Looking for a 10-day Japan itinerary around cherry blossom season.",
    source: "/contact",
    status: "contacted",
  },
  {
    type: "enquiry",
    name: "Sneha Kulkarni",
    email: "sneha.kulkarni@example.com",
    phone: "+91 98200 21003",
    destination: "Kerala",
    travellers: "1 adult",
    travelMonth: "January 2027",
    message:
      "Interested in: Speciality tour. I would like details about the Women's Special Kerala departure.",
    source: "/contact",
    status: "new",
  },
  {
    type: "enquiry",
    name: "Rahul Verma",
    email: "rahul.verma@example.com",
    phone: "+91 98200 21004",
    destination: "Rajasthan",
    travellers: "40 guests",
    travelMonth: "February 2027",
    message:
      "Interested in: Corporate travel. Planning a three-day company offsite in Rajasthan for about 40 people.",
    source: "/contact",
    status: "new",
  },
  {
    type: "enquiry",
    name: "Ayesha Khan",
    email: "ayesha.khan@example.com",
    phone: "+91 98200 21005",
    destination: "Europe",
    travellers: "4 adults",
    travelMonth: "May 2027",
    message:
      "Interested in: Group tour. A family trip to Europe — please share the Best of Europe itinerary and dates.",
    source: "/contact",
    status: "closed",
  },
  {
    type: "enquiry",
    name: "Nikhil Rao",
    email: "nikhil.rao@example.com",
    phone: "+91 98200 21006",
    destination: "Maldives",
    travellers: "2 adults",
    travelMonth: "June 2027",
    message:
      "Interested in: Something else. Looking for a quiet honeymoon in the Maldives with an overwater villa.",
    source: "/contact",
    status: "contacted",
  },
  {
    type: "enquiry",
    name: "Divya Menon",
    email: "divya.menon@example.com",
    phone: "+91 98200 21007",
    destination: "Sri Lanka",
    travellers: "2 adults + 1 child",
    travelMonth: "February 2027",
    message:
      "Interested in: Personalised holiday. We would like the Ramayana trail paced gently for our parents.",
    source: "/contact",
    status: "new",
  },
  {
    type: "enquiry",
    name: "Karan Sethi",
    email: "karan.sethi@example.com",
    phone: "+91 98200 21008",
    destination: "Switzerland",
    travellers: "2 adults",
    travelMonth: "April 2027",
    message:
      "Interested in: Group tour. Please send the Swiss Paris & Amsterdam itinerary with flights included.",
    source: "/contact",
    status: "new",
  },
];
