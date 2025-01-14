
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
import { useRef, useState } from "react"
import { GetServerSidePropsContext } from "next";


type Props = {
  url: string
}
export default function RecommendCandidate({ url }: Props) {

  const fileInput = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)

  const openFilePicker = () => {
    if (!fileInput.current) return
    fileInput.current.click()
  }
  const [jobRequirements, setJobRequirements] = useState<string[]>([])
  const [requirement, setRequirement] = useState<string>('')

  const addJobRequirement = () => {
    if (requirement == '') return
    setJobRequirements([...jobRequirements, requirement])
    setRequirement('')
  }

  const getRecommendations = async () => {
    let response
    try {

      response = await fetch(`${url}/recommend_candidates`, {
        method: 'POST',
        body: JSON.stringify({
          job_description: `Required Skills:\n${jobRequirements.join(',')}`,
          n_results: 5
        }),
        headers: {

          'Content-type': 'application/json'
        }
      })
      if (response.ok) {
        console.log(await response.json());
      } else {
        console.error('Failed to get recommendations');
      }
    } catch (error) {
      console.error(`Error getting recommendations - ${error}`);
    }


  }

  const handleSubmit = async () => {
    if (!file) return
    console.log(file)



    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await fetch(`${url}/upload_resume`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        console.log('File uploaded successfully');
      } else {
        console.error('Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

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
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-foreground transition-all hover:text-primary"
              >
                <LineChart className="h-4 w-4" />
                Recommend Candidates
              </Link>


              <Link
                href="/dashboard/rate_candidate"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
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
              <CardTitle className="text-xl">Candidate Details</CardTitle>
              <CardDescription>Upload a candidates resume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={openFilePicker}>Upload File</Button>
                <p>{file ? file.name : 'No file chosen'}</p>
              </div>
              <input type="file" className="hidden" ref={fileInput} onInput={(e: any) => setFile(e.target.files[0])} />
            </CardContent>
            <CardFooter>
              <Button onClick={handleSubmit}>Submit</Button>
            </CardFooter>
          </Card>
          <Card>

            <CardHeader>
              <CardTitle>Job Details</CardTitle>
              <CardDescription>Add job requirements by clicking the button below</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex">

                <Input value={requirement} placeholder="Enter job requirement" onInput={(e: any) => setRequirement(e.target.value)} />
                <Button variant="outline" onClick={addJobRequirement}><RxPlus /></Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">

                {
                  jobRequirements.map((requirement, index) => (
                    <Badge key={index}>{requirement}</Badge>
                  ))
                }
              </div>
            </CardContent>

            <CardFooter>
              <Button onClick={getRecommendations}>Submit</Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    </div>
  )
}


export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  return {
    props: { url: process.env.SERVER_URL }
  };
};
