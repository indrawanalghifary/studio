// Usage: node scripts/seed.js -- --userId=YOUR_USER_ID
const admin = require('firebase-admin');
const { seedTransactions } = require('../src/lib/seed');

// --- Configuration ---
// IMPORTANT: Make sure you have the service-account.json file in your root directory
// This file is git-ignored for security.
const serviceAccount = require('../service-account.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Add your databaseURL here if you have one, e.g.,
  // databaseURL: "https://your-project-id.firebaseio.com"
});

const db = admin.firestore();

// --- Main Seeding Logic ---
async function main() {
  // Parse command-line arguments to get the userId
  const args = process.argv.slice(2).reduce((acc, arg) => {
    const [key, value] = arg.split('=');
    if (key && value) {
      acc[key.replace('--', '')] = value;
    }
    return acc;
  }, {});

  const userId = args.userId;

  if (!userId) {
    console.error('Error: Please provide a userId.');
    console.log('Usage: node scripts/seed.js -- --userId=YOUR_USER_ID');
    process.exit(1);
  }

  console.log(`Starting to seed database for user: ${userId}...`);

  try {
    // Call the seeding functions
    await seedTransactions(db, userId);

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

main();
