export interface CurrentUser {
  userId: string;
  username: string;
  role: "Admin" | "HR" | "Employee";
}
