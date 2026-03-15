const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ["fleet_manager", "driver", "admin", "analyst"],
      default: "fleet_manager",
    },
    avatar:       { type: String, default: null },
    isActive:     { type: Boolean, default: true },
    lastLoginAt:  { type: Date, default: null },
    refreshToken: { type: String, select: false, default: null },

    // Driver-specific
    assignedVehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", default: null },
  },
  { timestamps: true }
);

// Hash password before save
// NOTE: Do NOT name the callback param "next" — it shadows Express's next()
// and causes "next is not a function" errors in controllers.
// Use the implicit Mongoose promise return instead.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toPublic = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  return obj;
};

module.exports = mongoose.model("User", userSchema);