import { Request, Response } from "express";
import * as Yup from "yup";

import UserModel from "../models/user.model";
import { encrypt } from "../utils/encryption";
import { generateToken } from "../utils/jwt";
import { IReqUser } from "../middlewares/auth.middlewares";

type TRegister = {
    fullName: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
};

type TLogin = {
    identifier: string;
    password: string;
}

const registerValidateschema = Yup.object({
    fullName: Yup.string().required(),
    username: Yup.string().required(),
    email: Yup.string().email().required(),
    password: Yup.string().required(),
    confirmPassword: Yup.string().required().oneOf([Yup.ref("password"), ""], "Password not matched"),
})

export default {
    async register(req: Request, res: Response) {
        const { fullName, username, email, password, confirmPassword } = req.body as unknown as TRegister;
        try {
            await registerValidateschema.validate({
                fullName, 
                username, 
                email, 
                password, 
                confirmPassword,
            });

            const result = await UserModel.create({
                fullName,
                email,
                username,
                password,
            });

            res.status(200).json({
                message: "Success registration!",
                data: result,
            });
        } catch (error) {
            const err = error as unknown as Error;
            res.status(400).json({
                message: err.message,
                data: null,
            });
        }
    },

    async login(req: Request, res: Response) {
        try {
            // identifier (email or usn)
            const { identifier, password } = req.body as unknown as TLogin;
            const userByIdentifier = await UserModel.findOne({
                $or: [
                    {
                        email: identifier,
                    },
                    {
                        username: identifier,
                    },
                ],
            });

            if (!userByIdentifier) {
                return res.status(403).json({
                    message: "user not found/Pass is Incorrect",
                    data: null,
                });
            }

            // validate pass
            const validatePassword: boolean = encrypt(password) === userByIdentifier.password;
            if (!validatePassword) {
                return res.status(403).json({
                    message: "User not found/Pass is Incorrect",
                    data: null,
                });
            }

            const token = generateToken({
                id: userByIdentifier._id,
                role: userByIdentifier.role,
            });

            res.status(200).json({
                message: "Login Success",
                data: token,
            });
        } catch (error) {
            const err = error as unknown as Error;
            res.status(400).json({
                message: err.message,
                data: null,
            });
        }
    },

    async me(req: IReqUser, res: Response) {
        try {
            const user = req.user;
            const result = await UserModel.findById(user?.id);

            res.status(200).json({
                message: "Success Get User Profile",
                data: result,
            })

        } catch (error) {
            const err = error as unknown as Error;
            res.status(400).json({
                message: err.message,
                data: null,
            });
        }
    },
};