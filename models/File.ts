import mongoose from "mongoose";

const Schema = mongoose.Schema;

const FileSchema = new Schema({
  name: { required: true, type: String },
  path: { required: true, type: String },
  size: { required: true, type: Number },
  type: { required: true, type: String },
  createdBy: { type: Object, default: null },
  createdAt: { type: Date, default: () => Date.now() },
});

export const File = mongoose.models.File || mongoose.model("File", FileSchema);
export type FileDocument = mongoose.Document & {
  createdBy: { cn: string; id: string; entity: string };
  createdAt: Date;
  name: string;
  path: string;
  size: number;
  type: string;
};
