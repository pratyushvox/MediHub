import Doctor from "../models/Doctor/Doctorsignupmodel.js";
import User from "../models/Usermodel/userModel.js";

export const getDashboardStats = async (req, res) => {
    try {
        const totalDoctors = await Doctor.countDocuments();
        const totalPatients = await User.countDocuments();

        res.status(200).json({
            success: true,
            data: {
                totalDoctors,
                totalPatients
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};
