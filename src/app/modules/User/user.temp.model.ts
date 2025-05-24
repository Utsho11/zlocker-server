import bcrypt from "bcrypt";
import { Schema, model } from "mongoose";
import config from "../../config";
import { TUserTemp, UserTempModel } from "./user.temp.interface";

const tempUserSchema = new Schema<TUserTemp, UserTempModel>(
  {
    email: {
      type: String,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },
  },
  {
    expires: 300,
    timestamps: true,
  }
);

tempUserSchema.pre("save", async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this; // doc
  // hashing password and save into DB
  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_rounds)
  );
  next();
});

tempUserSchema.statics.isUserExistsByEmail = async function (email: string) {
  return await UserTemp.findOne({ email });
};

export const UserTemp = model<TUserTemp, UserTempModel>(
  "UserTemp",
  tempUserSchema
);
