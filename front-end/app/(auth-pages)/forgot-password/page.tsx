import { forgotPasswordAction } from "@/app/actions";
import logo from "@/assets/HolaRental.png";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";

export default async function ForgotPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <Card className="bg-card-foreground mx-auto p-12">
      <Image src={logo} alt="HolaRental" className={"w-2/3 mx-auto"} />
      <form className="flex flex-col mx-auto">
        <div>
          <h1 className="text-2xl font-medium text-background">
            Reset Password
          </h1>
          <p className="text-sm  text-primary-foreground">
            Enter your phone number to reset password
            <Link className="text-primary underline" href="/sign-in">
              Sign in
            </Link>
          </p>
        </div>
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
          <Label htmlFor="phone" className="text-primary-foreground">
            Phone
          </Label>
          <Input name="phone" placeholder="Your phone number" required />
          <SubmitButton
            formAction={forgotPasswordAction}
            className="bg-red-700 hover:bg-red-800 text-white"
          >
            Continue
          </SubmitButton>
          <FormMessage message={searchParams} />
        </div>
      </form>
    </Card>
  );
}
