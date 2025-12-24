import { currentUserRole, getCurrentUser } from '@/modules/auth/actions'
import { currentUser } from '@clerk/nextjs/server'
import React from 'react'
import { UserRole } from '../generated/prisma/enums';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';

async function page() {
  const user = await currentUser()
  const role = await currentUserRole();

  if(role !== UserRole.ADMIN) {
    return redirect("/")
  }

  return (
    <section className='flex flex-col justify-center items-center container m-4'>
      <div className='flex flex-row justify-between items-center w-full'>
        <Link href={"/problems"}>
          <Button variant={"outline"} size={"icon"}>
            <ArrowLeft className='size-4' />
          </Button>
        </Link>
      <h1 className='text-3xl font-bold text-amber-400'>Welcome {user?.firstName}</h1>
      <ModeToggle />
      </div>

      {/* <CreateProblemForm /> */}
    </section>
  )
}

export default page