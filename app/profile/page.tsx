"use client";

import { useEffect, useState } from "react";
import { useAuthContext } from "@/contexts/auth-context";
import { getWallet, getTransactions } from "@/lib/api-client";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Wallet, Receipt, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Transaction {
  id: number;
  createdAt: string;
  isActive: boolean;
  wallet: number;
  amount: number;
  type: 'bonus' | 'debit' | 'credit';
  description: string;
}

export default function ProfilePage() {
  const { user } = useAuthContext();
  const [walletData, setWalletData] = useState<{ balance: number } | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [wallet, transactionData] = await Promise.all([
          getWallet(),
          getTransactions()
        ]);
        
        setWalletData(wallet);
        setTransactions(transactionData);
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
        setError('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'bonus':
        return 'text-green-500';
      case 'debit':
        return 'text-red-500';
      case 'credit':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 p-4">
        <div className="container mx-auto max-w-6xl space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Name</div>
                  <div className="font-medium">{user?.fullName}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="font-medium">{user?.email}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wallet */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Wallet Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : error ? (
                <div className="text-center text-destructive">{error}</div>
              ) : walletData ? (
                <div className="text-3xl font-bold">
                  {walletData.balance} Credits
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Billing History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Billing History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : error ? (
                <div className="text-center text-destructive">{error}</div>
              ) : transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="space-y-1">
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                      <div className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                        {transaction.type === 'debit' ? '-' : '+'}
                        {transaction.amount} Credits
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No transactions found
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 