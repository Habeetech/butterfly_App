import "dotenv/config";
import prisma from "../src/config/db.js";
import { faker } from "@faker-js/faker";
import { discoverProfiles } from "../src/modules/discover/discover.services.js";

const interestsPool = [
    "Cooking", "Baking", "Pastry Arts", "Tech", "Board Games", 
    "Photography", "Travel", "Running", "Fitness", "Reading", 
    "Hiking", "Gardening", "Volunteering", "Podcasts", "Public Speaking"
];

const personalityPool = [
    "Introvert", "Extrovert", "Ambivert", "Analytical", "Creative", 
    "Empathetic", "Detail-oriented", "Spontaneous", "Structured", "Ambitious"
];

const languagesPool = ["English", "Yoruba", "Hausa", "Igbo", "Arabic", "French", "Spanish"];
const ethnicityPool = ["Yoruba", "Hausa", "Igbo", "Edo", "Fulani", "Other"];
const keywordsPool = ["Kind", "Ambitious", "Family-oriented", "Tech-savvy", "Foodie", "Punctual", "Deen-focused"];
const iceBreakersPool = [
    "What's your absolute dream travel destination?",
    "Are you a morning person or a night owl?",
    "What's a book or podcast that completely changed your perspective?",
    "What does your ideal weekend look like?"
];

function createUser() {
    return {
        email: faker.internet.email(),
        passwordHash: faker.internet.password(),
        longitude: faker.number.float({ min: -0.3, max: 0.1 }),
        latitude: faker.number.float({ min: 51.3, max: 51.7 })
    };
}

const mockUsers = faker.helpers.multiple(createUser, { count: 20 });

export async function seedData() {
    console.log("Cleaning up existing database records...");

    // Clear tables in sequential dependency order to prevent foreign key deadlocks
    await prisma.match?.deleteMany();
    await prisma.filters?.deleteMany();
    await prisma.settings?.deleteMany();
    await prisma.profile?.deleteMany();
    await prisma.user?.deleteMany();

    console.log("Seeding main test account (Habeeb)...");
    
    const currentUser = await prisma.user.create({
        data: {
            email: "testuser@gmail.com",
            passwordHash: "testpass",
            longitude: -0.1278,
            latitude: 51.5074,
            status: "ACTIVE",
            isVerified: true,
            profile: {
                create: {
                    firstName: "Habeeb",
                    lastName: "Oluwanisola",
                    gender: "MALE",
                    sexualPreference: "HETEROSEXUAL",
                    birthDate: new Date("1996-08-01"),
                    occupation: "Software Engineer",
                    industry: "Technology",
                    company: "Habeetech",
                    educationLevel: "UNDERGRADUATE",
                    school: "University of London",
                    intent: "MARRIAGE",
                    tagline: "Building things that matter.",
                    bio: "Main testing profile focused on long term horizons.",
                    grewUpIn: "Lagos",
                    heightinCM: 182,
                    maritalStatus: "SINGLE",
                    religiousView: "ISLAM",
                    hasChildren: "NONE",
                    wantsChildren: "WANT_CHILDREN",
                    willRelocate: "YES",
                    marriageTimeline: "TWOTOSIXMONTHS",
                    chattingTimeline: "UNDERTWOMONTHS",
                    familyInvolvement: "IMMEDIATELY",
                    drinker: "NEVER",
                    smoker: "NEVER",
                    dietaryPreference: "HALAL",
                    primaryLoveLanguage: "QUALITY_TIME",
                    communicationStyle: "IN_PERSON",
                    politicalView: "APOLITICAL",
                    nationality: "Nigerian",
                    countryOfOrigin: "Nigeria",
                    idealMatchDescription: "Someone family oriented and highly driven.",
                    interests: ["Tech", "Board Games", "Cooking"],
                    personality: ["Analytical", "Creative", "Ambitious"],
                    languages: ["English", "Yoruba"],
                    ethnicity: ["Yoruba"],
                    idealMatchKeywords: ["Kind", "Family-oriented", "Ambitious"],
                    iceBreakers: ["What's your favorite project you've worked on?"]
                }
            },
            filters: {
                create: {
                    maxDistance: 25,
                    minAge: 20,
                    maxAge: 35,
                    genderPreference: "FEMALE",
                    sexualPreference: "HETEROSEXUAL",
                    religion: "ISLAM",
                    intent: "MARRIAGE",
                    matchingPreference: "BOTH",
                    interests: ["Cooking", "Travel"],
                    personality: ["Empathetic"]
                }
            },
            settings: {
                create: {
                    enableNotification: true,
                    previewMessage: true,
                    language: "en",
                    visibility: true
                }
            }
        }
    });

    console.log(`Seeding ${mockUsers.length} diverse mock user profiles...`);

    for (const mockUser of mockUsers) {
        const randomGender = faker.helpers.arrayElement(["MALE", "FEMALE", "NONBINARY"]);
        const targetGenderPref = randomGender === "MALE" ? "FEMALE" : "MALE";

        await prisma.user.create({
            data: {
                ...mockUser,
                status: "ACTIVE",
                isVerified: faker.datatype.boolean(0.8),
                profile: {
                    create: {
                        firstName: faker.person.firstName(),
                        lastName: faker.person.lastName(),
                        gender: randomGender,
                        sexualPreference: faker.helpers.arrayElement(["HETEROSEXUAL", "BISEXUAL"]),
                        birthDate: faker.date.birthdate({ min: 18, max: 40, mode: 'age' }), 
                        occupation: faker.person.jobTitle(),
                        industry: faker.person.jobArea(),
                        company: faker.company.name(),
                        educationLevel: faker.helpers.arrayElement(["UNDERGRADUATE", "GRADUATE", "MASTERS", "DOCTORAL"]),
                        school: faker.company.name() + " University",
                        intent: faker.helpers.arrayElement(["MARRIAGE", "LONGTERMRELATIONSHIP", "FRIENDSHIP"]),
                        tagline: faker.company.catchPhrase(),
                        bio: faker.lorem.sentences(2),
                        grewUpIn: faker.location.city(),
                        heightinCM: faker.number.int({ min: 155, max: 198 }),
                        maritalStatus: faker.helpers.arrayElement(["SINGLE", "DIVORCED"]),
                        religiousView: faker.helpers.arrayElement(["ISLAM", "CHRISTIANITY", "OTHER"]),
                        hasChildren: faker.helpers.arrayElement(["NONE", "HAS_ONE"]),
                        wantsChildren: faker.helpers.arrayElement(["WANT_CHILDREN", "OPEN_TO_CHILDREN", "NOT_SURE_YET"]),
                        willRelocate: faker.helpers.arrayElement(["YES", "NO"]),
                        marriageTimeline: faker.helpers.arrayElement(["TWOTOSIXMONTHS", "OVERAYEAR", "AGREETOGETHER"]),
                        chattingTimeline: faker.helpers.arrayElement(["UNDERTWOMONTHS", "TWOTOSIXMONTHS"]),
                        familyInvolvement: faker.helpers.arrayElement(["IMMEDIATELY", "TWOTOSIXMONTHS", "AGREETOGETHER"]),
                        drinker: faker.helpers.arrayElement(["NEVER", "SOCIAL"]),
                        smoker: faker.helpers.arrayElement(["NEVER", "SOCIAL"]),
                        dietaryPreference: faker.helpers.arrayElement(["OMNIVORE", "HALAL", "VEGETARIAN"]),
                        primaryLoveLanguage: faker.helpers.arrayElement(["WORDS_OF_AFFIRMATION", "QUALITY_TIME", "ACTS_OF_SERVICE"]),
                        communicationStyle: faker.helpers.arrayElement(["TEXTER", "CALLER", "IN_PERSON"]),
                        politicalView: faker.helpers.arrayElement(["MODERATE", "APOLITICAL"]),
                        nationality: faker.location.country(),
                        countryOfOrigin: faker.location.country(),
                        idealMatchDescription: faker.lorem.sentence(),
                        
                        interests: faker.helpers.arrayElements(interestsPool, { min: 2, max: 5 }),
                        personality: faker.helpers.arrayElements(personalityPool, { min: 2, max: 4 }),
                        languages: faker.helpers.arrayElements(languagesPool, { min: 1, max: 3 }),
                        ethnicity: faker.helpers.arrayElements(ethnicityPool, { min: 1, max: 1 }),
                        idealMatchKeywords: faker.helpers.arrayElements(keywordsPool, { min: 2, max: 4 }),
                        iceBreakers: faker.helpers.arrayElements(iceBreakersPool, { min: 1, max: 2 })
                    }
                },
                filters: {
                    create: {
                        maxDistance: faker.number.int({ min: 15, max: 60 }),
                        minAge: 18,
                        maxAge: faker.number.int({ min: 35, max: 45 }),
                        genderPreference: targetGenderPref,
                        matchingPreference: faker.helpers.arrayElement(["AUTO", "MANUAL", "BOTH"]),
                        interests: faker.helpers.arrayElements(interestsPool, { min: 1, max: 2 }),
                        personality: faker.helpers.arrayElements(personalityPool, { min: 1, max: 2 }),
                        languages: [faker.helpers.arrayElement(languagesPool)]
                    }
                },
                settings: {
                    create: {
                        enableNotification: faker.datatype.boolean(),
                        previewMessage: faker.datatype.boolean(),
                        language: "en",
                        visibility: true
                    }
                }
            }
        });
    }

    console.log(`Database seeded successfully with a test user and ${mockUsers.length} robust profiles!`);
    console.log("\n--- RUNNING INITIAL GEOSPATIAL DISCOVERY TEST ---");

    try {
        const matches = await discoverProfiles(currentUser.id.toString());
        console.log(`Found ${matches.length} matching profiles nearby:\n`);

        matches.forEach((match, index) => {
            const distanceKm = (match.distance_meters / 1000).toFixed(2);
            console.log(`${index + 1}. User ID: ${match.id} | Distance: ${distanceKm} km | Coords: (${match.longitude}, ${match.latitude})`);
        });
    } catch (error) {
        console.error("Discovery query verification failed:", error);
    }
    console.log("------------------------------------------");
}

seedData();