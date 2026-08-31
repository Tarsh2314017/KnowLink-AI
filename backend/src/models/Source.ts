import mongoose, { Document, Schema } from "mongoose";

export interface ISource extends Document {
  sessionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;

  url: string;
  title: string;

  content: string;

  chunks: string[];

  createdAt: Date;
  updatedAt: Date;
}

const sourceSchema = new Schema<ISource>(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    url: {
      type: String,
      required: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    content: {
      type: String,
      required: true,
    },

    chunks: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

sourceSchema.index(
  { sessionId: 1, url: 1 },
  { unique: true }
);

export const Source = mongoose.model<ISource>(
  "Source",
  sourceSchema
);