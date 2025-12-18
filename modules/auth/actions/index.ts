'use server'

import prisma from "@/lib/db" 
import { currentUser } from "@clerk/nextjs/server"

export async function onBoardUser() {
  try {
    const user = await currentUser();
    if(!user) {
      return { success: false, error: "Unauthenticated!" }
    }

    const { id, firstName, lastName, imageUrl, emailAddresses } = user;

    const newUser = await prisma.user.upsert({
      where: {
        clerkId: id
      },
      update: {
        firstName: firstName || null,
        lastName: lastName || null,
        imageUrl: imageUrl || null,
        email: emailAddresses[0].emailAddress || ""
      },
      create: {
        clerkId: id,
        firstName: firstName || null,
        lastName: lastName || null,
        imageUrl: imageUrl || null,
        email: emailAddresses[0].emailAddress || ""
      }
    })
    
    return {
      success: true,
      data: newUser,
      message: "User created or updated!"
    }
  } catch (error) {
    console.log("Error while onboarding user: ", error)
    return {
      success: false,
      error: "Failed to onboard user!"
    }
  }
}
