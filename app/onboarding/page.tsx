"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuthContext } from "@/contexts/auth-context"
import { useNavigation } from "@/hooks/use-navigation"
import { useFormValidation } from "@/hooks/use-form-validation"
import { useStudentOnboarding, type StudentProfile } from "@/hooks/use-student-onboarding"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Gender } from '@/types/profile'
import type { User } from "@/types/auth"

export default function OnboardingPage() {
  const { user } = useAuthContext()
  const { navigateToDashboard } = useNavigation()
  const { submitOnboarding } = useStudentOnboarding()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (user && !user.profile) {
      setShouldRender(true)
    } else {
      navigateToDashboard()
    }
  }, [user, navigateToDashboard])

  const initialValues: StudentProfile = {
    academicProfile: {
      college: "",
      highSchoolGPA: "",
      highSchoolName: "",
      graduationYear: "",
    },
    satScore: {
      total: 0,
      math: 0,
      verbal: 0,
    },
    englishProficiency: "",
    projectsAndSkills: "",
    financialSituation: "",
    gender: Gender.OTHER,
    dob: "",
  }

  const validationRules = {
    "academicProfile.college": (value: string) => (value ? null : "College selection is required"),
    "academicProfile.highSchoolGPA": (value: string) => (value ? null : "High school GPA is required"),
    "academicProfile.highSchoolName": (value: string) => (value ? null : "High school name is required"),
    "academicProfile.graduationYear": (value: string) => (value ? null : "Graduation year is required"),
    "satScore.total": (value: number) => (value > 0 ? null : "SAT total score is required"),
    "satScore.math": (value: number) => (value > 0 ? null : "SAT math score is required"),
    "satScore.verbal": (value: number) => (value > 0 ? null : "SAT verbal score is required"),
    englishProficiency: (value: string) => (value ? null : "English proficiency information is required"),
    projectsAndSkills: (value: string) => (value ? null : "Projects and skills information is required"),
    financialSituation: (value: string) => (value ? null : "Financial situation information is required"),
    gender: (value: Gender) => (value ? null : "Gender is required"),
    dob: (value: string) => (value ? null : "Date of birth is required"),
  }

  const form = useFormValidation(initialValues, validationRules)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.validateAll()) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      console.log("submitting ....: ", form.values)
      const success
       = await submitOnboarding(form.values)
      console.log("success", success)
      if (success) {
        navigateToDashboard()
      }
    } catch (err) {
      setError("Failed to save profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!shouldRender) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 p-4">
        <div className="container mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Profile</CardTitle>
              <CardDescription>We need some information to personalize your F1 visa interview practice</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {/* Academic Profile Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Academic Profile</h3>

                  <div className="space-y-2">
                    <Label htmlFor="college">College</Label>
                    <Select
                      value={form.values.academicProfile.college}
                      onValueChange={(value) => form.handleChange("academicProfile.college", value)}
                    >
                      <SelectTrigger id="college">
                        <SelectValue placeholder="Select your college" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in-valley">In-Valley College</SelectItem>
                        <SelectItem value="out-valley">Out-Valley College</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.touched["academicProfile.college"] && form.errors["academicProfile.college"] && (
                      <p className="text-sm text-destructive">{form.errors["academicProfile.college"]}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="highSchoolName">High School Name</Label>
                      <Input
                        id="highSchoolName"
                        value={form.values.academicProfile.highSchoolName}
                        onChange={(e) => form.handleChange("academicProfile.highSchoolName", e.target.value)}
                        onBlur={() => form.handleBlur("academicProfile.highSchoolName")}
                        placeholder="Enter your high school name"
                      />
                      {form.touched["academicProfile.highSchoolName"] &&
                        form.errors["academicProfile.highSchoolName"] && (
                          <p className="text-sm text-destructive">{form.errors["academicProfile.highSchoolName"]}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="highSchoolGPA">High School GPA</Label>
                      <Input
                        id="highSchoolGPA"
                        value={form.values.academicProfile.highSchoolGPA}
                        onChange={(e) => form.handleChange("academicProfile.highSchoolGPA", e.target.value)}
                        onBlur={() => form.handleBlur("academicProfile.highSchoolGPA")}
                        placeholder="e.g., 3.8/4.0"
                      />
                      {form.touched["academicProfile.highSchoolGPA"] &&
                        form.errors["academicProfile.highSchoolGPA"] && (
                          <p className="text-sm text-destructive">{form.errors["academicProfile.highSchoolGPA"]}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="graduationYear">High School Graduation Year</Label>
                      <Input
                        id="graduationYear"
                        value={form.values.academicProfile.graduationYear}
                        onChange={(e) => form.handleChange("academicProfile.graduationYear", e.target.value)}
                        onBlur={() => form.handleBlur("academicProfile.graduationYear")}
                        placeholder="e.g., 2023"
                      />
                      {form.touched["academicProfile.graduationYear"] &&
                        form.errors["academicProfile.graduationYear"] && (
                          <p className="text-sm text-destructive">{form.errors["academicProfile.graduationYear"]}</p>
                        )}
                    </div>
                  </div>
                </div>

                {/* SAT Scores Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">SAT Scores</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="satTotal">Total Score</Label>
                      <Input
                        id="satTotal"
                        type="number"
                        value={form.values.satScore.total || ""}
                        onChange={(e) => form.handleChange("satScore.total", Number.parseInt(e.target.value) || 0)}
                        onBlur={() => form.handleBlur("satScore.total")}
                        placeholder="Enter total SAT score"
                      />
                      {form.touched["satScore.total"] && form.errors["satScore.total"] && (
                        <p className="text-sm text-destructive">{form.errors["satScore.total"]}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="satMath">Math Score</Label>
                      <Input
                        id="satMath"
                        type="number"
                        value={form.values.satScore.math || ""}
                        onChange={(e) => form.handleChange("satScore.math", Number.parseInt(e.target.value) || 0)}
                        onBlur={() => form.handleBlur("satScore.math")}
                        placeholder="Enter math score"
                      />
                      {form.touched["satScore.math"] && form.errors["satScore.math"] && (
                        <p className="text-sm text-destructive">{form.errors["satScore.math"]}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="satVerbal">Verbal Score</Label>
                      <Input
                        id="satVerbal"
                        type="number"
                        value={form.values.satScore.verbal || ""}
                        onChange={(e) => form.handleChange("satScore.verbal", Number.parseInt(e.target.value) || 0)}
                        onBlur={() => form.handleBlur("satScore.verbal")}
                        placeholder="Enter verbal score"
                      />
                      {form.touched["satScore.verbal"] && form.errors["satScore.verbal"] && (
                        <p className="text-sm text-destructive">{form.errors["satScore.verbal"]}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* English Proficiency Section */}
                <div className="space-y-2">
                  <Label htmlFor="englishProficiency">English Proficiency Scores</Label>
                  <Textarea
                    id="englishProficiency"
                    value={form.values.englishProficiency}
                    onChange={(e) => form.handleChange("englishProficiency", e.target.value)}
                    onBlur={() => form.handleBlur("englishProficiency")}
                    placeholder="Enter your TOEFL/IELTS scores and other English proficiency details"
                    rows={3}
                  />
                  {form.touched.englishProficiency && form.errors.englishProficiency && (
                    <p className="text-sm text-destructive">{form.errors.englishProficiency}</p>
                  )}
                </div>

                {/* Projects and Skills Section */}
                <div className="space-y-2">
                  <Label htmlFor="projectsAndSkills">Projects and Skills</Label>
                  <Textarea
                    id="projectsAndSkills"
                    value={form.values.projectsAndSkills}
                    onChange={(e) => form.handleChange("projectsAndSkills", e.target.value)}
                    onBlur={() => form.handleBlur("projectsAndSkills")}
                    placeholder="Describe your projects, skills, and extracurricular activities"
                    rows={4}
                  />
                  {form.touched.projectsAndSkills && form.errors.projectsAndSkills && (
                    <p className="text-sm text-destructive">{form.errors.projectsAndSkills}</p>
                  )}
                </div>

                {/* Financial Situation Section */}
                <div className="space-y-2">
                  <Label htmlFor="financialSituation">Financial Situation</Label>
                  <Textarea
                    id="financialSituation"
                    value={form.values.financialSituation}
                    onChange={(e) => form.handleChange("financialSituation", e.target.value)}
                    onBlur={() => form.handleBlur("financialSituation")}
                    placeholder="Describe your financial situation and how you plan to fund your education"
                    rows={4}
                  />
                  {form.touched.financialSituation && form.errors.financialSituation && (
                    <p className="text-sm text-destructive">{form.errors.financialSituation}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select
                    value={form.values.gender}
                    onValueChange={(value) => form.handleChange("gender", value as Gender)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Gender.MALE}>Male</SelectItem>
                      <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                      <SelectItem value={Gender.OTHER}>Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.touched.gender && form.errors.gender && (
                    <p className="text-sm text-destructive">{form.errors.gender}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={form.values.dob}
                    onChange={(e) => form.handleChange("dob", e.target.value)}
                    onBlur={() => form.handleBlur("dob")}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {form.touched.dob && form.errors.dob && (
                    <p className="text-sm text-destructive">{form.errors.dob}</p>
                  )}
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Complete Profile"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
    </div>
  )
}

