const mongoose = require('mongoose');

const houseDetailSchema = new mongoose.Schema({
    username: { type: String, required: true },
    mobile: { type: String, required: true },
    address: { type: String, required: true },
    category: { type: String, required: true },
    locality: { type: String },
    rent: { type: Number, required: true },
    facing: { type: String },
    about: { type: String },
    bhk: { type: Number },
    filename: { type: String },
    contentType: { type: String },
    data: { type: Buffer }
});

const HouseDetail = mongoose.model('HouseDetail', houseDetailSchema);

module.exports = HouseDetail;
