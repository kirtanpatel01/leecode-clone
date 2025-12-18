import { onBoardUser } from "@/modules/auth/actions";
import { UserButton } from "@clerk/nextjs";

export default async function Page() {
  await onBoardUser();
  return (
    <div className="min-h-screen flex justify-center items-center">
      <UserButton />
    </div>
  );
}
