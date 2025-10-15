import { resetPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import logo from "@/assets/HolaRental.png";

export default async function ResetPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <Card className="bg-card-foreground mx-auto p-12">
      <Image src={logo} alt="HolaRental" className={"w-2/3 mx-auto"} />
      <form className="flex flex-col w-full max-w-md p-4 gap-2 [&>input]:mb-4">
        <h1 className="text-2xl text-background font-medium">Reset password</h1>
        <p className="text-sm text-primary-foreground">
          Please enter your new password below.
        </p>
        <Label htmlFor="password" className="text-background">
          New password
        </Label>
        <Input
          type="password"
          name="password"
          placeholder="New password"
          required
        />
        <Label htmlFor="confirmPassword" className="text-background">
          Confirm password
        </Label>
        <Input
          type="password"
          name="confirmPassword"
          placeholder="Confirm password"
          required
        />
        <SubmitButton
          formAction={resetPasswordAction}
          className="bg-red-700 hover:bg-red-800 text-white"
        >
          Reset password
        </SubmitButton>
        <FormMessage message={searchParams} />
      </form>
    </Card>
  );
}
