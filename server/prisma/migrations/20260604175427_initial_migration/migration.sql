-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED');

-- CreateEnum
CREATE TYPE "MatchingMode" AS ENUM ('AUTO', 'MANUAL', 'BOTH');

-- CreateEnum
CREATE TYPE "MatchType" AS ENUM ('AUTOMATED', 'MANUAL');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "Intent" AS ENUM ('MARRIAGE', 'FRIENDSHIP', 'LONGTERMRELATIONSHIP', 'SHORTTERMRELATIONSHIP', 'CASUAL', 'NOTSURE');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'TRANSMAN', 'TRANSWOMAN', 'NONBINARY', 'OTHER');

-- CreateEnum
CREATE TYPE "Sexuality" AS ENUM ('HETEROSEXUAL', 'HOMOSEXUAL', 'BISEXUAL', 'PANSEXUAL', 'ASEXUAL');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'DIVORCED', 'SEPARATED', 'WIDOWED', 'ANNULLED', 'NEVERMARRIED');

-- CreateEnum
CREATE TYPE "Religion" AS ENUM ('ISLAM', 'CHRISTIANITY', 'HINDUISM', 'BUDDHISM', 'JUDAISM', 'AGNOSTIC', 'ATHEIST', 'OTHER');

-- CreateEnum
CREATE TYPE "Children" AS ENUM ('NONE', 'HAS_ONE', 'HAS_TWO', 'MORE_THAN_TWO');

-- CreateEnum
CREATE TYPE "ChildPreference" AS ENUM ('WANT_CHILDREN', 'DO_NOT_WANT_CHILDREN', 'OPEN_TO_CHILDREN', 'NOT_SURE_YET');

-- CreateEnum
CREATE TYPE "TwoOptions" AS ENUM ('YES', 'NO');

-- CreateEnum
CREATE TYPE "Timeline" AS ENUM ('IMMEDIATELY', 'UNDERTWOMONTHS', 'TWOTOSIXMONTHS', 'OVERAYEAR', 'AGREETOGETHER', 'NOT_SURE_YET');

-- CreateEnum
CREATE TYPE "Education" AS ENUM ('BASIC', 'SECONDARY', 'UNDERGRADUATE', 'GRADUATE', 'MASTERS', 'DOCTORAL', 'OTHER');

-- CreateEnum
CREATE TYPE "MatchAction" AS ENUM ('NONE', 'APPROVED', 'DECLINED');

-- CreateEnum
CREATE TYPE "DrinkingHabit" AS ENUM ('NEVER', 'SOCIAL', 'REGULAR', 'HEAVY');

-- CreateEnum
CREATE TYPE "SmokingHabit" AS ENUM ('NEVER', 'SOCIAL', 'REGULAR', 'TRYING_TO_QUIT');

-- CreateEnum
CREATE TYPE "Diet" AS ENUM ('OMNIVORE', 'VEGETARIAN', 'VEGAN', 'HALAL', 'KOSHER', 'OTHER');

-- CreateEnum
CREATE TYPE "LoveLanguage" AS ENUM ('WORDS_OF_AFFIRMATION', 'QUALITY_TIME', 'RECEIVING_GIFTS', 'ACTS_OF_SERVICE', 'PHYSICAL_TOUCH');

-- CreateEnum
CREATE TYPE "CommunicationStyle" AS ENUM ('TEXTER', 'CALLER', 'VIDEO_CHATTER', 'IN_PERSON');

-- CreateEnum
CREATE TYPE "PoliticalView" AS ENUM ('LIBERAL', 'CONSERVATIVE', 'MODERATE', 'APOLITICAL', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastActive" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "gender" "Gender" NOT NULL,
    "sexualPreference" "Sexuality" NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "occupation" TEXT,
    "industry" TEXT,
    "company" TEXT,
    "educationLevel" "Education",
    "school" TEXT,
    "intent" "Intent" NOT NULL,
    "tagline" TEXT,
    "introVideo" TEXT,
    "introVoice" TEXT,
    "grewUpIn" TEXT,
    "heightinCM" INTEGER,
    "maritalStatus" "MaritalStatus" NOT NULL,
    "religiousView" "Religion" NOT NULL,
    "hasChildren" "Children" NOT NULL DEFAULT 'NONE',
    "wantsChildren" "ChildPreference" NOT NULL DEFAULT 'NOT_SURE_YET',
    "willRelocate" "TwoOptions" NOT NULL DEFAULT 'NO',
    "marriageTimeline" "Timeline" NOT NULL DEFAULT 'NOT_SURE_YET',
    "chattingTimeline" "Timeline" NOT NULL DEFAULT 'NOT_SURE_YET',
    "familyInvolvement" "Timeline" NOT NULL DEFAULT 'NOT_SURE_YET',
    "drinker" "DrinkingHabit" NOT NULL DEFAULT 'NEVER',
    "smoker" "SmokingHabit" NOT NULL DEFAULT 'NEVER',
    "dietaryPreference" "Diet" NOT NULL DEFAULT 'OMNIVORE',
    "primaryLoveLanguage" "LoveLanguage",
    "communicationStyle" "CommunicationStyle" DEFAULT 'IN_PERSON',
    "politicalView" "PoliticalView" DEFAULT 'APOLITICAL',
    "timelineNote" TEXT,
    "bio" TEXT,
    "interests" TEXT[],
    "personality" TEXT[],
    "iceBreakers" TEXT[],
    "languages" TEXT[],
    "ethnicity" TEXT[],
    "nationality" TEXT NOT NULL,
    "countryOfOrigin" TEXT,
    "idealMatchDescription" TEXT,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Filters" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "maxDistance" INTEGER NOT NULL DEFAULT 50,
    "minAge" INTEGER NOT NULL DEFAULT 18,
    "maxAge" INTEGER NOT NULL DEFAULT 40,
    "genderPreference" "Gender" NOT NULL,
    "sexualPreference" "Sexuality" NOT NULL,
    "religion" "Religion",
    "intent" "Intent",
    "educationLevel" "Education",
    "maritalStatus" "MaritalStatus",
    "hasChildren" "Children",
    "wantsChildren" "ChildPreference",
    "drinker" "DrinkingHabit",
    "smoker" "SmokingHabit",
    "willRelocate" "TwoOptions",
    "languages" TEXT[],
    "ethnicities" TEXT[],
    "nationalities" TEXT[],
    "matchingPreference" "MatchingMode" NOT NULL DEFAULT 'BOTH',

    CONSTRAINT "Filters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "enableNotification" BOOLEAN NOT NULL DEFAULT false,
    "previewMessage" BOOLEAN NOT NULL DEFAULT false,
    "language" TEXT DEFAULT 'en',
    "visibility" BOOLEAN NOT NULL DEFAULT true,
    "blockList" INTEGER[],

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" SERIAL NOT NULL,
    "userOneId" INTEGER NOT NULL,
    "userTwoId" INTEGER NOT NULL,
    "type" "MatchType" NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'PENDING',
    "score" INTEGER NOT NULL DEFAULT 0,
    "matchmakerNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userOneAction" "MatchAction" DEFAULT 'NONE',
    "userTwoAction" "MatchAction" DEFAULT 'NONE',

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Filters_userId_key" ON "Filters"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_userId_key" ON "Settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Match_userOneId_userTwoId_key" ON "Match"("userOneId", "userTwoId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Filters" ADD CONSTRAINT "Filters_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settings" ADD CONSTRAINT "Settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_userOneId_fkey" FOREIGN KEY ("userOneId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_userTwoId_fkey" FOREIGN KEY ("userTwoId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
