const ContactMessage = require("../models/ContactMessage");

// POST /api/contact  (public - anyone visiting the Contact page)
const submitContactMessage = async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: "Name, email and message are all required." });
  }
  const saved = await ContactMessage.create({ name, email, message });
  res.status(201).json(saved);
};

// GET /api/admin/contact-messages  (admin only)
const getAllContactMessages = async (req, res) => {
  const messages = await ContactMessage.find().sort({ createdAt: -1 });
  res.json(messages);
};

// PUT /api/admin/contact-messages/:id/read  (admin only)
const markContactMessageRead = async (req, res) => {
  const updated = await ContactMessage.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
  if (!updated) return res.status(404).json({ message: "Message not found" });
  res.json(updated);
};

// DELETE /api/admin/contact-messages/:id  (admin only)
const deleteContactMessage = async (req, res) => {
  const deleted = await ContactMessage.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Message not found" });
  res.json({ message: "Deleted" });
};

module.exports = {
  submitContactMessage,
  getAllContactMessages,
  markContactMessageRead,
  deleteContactMessage,
};
