import Link from "next/link";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main>{children}</main>
      <footer className="border-t border-sand-300 bg-paper">
        <div className="container-page flex flex-col gap-3 py-7 text-[13px] sm:flex-row sm:items-center sm:justify-between">
          <p className="font-medium text-navy-500">
            © {new Date().getFullYear()} Hidden Miles Holidays Pvt. Ltd. · IATA
            accredited
          </p>
          <p className="font-bold text-navy-700">
            <Link href="/contact" className="hover:text-blue-700">
              Booking terms
            </Link>
            &nbsp;&nbsp;·&nbsp;&nbsp;
            <Link href="/contact" className="hover:text-blue-700">
              Cancellation policy
            </Link>
            &nbsp;&nbsp;·&nbsp;&nbsp;
            <Link href="/contact" className="hover:text-blue-700">
              Privacy
            </Link>
          </p>
        </div>
      </footer>
    </>
  );
}
