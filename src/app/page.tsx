'use client'
import { useSession } from "next-auth/react";
import { signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  console.log(session);

  if (session) {
    return (
      <div className='p-6'>
        <p className='text-white font-normal text-xl mt-5 mb-2'>Signed In as</p>
        <span className='bold-txt'>{session?.user?.name}</span>
        <p className='opacity-70 mt-8 mb-5 underline cursor-pointer' onClick={() => signOut()}>Sign Out</p>
      </div>
    )
  } else {
    return (
        <button onClick={() => signIn("spotify")} className='shadow-primary w-56 h-16 rounded-xl bg-white border-0 text-black text-3xl active:scale-[0.99] m-6'>Sign In</button>
    )
  }
}





// import InputBar from "../components/ui/inputBar";

// export default function Home() {
//   return (
//     <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
//       <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
//         <h1 className="text-4xl font-bold leading-[1.1] tracking-tighter sm:text-5xl">
//           Guessify
//         </h1>
//         <div className="w-[680px]">
//           <InputBar />
//         </div>
//       </main>
//       <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center"></footer>
//     </div>
//   );
// }

// {
//   /* <div className="flex gap-4 items-center flex-col sm:flex-row"></div> */
// }
