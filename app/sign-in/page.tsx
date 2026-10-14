import { SignInView, type SignInViewProps } from "@/components/auth/SignInView";

export default function SignInPage({ searchParams }: SignInViewProps) {
  return <SignInView searchParams={searchParams} />;
}