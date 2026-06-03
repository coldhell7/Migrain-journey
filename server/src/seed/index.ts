import db, { initDB } from '../db';
import bcrypt from 'bcryptjs';
import { config } from '../config';

const FACTS = [
  { title: "Migraine is not just a headache", body: "Migraine is a neurological condition that affects over 1 billion people worldwide. It involves complex brain mechanisms and can cause a wide range of symptoms beyond head pain.", category: "migraine", source: "WHO" },
  { title: "The phases of a migraine attack", body: "A migraine attack typically has four phases: prodrome (early warning signs), aura (sensory disturbances), headache (the pain phase), and postdrome (recovery). Not everyone experiences all phases.", category: "migraine", source: "American Migraine Foundation" },
  { title: "Migraine affects women more", body: "Women are three times more likely to experience migraine than men. This is largely attributed to hormonal fluctuations, particularly estrogen levels.", category: "migraine", source: "Migraine Research Foundation" },
  { title: "Caffeine can help — or hurt", body: "For some people, caffeine can help stop a migraine attack by constricting blood vessels. However, overuse can lead to rebound headaches and worsen migraine frequency.", category: "migraine", source: "American Migraine Foundation" },
  { title: "Sleep and migraine are deeply connected", body: "Both too little and too much sleep can trigger migraines. Maintaining a consistent sleep schedule is one of the most effective non-medical strategies for migraine prevention.", category: "sleep", source: "National Sleep Foundation" },
  { title: "Dehydration triggers headaches", body: "Even mild dehydration can trigger headache and migraine attacks. The brain is 73% water, and fluid balance affects everything from blood flow to neurotransmitter function.", category: "hydration", source: "European Journal of Neurology" },
  { title: "Stress is the #1 trigger", body: "Studies show that stress is the most commonly reported migraine trigger. Stress management techniques like meditation and biofeedback can significantly reduce attack frequency.", category: "migraine", source: "Headache: The Journal of Head and Face Pain" },
  { title: "The gut-brain connection", body: "There is a strong connection between the gut and brain in migraine. Nausea and vomiting are common symptoms, and some people find trigger foods through elimination diets.", category: "migraine", source: "American Migraine Foundation" },
  { title: "Light sensitivity (photophobia)", body: "Over 80% of people with migraine experience photophobia — extreme sensitivity to light. This is because migraine makes the brain's visual processing system hyper-reactive.", category: "migraine", source: "Cephalalgia journal" },
  { title: "Screen time and eye strain", body: "Prolonged screen time can trigger migraines due to blue light exposure, eye strain, and poor posture. The 20-20-20 rule (look 20 feet away for 20 seconds every 20 minutes) may help.", category: "lifestyle", source: "American Optometric Association" },
  { title: "Exercise can prevent migraine", body: "Regular moderate exercise has been shown to reduce migraine frequency and intensity. Exercise releases endorphins, improves sleep, and reduces stress — all protective factors.", category: "lifestyle", source: "Journal of Headache and Pain" },
  { title: "Weather as a trigger", body: "Barometric pressure changes, high humidity, extreme temperatures, and storms are common weather-related migraine triggers. This affects about 50% of people with migraine.", category: "migraine", source: "American Migraine Foundation" },
  { title: "The importance of routine", body: "People with migraine often benefit from maintaining consistent routines for sleep, meals, exercise, and hydration. Disruptions to routine are a common trigger.", category: "lifestyle", source: "Migraine Trust" },
  { title: "Hormonal migraine", body: "Hormonal fluctuations, especially around menstruation, can trigger migraine attacks. This is known as menstrual migraine and is often more severe and longer-lasting.", category: "migraine", source: "National Headache Foundation" },
  { title: "Magnesium for migraine", body: "Some studies suggest magnesium supplements may help prevent migraines. Magnesium plays a role in nerve transmission and blood vessel tone.", category: "treatment", source: "Headache journal" },
  { title: "How much water do you need?", body: "The '8 glasses a day' rule is a general guideline. Actual water needs vary based on body size, activity level, climate, and diet. A good indicator is pale yellow urine.", category: "hydration", source: "Mayo Clinic" },
  { title: "Blue light and sleep", body: "Blue light from screens suppresses melatonin production, making it harder to fall asleep. Using blue light filters or avoiding screens 1-2 hours before bed can improve sleep quality.", category: "sleep", source: "Harvard Medical School" },
  { title: "Sleep needs vary by age", body: "Adults typically need 7-9 hours of sleep per night. Sleep quality matters as much as quantity — deep sleep is when the brain clears waste products and consolidates memories.", category: "sleep", source: "CDC" },
  { title: "Tracking helps identify patterns", body: "Keeping a migraine diary helps identify triggers, track medication effectiveness, and provides valuable data for healthcare providers to make informed treatment decisions.", category: "migraine", source: "American Migraine Foundation" },
  { title: "The glymphatic system", body: "During deep sleep, the brain's glymphatic system clears out metabolic waste. This may be why poor sleep is linked to higher migraine risk.", category: "sleep", source: "Science journal" },
  { title: "Migraine and serotonin", body: "Serotonin levels fluctuate during migraine attacks. Many migraine medications work by influencing serotonin receptors, which helps regulate pain pathways.", category: "migraine", source: "Cephalalgia" },
  { title: "Cervicogenic headache vs migraine", body: "Cervicogenic headaches originate from neck issues, while migraine is neurological. They can feel similar but require different treatment approaches.", category: "migraine", source: "International Headache Society" },
  { title: "The power of darkness", body: "During a migraine attack, lying in a dark, quiet room helps because the brain is hypersensitive to both light and sound stimuli.", category: "migraine", source: "American Migraine Foundation" },
  { title: "Alcohol as a trigger", body: "Red wine is the most commonly reported alcoholic migraine trigger, but any alcohol can be a trigger. Dehydration and vasodilation are contributing factors.", category: "migraine", source: "Migraine Trust" },
  { title: "Vitamins and supplements", body: "Riboflavin (Vitamin B2), Coenzyme Q10, and feverfew have shown some evidence in migraine prevention. Always consult a doctor before starting supplements.", category: "treatment", source: "American Headache Society" },
  { title: "Sleep apnea and headache", body: "Sleep apnea is associated with morning headaches and can worsen migraine. Treating sleep apnea often leads to fewer headache days.", category: "sleep", source: "Chest journal" },
  { title: "Migraine in children", body: "About 10% of children experience migraines. Childhood migraines often present differently, with shorter attacks and more prominent gastrointestinal symptoms.", category: "migraine", source: "American Academy of Pediatrics" },
  { title: "The placebo effect in migraine", body: "The placebo response in migraine treatment is particularly strong — up to 30% in some studies. This highlights the powerful role of expectation and the brain's own pain-regulation systems.", category: "treatment", source: "Headache journal" },
  { title: "Circadian rhythm and migraine", body: "Migraine attacks often follow a circadian pattern, with many occurring in early morning or late night. Disruptions to the body's internal clock can trigger attacks.", category: "migraine", source: "Nature Reviews Neurology" },
  { title: "Medication overuse headache", body: "Using acute migraine medication more than 10 days per month can lead to medication overuse headaches — a cycle where more medication leads to more headaches.", category: "treatment", source: "International Headache Society" },
  { title: "Ice cream headache", body: "\"Brain freeze\" from cold foods is a type of headache caused by rapid constriction and dilation of blood vessels in the palate. It usually resolves within seconds to minutes.", category: "migraine", source: "NIH" },
  { title: "Yoga for migraine", body: "Regular yoga practice has been shown to reduce migraine frequency, intensity, and duration. It combines stress reduction, improved posture, and mind-body awareness.", category: "lifestyle", source: "Neurology journal" },
  { title: "Migraine and weather fronts", body: "Cold fronts, warm fronts, and high humidity are the most common weather-related triggers. Some people can sense a storm coming by their migraine symptoms.", category: "migraine", source: "American Migraine Foundation" },
  { title: "Essential oils for migraine", body: "Peppermint oil applied to the forehead and temples may help relieve tension-type headaches. Lavender oil inhalation has shown some benefit for migraine relief.", category: "treatment", source: "European Neurology journal" },
  { title: "Posture matters", body: "Poor posture, especially forward head posture from phone use, strains neck muscles and can trigger cervicogenic headaches and worsen migraine.", category: "lifestyle", source: "Journal of Bodywork and Movement Therapies" },
  { title: "The blood-brain barrier", body: "During a migraine with aura, there may be temporary changes in the blood-brain barrier, which is why certain medications work differently during an attack.", category: "migraine", source: "Journal of Clinical Investigation" },
  { title: "Migraine and creativity", body: "Many famous artists, writers, and scientists — including Van Gogh, Virginia Woolf, and Charles Darwin — are believed to have suffered from migraines.", category: "migraine", source: "Migraine Trust" },
  { title: "Hydration and cognition", body: "Even 1-2% dehydration can impair cognitive function, affecting concentration, alertness, and short-term memory.", category: "hydration", source: "Journal of Nutrition" },
  { title: "Temperature and sleep", body: "The optimal bedroom temperature for sleep is around 65°F (18°C). A cooler environment helps the body's core temperature drop, which is necessary for falling asleep.", category: "sleep", source: "National Sleep Foundation" },
  { title: "Napping and migraine", body: "Short power naps (10-20 minutes) can help alleviate fatigue and prevent migraine attacks for some people. Longer naps may disrupt nighttime sleep.", category: "sleep", source: "Sleep Health journal" },
  { title: "Aromatherapy for sleep", body: "Lavender, chamomile, and valerian root are aromatherapy scents associated with improved sleep quality. They may help reduce anxiety and promote relaxation.", category: "sleep", source: "Evidence-Based Complementary Medicine" },
  { title: "Exercise intensity matters", body: "While moderate exercise helps prevent migraines, very high-intensity exercise can sometimes trigger attacks. Start slow and gradually build up intensity.", category: "lifestyle", source: "Journal of Headache and Pain" },
  { title: "The trigeminal nerve", body: "The trigeminal nerve is the primary sensory nerve for the face and head. In migraine, this nerve becomes hypersensitive, sending pain signals to the brain.", category: "migraine", source: "Nature Reviews Neuroscience" },
];

const QUIZZES = [
  { factIdx: 0, q: "How many people worldwide are affected by migraine?", opts: ["About 100 million", "Over 1 billion", "About 500 million", "About 50 million"], correct: 1, explanation: "Migraine affects over 1 billion people worldwide, making it the third most prevalent illness globally." },
  { factIdx: 1, q: "How many phases can a migraine attack typically have?", opts: ["2", "3", "4", "5"], correct: 2, explanation: "A migraine attack typically has four phases: prodrome, aura, headache, and postdrome." },
  { factIdx: 2, q: "Women are how much more likely to experience migraine than men?", opts: ["Twice as likely", "Three times as likely", "Equally likely", "Five times as likely"], correct: 1, explanation: "Women are three times more likely to experience migraine, largely due to hormonal differences." },
  { factIdx: 3, q: "How can caffeine affect migraines?", opts: ["Always helps", "Always hurts", "Can help some but overuse causes rebound headaches", "Has no effect"], correct: 2, explanation: "Caffeine can help some people but overuse can lead to rebound headaches." },
  { factIdx: 4, q: "What sleep pattern is recommended for migraine prevention?", opts: ["Sleep as much as possible", "Consistent sleep schedule", "Sleep less than 6 hours", "Vary sleep times"], correct: 1, explanation: "A consistent sleep schedule is one of the most effective non-medical strategies for migraine prevention." },
  { factIdx: 5, q: "What percentage of water is the human brain?", opts: ["53%", "63%", "73%", "83%"], correct: 2, explanation: "The brain is 73% water, making hydration crucial for proper brain function." },
  { factIdx: 6, q: "What is the #1 reported migraine trigger?", opts: ["Weather", "Caffeine", "Stress", "Hormones"], correct: 2, explanation: "Stress is the most commonly reported migraine trigger according to multiple studies." },
  { factIdx: 7, q: "What is the connection between gut and brain in migraine?", opts: ["No connection", "They are separate", "There is a strong gut-brain connection", "Only gut affects migraine"], correct: 2, explanation: "There is a strong connection between the gut and brain in migraine, with nausea and vomiting being common symptoms." },
  { factIdx: 8, q: "What percentage of people with migraine experience photophobia?", opts: ["About 30%", "About 50%", "Over 80%", "About 10%"], correct: 2, explanation: "Over 80% of people with migraine experience photophobia — extreme sensitivity to light." },
  { factIdx: 9, q: "What is the 20-20-20 rule for screen time?", opts: ["20 min screen, 20 min break", "Look 20 feet away for 20 seconds every 20 min", "20 inches from screen", "20% brightness"], correct: 1, explanation: "The 20-20-20 rule helps reduce eye strain: look 20 feet away for 20 seconds every 20 minutes." },
  { factIdx: 10, q: "What type of exercise helps prevent migraine?", opts: ["None", "Only high-intensity", "Regular moderate exercise", "Only yoga"], correct: 2, explanation: "Regular moderate exercise has been shown to reduce migraine frequency and intensity." },
  { factIdx: 11, q: "What percentage of people with migraine are affected by weather?", opts: ["About 10%", "About 25%", "About 50%", "About 90%"], correct: 2, explanation: "About 50% of people with migraine report weather as a trigger." },
  { factIdx: 12, q: "What type of routine is beneficial for migraine?", opts: ["Sleep only", "Meal only", "Consistent routine for sleep, meals, exercise, and hydration", "No routine needed"], correct: 2, explanation: "Consistent routines for sleep, meals, exercise, and hydration help reduce migraine frequency." },
  { factIdx: 13, q: "What is menstrual migraine?", opts: ["Migraine during pregnancy", "Migraine triggered by hormonal fluctuations around menstruation", "Migraine only during periods", "Migraine in women only"], correct: 1, explanation: "Menstrual migraine is triggered by hormonal fluctuations around menstruation." },
  { factIdx: 14, q: "Which supplement has shown promise for migraine prevention?", opts: ["Vitamin C", "Magnesium", "Iron", "Vitamin D"], correct: 1, explanation: "Some studies suggest magnesium supplements may help prevent migraines." },
  { factIdx: 15, q: "What is a good indicator of proper hydration?", opts: ["Thirst", "Pale yellow urine", "Clear urine", "Dark urine"], correct: 1, explanation: "Pale yellow urine is a good indicator of proper hydration." },
  { factIdx: 16, q: "How does blue light affect sleep?", opts: ["Improves sleep", "No effect", "Suppresses melatonin production", "Increases melatonin"], correct: 2, explanation: "Blue light from screens suppresses melatonin production, making it harder to fall asleep." },
  { factIdx: 17, q: "How many hours of sleep do adults typically need?", opts: ["5-6", "7-9", "10-12", "4-5"], correct: 1, explanation: "Adults typically need 7-9 hours of sleep per night." },
  { factIdx: 19, q: "What does the glymphatic system do?", opts: ["Regulates blood flow", "Clears metabolic waste from the brain during sleep", "Controls breathing", "Digests food"], correct: 1, explanation: "During deep sleep, the brain's glymphatic system clears out metabolic waste." },
  { factIdx: 20, q: "Which neurotransmitter is linked to migraine?", opts: ["Dopamine", "Serotonin", "Acetylcholine", "GABA"], correct: 1, explanation: "Serotonin levels fluctuate during migraine attacks and many migraine medications target serotonin receptors." },
  { factIdx: 22, q: "Where is the best place to rest during a migraine attack?", opts: ["Bright room", "Dark, quiet room", "Outdoors", "Gym"], correct: 1, explanation: "Lying in a dark, quiet room helps because the brain is hypersensitive to light and sound during an attack." },
  { factIdx: 23, q: "Which alcoholic drink is the most common migraine trigger?", opts: ["Beer", "White wine", "Red wine", "Vodka"], correct: 2, explanation: "Red wine is the most commonly reported alcoholic migraine trigger." },
  { factIdx: 26, q: "What percentage of children experience migraine?", opts: ["About 1%", "About 10%", "About 25%", "About 50%"], correct: 1, explanation: "About 10% of children experience migraines, often with different symptoms than adults." },
  { factIdx: 29, q: "Using acute migraine medication more than how many days per month can lead to medication overuse headache?", opts: ["5 days", "10 days", "15 days", "20 days"], correct: 1, explanation: "Using acute migraine medication more than 10 days per month can lead to medication overuse headaches." },
  { factIdx: 31, q: "What practice has been shown to reduce migraine frequency?", opts: ["Weightlifting", "Sprinting", "Regular yoga", "Swimming only"], correct: 2, explanation: "Regular yoga practice has been shown to reduce migraine frequency, intensity, and duration." },
  { factIdx: 33, q: "Which essential oil may help with migraine relief when inhaled?", opts: ["Tea tree", "Lavender", "Eucalyptus", "Rosemary"], correct: 1, explanation: "Lavender oil inhalation has shown some benefit for migraine relief." },
  { factIdx: 34, q: "What posture issue can trigger headaches?", opts: ["Slouching", "Forward head posture", "Leaning back", "Standing straight"], correct: 1, explanation: "Poor posture, especially forward head posture from phone use, can trigger cervicogenic headaches." },
  { factIdx: 37, q: "What level of dehydration can impair cognitive function?", opts: ["5-6%", "Even 1-2%", "10%", "15%"], correct: 1, explanation: "Even 1-2% dehydration can impair cognitive function, affecting concentration and memory." },
  { factIdx: 38, q: "What is the optimal bedroom temperature for sleep?", opts: ["55°F (13°C)", "65°F (18°C)", "75°F (24°C)", "85°F (29°C)"], correct: 1, explanation: "The optimal bedroom temperature for sleep is around 65°F (18°C)." },
  { factIdx: 39, q: "How long should a power nap ideally be?", opts: ["5 minutes", "10-20 minutes", "1 hour", "90 minutes"], correct: 1, explanation: "Short power naps of 10-20 minutes can help alleviate fatigue without disrupting nighttime sleep." },
  { factIdx: 40, q: "Which aromatherapy scent is NOT mentioned for sleep?", opts: ["Lavender", "Chamomile", "Peppermint", "Valerian root"], correct: 2, explanation: "Lavender, chamomile, and valerian root are aromatherapy scents for sleep. Peppermint is more associated with headache relief." },
  { factIdx: 41, q: "What type of exercise might trigger migraines?", opts: ["Walking", "Very high-intensity exercise", "Yoga", "Stretching"], correct: 1, explanation: "While moderate exercise helps, very high-intensity exercise can sometimes trigger attacks." },
  { factIdx: 42, q: "Which nerve becomes hypersensitive during migraine?", opts: ["Vagus nerve", "Trigeminal nerve", "Facial nerve", "Optic nerve"], correct: 1, explanation: "The trigeminal nerve becomes hypersensitive during migraine, sending pain signals to the brain." },
];

function seed() {
  initDB();

  // Seed default admin
  const adminHash = bcrypt.hashSync(config.defaultAdmin.password, 10);
  const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(config.defaultAdmin.email);
  if (!existingAdmin) {
    db.prepare('INSERT INTO users (email, password_hash, display_name, role) VALUES (?, ?, ?, ?)').run(
      config.defaultAdmin.email, adminHash, config.defaultAdmin.displayName, 'admin'
    );
    console.log(`Admin created: ${config.defaultAdmin.email} / ${config.defaultAdmin.password}`);
  }

  // Seed default doctor
  const doctorHash = bcrypt.hashSync(config.defaultDoctor.password, 10);
  const existingDoctor = db.prepare('SELECT id FROM users WHERE email = ?').get(config.defaultDoctor.email);
  if (!existingDoctor) {
    db.prepare('INSERT INTO users (email, password_hash, display_name, role) VALUES (?, ?, ?, ?)').run(
      config.defaultDoctor.email, doctorHash, config.defaultDoctor.displayName, 'doctor'
    );
    console.log(`Doctor created: ${config.defaultDoctor.email} / ${config.defaultDoctor.password}`);
  }

  // Seed facts
  const existingFacts = db.prepare('SELECT COUNT(*) as count FROM facts').get() as any;
  if (existingFacts.count === 0) {
    const insertFact = db.prepare('INSERT INTO facts (title, body, category, source) VALUES (?, ?, ?, ?)');
    for (const fact of FACTS) {
      insertFact.run(fact.title, fact.body, fact.category, fact.source);
    }
    console.log(`Seeded ${FACTS.length} facts`);
  }

  // Seed quizzes
  const existingQuiz = db.prepare('SELECT COUNT(*) as count FROM quiz_questions').get() as any;
  if (existingQuiz.count === 0) {
    const insertQuestion = db.prepare('INSERT INTO quiz_questions (fact_id, question, options, correct_index, explanation) VALUES (?, ?, ?, ?, ?)');
    for (const q of QUIZZES) {
      const factId = q.factIdx + 1; // Facts are 1-indexed
      insertQuestion.run(factId, q.q, JSON.stringify(q.opts), q.correct, q.explanation);
    }
    console.log(`Seeded ${QUIZZES.length} quiz questions`);
  }

  console.log('Seed complete!');
}

seed();
