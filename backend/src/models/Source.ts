import mongoose, { Document, Schema } from "mongoose";
// import { text } from "node:stream/consumers";

interface ISourceChunk{
  text: string;
  embedding: number[];
}
export interface ISource extends Document {
  sessionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;

  url: string;
  title: string;

  content: string;

  chunks: ISourceChunk[];

  createdAt: Date;
  updatedAt: Date;
}

const sourceChunkSchema= new Schema<ISourceChunk>(
  {
    text: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number],
      required: true,
    },
  },
  {
    _id: false,
  }
);


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
      type: [sourceChunkSchema],
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