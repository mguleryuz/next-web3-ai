import { Schema, model } from "mongoose";

export const UserSchema = new Schema({
  wallet_address: { type: String, required: true, unique: true },
});

export const UserModel = model("users", UserSchema);
