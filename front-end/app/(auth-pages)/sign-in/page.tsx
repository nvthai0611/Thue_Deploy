import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "@/assets/HolaRental.png";
import Image from "next/image";
import Link from "next/link";
import OAuthButtons from "@/components/auth/oauth-buttons";
import ClearUserStorage from "@/components/auth/clear-user-storage";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  return (
    <>
      <ClearUserStorage />
      <Card className="bg-card-foreground mx-auto p-6 sm:p-8 md:p-12 w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-md">
        <form className="flex flex-col mx-auto">
          <Image src={logo} alt="HolaRental" className="w-2/3 mx-auto" />
          <h1 className="text-2xl text-background font-semibold text-center mt-4">
            Đăng nhập
          </h1>
          <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
            <Label htmlFor="phone" className="text-background">
              Số điện thoại
            </Label>
            <Input name="phone" placeholder="Nhập số điện thoại" required />
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-background">
                Mật khẩu
              </Label>
              <Link
                className="text-xs text-foreground underline"
                href="/forgot-password"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <Input
              type="password"
              name="password"
              placeholder="Nhập mật khẩu"
              required
            />
            <Link className="text-xs text-blue-400 " href="/forgot-password">
              Quên mật khẩu?
            </Link>
            <SubmitButton
              pendingText="Đang đăng nhập..."
              formAction={signInAction}
              className="bg-red-700 hover:bg-red-800 text-white"
            >
              Đăng nhập
            </SubmitButton>
            <FormMessage message={searchParams} />
          </div>
        </form>
        {/* Facebook and Google OAuth buttons */}
        <OAuthButtons />

        <p className="text-sm text-background text-center mt-4">
          Chưa có tài khoản?{" "}
          <Link className="text-blue-400 font-medium " href="/sign-up">
            Đăng ký
          </Link>
        </p>
      </Card>
    </>
  );
}
