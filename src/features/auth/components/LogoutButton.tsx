import Button from '@/shared/ui/Button';

export default function LogoutButton() {
  return (
    <form action="/auth/logout" method="post" className="w-full">
      <Button type="submit" variant="ghost" className="w-full justify-center">
        Logout
      </Button>
    </form>
  );
}
