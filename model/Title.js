var mongoose = require('mongoose')

var titleSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["choice", "fill", "answer"],
        required: true
    },
    choice:{
        title: String,
        optionType: {
            type: String,
            enum: ["shared", "individual"],
            required: true
        },
        shared:  [String],
        individual: [[String]],
        rightOption: [[Number]],
        explanation: String,
        img: String
    }
})

titleSchema.pre('validate', function(next) {
    if (this.type !== 'choice') return next();
    
    const { optionType, shared, individual } = this.choice;
    
    if (optionType === 'shared') {
      this.choice.individual = undefined;
      if (!shared?.length) {
        return next(new Error('shared is required for optionType=shared'));
      }
    } else {
      this.choice.shared = undefined;
      if (!individual?.length) {
        return next(new Error('individual is required for optionType=individual'));
      }
    }
    
    next();
  });

function getTitleModel(collectionName) {
    return mongoose.model(collectionName, titleSchema, collectionName);
}

module.exports = {
    getTitleModel
}