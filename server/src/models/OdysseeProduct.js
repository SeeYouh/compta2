import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  img: {
    type: [String],
    default: [],
  },
  tooltips: {
    type: String,
  },
  contentFilesData: {
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    aliasName: {
      activate: {
        type: Boolean,
        default: true,
      },
      name: {
        type: String,
      },
    },
    img: [
      {
        adress: { type: String },
        alt: { type: String },
      },
    ],
    treatmentDuration: { type: Number },
    amountToAdminister: { type: Number },
    intakeTime: {
      mode: {
        type: String,
        enum: ["normal", "advanced"],
        default: "normal",
      },
      checkedMoments: {
        type: [String],
        default: [],
      },
      selectedTime: { type: String },
      durationBefore: { type: Number },
      durationAfter: { type: Number },
      nightDuration: { type: Number },
      advancedMode: {
        type: Boolean,
        default: false,
      },
      daysTime: [
        {
          name: { type: String, required: true },
          activateTime: { type: Boolean, default: false },
        },
      ],
    },
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OdysseeCategory",
    required: true,
  },
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OdysseeProductFolder",
    default: null,
  },
  // userId stocké en String (format site-1 : "user-UUID")
  userId: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

productSchema.index({
  "contentFilesData.productName": "text",
  "contentFilesData.aliasName.name": "text",
  name: "text",
});
productSchema.index({ userId: 1 });
productSchema.index({ categoryId: 1 });
productSchema.index({ userId: 1, categoryId: 1 });

productSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

productSchema.statics.findByUser = function (userId) {
  return this.find({ userId, isActive: true });
};

productSchema.statics.findByUserAndCategory = function (userId, categoryId) {
  return this.find({ userId, categoryId, isActive: true });
};

productSchema.statics.searchProducts = function (searchTerm, userId) {
  return this.find({ userId, isActive: true, $text: { $search: searchTerm } });
};

export const OdysseeProduct = mongoose.model("OdysseeProduct", productSchema);
