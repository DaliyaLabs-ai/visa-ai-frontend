import type {
  RegisterData,
  LoginData,
  LoginError,
  LoginResponse,
} from "@/types/auth";
import type { StudentProfileData } from "@/types/profile";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function register(data: RegisterData) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to register");
  }

  return response.json();
}

export async function login(data: LoginData) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw result as LoginError;
  }

  return result as LoginResponse;
}

export async function submitStudentProfile(data: StudentProfileData) {
  console.log("submitting profile ....");
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    throw new Error("No access token found");
  }

  const response = await fetch(`${API_URL}/profile`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw result;
  }

  return result;
}

export async function createMeeting(meetingId: string) {
  const accessToken = localStorage.getItem("accessToken");

  const response = await fetch(`${API_URL}/meeting`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ meetingId }),
  });

  console.log("meeting created: ", response.json());
}

export async function rateMeeting(meetingId: string, rating: number) {
  const accessToken = localStorage.getItem("accessToken");

  const response = await fetch(`${API_URL}/meeting/${meetingId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rating, metadata: {} }),
  });

  console.log("meeting rated: ", response.json());
}

interface Wallet {
  id: number;
  createdAt: string;
  isActive: boolean;
  user: string;
  balance: number;
}

interface Transaction {
  id: number;
  createdAt: string;
  isActive: boolean;
  wallet: number;
  amount: number;
  type: 'bonus' | 'debit' | 'credit';
  description: string;
}

export const getWallet = async (): Promise<Wallet> => {
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallet`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch wallet');
  }

  const data = await response.json();
  return data.data;
};

export const getTransactions = async (): Promise<Transaction[]> => {
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallet/transactions`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }

  const data = await response.json();
  return data.data;
};
