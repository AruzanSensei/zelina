export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-8 text-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} My Company. All rights reserved.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Farm fresh goodness, from our family to yours.
        </p>
      </div>
    </footer>
  );
}
