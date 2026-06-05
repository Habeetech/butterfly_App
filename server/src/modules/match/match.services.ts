import prisma from "@server/config/db"
import AppError from "@server/utils/AppError"
import { discoverProfiles } from "../discover/discover.services";
import { Prisma } from "server/generated/prisma/client";
import { match } from "node:assert";
import { profile } from "node:console";
import { fa } from "@faker-js/faker";

export async function autoMatchmaker(userId: string) {
    const id = parseInt(userId);
    if (!id) {
        throw new AppError("User not found", 404);
    }
    const user = await prisma.user.findUnique({
        where: { id: id },
        include: { filters: true, profile: true }
    })
    if (!user) {
        throw new AppError("User not found", 404);
    }
    const today = new Date();
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(today.getDate() - 7);
    const maxDistanceKM = user?.filters?.maxDistance ?? 50
    const maxDistanceMeters = maxDistanceKM * 1000;

    const dynamicConditions = [];

    if (user.filters?.religion) {
        dynamicConditions.push(Prisma.sql`p."religiousView" = ${user.filters.religion}`);
    }

    if (user.filters?.intent) {
        dynamicConditions.push(Prisma.sql`p.intent = ${user.filters.intent}`);
    }


    if (user.filters?.educationLevel) {
        dynamicConditions.push(Prisma.sql`p."educationLevel" = ${user.filters.educationLevel}`);
    }


    if (user.filters?.maritalStatus) {
        dynamicConditions.push(Prisma.sql`p."maritalStatus" = ${user.filters.maritalStatus}`);
    }

    if (user.filters?.hasChildren) {
        dynamicConditions.push(Prisma.sql`p."hasChildren" = ${user.filters.hasChildren}`);
    }
    if (user.filters?.wantsChildren) {
        dynamicConditions.push(Prisma.sql`p."wantsChildren" = ${user.filters.wantsChildren}`);
    }

    if (user.filters?.drinker) {
        dynamicConditions.push(Prisma.sql`p.drinker = ${user.filters.drinker}`);
    }
    if (user.filters?.smoker) {
        dynamicConditions.push(Prisma.sql`p.smoker = ${user.filters.smoker}`);
    }
    if (user.filters?.willRelocate) {
        dynamicConditions.push(Prisma.sql`p."willRelocate" = ${user.filters.willRelocate}`);
    }

    const dynamicWhereClause = dynamicConditions.length > 0
        ? Prisma.sql`AND ${Prisma.join(dynamicConditions, ' AND ')}`
        : Prisma.empty;

    const potentials = await prisma.$queryRaw`SELECT u.id, u.longitude, u.latitude,
    p.gender, f."genderPreference", p."sexualPreference", f."sexualPreference",
    p."birthDate", p."religiousView", p.interests, p.languages, p.personality,
    p."wantsChildren", p."marriageTimeline", p."willRelocate", p.drinker, p.smoker,
    ST_Distance(
        ST_MakePoint(u.longitude, u.latitude)::geography,
        ST_MakePoint(${user.longitude}, ${user.latitude})::geography
        ) AS distance_meters
    FROM "User" u 
    JOIN "Profile" p ON u.id = p."userId" JOIN "Filters" f ON u.id = f."userId"
    LEFT JOIN "Match" m ON (u.id = m."userOneId" AND  ${id} = m."userTwoId") OR
    (${id} = m."userOneId" AND  u.id = m."userTwoId")
    WHERE u.id != ${id} AND
    ST_DWithin(
        ST_MakePoint(u.longitude, u.latitude)::geography,
        ST_MakePoint(${user.longitude}, ${user.latitude})::geography,
        ${maxDistanceMeters}
    ) AND u."lastActive" >= ${threeDaysAgo} AND u.status = 'ACTIVE' AND
    p.gender = ${user.filters.genderPreference} AND 
    f."genderPreference" = ${user?.profile?.gender} AND
    f."sexualPreference" = ${user?.profile?.sexualPreference} AND
    EXTRACT(YEAR FROM AGE(p."birthDate")) >= ${user?.filters?.minAge} AND
    EXTRACT(YEAR FROM AGE(p."birthDate")) <= ${user?.filters.maxAge} AND 
    m.id IS NULL
    ${dynamicWhereClause}

    ORDER BY RANDOM() ASC
    ;`

    if (!potentials || potentials.length <= 0) {
        console.log("No potentials found");
        return [];
    }

    const betterPotentials = potentials.map(p => {
        let score = 0;
        const religionPoint = (user.profile?.religiousView === "OTHER" && p.religiousView === "OTHER") ? 5 :
            (user.profile?.religiousView === p.religiousView) ? 15 : 0;
        score += religionPoint;

        const interestsPoint = (user?.profile?.interests.filter(interest => p.interests.includes(interest))
            .length || 0) * 2;
        score += interestsPoint > 10 ? 10 : interestsPoint;

        const personalityPoint = (user?.profile?.personality.filter(personality => p.personality.includes(personality))
            .length || 0) * 3;
        score += personalityPoint > 10 ? 10 : personalityPoint;

        const languagePoint = (user?.profile?.languages.filter(lang => p.languages.includes(lang))
            .length || 0);
        score += languagePoint > 1 ? 15 : languagePoint > 0 ? 13 : 0;

        const childrenPoints = (user.profile?.wantsChildren === "NOT_SURE_YET"
            && p.wantsChildren === "NOT_SURE_YET") ? 0 :
            (user.profile?.wantsChildren === p.wantsChildren) ? 15 :
                (user.profile?.wantsChildren === "OPEN_TO_CHILDREN" && p.wantsChildren === "WANT_CHILDREN") ?
                    7 : (user.profile?.wantsChildren === "WANT_CHILDREN" && p.wantsChildren === "OPEN_TO_CHILDREN") ?
                        7 : 0;
        score += childrenPoints;

        const marriageTimelinePoints = user.profile?.marriageTimeline === "NOT_SURE_YET" &&
            p.marriageTimeline === "NOT_SURE_YET" ? 0 :
            (user.profile?.marriageTimeline === p.marriageTimeline) ? 8 :
                (user.profile?.marriageTimeline === "TWOTOSIXMONTHS" && p.marriageTimeline === "UNDERTWOMONTHS") ? 3 :
                    (p.marriageTimeline === "TWOTOSIXMONTHS" && user?.profile?.marriageTimeline === "UNDERTWOMONTHS") ? 3 :
                        (user.profile?.marriageTimeline === "IMMEDIATELY" && p.marriageTimeline === "UNDERTWOMONTHS") ? 3 :
                            (p.marriageTimeline === "IMMEDIATELY" && user?.profile?.marriageTimeline === "UNDERTWOMONTHS") ? 3 : 0;
        score += marriageTimelinePoints;

        const relocationPoints = (user.profile?.willRelocate === "YES" && p.willRelocate === "YES") ? 7 :
            p.distance_meters <= 15000 ? 7 : 0;
        score += relocationPoints;

        const drinkingPoints = user?.profile?.drinker === p.drinker ? 10 :
            (user.profile?.drinker === "SOCIAL" && p.drinker === "REGULAR") ? 5 :
                (p.drinker === "SOCIAL" && user?.profile?.drinker === "REGULAR") ? 5 : 0;
        score += drinkingPoints;

        const smokingPoints = user.profile?.smoker === p.smoker ? 10 :
            (user.profile?.smoker === "SOCIAL" && p.smoker === "REGULAR") ? 5 :
                (p.smoker === "SOCIAL" && user?.profile?.smoker === "REGULAR") ? 5 : 0;
        score += smokingPoints;

        return { ...p, score }
    })

    const bestPotentials = betterPotentials
        .filter(p => p.score >= 60)
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);

    if (bestPotentials.length === 0) {
        console.log("No best potentials found");
        return [];
    }

    const matchPairs = bestPotentials.map(p => ({
        userOneId: Math.min(id, p.id),
        userTwoId: Math.max(id, p.id)
    }));

    const existingMatches = await prisma.match.findMany({
        where: {
            OR: matchPairs
        }
    });

    for (const potential of bestPotentials) {
        const userOneId = Math.min(id, potential.id)
        const userTwoId = Math.max(id, potential.id)

        const historicalMatch = existingMatches.find(
            m => m.userOneId === userOneId && m.userTwoId === userTwoId
        );

        if (historicalMatch && historicalMatch.status !== "PENDING") {
            continue;
        }

        const match = await prisma.match.upsert({
            where: {
                userOneId_userTwoId: {
                    userOneId: userOneId,
                    userTwoId: userTwoId
                }
            },
            update: {
                score: potential.score
            },
            create: {
                userOneId,
                userTwoId,
                type: "AUTOMATED",
                status: "PENDING",
                score: potential.score
            }
        })
    }
    return bestPotentials;
}

export async function getPotentials(userId: string, skip = 0) {
    const id = parseInt(userId);
    if (!id) {
        throw new AppError("Invalid or missing User ID", 404)
    }
    const potentials = await prisma.match.findMany({
        where: {
            status: "PENDING",
            OR: [{ userOneId: id },
            { userTwoId: id }
            ]
        },
        include: {
            userOne: {
                include: { profile: true }
            },
            userTwo: {
                include: { profile: true }
            }
        },
        orderBy: {
            score: "desc"
        },
        take: 30,
        skip: skip
    })
    return potentials.map(match => {
        const candidate = match.userOneId === id ? match.userTwo : match.userOne;

        return {
            matchId: match.id,
            score: match.score,
            status: match.status,
            type: match.type,
            expiresAt: match.expiresAt,
            profile: candidate?.profile || null
        }
    });
}
export async function getAllUsersPotentials() {

    return await prisma.match.findMany({
        where: {
            status: "PENDING"
        },
        orderBy: {
            createdAt: "desc"
        }
    })

}
export async function userAction(userId: string, match: any) {
    const id = parseInt(userId)
    if (!id) {
        throw new AppError("Invalid or missing User ID", 404)
    }

    const matchToUpdate = await prisma.match.findUnique({
        where: { id: match.id }
    })

    if (!matchToUpdate) {
        throw new AppError("The match does not exist", 404);
    }

    const isUserOne = matchToUpdate.userOneId === id;
    const isUserTwo = matchToUpdate.userTwoId === id;

    if (!isUserOne && !isUserTwo) {
        throw new AppError("User is not a participant in this match", 403);
    }

    let updatedMatch;
    let isMatch = false;

    const today = new Date();
    const threeDays = new Date();
    threeDays.setDate(today.getDate() + 3);


    const expiry = matchToUpdate.expiresAt ? matchToUpdate.expiresAt : threeDays;

  
    const currentOneAction = isUserOne ? match.action : matchToUpdate.userOneAction;
    const currentTwoAction = isUserTwo ? match.action : matchToUpdate.userTwoAction;

  
    if (match.action === "DECLINED") {
        updatedMatch = await prisma.match.update({
            where: { id: matchToUpdate.id },
            data: {
                status: "REJECTED",
                userOneAction: currentOneAction,
                userTwoAction: currentTwoAction,
                expiresAt: null
            }
        });
    }
    else if (match.action === "APPROVED" && (isUserOne ? matchToUpdate.userTwoAction === "APPROVED" : matchToUpdate.userOneAction === "APPROVED")) {
        updatedMatch = await prisma.match.update({
            where: { id: matchToUpdate.id },
            data: {
                status: "ACCEPTED",
                userOneAction: currentOneAction,
                userTwoAction: currentTwoAction,
                expiresAt: threeDays
            }
        });
        isMatch = true;
    }
    else {
        updatedMatch = await prisma.match.update({
            where: { id: matchToUpdate.id },
            data: {
                userOneAction: currentOneAction,
                userTwoAction: currentTwoAction,
                expiresAt: expiry
            }
        });
    }

    return { ...updatedMatch, isMatch };
}