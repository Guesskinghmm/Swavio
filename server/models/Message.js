import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  senderId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiverId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text:          String,
  fileUrl:       String,          // Full Cloudinary delivery URL (or legacy /uploads/… path)
  filePublicId:  String,          // Cloudinary public_id for deletion
  mimeType:      String,          // e.g. "image/jpeg", "application/pdf"
  resourceType:  String,          // Cloudinary resource_type: "image" | "video" | "raw"
  originalName:  String,          // Original filename from the user's device
  read:          { type: Boolean, default: false },
}, { timestamps: true });

messageSchema.index({ senderId: 1, receiverId: 1 });

export default mongoose.model('Message', messageSchema);
