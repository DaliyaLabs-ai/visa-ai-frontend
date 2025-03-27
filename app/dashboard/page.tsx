"use client"

import { useEffect } from "react"
import { useAuthContext } from "@/contexts/auth-context"
import { useNavigation } from "@/hooks/use-navigation"
import { useStudentOnboarding } from "@/hooks/use-student-onboarding"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthContext()
  const { navigateToLogin, navigateToOnboarding } = useNavigation()
  const { getProfile } = useStudentOnboarding()

  useEffect(() => {
    if (!isAuthenticated) {
      navigateToLogin()
    } else if (user?.userType === "student" && !user.isOnboarded) {
      navigateToOnboarding()
    }
  }, [isAuthenticated, navigateToLogin, navigateToOnboarding, user])

  if (!isAuthenticated || !user) {
    return null
  }

  const studentProfile = user.userType === "student" ? getProfile() : null

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 p-4">
        <div className="container mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Welcome, {user.fullName}</h1>
            <p className="text-muted-foreground">
              {user.userType === "student"
                ? "Prepare for your F1 visa interview with our AI agents"
                : "Manage your consultancy and help students prepare for their F1 visa interviews"}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Practice Interview</CardTitle>
                <CardDescription>Start a practice interview with our AI agent</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Our AI agents are trained to simulate real F1 visa interviews and provide personalized feedback.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link href="/call">Start Practice</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Interview History</CardTitle>
                <CardDescription>Review your past practice interviews</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">You haven't completed any practice interviews yet.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/history">View History</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resources</CardTitle>
                <CardDescription>Helpful resources for your F1 visa interview</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Access guides, tips, and common questions for F1 visa interviews.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Browse Resources
                </Button>
              </CardFooter>
            </Card>
          </div>

          {user.userType === "student" && studentProfile && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Your Profile</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="font-medium">Academic Profile</h3>
                      <p className="text-sm text-muted-foreground">
                        {studentProfile.academicProfile.college === "in-valley"
                          ? "In-Valley College"
                          : studentProfile.academicProfile.college === "out-valley"
                            ? "Out-Valley College"
                            : studentProfile.academicProfile.college}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        High School: {studentProfile.academicProfile.highSchoolName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        GPA: {studentProfile.academicProfile.highSchoolGPA}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Graduation Year: {studentProfile.academicProfile.graduationYear}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-medium">SAT Scores</h3>
                      <p className="text-sm text-muted-foreground">
                        Total: {studentProfile.satScore.total} | Math: {studentProfile.satScore.math} | Verbal:{" "}
                        {studentProfile.satScore.verbal}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-medium">English Proficiency</h3>
                      <p className="text-sm text-muted-foreground">{studentProfile.englishProficiency}</p>
                    </div>

                    <div>
                      <h3 className="font-medium">Projects and Skills</h3>
                      <p className="text-sm text-muted-foreground">{studentProfile.projectsAndSkills}</p>
                    </div>

                    <div className="md:col-span-2">
                      <h3 className="font-medium">Financial Situation</h3>
                      <p className="text-sm text-muted-foreground">{studentProfile.financialSituation}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline">Edit Profile</Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

