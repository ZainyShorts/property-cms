import { SignIn } from "@clerk/nextjs";
import { dark } from '@clerk/themes'

export default function Page() {
  return (
    <div className="flex bg-[#1F1F23] justify-center  items-center h-screen">
      <SignIn appearance={{
        baseTheme: dark,
      }}  routing="hash" />
    </div>
  );
}
