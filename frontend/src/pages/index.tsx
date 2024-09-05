import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import useAsyncFunction from "@/hooks/useAsyncFunction";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { BiLoaderAlt as LoadingSpinner } from "react-icons/bi";
import Link from "next/link";

export default function Home() {
  const router = useRouter()

  const [code, setCode] = useState('')
  const { execute: createRoom, loading, error, result: roomId } = useAsyncFunction(async () => {
    const response = await fetch('/api/room/create', {
      method: 'POST',
    })
    const { roomId } = await response.json()
    return roomId
  })


  const joinRoom = () => {
    let temp = code
    if (temp.includes('/')) {
      temp = temp.split('/').slice(-1)[0]
    }
    router.push(`/${temp}`)
  }

  useEffect(() => {
    if (error != null) return console.log(`Error: ${error}`)
    if (roomId == null) return console.log(`Failed to get roomId`)
    router.push(`/${roomId}`)
  }, [roomId, error])


  return <main className="w-screen min-h-screen flex items-center justify-center flex-col gap-4">

    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle className="text-2xl">Create Room</CardTitle>
        <CardDescription>Create a new meeting room in one-click.</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between">
        <Button type="submit" onClick={createRoom} disabled={loading}>
          {loading && <LoadingSpinner className="animate-spin w-4 h-4 mr-2" />}
          Create
        </Button>
      </CardFooter>


      <div className="flex items-center justify-center relative">
        <div className="bg-neutral-400/20 w-[90%] h-0.5"></div>
        <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background text-neutral-400 text-center font-bold text-sm">OR</p>
      </div>

      <CardHeader>
        <CardTitle className="text-2xl">Join Room</CardTitle>
        <CardDescription>Join an existing room with a code.</CardDescription>
      </CardHeader>
      <CardFooter>
        <div className="w-full">

          <Input onInput={(e: any) => setCode(e.target.value)} className="w-full" placeholder="xxx-xxxx-xxx" />
          <Button type="submit" onClick={joinRoom} className="mt-2" disabled={loading}>
            Join
          </Button>
        </div>
      </CardFooter>
    </Card>

    <Link href="/dashboard" className="underline cursor-pointer">Upload documents</Link>


  </main >;
}
