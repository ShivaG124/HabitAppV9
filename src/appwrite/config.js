import { Client, Account, Databases, ID } from 'appwrite'

const client = new Client()

client
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('687073050007516b353d')

export const account = new Account(client)
export const databases = new Databases(client)

export { ID }

// Database and collection IDs
export const DATABASE_ID = 'habitflow-db'
export const USERS_COLLECTION_ID = 'users'

// Helper function to ensure database and collection exist
export const initializeDatabase = async () => {
  try {
    // Try to get the database first
    try {
      await databases.get(DATABASE_ID)
    } catch (error) {
      if (error.code === 404) {
        // Database doesn't exist, create it
        await databases.create(DATABASE_ID, 'HabitFlow Database')
      }
    }

    // Try to get the collection
    try {
      await databases.getCollection(DATABASE_ID, USERS_COLLECTION_ID)
    } catch (error) {
      if (error.code === 404) {
        // Collection doesn't exist, create it
        await databases.createCollection(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          'Users',
          [
            // Read/Write permissions for authenticated users
            'read("user")',
            'write("user")'
          ]
        )

        // Create attributes for the users collection
        const attributes = [
          { key: 'userId', type: 'string', size: 255, required: true },
          { key: 'name', type: 'string', size: 255, required: true },
          { key: 'email', type: 'string', size: 255, required: true },
          { key: 'verified', type: 'boolean', required: false, default: false },
          { key: 'habits', type: 'string', size: 65535, required: false },
          { key: 'habitCompletion', type: 'string', size: 65535, required: false },
          { key: 'activityLog', type: 'string', size: 65535, required: false },
          { key: 'habitPreferences', type: 'string', size: 65535, required: false },
          { key: 'habitStacks', type: 'string', size: 65535, required: false },
          { key: 'dailyStats', type: 'string', size: 65535, required: false },
          { key: 'reflections', type: 'string', size: 65535, required: false },
          { key: 'journalEntries', type: 'string', size: 65535, required: false },
          { key: 'calendarEvents', type: 'string', size: 65535, required: false },
          { key: 'todoItems', type: 'string', size: 65535, required: false },
          { key: 'mealLogs', type: 'string', size: 65535, required: false },
          { key: 'waterIntake', type: 'string', size: 65535, required: false },
          { key: 'mealTrackerSettings', type: 'string', size: 65535, required: false },
          { key: 'futureLetters', type: 'string', size: 65535, required: false },
          { key: 'gratitudeEntries', type: 'string', size: 65535, required: false },
          { key: 'dayReflections', type: 'string', size: 65535, required: false },
          { key: 'bucketListItems', type: 'string', size: 65535, required: false },
          { key: 'transactions', type: 'string', size: 65535, required: false },
          { key: 'budgets', type: 'string', size: 65535, required: false },
          { key: 'savingsGoals', type: 'string', size: 65535, required: false },
          { key: 'financeSettings', type: 'string', size: 65535, required: false },
          { key: 'schoolTasks', type: 'string', size: 65535, required: false },
          { key: 'schoolSubjects', type: 'string', size: 65535, required: false },
          { key: 'schoolGrades', type: 'string', size: 65535, required: false },
          { key: 'studySchedule', type: 'string', size: 65535, required: false },
          { key: 'schoolSettings', type: 'string', size: 65535, required: false },
          { key: 'passwordEntries', type: 'string', size: 65535, required: false },
          { key: 'vaultPin', type: 'string', size: 255, required: false },
          { key: 'joinedServers', type: 'string', size: 65535, required: false }
        ]

        // Create attributes one by one
        for (const attr of attributes) {
          try {
            if (attr.type === 'string') {
              await databases.createStringAttribute(
                DATABASE_ID,
                USERS_COLLECTION_ID,
                attr.key,
                attr.size,
                attr.required,
                attr.default
              )
            } else if (attr.type === 'boolean') {
              await databases.createBooleanAttribute(
                DATABASE_ID,
                USERS_COLLECTION_ID,
                attr.key,
                attr.required,
                attr.default
              )
            }
          } catch (error) {
            console.log(`Attribute ${attr.key} might already exist:`, error.message)
          }
        }

        // Create indexes
        try {
          await databases.createIndex(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            'userId_index',
            'key',
            ['userId']
          )
        } catch (error) {
          console.log('Index might already exist:', error.message)
        }
      }
    }
  } catch (error) {
    console.error('Error initializing database:', error)
  }
}

export default client