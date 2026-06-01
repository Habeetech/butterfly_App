import { ne } from "@faker-js/faker";
import prisma from "../../config/db.js";
import AppError from "../../utils/AppError.js";

interface DiscoveredUser {
    id: number;
    longitude: number;
    latitude: number;
    distance_meters: number;
}

export async function discoverProfiles(userId: string,
    page: number = 1,
    limit: number = 10,
    randomSeed: number = 0.5
) {
    const id = parseInt(userId);
    const offset = (page - 1) * limit;
    const currentUser = await prisma.user.findUnique({
        where: { id: id },
        include: { filters: true }
    })
    if (!currentUser) {
        throw new AppError(`User Id ${userId} not found`, 404);
    }
    if (!currentUser?.longitude || !currentUser?.latitude) {
        throw new AppError("You need to set your location first", 400);
    }

    const maxDistanceKm = currentUser.filters?.maxDistance ?? 50;
    const maxDistanceMeters = maxDistanceKm * 1000;

    const [_, nearbyMatches] = await prisma.$transaction([
        prisma.$executeRawUnsafe(`SELECT setseed(${randomSeed});`),

        prisma.$queryRaw<DiscoveredUser[]>`
    SELECT u.id, u.longitude, u.latitude,
    ST_Distance(
    ST_MakePoint(u.longitude, u.latitude)::geography,
    ST_MakePoint(${currentUser.longitude}, ${currentUser.latitude})::geography)
    AS distance_meters
    FROM "User" u
    WHERE u.id != ${id} AND
    ST_DWithin(
    ST_MakePoint(u.longitude, u.latitude)::geography,
    ST_MakePoint(${currentUser.longitude}, ${currentUser.latitude})::geography,
    ${maxDistanceMeters})
    ORDER BY RANDOM()
    LIMIT ${limit} OFFSET ${offset};
    `
    ])


    return nearbyMatches;
}