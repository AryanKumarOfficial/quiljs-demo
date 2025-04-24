import mongoose, { Schema } from 'mongoose';
import { hash } from 'bcryptjs'; // Changed from bcrypt to bcryptjs

export interface IUser {
  name: string;
  email: string;
  password?: string;
  image?: string;
  authProvider?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true,
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: { 
    type: String, 
    required: [function(this: IUser) {
      // Password is only required for email/password authentication
      return !this.authProvider;
    }, 'Password is required for email login'],
    minlength: [8, 'Password must be at least 8 characters'],
  },
  image: {
    type: String,
  },
  authProvider: {
    type: String,
    enum: ['github', 'google', null],
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.password; // Don't expose password
      return ret;
    }
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password') && this.password) {
    this.password = await hash(this.password, 10);
  }
  next();
});

// Create the model or get it if it exists
const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;