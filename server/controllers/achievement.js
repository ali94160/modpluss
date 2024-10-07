import { Achievement } from '../models/Achievement.js';

const achievementsList = [
    { src: 'beta_tester', title: 'Beta Tester', desc: "BETA tester of Mod+", value: 0 },
    { src: 'call_god', title: 'Call God', desc: "God at handling admin calls", value: 0 },
    { src: 'call_pro2', title: 'Call Pro2', desc: "Pro at handling admin calls", value: 0 },
    { src: 'millionaire', title: 'Millionaire', desc: "Has reached 1 000 000 Mod Coins!", value: 0 },
    { src: 'report_expert', title: 'Report Expert', desc: "Expert at handling reports", value: 0 },
    { src: 'ticket_expert', title: 'Ticket Expert', desc: "Expert at handling support tickets", value: 0 },
    { src: 'reports_250', title: '250 Reports', desc: "Has done 250 reports", value: 250 },
    { src: 'reports_750', title: 'Reports 750', desc: "Has done 750 reports", value: 750 },
    { src: 'reports_1500', title: 'Reports 1500', desc: "Has done 1500 reports", value: 1500 },
    { src: 'reports_3000', title: 'Reports 3000', desc: "Has done 3000 reports", value: 3000 },
    { src: 'reports_9999', title: 'Reports 9999', desc: "Has done 9999 reports", value: 9999 },
    { src: 'tickets_100', title: 'Tickets 100', desc: "Has done 100 tickets", value: 100 },
    { src: 'tickets_500', title: 'Tickets 500', desc: "Has done 500 tickets", value: 500 },
    { src: 'tickets_1000', title: 'Tickets 1000', desc: "Has done 1000 tickets", value: 1000 },
    { src: 'tickets_2500', title: 'Tickets 2500', desc: "Has done 2500 tickets", value: 2500 },
    { src: 'tickets_5000', title: 'Tickets 5000', desc: "Has done 5000 tickets", value: 5000 },
  ];
  
  // Insert achievements into the database
  export async function insertAchievements() {
    try {
        console.log('Inserting achievements...');
      // Insert achievements into the collection
      await Achievement.insertMany(achievementsList);
      console.log('Achievements added successfully!');
      
    } catch (err) {
      console.error('Error inserting achievements:', err);
    }
  }
  