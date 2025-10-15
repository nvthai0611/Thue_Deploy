export type Message =
  | { success: string }
  | { error: string }
  | { message: string };

export function FormMessage({ message }: { message: Message }) {
  return (
    <div className="flex flex-col gap-2 w-full max-w-md text-sm">
      {"success" in message && (
        <div className="text-background border-l-2 border-background px-4">
          {message.success}
        </div>
      )}
      {"error" in message && (
        <div className="text-background border-l-2 border-background px-4">
          {message.error}
        </div>
      )}
      {"message" in message && (
        <div className="text-background border-l-2 order-background px-4">
          {message.message}
        </div>
      )}
    </div>
  );
}
