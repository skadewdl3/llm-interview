import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import useAsyncFunction from "@/hooks/useAsyncFunction";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { BiLoaderAlt as LoadingSpinner } from "react-icons/bi";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

// const formSchema = z.object({
//   name: z.string().min(3, {
//     message: "Meeting room name must be at least 3 characters.",
//   }),
// })
//
export default function Home() {
  const router = useRouter()
  const { execute: createRoom, loading, error, result: roomId } = useAsyncFunction(async () => {
    const response = await fetch('/api/room/create', {
      method: 'POST',
    })
    const { roomId } = await response.json()
    return roomId
  })
  // const form = useForm<z.infer<typeof formSchema>>({
  //   resolver: zodResolver(formSchema),
  //   defaultValues: {
  //     name: "",
  //   },
  // })

  useEffect(() => {
    if (error != null) return console.log(`Error: ${error}`)
    if (roomId == null) return console.log(`Failed to get roomId`)
    router.push(`/${roomId}`)
  }, [roomId, error])

  return <main className="w-screen min-h-screen flex items-center justify-center">

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
    </Card>
  </main >;
}
