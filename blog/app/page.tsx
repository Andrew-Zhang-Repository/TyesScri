import React from 'react';
import Link from 'next/link';
import Loginpage from './login/Loginpage';

// The root layout defined in app/layout.tsx will wrap this component.
// You can learn more about layouts in the [Next.js documentation](https://nextjs.org/docs/app/getting-started/layouts-and-pages).

export default function Home() {
  return (
      <Loginpage />
  );
}


