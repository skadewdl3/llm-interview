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


const formSchema = z.object({
  name: z.string().min(3, {
    message: "Meeting room name must be at least 3 characters.",
  }),
})

const _createRoom = async (values: z.infer<typeof formSchema>) => {
  const response = await fetch('/api/createRoom', {
    method: 'POST',
    body: JSON.stringify({
      name: values.name
    })
  })
  const { roomId } = await response.json()
  return roomId
}


export default function Home() {
  const router = useRouter()
  const { execute: createRoom, loading, error, result: roomId } = useAsyncFunction(_createRoom)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  })

  useEffect(() => {
    if (error != null) return console.log(`Error: ${error}`)
    if (roomId == null) return console.log(`Failed to get roomId`)
    // We have our roomId successfully, take user to media selection page
    router.push(`/${roomId}`)
  }, [roomId, error])

  return <main>

    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Create Room</CardTitle>
        <CardDescription>Create a new meeting room in one-click.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(createRoom)}>
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Name of your meeting room" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button type="submit" onClick={form.handleSubmit(createRoom)} disabled={loading}>
          {loading && <LoadingSpinner className="animate-spin w-4 h-4 mr-2" />}
          Create
        </Button>
      </CardFooter>
    </Card>
  </main >;
}

// export const getServerSideProps = async () => {
//   const response = await fetch("https://api.huddle01.com/api/v1/create-room", {
//     method: "POST",
//     body: JSON.stringify({
//       title: "Huddle01 Room",
//     }),
//     headers: {
//       "Content-type": "application/json",
//       "x-api-key": process.env.API_KEY || "",
//     },
//   });
//
//   const data = await response.json();
//
//  const roomId = data.data.roomId;
//
//   return {
//     redirect: {
//       destination: `/${roomId}`,
//       permanent: false,
//     },
//   };
// };
