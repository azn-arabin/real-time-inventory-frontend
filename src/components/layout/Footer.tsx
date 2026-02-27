// simple footer, nothing fancy
export function Footer() {
  return (
    <footer className="border-t py-6 text-center text-sm text-muted-foreground">
      <p>
        &copy; {new Date().getFullYear()} SneakerDrop. All rights reserved.
      </p>
      <p className="mt-1">Limited edition drops, updated in real time.</p>
    </footer>
  );
}
