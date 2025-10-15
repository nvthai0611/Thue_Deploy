"use client";

import logo from "@/assets/HolaRental.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/useUserStore";
import { createClient } from "@/utils/supabase/client";
import {
  Bell,
  Scale,
  LayoutDashboard,
  MapPin,
  Menu,
  MessageSquare,
  Plus,
  Search,
  User,
  UserPen,
  Bookmark,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import NotificationBell from "./notification-bell";
import { Notification } from "@/lib/type";
import { useSearchRooms } from "@/queries/room.queries";

interface SearchHeaderProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onSearch?: (value?: string) => void;
  data?: [];
}

export default function SearchHeader({
  searchQuery,
  setSearchQuery,
  onSearch,
  data,
}: SearchHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const userId = useUserStore((state) => state.userId);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const supabase = createClient();
  const [roleUser, setRoleUser] = useState<string>("");
  const [openSuggestSearch, setOpenSuggestSearch] = useState(false);
  const { data: dataQuery, isLoading } = useSearchRooms(searchQuery);
  const searchQueryArray = Array.from(
    new Set(dataQuery?.data.map((room: any) => room.title))
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (!userId) return;

    // Fetch initial notifications
    //console.log("Fetching notifications for user ID:", userId);

    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data }) => setNotifications(data as Notification[]));

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setNotifications((prev) => [payload.new as Notification, ...prev]);
          }
          if (payload.eventType === "UPDATE") {
            setNotifications((prev) =>
              prev.map((n) =>
                n.id === payload.new.id ? (payload.new as Notification) : n
              )
            );
          }
        }
      )
      .subscribe();

    // console.log("Notifications: ", notifications);
    // console.log("User ID: ", userId);

    return () => {
      channel.unsubscribe();
    };
  }, [userId, supabase]);

  // Fetch Role user
  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient();
      const { data: user, error } = await supabase
        .from("users")
        .select("role")
        .eq("auth_user_id", userId)
        .single();
      if (!error) setRoleUser(user?.role);
    }
    fetchUser();
  }, [userId, supabase]);

  console.log("User: ", user);
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background shadow-md">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center">
            <Image src={logo} alt="HolaRental" className="w-32 h-16" />
          </Link>
        </div>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4">
          <div className="relative w-full">
            <Input
              type="search"
              placeholder="search room by name or Id"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setOpenSuggestSearch(e.target.value.length > 0);
              }}
              onMouseEnter={(e) => setOpenSuggestSearch(true)}
              className="w-full pl-10 rounded-l-md rounded-r-none h-10"
              onKeyDown={(e) => e.key === "Enter" && onSearch?.(searchQuery)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            {openSuggestSearch && (
              <div className="absolute z-10 w-full flex mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                <ul
                  className="py-1 w-full "
                  onMouseLeave={() => setOpenSuggestSearch(false)}
                >
                  {searchQuery.length > 0 ? (
                    <>
                      <li
                        className="px-4 py-2 text-sm text-gray-700 w-full hover:bg-red-50 hover:text-red-600 cursor-pointer flex items-center gap-2"
                        onClick={() => {
                          setSearchQuery(searchQuery);
                          onSearch?.(searchQuery);
                          setOpenSuggestSearch(false);
                        }}
                        onMouseEnter={() => setOpenSuggestSearch(true)}
                      >
                        <Search className="h-4 w-4 text-red-500" />
                        Search for "{searchQuery}"
                      </li>
                      {searchQueryArray
                        .filter((item: any) =>
                          item.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((suggestion: any, index) => (
                          <li
                            key={index}
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 cursor-pointer flex items-center gap-2"
                            onClick={() => {
                              setSearchQuery(suggestion);
                              setOpenSuggestSearch(false);
                              onSearch?.(suggestion);
                            }}
                          >
                            <MapPin className="h-4 w-4 text-red-500" />
                            {suggestion}
                          </li>
                        ))}
                    </>
                  ) : (
                    <li className="px-4 py-2 text-sm text-gray-500">
                      Enter keyword to see suggest search result
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-4">
          <Link href="/compare">
            <Button
              variant="ghost"
              size="sm"
              className="text-sm flex gap-2 items-center"
            >
              <Scale className="h-5 w-5" />
              <span>Compare</span>
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="text-sm flex flex-col items-center relative"
          >
            <MessageSquare
              className="h-5 w-5"
              onClick={() => router.push("/chat")}
            />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-sm flex gap-2 items-center"
            onClick={() => router.push("/user/room/saved")}
            aria-label="Saved Rooms"
          >
            <Bookmark className="h-5 w-5" />
            <span>Saved</span>
          </Button>
          <NotificationBell notifications={notifications} />

          <Link href="/landlord/my-ads">
            <Button
              variant="ghost"
              size="sm"
              className="text-sm flex gap-2 items-center"
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>My Ads</span>
            </Button>
          </Link>
          <Link href="/user/contracts">
            <Button
              variant="ghost"
              size="sm"
              className="text-sm flex gap-2 items-center"
            >
              <UserPen className="h-5 w-5" />
              <span>Contracts</span>
            </Button>
          </Link>
          {userId && (
            <Link href={`/user/${userId}`}>
              <Button
                variant="ghost"
                size="sm"
                className="text-sm flex gap-2 items-center"
              >
                <User className="h-5 w-5" />
                <span>Account</span>
              </Button>
            </Link>
          )}

          {roleUser === "user" ? (
            <>
              {user && (
                <Link href="/landlord/register/property-document">
                  <Button className="bg-red-600 text-white hover:bg-red-700">
                    <Plus className="mr-2 h-4 w-4" /> Register Landlord
                  </Button>
                </Link>
              )}
            </>
          ) : (
            <>
              {user && (
                <Link href="/landlord/housing-area/create">
                  <Button className="bg-red-600 text-white hover:bg-red-700">
                    <Plus className="mr-2 h-4 w-4" /> Create Ads
                  </Button>
                </Link>
              )}
            </>
          )}
        </nav>
      </div>

      {/* Mobile Search - under header */}
      <div className="md:hidden px-4 py-2 bg-gray-50">
        <div className="relative">
          <Input
            type="search"
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-16 h-10"
            onKeyDown={(e) => e.key === "Enter" && onSearch?.(searchQuery)}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Button
            size="sm"
            className="absolute right-1 top-1 h-8 bg-red-700 hover:bg-red-600 text-white"
            onClick={() => onSearch?.(searchQuery)}
          >
            Search
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-background transition-transform duration-300 ease-in-out transform",
          isMenuOpen ? "translate-x-0" : "-translate-x-full",
          "md:hidden"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-x"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </Button>
        </div>
        <nav className="p-4">
          <ul className="space-y-4">
            <li>
              <Link
                href="/about-us"
                className="flex items-center p-2 hover:bg-gray-100 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="mr-3 h-5 w-5" />
                <span>About</span>
              </Link>
            </li>
            <li>
              <Link
                href="/"
                className="flex items-center p-2 hover:bg-gray-100 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="mr-3 h-5 w-5" />
                <span>Account</span>
              </Link>
            </li>
            <li>
              <Link
                href="/chat"
                className="flex items-center p-2 hover:bg-gray-100 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <MessageSquare className="mr-3 h-5 w-5" />
                <span>Chat</span>
              </Link>
            </li>
            <li>
              <Link
                href="/notifications"
                className="flex items-center p-2 hover:bg-gray-100 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <Bell className="mr-3 h-5 w-5" />
                <span>Notifications</span>
              </Link>
            </li>
            <li>
              <Link
                href="/landlord/my-ads"
                className="flex items-center p-2 hover:bg-gray-100 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <LayoutDashboard className="mr-3 h-5 w-5" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li className="pt-4">
              <Link
                href="/landlord/housing-area/create"
                onClick={() => setIsMenuOpen(false)}
              >
                <Button className="w-full bg-red-700 text-white hover:bg-red-600">
                  <Plus className="mr-2 h-4 w-4" /> Post Ad
                </Button>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
