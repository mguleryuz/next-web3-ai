import mongoose, { Schema, Document, Model, Types } from "mongoose";

// Interface for the User document
export interface IUser {
  wallet_address: string;
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
}

export type IUserModel = Model<IUserDocument>;

// Schema definition
const UserSchema = new Schema<IUserDocument>({
  wallet_address: { type: String, required: true, unique: true, index: true },
});

export const UserModel =
  (mongoose.models.users as IUserModel) ||
  mongoose.model<IUserDocument, IUserModel>("users", UserSchema);
