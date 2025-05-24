import { Model } from "mongoose";
import { USER_ROLE } from "./user.constant";

export interface TUserTemp {
  email: string;
  password: string;
}

export interface UserTempModel extends Model<TUserTemp> {
  //instance methods for checking if the user exist
  isUserExistsByEmail(email: string): Promise<TUserTemp>;
}

export type TUserRole = keyof typeof USER_ROLE;
