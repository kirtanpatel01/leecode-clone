'use server'

import prisma from "@/lib/db" 
import { currentUser } from "@clerk/nextjs/server"
import { toast } from "sonner";

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

export async function currentUserRole() {
  const user = await currentUser();
  
  if (!user) return null
  
  const userRole = await prisma.user.findUnique({
    where: { clerkId: user?.id },
    select: { role: true },
  });

  return userRole?.role ?? null
}
