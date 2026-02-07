import { redirect } from 'next/navigation';

export default function LegacyCreateOrderPage() {
  redirect('/orders/create');
}
