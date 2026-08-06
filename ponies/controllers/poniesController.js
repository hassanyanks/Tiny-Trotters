import Pony from "../models/pony.js";

export const ponies = async(req, res, next) => {
    const ponies = await Pony.find({}).exec();
    res.render("ponies", {
        ponies: ponies,
    });
};

