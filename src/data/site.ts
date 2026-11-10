export const site = {
  name: "Safarnest",
  legalName: "Safarnest Holidays Pvt. Ltd.",
  tagline: "Journeys that feel like home",
  description:
    "Thoughtfully crafted group tours, family holidays, honeymoons and bespoke escapes across India and the world. Travel with experts who treat you like family.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://safarnest.in",
  phone: "+91 98204 12345",
  phoneHref: "tel:+919820412345",
  whatsappNumber: "919820412345",
  whatsappHref:
    "https://wa.me/919820412345?text=Hi%20Safarnest!%20I'd%20like%20to%20plan%20a%20holiday.",
  email: "hello@safarnest.in",
  emailHref: "mailto:hello@safarnest.in",
  address: "302, Meridian House, Andheri East, Mumbai 400069",
  hours: "Mon – Sat · 9:30 am to 7:00 pm",
  socials: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Facebook", href: "https://facebook.com" },
    { label: "YouTube", href: "https://youtube.com" },
  ],
};

export const stats = [
  { value: "42", suffix: "yrs", label: "Of crafting happy holidays" },
  { value: "1.2", suffix: "M+", label: "Travellers hosted" },
  { value: "500", suffix: "+", label: "Expert tour leaders" },
  { value: "60", suffix: "+", label: "Destinations worldwide" },
];

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Destinations", href: "/destinations" },
  { label: "Tour Packages", href: "/tours" },
  { label: "Experiences", href: "/experiences" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const trustPoints = [
  {
    title: "All-inclusive pricing",
    description: "Flights, stays, meals and sightseeing in one clear price.",
  },
  {
    title: "Expert tour leaders",
    description: "Full-time, multilingual leaders with you end to end.",
  },
  {
    title: "24×7 travel support",
    description: "Real humans on call, before and during your holiday.",
  },
  {
    title: "Flexible payments",
    description: "Book with a small deposit and pay in easy EMIs.",
  },
];

export const testimonials = [
  {
    name: "Ananya Deshpande",
    city: "Pune",
    tour: "Magical Kashmir",
    rating: 5,
    quote:
      "Our tour leader felt like family by day two. Every hotel, every meal and every shikara ride was arranged beautifully. Kashmir has our heart, and Safarnest made it effortless.",
  },
  {
    name: "Rohan & Meera Shah",
    city: "Mumbai",
    tour: "Bali Bliss Honeymoon",
    rating: 5,
    quote:
      "We wanted a honeymoon that was equal parts adventure and quiet. The team listened, tweaked the itinerary twice, and gave us a trip we will talk about for decades.",
  },
  {
    name: "Lakshmi Iyer",
    city: "Bengaluru",
    tour: "Keralam Women's Special",
    rating: 5,
    quote:
      "Travelling with a group of women felt safe, joyful and incredibly easy. The little surprises, from a spice plantation lunch to a sunset cruise, made it special.",
  },
  {
    name: "Vikram Malhotra",
    city: "Delhi",
    tour: "Best of Europe",
    rating: 5,
    quote:
      "Twelve days, four countries, zero stress. The pace was perfect and the optional experiences were worth every rupee. Our teens still say it was the best holiday ever.",
  },
  {
    name: "Farida Qureshi",
    city: "Hyderabad",
    tour: "Sri Lanka Ramayana Trail",
    rating: 5,
    quote:
      "A deeply meaningful yatra with comfortable stays and a guide who knew every story behind every temple. My parents were cared for like their own family.",
  },
  {
    name: "Sanjay Kulkarni",
    city: "Nagpur",
    tour: "Ladakh Winter Wonderland",
    rating: 5,
    quote:
      "Frozen Pangong, snow leopards and hand-warming thukpa. The team handled altitude, weather and every little detail so we could simply soak it all in.",
  },
];
