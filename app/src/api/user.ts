import { api } from "./client";

export type User = {
    id: number;
    username: string;
    email: string;
};

export type UserEnvelope = {
    success: true;
    message?: string;
    data: User;
};

export type UpdateUserInput = {
    email: string;
};

export const getMe = (): Promise<UserEnvelope> => api.get("/user");

export const updateMe = (input: UpdateUserInput): Promise<UserEnvelope> => api.put("/user", input);
