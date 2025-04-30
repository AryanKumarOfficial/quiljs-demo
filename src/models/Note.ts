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
  sharedWith: string[]; // Store emails instead of IDs for easier lookups
  lastAccessed: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const noteSchema = new Schema<INote>({
  title: { 
    type: String, 
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
    minlength: [1, 'Title cannot be empty']
  },
  content: { 
    type: String, 
    default: ''
  },
  tags: { 
    type: [String],
    default: [],
    validate: {
      validator: function(tags: string[]) {
        // Each tag should be between 1-20 characters and have at most 50 tags
        return tags.every(tag => tag.length >= 1 && tag.length <= 20) && tags.length <= 50;
      },
      message: 'Tags must be between 1-20 characters and you can have at most 50 tags'
    }
  },
  folder: {
    type: String,
    default: 'Default',
    trim: true,
    maxlength: [30, 'Folder name cannot be more than 30 characters']
  },
  color: {
    type: String,
    default: '#ffffff',
    validate: {
      validator: function(color: string) {
        // Either a hex color code or predefined color name
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color) || 
               ['white', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'gray'].includes(color);
      },
      message: 'Invalid color format'
    }
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
    enum: {
      values: ['rich', 'markdown', 'simple'],
      message: 'Invalid editor type, must be rich, markdown, or simple'
    },
    default: 'rich'
  },
  userId: {
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  isPublic: {
    type: Boolean,
    default: false,
    index: true
  },
  sharedWith: {
    type: [String],
    default: [],
    validate: {
      validator: function(emails: string[]) {
        // Simple email validation for shared emails
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emails.every(email => emailRegex.test(email));
      },
      message: 'Invalid email format in sharedWith array'
    }
  },
  lastAccessed: {
    type: Date,
    default: Date.now,
    index: true // Index for sorting by recently accessed
  }
}, {
  timestamps: true, // Automatically add createdAt and updatedAt
  toJSON: {
    virtuals: true,
    transform: (_doc, ret) => {
      ret.id = ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for efficient querying
noteSchema.index({ title: 'text', content: 'text', tags: 'text' }); // Text search index
noteSchema.index({ userId: 1, updatedAt: -1 }); // Most common query pattern
noteSchema.index({ userId: 1, isPinned: -1 }); // For pinned notes queries
noteSchema.index({ userId: 1, isFavorite: -1 }); // For favorite notes queries
noteSchema.index({ userId: 1, folder: 1 }); // For folder-based filtering

// Create the model or get it if it exists
const Note = mongoose.models.Note as mongoose.Model<INote> || mongoose.model<INote>('Note', noteSchema);

export default Note;