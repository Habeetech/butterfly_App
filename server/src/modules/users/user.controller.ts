import * as userServices from "./user.services.ts"

export async function getUsers(req: any, res: any) {
    const users = await userServices.getUsers();
    res.status(200).json(users);
}