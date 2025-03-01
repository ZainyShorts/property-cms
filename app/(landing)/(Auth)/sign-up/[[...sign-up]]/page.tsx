import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <main className="flex bg-[#1F1F23] h-screen w-full items-center justify-center">
      <SignUp  />
    </main>
  );
}