"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Menu, Milk, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/products', label: 'Products' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-card shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
              <Milk className="h-8 w-8" />
              <span className="font-semibold text-xl">Dairy Delights</span>
            </Link>
          </div>
          <nav className="hidden md:flex space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-card p-0">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4 border-b">
                     <Link href="/" className="flex items-center gap-2 text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                        <Milk className="h-7 w-7" />
                        <span className="font-semibold text-lg">Dairy Delights</span>
                      </Link>
                    <SheetClose asChild>
                       <Button variant="ghost" size="icon" >
                        <X className="h-6 w-6" />
                        <span className="sr-only">Close menu</span>
                      </Button>
                    </SheetClose>
                  </div>
                  <nav className="flex-grow px-4 py-6 space-y-2">
                    {navLinks.map((link) => (
                      <SheetClose key={link.href} asChild>
                        <Link
                          href={link.href}
                          className={cn(
                            "block px-3 py-2 rounded-md text-base font-medium transition-colors",
                            pathname === link.href
                              ? "bg-primary text-primary-foreground"
                              : "text-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          {link.label}
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
