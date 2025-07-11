import React, { createContext, useContext, useState, useEffect } from 'react'
import { account, databases, DATABASE_ID, USERS_COLLECTION_ID, ID, initializeDatabase } from '../appwrite/config'
import { Query } from 'appwrite'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialize database on app start
  useEffect(() => {
    initializeDatabase()
  }, [])

  async function signup(email, password, name) {
    try {
      // Create account
      const userAccount = await account.create(ID.unique(), email, password, name)
      
      // Send email verification
      try {
        await account.createVerification('http://localhost:5173/verify-email')
        console.log('Email verification sent successfully')
      } catch (verificationError) {
        console.error('Error sending verification email:', verificationError)
        // Don't throw error - allow signup to continue even if email fails
      }

      // Create user document in database
      const userData = {
        userId: userAccount.$id,
        name,
        email,
        verified: false,
        habits: JSON.stringify({}),
        habitCompletion: JSON.stringify({}),
        activityLog: JSON.stringify({}),
        habitPreferences: JSON.stringify({}),
        habitStacks: JSON.stringify({}),
        dailyStats: JSON.stringify({}),
        reflections: JSON.stringify({}),
        journalEntries: JSON.stringify([]),
        calendarEvents: JSON.stringify([]),
        todoItems: JSON.stringify([]),
        mealLogs: JSON.stringify({}),
        waterIntake: JSON.stringify({}),
        mealTrackerSettings: JSON.stringify({ waterGoal: 8 }),
        futureLetters: JSON.stringify([]),
        gratitudeEntries: JSON.stringify([]),
        dayReflections: JSON.stringify([]),
        bucketListItems: JSON.stringify([]),
        transactions: JSON.stringify([]),
        budgets: JSON.stringify({}),
        savingsGoals: JSON.stringify([]),
        financeSettings: JSON.stringify({}),
        schoolTasks: JSON.stringify([]),
        schoolSubjects: JSON.stringify([]),
        schoolGrades: JSON.stringify([]),
        studySchedule: JSON.stringify([]),
        schoolSettings: JSON.stringify({}),
        passwordEntries: JSON.stringify([]),
        vaultPin: '',
        joinedServers: JSON.stringify([])
      }
      
      await databases.createDocument(DATABASE_ID, USERS_COLLECTION_ID, ID.unique(), userData)

      return { user: userAccount }
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    }
  }

  async function login(email, password) {
    try {
      const session = await account.createEmailPasswordSession(email, password)
      const user = await account.get()
      
      // Update last login time in user document
      try {
        const userDocs = await databases.listDocuments(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          [Query.equal('userId', user.$id)]
        )
        
        if (userDocs.documents.length > 0) {
          await databases.updateDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            userDocs.documents[0].$id,
            {
              lastLogin: new Date().toISOString()
            }
          )
        }
      } catch (error) {
        console.error('Error updating last login:', error)
      }

      return { user }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  async function logout() {
    try {
      await account.deleteSession('current')
      setCurrentUser(null)
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  async function resetPassword(email) {
    try {
      await account.createRecovery(email, 'http://localhost:5173/reset-password')
    } catch (error) {
      console.error('Reset password error:', error)
      throw error
    }
  }

  async function getUserData(uid) {
    try {
      const userDocs = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal('userId', uid)]
      )
      
      if (userDocs.documents.length > 0) {
        const userData = userDocs.documents[0]
        
        // Parse JSON fields
        const parsedData = {
          ...userData,
          habits: userData.habits ? JSON.parse(userData.habits) : {},
          habitCompletion: userData.habitCompletion ? JSON.parse(userData.habitCompletion) : {},
          activityLog: userData.activityLog ? JSON.parse(userData.activityLog) : {},
          habitPreferences: userData.habitPreferences ? JSON.parse(userData.habitPreferences) : {},
          habitStacks: userData.habitStacks ? JSON.parse(userData.habitStacks) : {},
          dailyStats: userData.dailyStats ? JSON.parse(userData.dailyStats) : {},
          reflections: userData.reflections ? JSON.parse(userData.reflections) : {},
          journalEntries: userData.journalEntries ? JSON.parse(userData.journalEntries) : [],
          calendarEvents: userData.calendarEvents ? JSON.parse(userData.calendarEvents) : [],
          todoItems: userData.todoItems ? JSON.parse(userData.todoItems) : [],
          mealLogs: userData.mealLogs ? JSON.parse(userData.mealLogs) : {},
          waterIntake: userData.waterIntake ? JSON.parse(userData.waterIntake) : {},
          mealTrackerSettings: userData.mealTrackerSettings ? JSON.parse(userData.mealTrackerSettings) : { waterGoal: 8 },
          futureLetters: userData.futureLetters ? JSON.parse(userData.futureLetters) : [],
          gratitudeEntries: userData.gratitudeEntries ? JSON.parse(userData.gratitudeEntries) : [],
          dayReflections: userData.dayReflections ? JSON.parse(userData.dayReflections) : [],
          bucketListItems: userData.bucketListItems ? JSON.parse(userData.bucketListItems) : [],
          transactions: userData.transactions ? JSON.parse(userData.transactions) : [],
          budgets: userData.budgets ? JSON.parse(userData.budgets) : {},
          savingsGoals: userData.savingsGoals ? JSON.parse(userData.savingsGoals) : [],
          financeSettings: userData.financeSettings ? JSON.parse(userData.financeSettings) : {},
          schoolTasks: userData.schoolTasks ? JSON.parse(userData.schoolTasks) : [],
          schoolSubjects: userData.schoolSubjects ? JSON.parse(userData.schoolSubjects) : [],
          schoolGrades: userData.schoolGrades ? JSON.parse(userData.schoolGrades) : [],
          studySchedule: userData.studySchedule ? JSON.parse(userData.studySchedule) : [],
          schoolSettings: userData.schoolSettings ? JSON.parse(userData.schoolSettings) : {},
          passwordEntries: userData.passwordEntries ? JSON.parse(userData.passwordEntries) : [],
          joinedServers: userData.joinedServers ? JSON.parse(userData.joinedServers) : []
        }
        
        return parsedData
      }
      return null
    } catch (error) {
      console.error('Error getting user data:', error)
      return null
    }
  }

  async function updateUserData(uid, data) {
    try {
      const userDocs = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal('userId', uid)]
      )
      
      if (userDocs.documents.length > 0) {
        // Stringify JSON fields
        const updateData = {}
        
        Object.keys(data).forEach(key => {
          if (typeof data[key] === 'object' && data[key] !== null && !(data[key] instanceof Date)) {
            updateData[key] = JSON.stringify(data[key])
          } else if (data[key] instanceof Date) {
            updateData[key] = data[key].toISOString()
          } else {
            updateData[key] = data[key]
          }
        })
        
        await databases.updateDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          userDocs.documents[0].$id,
          updateData
        )
      }
    
    } catch (error) {
      console.error('Error updating user data:', error)
      throw error
    }
  }

  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await account.get()
        setCurrentUser({
          $id: user.$id,
          email: user.email,
          name: user.name,
          emailVerification: user.email_verification || user.emailVerification,
          get emailVerified() {
            return this.emailVerification
          },
          get displayName() {
            return this.name
          }
        })
      } catch (error) {
        setCurrentUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const value = {
    
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
    getUserData,
    updateUserData
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}