
import Link from "next/link"
import { RxPlus } from "react-icons/rx";
import {
  CircleUser,
  Home,
  LineChart,
  Menu,
  Package,
  Package2,
  Search,
  ShoppingCart,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { useEffect, useRef, useState } from "react"
import { GetServerSidePropsContext } from "next";
import { useParams } from "next/navigation";
import useAsyncFunction from "@/hooks/useAsyncFunction";
import { Skeleton } from "@/components/ui/skeleton";


type Props = {
  url: string
}
export default function RateCandidate({ url }: Props) {

  const { roomId } = useParams()


  const _rateCandidate = async () => {
    try {
      let response
      console.log('getting rating')
      response = await fetch(`${url}/evaluate_response`, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({
          room_id: roomId
        })
      })
      if (response.ok) {
        let res = await response.json()
        return res.evaluation
      } else {
        console.error('Failed to get rating');
      }
    } catch (error) {
      console.error(`Error getting rating - ${error}`);
    }


  }


  const { execute: getRating, result: rating, loading, error } = useAsyncFunction(_rateCandidate)


  useEffect(() => {
    getRating()
  }, [])

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6" />
              <span className="">Meetings</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <LineChart className="h-4 w-4" />
                Recommend Candidates
              </Link>


              <Link
                href="/dashboard/rate_candidate"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-foreground transition-all hover:text-primary"
              >
                <LineChart className="h-4 w-4" />
                Rate Candidate
              </Link>
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">Recommend Candidates</h1>
          </div>
          <Card className="w-[400px]">
            <CardHeader>
              <CardTitle className="text-xl">Candidate Rating</CardTitle>
              <CardDescription>A detailed review of the candidates experience as per DRDO specifications.</CardDescription>
            </CardHeader>
            <CardContent>
              {
                loading ? <Skeleton className="w-full h-8" />
                  :
                  <p>

                    {rating}
                  </p>
              }
            </CardContent>
          </Card>
        </main>
      </div>
    </div >
  )
}


export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  return {
    props: { url: process.env.SERVER_URL }
  };
};
