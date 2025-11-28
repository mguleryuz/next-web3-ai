import mongoose, { Schema, Document, Model, Types } from "mongoose";

// Interface for the User document
export interface IUser {
  wallet_address: string;
  dynamic_user_id?: string;
  email?: string;
  name?: string;
  created_at: Date;
  updated_at: Date;
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
}

export interface IUserModel extends Model<IUserDocument> {
  findOrCreateByWallet(
    walletAddress: string,
    userData?: Partial<Omit<IUser, "wallet_address" | "created_at" | "updated_at">>
  ): Promise<IUserDocument>;
}

// Schema definition
const UserSchema = new Schema<IUserDocument>(
  {
    wallet_address: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
    },
    dynamic_user_id: { type: String, index: true, sparse: true },
    email: { type: String, index: true, sparse: true },
    name: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// Static method to find or create user by wallet address
UserSchema.statics.findOrCreateByWallet = async function (
  walletAddress: string,
  userData?: Partial<Omit<IUser, "wallet_address" | "created_at" | "updated_at">>
): Promise<IUserDocument> {
  const normalizedAddress = walletAddress.toLowerCase();

  let user = await this.findOne({ wallet_address: normalizedAddress });

  if (user) {
    // Update user data if provided
    if (userData) {
      if (userData.dynamic_user_id) user.dynamic_user_id = userData.dynamic_user_id;
      if (userData.email) user.email = userData.email;
      if (userData.name) user.name = userData.name;
      await user.save();
    }
    return user;
  }

  // Create new user
  user = await this.create({
    wallet_address: normalizedAddress,
    ...userData,
  });

  return user;
};

export const UserModel =
  (mongoose.models.users as IUserModel) ||
  mongoose.model<IUserDocument, IUserModel>("users", UserSchema);
