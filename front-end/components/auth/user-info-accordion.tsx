"use client";
import { Mail, Chrome, Facebook, Unlink } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useUserStore } from "@/store/useUserStore";
import { useParams } from "next/navigation";
import { supabase } from "@/utils/supabase/upload-file";
import { toast } from "sonner";
import {
  checkUserAndUpdateEmail,
  unlinkProvider,
} from "@/utils/supabase/change-email-phone";
import { VietQR } from "vietqr";
import { Bank, VietQRResponse } from "@/lib/type";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import Image from "next/image";
import { ChevronsUpDownIcon } from "lucide-react";
import { useUpdateUser } from "@/queries/user.queries";
import { createClient } from "@/utils/supabase/client";

let vietQR = new VietQR({
  clientID: process.env.NEXT_PUBLIC_CLIENT_ID,
  apiKey: process.env.NEXT_PUBLIC_LIST_BANK_API_KEY,
});

type BankAccount = {
  account_number?: string;
  bank_name?: string;
};

type CardID = {
  id_number?: string;
  full_name?: string;
  gender?: string;
  place_of_residence?: string;
};

interface UserIdentity {
  id: string;
  provider: string;
  identity_data?: {
    email?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export default function UserInfoAccordion({
  name,
  phone,
  verified,
  bankAccount,
  cardId,
}: {
  name?: string;
  phone?: string;
  verified?: boolean;
  bankAccount?: BankAccount;
  cardId?: CardID;
}) {
  const [user, setUser] = useState<any>(null);
  const [editName, setEditName] = useState(name || "");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState(phone || "");
  const [open, setOpen] = useState(false);
  const [banks, setListBank] = useState<Bank[]>([]);
  const [listIdentities, setListIdentities] = useState<UserIdentity[]>([]);
  const [editBankAccount, setEditBankAccount] = useState<BankAccount>({
    account_number: bankAccount?.account_number || "",
    bank_name: bankAccount?.bank_name || "",
  });
  const [editCardId, setEditCardId] = useState<CardID>({
    id_number: cardId?.id_number || "",
    full_name: cardId?.full_name || "",
    gender: cardId?.gender || "",
    place_of_residence: cardId?.place_of_residence || "",
  });
  // Thêm state để theo dõi trạng thái xác nhận
  const [verifiedFields, setVerifiedFields] = useState({
    phone: !!phone, // true nếu phone đã được cung cấp từ props
    bankAccount: !!bankAccount?.account_number && !!bankAccount?.bank_name,
    cardId: !!cardId?.id_number,
  });

  const myUserId = useUserStore((state) => state.userId);
  const params = useParams();
  const paramUserId = params?.id as string;
  const isOwner = paramUserId === myUserId;
  const updateUserMutation = useUpdateUser();

  const supabaseGetUser = createClient();
  const hasUpdatedVerified = useRef(false);

  // Đồng bộ state với props khi props thay đổi
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabaseGetUser.auth.getUser();

      if (error) {
        console.error("Error when get user: ", error.message);
        return;
      }

      if (!user) {
        console.warn("User not found");
        return;
      }

      setUser(user);
      setEditEmail(user?.email || "");
      setListIdentities(user?.identities || []);
    };

    fetchUser();

    setEditName(name || "");
    setEditPhone(phone || "");
    setEditBankAccount({
      account_number: bankAccount?.account_number || "",
      bank_name: bankAccount?.bank_name || "",
    });
    setEditCardId({
      id_number: cardId?.id_number || "",
      full_name: cardId?.full_name || "",
      gender: cardId?.gender || "",
      place_of_residence: cardId?.place_of_residence || "",
    });

    // Cập nhật verifiedFields dựa trên props ban đầu
    setVerifiedFields({
      phone: !!phone,
      bankAccount: !!bankAccount?.account_number && !!bankAccount?.bank_name,
      cardId: !!cardId?.id_number,
    });

    vietQR
      .getBanks()
      .then((response: VietQRResponse) => {
        console.log("VietQR response:", response); // Debug log
        if (response && response.data) {
          setListBank(response.data);
        } else {
          console.warn("VietQR response does not contain data:", response);
          setListBank([]); // Set empty array as fallback
        }
      })
      .catch((err: Error) => {
        console.error("Error fetching banks:", err.message);
        setListBank([]); // Set empty array as fallback
      });
  }, [name, phone, bankAccount, cardId]);

  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    email: "",
  });

  function getProgressInfo() {
    // Tính filled dựa trên trạng thái xác nhận
    const filled = [
      verifiedFields.phone,
      verifiedFields.bankAccount,
      verifiedFields.cardId,
    ].filter(Boolean).length;
    let value = (filled / 3) * 100;
    let colorClass = "[&>div]:bg-orange-400"; // default 1/3

    if (filled === 2) colorClass = "[&>div]:bg-yellow-400";
    if (filled === 3) colorClass = "[&>div]:bg-emerald-500";

    return { value, colorClass, filled };
  }

  const { value, colorClass, filled } = getProgressInfo();

  useEffect(() => {
    if (filled === 3 && !verified && !hasUpdatedVerified.current) {
      hasUpdatedVerified.current = true;
      updateVerified(paramUserId);
    }
  }, [filled, paramUserId, verified]);

  const validateField = (field: string, value: string) => {
    let error = "";

    switch (field) {
      case "name":
        if (!value.trim()) {
          error = "Name not empty!!!";
        } else if (!/^[a-zA-Z\s]{2,50}$/.test(value)) {
          error = "Name must contain only letters and spaces, 2-50 characters";
        }
        break;
      case "phone":
        if (!value.trim()) {
          error = "Phone not empty!!!";
        } else if (!/^0\d{9}$/.test(value)) {
          error = "Phone number must be 10 digits, starting with 0";
        }
        break;
      case "email":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Invalid email";
        }
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
    return error === "";
  };

  async function handleUpdateUser(field: string, value: string) {
    let updateData: { [key: string]: string | undefined } = {};

    if (validateField(field, value)) {
      try {
        switch (field) {
          case "name":
            updateData = { name: value };
            break;
          case "phone":
            updateData = { phone: value };
            break;
          case "email":
            const result = await checkUserAndUpdateEmail(value);
            if (!result.success) {
              toast.error(result.message);
              return;
            }
            toast.success(result.message);
            break;
          default:
            throw new Error("Invalid field");
        }

        if (field !== "email") {
          const { error } = await supabase
            .from("users")
            .update(updateData)
            .eq("auth_user_id", paramUserId);

          if (error) {
            toast.error("Update Failed!");
            return;
          }

          // Cập nhật verifiedFields khi lưu thành công
          if (field === "phone") {
            setVerifiedFields((prev) => ({ ...prev, phone: true }));
          }
          toast.success("Update successfully!");
        }
      } catch (error) {
        toast.error("Update Failed!");
      }
    }
  }

  const handleChange = (field: string, value: string) => {
    if (field === "name") setEditName(value);
    if (field === "phone") setEditPhone(value);
    if (field === "email") setEditEmail(value);

    validateField(field, value);
  };

  const handleUpdateBankAccount = async () => {
    if (!editBankAccount.bank_name || !editBankAccount.account_number) {
      toast.error("Please fill in all bank account fields");
      return;
    }

    try {
      await updateUserMutation.mutateAsync({
        userDetail: {
          user_id: paramUserId,
          bank_account: {
            bank_name: editBankAccount.bank_name,
            account_number: editBankAccount.account_number,
          },
        },
      });

      setEditBankAccount({
        bank_name: editBankAccount.bank_name,
        account_number: editBankAccount.account_number,
      });

      // Cập nhật verifiedFields khi lưu thành công
      setVerifiedFields((prev) => ({ ...prev, bankAccount: true }));

      toast.success("Bank account updated successfully!");
    } catch (error) {
      toast.error("Failed to update bank account");
    }
  };

  async function handleUnlink(type: string) {
    const result = await unlinkProvider(type);

    if (result.success) {
      setListIdentities((prevIdentities: UserIdentity[]) =>
        prevIdentities.filter(
          (identity: UserIdentity) => identity.provider !== type
        )
      );

      const {
        data: { user },
        error,
      } = await supabaseGetUser.auth.getUser();

      if (!error && user) {
        setUser(user);
        setListIdentities(user?.identities || []);
      }

      toast.success("Successfully unlinked!");
    } else {
      toast.error(`Error: ${result.message}`);
    }
  }

  async function updateVerified(paramUserId: string) {
    await updateUserMutation.mutateAsync({
      userDetail: {
        user_id: paramUserId,
        verified: true,
      },
    });
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">
            Verification Progress
          </span>
          <span className="text-xs text-gray-500">{filled}/3</span>
        </div>
        <Progress value={value} className={`h-3 ${colorClass}`} />
      </div>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>Personal information</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4">
            <div className="flex flex-row gap-4">
              <div className="w-1/2 flex flex-row gap-4 items-center">
                <span className="font-semibold">Name:</span>{" "}
                {isOwner ? (
                  <Input
                    className="bl-2"
                    type="text"
                    value={editName}
                    placeholder="Name*"
                    onChange={(e) => handleChange("name", e.target.value)}
                    onBlur={() => handleUpdateUser("name", editName)}
                  />
                ) : (
                  <span className="text-gray-700">
                    {name || "Name not provided"}
                  </span>
                )}
              </div>
              <div className="w-1/2 flex flex-row gap-4 items-center">
                <span className="font-semibold">Phone:</span>{" "}
                {isOwner ? (
                  <Input
                    className="br-2"
                    type="text"
                    value={editPhone}
                    placeholder="Phone*"
                    onChange={(e) => handleChange("phone", e.target.value)}
                    onBlur={() => handleUpdateUser("phone", editPhone)}
                  />
                ) : (
                  <span className="text-gray-500">Phone not provided</span>
                )}
              </div>
            </div>
            {errors.name && (
              <span className="text-red-500 text-sm">{errors.name}</span>
            )}
            {errors.phone && (
              <span className="text-red-500 text-sm">{errors.phone}</span>
            )}
            <span className="font-semibold">Email:</span>{" "}
            {isOwner ? (
              <>
                <Input
                  className="bl-2"
                  type="email"
                  value={editEmail}
                  placeholder="Email"
                  onChange={(e) => handleChange("email", e.target.value)}
                  onBlur={() => handleUpdateUser("email", editEmail)}
                />
                {errors.email && (
                  <span className="text-red-500 text-sm">{errors.email}</span>
                )}
              </>
            ) : (
              <span className="text-gray-500">Email is not provided</span>
            )}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Bank Account</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <div className="flex flex-row gap-4 items-center">
                <span className="font-semibold w-1/5">Bank name:</span>{" "}
                {isOwner ? (
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="justify-between w-1/3"
                      >
                        {editBankAccount?.bank_name
                          ? banks.find(
                              (bank) =>
                                bank.shortName === editBankAccount?.bank_name
                            )?.shortName
                          : "Select bank..."}
                        <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent side="bottom" avoidCollisions={false}>
                      <Command>
                        <CommandInput placeholder="Search bank..." />
                        <CommandList>
                          <CommandEmpty>No bank found.</CommandEmpty>
                          <CommandGroup>
                            {banks.map((bank) => (
                              <CommandItem
                                key={bank.id}
                                value={bank.shortName}
                                className="h-14"
                                onSelect={(currentValue) => {
                                  setEditBankAccount((prev) => ({
                                    ...prev,
                                    bank_name:
                                      currentValue ===
                                      editBankAccount?.bank_name
                                        ? ""
                                        : currentValue,
                                  }));
                                  setOpen(false);
                                }}
                              >
                                {bank.logo && (
                                  <Image
                                    src={bank.logo}
                                    alt={bank.name}
                                    width={64}
                                    height={56}
                                    className="object-contain"
                                  />
                                )}
                                {bank.shortName}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <span className="text-gray-500">
                    Bank name is not provided
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex flex-row gap-4 items-center">
                  <span className="font-semibold w-1/5">Account number:</span>{" "}
                  {isOwner ? (
                    <Input
                      className="w-1/3"
                      type="number"
                      value={editBankAccount.account_number}
                      placeholder="Account number"
                      onChange={(e) =>
                        setEditBankAccount((prev) => ({
                          ...prev,
                          account_number: e.target.value,
                        }))
                      }
                    />
                  ) : (
                    <span className="text-gray-500">
                      Account number is not provided
                    </span>
                  )}
                </div>
                {isOwner && (
                  <Button
                    className="w-1/3 my-1 bg-red-600 text-white hover:bg-red-700"
                    onClick={handleUpdateBankAccount}
                    disabled={updateUserMutation.isPending}
                    size="sm"
                  >
                    Update
                  </Button>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Social network links</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              {isOwner ? (
                listIdentities.length > 0 ? (
                  listIdentities.map((identity: UserIdentity) => (
                    <div key={identity.id}>
                      <div className="flex items-center justify-between p-3 border rounded-lg hover:opacity-70 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="text-blue-600">
                            {identity.provider === "email" ? (
                              <Mail className="w-5 h-5" />
                            ) : identity.provider === "google" ? (
                              <Chrome className="w-5 h-5" />
                            ) : identity.provider === "facebook" ? (
                              <Facebook className="w-5 h-5" />
                            ) : null}
                          </div>
                          <div>
                            <div className="font-medium">
                              {identity.provider}
                            </div>
                            <div className="text-sm text-gray-500">
                              {identity.identity_data?.email}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Connected
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs text-red-600 px-2 py-1 rounded-full"
                            onClick={() => handleUnlink(identity.provider)}
                          >
                            <Unlink className="w-4 h-4 mr-1" />
                            Disconnect
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500">
                    No social accounts connected
                  </div>
                )
              ) : (
                <div className="text-center py-4">
                  <div className="text-gray-500 mb-2">🔒</div>
                  <div className="text-gray-600">
                    Social network information is only visible to the account
                    owner
                  </div>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-4">
          <AccordionTrigger>Citizen ID</AccordionTrigger>
          <AccordionContent>
            {editCardId.id_number ? (
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">ID number:</span>{" "}
                  {editCardId.id_number}
                </div>
                <div>
                  <span className="font-semibold">Full name:</span>{" "}
                  {editCardId.full_name}
                </div>
                <div>
                  <span className="font-semibold">Gender:</span>{" "}
                  {editCardId.gender}
                </div>
                <div>
                  <span className="font-semibold">Place of residence:</span>{" "}
                  {editCardId.place_of_residence}
                </div>
              </div>
            ) : isOwner ? (
              <div className="space-y-2">
                <div className="text-red-500 font-medium">
                  Your account has not been verified yet.
                </div>
                <Link
                  href="/protected/verify-id"
                  className="text-blue-600 underline"
                >
                  Verify now
                </Link>
              </div>
            ) : (
              <span className="text-gray-500">ID card is not provided</span>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
