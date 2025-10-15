import { signUpAction } from '@/app/actions';
import logo from '@/assets/HolaRental.png';
import OAuthButtons from '@/components/auth/oauth-buttons';
import { FormMessage, Message } from '@/components/form-message';
import { SubmitButton } from '@/components/submit-button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import Link from 'next/link';

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;

  if ('message' in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <Card className="bg-card-foreground w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-md mx-auto p-6 sm:p-8 md:p-12">
      <form className="flex flex-col mx-auto">
        <Image src={logo} alt="HolaRental" className="w-2/3 mx-auto" />
        <h1 className="text-2xl font-semibold text-background text-center mt-4">
          Sign up
        </h1>
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
          <Label htmlFor="name" className="text-background">
            Full name
          </Label>
          <Input name="name" placeholder="Your full name" required />
          <Label htmlFor="phone" className="text-background">
            Phone
          </Label>
          <Input name="phone" placeholder="Your phone number" required />
          <Label htmlFor="password" className="text-background">
            Password
          </Label>
          <Input
            type="password"
            name="password"
            placeholder="Your password"
            minLength={6}
            required
          />
          <div className="flex items-center space-x-2">
            <Checkbox className="bg-background" id="policy" required />
            <label
              htmlFor="policy"
              className="text-background text-sm opacity-80 break-words"
            >
              By registering, you have read and agree to the{' '}
              <Link href="/terms" className="text-blue-400">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-blue-400">
                Privacy Policy
              </Link>{' '}
              of HolaRental.
            </label>
          </div>
          <SubmitButton
            formAction={signUpAction}
            pendingText="Signing up..."
            className="bg-red-700 hover:bg-red-800 text-white"
          >
            Sign up
          </SubmitButton>
          <FormMessage message={searchParams} />
        </div>
      </form>

      {/* Facebook || Google */}
      <OAuthButtons />
      <p className="text-sm text-background text-center mt-4">
        Already have an account?{' '}
        <Link className="font-medium text-blue-400" href="/sign-in">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
