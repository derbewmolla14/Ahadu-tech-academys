import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function MarketingLayout() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </>
  );
}
