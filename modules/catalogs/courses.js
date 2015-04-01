var mongoose = require('mongoose');

var courseSchema = new mongoose.Schema({
    course: {
        type: String,
        unique: true,
        required: true
    },
    category: String,// type of this categorySchema
    updatedAt: { type: Date }
});

courseSchema.pre('save', function(next){
    this.updatedAt = new Date();
    next();
});

var Course = mongoose.model('courses', courseSchema);

module.exports = Course;