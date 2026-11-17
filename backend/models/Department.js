const mongoose = require('mongoose');

const DEPARTMENT_CATEGORIES = ['Natural Science', 'Social Science', 'Health Science', 'Diploma', 'Uncategorized];
const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  normalizedName: { type: String, required: true, lowercase: true, trim: true },
  category: { type: String, enum: DEPARTMENT_CATEGORIES, default: 'Uncategorized', index: true },
  isActive: { type: Boolean, default: true, index: true },
  description: { type: String, default: '', trim: true },
}, { timestamps: true });

departmentSchema.pre('validate', function normalizeDepartmentName(next) {
  if (this.name) this.normalizedName = this.name.trim().toLocaleLowerCase();
  next();
});

departmentSchema.index({ category: 1, normalizedName: 1 }, { unique: true, partialFilterExpression: { normalizedName: { $type: 'string' } } });

departmentSchema.statics.CATEGORIES = DEPARTMENT_CATEGORIES;

module.exports = mongoose.models.Department || mongoose.model('Department', departmentSchema);
