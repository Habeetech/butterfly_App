import prisma from "../../config/db.js"
export async function getUsers() {
    return await prisma.user.findMany({
        include: {profile: true, filters: true, settings: true}
    })
}