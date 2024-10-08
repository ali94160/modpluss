import { Achievement } from '../models/Achievement.js';
import { SystemLog } from '../models/System.js';
import { User } from '../models/User.js';
import { newDate } from './systemController.js';

// Add more achievements:
// const achievementsList = [
//     { src: 'beta_tester', title: 'Beta Tester', desc: "BETA tester of Mod+", value: 0 },
//   ];
  
//   // Insert achievements into the database
//   export async function insertAchievements() {
//     try {
//         console.log('Inserting achievements...');
//       // Insert achievements into the collection
//       await Achievement.insertMany(achievementsList);
//       console.log('Achievements added successfully!');
      
//     } catch (err) {
//       console.error('Error inserting achievements:', err);
//     }
//   }
  
//TODO: get achievements() kvar  + testa + lägga till i index.js att admins kan ge achievements. 
// Sedan lägga till i contentScript.js > Finns det ens stöd för att läsa mod+ user data i contentScript.js?

export const addAchievement = async (req, res) => {
    try {
        const { src, username, addedByAdmin } = req.body; // Get the achievement src from request body
        let hasAchievement;
        // Step 1: Find the achievement by src
        const achievement = await Achievement.findOne({ src }); // example: src = "Beta Tester"
        if (!achievement) {
        return res.status(404).json({ error: "Achievement not found with the provided src" });
        }

        const user = await User.findOne({ username });
        if (!user) {
        return res.status(404).json({ error: "User not found" });
        }

        // Check if the achievement is already added to avoid duplicates
        if(user.achievements.length > 0){
          hasAchievement = user.achievements.some(
            (ach) => ach.toString() === achievement._id.toString()
          );
        }

        if (hasAchievement) {
        return res.status(400).json({ error: "Achievement already exists for this user" });
        }

        user.achievements.push(achievement._id);

        await user.save();

        await SystemLog.create({
            type: 0,
            text: `${addedByAdmin ? `${req.session.user.username} gave ${user.username} achievement: ${achievement.title}` : `${user.username} has earned the achievement: ${achievement.title}`}`,
            date: newDate(),
          });
          
      return res.status(200).json(user);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  };


export async function getAchievements(req, res){
  try {
    const achievements = await Achievement.find({});
    res.status(200).json(achievements);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}