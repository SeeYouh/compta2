import mongoose from 'mongoose';

const genericItemSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: {
    type: String,
    enum: ["passengers", "odyssey"],
    required: true,
  },
  categoryId: { type: String, required: true },
  folderId: { type: String, default: null },
  name: { type: String, required: true, trim: true },
  contentData: { type: mongoose.Schema.Types.Mixed, default: {} },
  deletedAt: { type: Date, default: null },
});

genericItemSchema.index({ userId: 1, type: 1, categoryId: 1 });

export const GenericItem = mongoose.model("GenericItem", genericItemSchema);
