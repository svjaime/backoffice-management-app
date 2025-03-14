import { CreateUserInput } from "@/components/forms/create-user-form";
import { UpdateUserInput } from "@/components/forms/update-user-form";
import { config } from "@/config";
import { useAuth } from "@/context/auth-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.string().datetime(),
  role: z.object({ id: z.number(), name: z.enum(["admin", "user"]) }),
});

export type User = z.infer<typeof userSchema>;

export function useGetUsers() {
  const { user, logout } = useAuth();
  const token = user?.token ?? "";

  return useQuery<User[]>({
    queryKey: ["users", token],
    queryFn: async () => {
      try {
        return await fetchUsers(token);
      } catch (err) {
        if (err instanceof Error && err.message === "Unauthorized") {
          logout();
        }
        throw err;
      }
    },
    enabled: !!token && user?.isAdmin,
  });
}

export function useUserActions() {
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();
  const token = user?.token ?? "";

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      try {
        return await deleteUser(token, id);
      } catch (err) {
        if (err instanceof Error && err.message === "Unauthorized") {
          logout();
        }
        throw err;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const updateUserMutation = useMutation({
    mutationFn: async (user: UpdateUserInput & { id: number }) => {
      try {
        return await updateUser(token, user);
      } catch (err) {
        if (err instanceof Error && err.message === "Unauthorized") {
          logout();
        }
        throw err;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const createUserMutation = useMutation({
    mutationFn: async (user: CreateUserInput) => {
      try {
        return await createUser(token, user);
      } catch (err) {
        if (err instanceof Error && err.message === "Unauthorized") {
          logout();
        }
        throw err;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  return { deleteUserMutation, updateUserMutation, createUserMutation };
}

const fetchUsers = async (token: string) => {
  const res = await fetch(`${config.api.baseUrl}/api/users`, {
    method: "GET",
    headers: [
      ["Content-Type", "application/json"],
      ["Authorization", `Bearer ${token}`],
    ],
  });

  if (res.status === 401) {
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }
  const data = await res.json();

  return z.array(userSchema).parse(data);
};

const deleteUser = async (token: string, id: number) => {
  const res = await fetch(`${config.api.baseUrl}/api/users/${id}`, {
    method: "DELETE",
    headers: [
      ["Content-Type", "application/json"],
      ["Authorization", `Bearer ${token}`],
    ],
  });

  if (res.status === 401) {
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    throw new Error("Failed to delete user");
  }
};

const updateUser = async (
  token: string,
  user: UpdateUserInput & { id: number },
) => {
  const res = await fetch(`${config.api.baseUrl}/api/users/${user.id}`, {
    method: "PUT",
    headers: [
      ["Content-Type", "application/json"],
      ["Authorization", `Bearer ${token}`],
    ],
    body: JSON.stringify(user),
  });

  if (res.status === 401) {
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    throw new Error("Failed to update user");
  }
};

const createUser = async (token: string, user: CreateUserInput) => {
  const res = await fetch(`${config.api.baseUrl}/api/users`, {
    method: "POST",
    headers: [
      ["Content-Type", "application/json"],
      ["Authorization", `Bearer ${token}`],
    ],
    body: JSON.stringify(user),
  });

  if (res.status === 401) {
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    throw new Error("Failed to create user");
  }
};
