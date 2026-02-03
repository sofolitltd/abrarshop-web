export function Footer() {
  return (
    <footer className="border-t bg-black">
      <div className="container flex h-20 items-center justify-center">
        <p className="text-sm text-white">
          &copy; {new Date().getFullYear()} Abrar Shop. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
