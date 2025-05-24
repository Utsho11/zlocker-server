import { Model } from "mongoose";
import { USER_ROLE } from "./user.constant";

export interface TUser {
  email: string;
  username?: string;
  password: string;
  role?: "superAdmin" | "user" | "premiumUser";
  status?: "active" | "blocked";
  passwordChangedAt?: Date;
  isVerified: boolean;
  isDeleted: boolean;
}

export interface UserModel extends Model<TUser> {
  //instance methods for checking if the user exist
  isUserExistsByEmail(email: string): Promise<TUser>;
  //instance methods for checking if passwords are matched
  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string
  ): Promise<boolean>;
  isJWTIssuedBeforePasswordChanged(
    passwordChangedTimestamp: Date,
    jwtIssuedTimestamp: number
  ): boolean;
}

export type TUserRole = keyof typeof USER_ROLE;
