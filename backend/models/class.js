const { Schema, model, Types } = require("mongoose");

const ClassSchema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    members: [{ type: Types.ObjectId, ref: "User" }], 
    createdBy: { type: Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = model("Class", ClassSchema, "classes"); 
