"use client";

import { useEffect, useState } from "react";
import { useAuthContext } from "@/contexts/auth-context";
import { getWallet, getTransactions, changePassword, deleteAccount } from "@/lib/api-client";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Wallet, Receipt, Clock, Lock, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

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
  const { toast } = useToast();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteForm, setDeleteForm] = useState({
    password: "",
    reason: "",
  });
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error
    setPasswordError(null);

    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long");
      return;
    }

    setIsChangingPassword(true);

    try {
      await changePassword(passwordForm.oldPassword, passwordForm.newPassword);
      
      // Reset form
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast({
        title: "Success",
        description: "Your password has been changed successfully.",
      });
    } catch (error: any) {
      setPasswordError(error?.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);

    if (!deleteForm.password) {
      setDeleteError("Password is required");
      return;
    }

    if (!deleteForm.reason) {
      setDeleteError("Please provide a reason for account deletion");
      return;
    }

    setIsDeleting(true);

    try {
      await deleteAccount(deleteForm.password, deleteForm.reason);
      
      // Clear local storage and redirect to home
      localStorage.clear();
      router.push("/");
      
      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted.",
      });
    } catch (error: any) {
      setDeleteError(error?.message || "Failed to delete account");
    } finally {
      setIsDeleting(false);
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

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Password</label>
                  <Input
                    type="password"
                    value={passwordForm.oldPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        oldPassword: e.target.value,
                      })
                    }
                    placeholder="Enter current password"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>
                  <Input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder="Enter new password"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm New Password</label>
                  <Input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Confirm new password"
                  />
                </div>

                {passwordError && (
                  <div className="text-sm text-destructive">{passwordError}</div>
                )}

                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Changing Password...
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Delete Account */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Delete Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">Delete Account</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-destructive">Delete Account</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently delete your
                        account and remove your data from our servers.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleDeleteAccount} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Confirm Password
                        </label>
                        <Input
                          type="password"
                          value={deleteForm.password}
                          onChange={(e) =>
                            setDeleteForm({
                              ...deleteForm,
                              password: e.target.value,
                            })
                          }
                          placeholder="Enter your password"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Reason for Deletion
                        </label>
                        <Textarea
                          value={deleteForm.reason}
                          onChange={(e) =>
                            setDeleteForm({
                              ...deleteForm,
                              reason: e.target.value,
                            })
                          }
                          placeholder="Please tell us why you're deleting your account"
                          rows={3}
                        />
                      </div>

                      {deleteError && (
                        <div className="text-sm text-destructive">
                          {deleteError}
                        </div>
                      )}

                      <div className="flex justify-end gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowDeleteDialog(false);
                            setDeleteForm({ password: "", reason: "" });
                            setDeleteError(null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="destructive"
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            "Delete Account"
                          )}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 