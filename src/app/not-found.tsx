import Link from 'next/link';
import { Home, Menu as MenuIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gradient mb-4">404</h1>
          <h2 className="text-3xl font-bold text-text mb-4">Page Not Found</h2>
          <p className="text-text-secondary text-lg">
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/">
            <Button variant="primary" size="lg" className="w-full">
              <Home className="h-5 w-5 mr-2" />
              Go to Homepage
            </Button>
          </Link>
          <Link href="/menu">
            <Button variant="outline" size="lg" className="w-full">
              <MenuIcon className="h-5 w-5 mr-2" />
              View Menu
            </Button>
          </Link>
        </div>

        <div className="mt-12">
          <p className="text-text-secondary text-sm">
            SmashDaddy • Daventry
          </p>
        </div>
      </div>
    </div>
  );
}

