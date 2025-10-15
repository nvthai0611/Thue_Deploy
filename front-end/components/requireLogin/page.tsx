"use client";

import { AlertCircle, LogIn } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function LoginAlert() {
  const router = useRouter();

  return (
    <Card className="max-w-4xl mx-auto p-6">
      <CardContent className="p-0">
        <Alert className="bg-red-50 border-gray-200">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <AlertTitle className="text-gray-900 font-semibold">
            Login Required
          </AlertTitle>
          <AlertDescription className="text-gray-700 text-sm">
            You need to log in to comment. Please sign in or create an account.
            <div className="mt-4">
              <Button 
                className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white"
                onClick={() => router.push('/sign-in')}
              >
                <LogIn className="mr-2 h-4 w-4" /> Sign In Now
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}