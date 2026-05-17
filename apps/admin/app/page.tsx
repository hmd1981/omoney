import Link from 'next/link';

const tiles = [
  'Users',
  'KYC Review',
  'Exchange Rates',
  'Orders',
  'Internal Notes',
  'Audit Logs',
  'Files',
  'Support Tickets',
  'Notifications'
];

export default function AdminHome() {
  return (
    <main className="mx-auto max-w-7xl p-5">
      <header className="flex flex-col gap-4 border-b border-black/10 pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-black/60">Operations</p>
          <h1 className="text-2xl font-semibold">Admin dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <input className="rounded-md border bg-white px-3 py-2" placeholder="Search orders, users, tickets" />
          <Link className="rounded-md bg-[#11221f] px-4 py-2 text-white" href="/media">
            Media manager
          </Link>
        </div>
      </header>
      <section className="mt-6 grid gap-4 md:grid-cols-4">
        {['Pending KYC', 'Open Orders', 'Processing', 'Open Tickets'].map((item) => (
          <article key={item} className="rounded-md bg-white p-4 shadow-sm">
            <p className="text-sm">{item}</p>
            <strong className="text-2xl">0</strong>
          </article>
        ))}
      </section>
      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {tiles.map((item) => (
          <article key={item} className="rounded-md border bg-white p-4">
            {item}
          </article>
        ))}
      </section>
    </main>
  );
}
