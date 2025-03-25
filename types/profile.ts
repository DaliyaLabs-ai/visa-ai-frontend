export interface StudentProfileData {
  college: string
  highSchoolName: string
  highSchoolGraduationYear: string // ISO date string
  highSchoolGpa: number
  satTotalScore: number
  satMathRank: number
  satVerbalScore: number
  satEnglishProficiencyScores: number
  projectsAndSkills: string
  financialSituation: string
  gender: string
  dob: string // ISO date string
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other'
} 