import { signOut } from "./actions";

export default function SignOutButton() {
  return (
    <form action={signOut}>
      <button type="submit" className="text-xs text-muted-foreground hover:text-foreground">
        Sign out
      </button>
    </form>
  );
}
