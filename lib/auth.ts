
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { env } from "./env";
import { emailOTP } from "better-auth/plugins"
import { sendVerificationEmail } from "./mailer";
import { admin } from "better-auth/plugins";

// If your Prisma file is located elsewhere, you can change the path

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "sqlite", ...etc
    }),
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60, // 5 minutes cache
        },
    },
    account: {
        accountLinking: {
            enabled: true,
            trustedProviders: ["google", "github", "discord"],
        },
    },
    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    // Only allow user creation if an admin pre-created the user record
                    const existingUser = await prisma.user.findUnique({
                        where: { email: user.email.toLowerCase() },
                    });
                    if (!existingUser) {
                        // Returning false blocks the creation of new unapproved user accounts
                        return false;
                    }
                },
            },
        },
    },
    socialProviders: {
        github: {
            clientId: env.AUTH_GITHUB_CLIENT_ID,
            clientSecret: env.AUTH_GITHUB_CLIENT_SECRET,
        },
        google: {
            clientId: env.AUTH_GOOGLE_CLIENT_ID,
            clientSecret: env.AUTH_GOOGLE_CLIENT_SECRET,
        },
        discord: {
            clientId: env.AUTH_DISCORD_CLIENT_ID,
            clientSecret: env.AUTH_DISCORD_CLIENT_SECRET,
            permissions: 2048 | 16384, // Send Messages + Embed Links
        }
    },

    plugins: [
        emailOTP({
            async sendVerificationOTP({ email, otp }) {
                // Ensure email is pre-registered by an admin
                const existingUser = await prisma.user.findUnique({
                    where: { email: email.trim().toLowerCase() },
                });

                if (!existingUser) {
                    throw new Error("Unauthorized Access: Your email is not registered as a member.");
                }

                // Send verification email using nodemailer with beautiful template
                await sendVerificationEmail({
                    to: email,
                    otp: otp,
                });
            },
        }),
        admin(),
    ],
});