import mongoose, { Schema } from 'mongoose';

export interface INote {
  _id?: mongoose.Types.ObjectId | string;
  id?: string;
  title: string;
  content: string;
  tags: string[];
  folder: string;
  color: string;
  isPinned: boolean;
  isFavorite: boolean;
  editorType: 'rich' | 'markdown' | 'simple';
  userId: mongoose.Types.ObjectId | string;
  isPublic: boolean;
  sharedWith: mongoose.Types.ObjectId[] | string[];
  lastAccessed: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const noteSchema = new Schema<INote>({
  title: { 
    type: String, 
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  content: { 
    type: String, 
    required: [true, 'Content is required'] 
  },
  tags: { 
    type: [String],
    default: []
  },
  folder: {
    type: String,
    default: 'Default'
  },
  color: {
    type: String,
    default: '#ffffff'
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  editorType: { 
    type: String, 
    enum: ['rich', 'markdown', 'simple'],
    default: 'rich'
  },
  userId: {
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: [true, 'User ID is required']
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  sharedWith: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  lastAccessed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Create the model or get it if it exists
const Note = mongoose.models.Note || mongoose.model<INote>('Note', noteSchema);

export default Note;