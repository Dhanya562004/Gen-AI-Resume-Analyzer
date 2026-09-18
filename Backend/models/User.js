
import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: function () {
      return this.authProvider === "local"
    },
    select: false
  },

  authProvider: {
    type: String,
    enum: ["local", "google"],
    default: "local"
  },

  firebaseUid: {
    type: String,
    unique: true,
    sparse: true
  },

  photoURL: {
    type: String
  }
}, { timestamps: true })

userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return

  this.password = await bcrypt.hash(this.password, 10)
})

const User = mongoose.model("User", userSchema)

export default User