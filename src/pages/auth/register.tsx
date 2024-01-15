// next
import Head from 'next/head';
// auth
import GuestGuard from '../../auth/GuestGuard';
// sections
import Register from '../../sections/auth/Register';

// ----------------------------------------------------------------------

export default function RegisterPage() {
  return (
    <>
      <Head>
        <title> BIMNEXT 3.0 </title>
      </Head>

      <GuestGuard>
        <Register />
      </GuestGuard>
    </>
  );
}
