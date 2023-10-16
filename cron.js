import fs from "fs";
import cron from 'node-cron';

const csvFileName = 'data/lombatebak.csv';

// Schedule a task to reset the CSV file at midnight (00:00)
cron.schedule('0 0 * * *', () => {
  // Delete the existing CSV file
  if (fs.existsSync(csvFileName)) {
    fs.unlinkSync(csvFileName);
    console.log('CSV file reset at midnight');
  }
});
