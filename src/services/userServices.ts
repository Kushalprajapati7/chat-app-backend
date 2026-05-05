import User from "../models/userModel";
import { IUser } from "../models/userModel";
import bcrypt from 'bcrypt'
import { JwtUtills } from "../utils/jwtUtiils"
import crypto from 'crypto';
import { sendVerificationEmail } from './emailService';

class UserServices {
    public async createUser(newUser: IUser): Promise<IUser> {
        const existingUser = await User.findOne({ email: newUser.email });
        if (existingUser) {
            throw new Error(`User already exists`);
        }
        const hashPassword = await bcrypt.hash(newUser.password, 10);
        newUser.password = hashPassword;
        newUser.verificationToken = crypto.randomBytes(32).toString('hex');
        newUser.isVerified = false;
        const user = new User(newUser);
        const savedUser = await user.save();

        try {
            await sendVerificationEmail(savedUser.email, savedUser.verificationToken!);
        } catch (e) {
            console.error("Verification email failed", e);
        }

        return savedUser;
    }

    public async loginUser(email: string, password: string): Promise<{ token: string, user: IUser }> {
        let user;
        user = await User.findOne({ email: email })

        if (!user) throw new Error(`User with Email ${email} not found`);
        const pass = await bcrypt.compare(password, user.password);
        if (!pass) throw new Error(`Invalid Credentials`);
        if (!user.isVerified) throw new Error(`Please verify your email to log in.`);
        const token = JwtUtills.generateToken(user.id);
        return { token, user };
    }

    public async allUser(): Promise<IUser[]> {
        const user = User.aggregate(
            [
                {
                    $project: {
                        username: 1,
                        email: 1,
                        role: 1
                    }
                }
            ]
        )
        return user;
    }

    public async deleteUser(userId: string): Promise<void> {
        if (!userId) throw new Error('User Id is required');
        await User.findByIdAndDelete(userId);
    }

    public async getUserByUserName(username: string): Promise<IUser | null> {
        const user = await User.findOne({ username: username });
        return user;
    }

    public async getUserById(userId: string): Promise<IUser | null> {
        if (!userId) throw new Error('User Id is required');
        return await User.findById(userId);
    }

    public async getAllUsersExceptCurrentUser(userId: string): Promise<IUser[]> {
        return await User.find({ _id: { $ne: userId } });
    }

    public async verifyEmail(token: string): Promise<void> {
        if (!token) throw new Error('Verification token is required.');
        const user = await User.findOne({ verificationToken: token });
        if (!user) throw new Error('Invalid or expired verification token.');

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();
    }

    public async updateProfile(userId: string, updateData: { bio?: string, status?: string, avatar?: string }): Promise<IUser | null> {
        if (!userId) throw new Error('User Id is required');
        return await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true });
    }

}

export default new UserServices();