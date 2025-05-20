import * as Notifications from 'expo-notifications';
import * as SQLite from "expo-sqlite";
import { getAllScripts, getCurrentUserID } from "./dbservice"; // Assuming you have this function for getting the current user ID
import * as DateFns from 'date-fns';
// Function to check deadline and lastnotified, then schedule notification
export const scheduleNotificationsForScripts = async () => {
  const scripts = await getAllScripts();
  const currentDate = new Date();
  // Loop through each script
  for (const script of scripts) {
    // Parse the deadline and last notified date
    const deadlineDate = new Date(script.deadline);
    const lastNotifiedDate = new Date(script.lastnotified);
    // Check if the deadline is in the future and if lastnotified is not today
    if (deadlineDate > currentDate && !DateFns.isToday(script.lastNotifiedDate)) {
      console.log(`Scheduling notification for script ID: ${script.id}`);
      // Schedule notification 30 minutes after the current time
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Deadline approaching for ${script.title}`,
          body: `Your deadline for the script "${script.title}" is coming up soon.`, // Customize this body text
        },
        trigger: {
          seconds: 30 *60, // 30 minutes
        },
      });
      // Optionally, you can store this identifier or update the lastnotified timestamp
      await updateLastNotified(script.id); // Function to update last notified timestamp in the database
    }
  }
};
// Function to update lastnotified field
const updateLastNotified = async (scriptId) => {
  try {
    const db = await SQLite.openDatabaseAsync("localdb");
    const currentTimestamp = new Date().toISOString();
    await db.runAsync( 
      `UPDATE scripts SET lastnotified = ? WHERE id = ?`,
      [currentTimestamp, scriptId]
    );
    console.log(`Last notified timestamp updated for script ID: ${scriptId}`);
  } catch (error) {
    console.error("Error updating lastnotified", error);
  }
};
