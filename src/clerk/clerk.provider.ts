import {createClerkClient} from "@clerk/clerk-sdk-node"

export const clerkAsyncProvider = "clerkProvider"

export const clerkProvider = [{
    provide: clerkAsyncProvider,
    useFactory: async () => {
        console.log("hello " + process.env.CLERK_SECRET_KEY);

        return createClerkClient({secretKey: process.env.CLERK_SECRET_KEY})
    },
    exports: [clerkAsyncProvider]
}]