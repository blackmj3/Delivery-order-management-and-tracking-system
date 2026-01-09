require("dotenv").config();
const User = require("../models/User");
const connectDB = require("../utils/connectDB");
const passwordService = require("../utils/passwordService");

const createAdminUser = async () => {
    try {
        await connectDB();

        const adminData = {
            email: process.env.SUPERADMIN_EMAIL,
            password: process.env.SUPERADMIN_PASS,
            name: process.env.SUPERADMIN_NAME,
            role: "ADMIN",
            phone: "0000000000",
            isEmailVerified: true
        };

        const existedAdmin = await User.findOne({ role: "ADMIN" });

        if (existedAdmin) {
            console.error("Admin already exists");
            process.exit(1);
        }

        await User.create({
            ...adminData,
            password: await passwordService.hashPassword(adminData.password)
        });

        console.log("Admin user created successfully");
        process.exit(0);
    } catch (error) {
        console.error("Error creating admin user:", error.message);
        process.exit(1);
    }
};

createAdminUser();
