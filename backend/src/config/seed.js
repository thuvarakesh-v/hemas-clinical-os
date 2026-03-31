require('dotenv').config();
const { connectDB } = require('./database');
const { Department, Allergy, Condition, Doctor, Admin, Staff } = require('../models');

async function seed() {
  await connectDB();

  // Departments
  const deptData = [
    { name: 'General Practice', description: 'General health consultations', icon: 'stethoscope' },
    { name: 'Cardiology', description: 'Heart and cardiovascular system', icon: 'heart' },
    { name: 'Neurology', description: 'Brain, spine and nervous system', icon: 'brain' },
    { name: 'Orthopedics', description: 'Bones, joints and muscles', icon: 'bone' },
    { name: 'Pediatrics', description: 'Children\'s health', icon: 'baby' },
    { name: 'Gynecology', description: 'Women\'s reproductive health', icon: 'female' },
    { name: 'Dermatology', description: 'Skin, hair and nails', icon: 'skin' },
    { name: 'Ophthalmology', description: 'Eye care', icon: 'eye' },
    { name: 'ENT', description: 'Ear, Nose and Throat', icon: 'ear' },
    { name: 'Psychiatry', description: 'Mental health', icon: 'mental' },
    { name: 'Oncology', description: 'Cancer treatment', icon: 'cancer' },
    { name: 'Endocrinology', description: 'Hormones and metabolism', icon: 'hormone' },
    { name: 'Gastroenterology', description: 'Digestive system', icon: 'stomach' },
    { name: 'Pulmonology', description: 'Lungs and respiratory system', icon: 'lungs' },
    { name: 'Urology', description: 'Urinary tract and male reproductive system', icon: 'urology' },
    { name: 'Emergency Medicine', description: 'Emergency care', icon: 'emergency' },
    { name: 'Radiology', description: 'Medical imaging', icon: 'xray' },
    { name: 'Laboratory', description: 'Diagnostic tests', icon: 'lab' },
  ];

  const departments = {};
  for (const d of deptData) {
    const [dept] = await Department.findOrCreate({ where: { name: d.name }, defaults: d });
    departments[d.name] = dept.id;
  }
  console.log('✅ Departments seeded');

  // Allergies
  const allergies = [
    { name: 'Penicillin', category: 'drug' }, { name: 'Aspirin', category: 'drug' },
    { name: 'Ibuprofen', category: 'drug' }, { name: 'Sulfonamides', category: 'drug' },
    { name: 'Codeine', category: 'drug' }, { name: 'Morphine', category: 'drug' },
    { name: 'Latex', category: 'latex' }, { name: 'Bee Sting', category: 'insect' },
    { name: 'Peanuts', category: 'food' }, { name: 'Tree Nuts', category: 'food' },
    { name: 'Shellfish', category: 'food' }, { name: 'Fish', category: 'food' },
    { name: 'Milk (Dairy)', category: 'food' }, { name: 'Eggs', category: 'food' },
    { name: 'Wheat/Gluten', category: 'food' }, { name: 'Soy', category: 'food' },
    { name: 'Pollen', category: 'environmental' }, { name: 'Dust Mites', category: 'environmental' },
    { name: 'Pet Dander', category: 'environmental' }, { name: 'Mold', category: 'environmental' },
    { name: 'Contrast Dye (Iodine)', category: 'drug' }, { name: 'NSAIDs', category: 'drug' },
  ];
  for (const a of allergies) await Allergy.findOrCreate({ where: { name: a.name }, defaults: a });
  console.log('✅ Allergies seeded');

  // Conditions
  const conditions = [
    { name: 'Type 1 Diabetes', category: 'Endocrine', icd_code: 'E10' },
    { name: 'Type 2 Diabetes', category: 'Endocrine', icd_code: 'E11' },
    { name: 'Hypertension', category: 'Cardiovascular', icd_code: 'I10' },
    { name: 'Asthma', category: 'Respiratory', icd_code: 'J45' },
    { name: 'COPD', category: 'Respiratory', icd_code: 'J44' },
    { name: 'Coronary Artery Disease', category: 'Cardiovascular', icd_code: 'I25' },
    { name: 'Heart Failure', category: 'Cardiovascular', icd_code: 'I50' },
    { name: 'Atrial Fibrillation', category: 'Cardiovascular', icd_code: 'I48' },
    { name: 'Epilepsy', category: 'Neurological', icd_code: 'G40' },
    { name: 'Migraine', category: 'Neurological', icd_code: 'G43' },
    { name: 'Hypothyroidism', category: 'Endocrine', icd_code: 'E03' },
    { name: 'Hyperthyroidism', category: 'Endocrine', icd_code: 'E05' },
    { name: 'Depression', category: 'Mental Health', icd_code: 'F32' },
    { name: 'Anxiety Disorder', category: 'Mental Health', icd_code: 'F41' },
    { name: 'Chronic Kidney Disease', category: 'Renal', icd_code: 'N18' },
    { name: 'Osteoporosis', category: 'Musculoskeletal', icd_code: 'M81' },
    { name: 'Arthritis', category: 'Musculoskeletal', icd_code: 'M13' },
    { name: 'HIV/AIDS', category: 'Infectious', icd_code: 'B20' },
    { name: 'Hepatitis B', category: 'Infectious', icd_code: 'B18.1' },
    { name: 'Hepatitis C', category: 'Infectious', icd_code: 'B18.2' },
    { name: 'Cancer (General)', category: 'Oncology', icd_code: 'C80' },
    { name: 'Obesity', category: 'Metabolic', icd_code: 'E66' },
    { name: 'Anemia', category: 'Hematologic', icd_code: 'D64' },
    { name: 'GERD', category: 'Gastrointestinal', icd_code: 'K21' },
    { name: 'IBS', category: 'Gastrointestinal', icd_code: 'K58' },
    { name: 'Psoriasis', category: 'Dermatological', icd_code: 'L40' },
    { name: 'Eczema', category: 'Dermatological', icd_code: 'L20' },
    { name: 'Sleep Apnea', category: 'Respiratory', icd_code: 'G47.3' },
    { name: 'Glaucoma', category: 'Ophthalmological', icd_code: 'H40' },
    { name: 'Chronic Pain', category: 'Pain', icd_code: 'G89.29' },
  ];
  for (const c of conditions) await Condition.findOrCreate({ where: { name: c.name }, defaults: c });
  console.log('✅ Conditions seeded');

  // Default Admin
  const [admin] = await Admin.findOrCreate({
    where: { username: 'superadmin' },
    defaults: {
      username: 'superadmin',
      password_hash: 'Admin@123456',
      email: 'admin@hospital.com',
      first_name: 'Super',
      last_name: 'Admin',
      is_super_admin: true,
    },
  });
  console.log('✅ Admin seeded - username: superadmin, password: Admin@123456');

  // Sample Doctors
  const sampleDoctors = [
    { username: 'dr.smith', password_hash: 'Doctor@123', email: 'dr.smith@hospital.com', first_name: 'James', last_name: 'Smith', specialization: 'General Practice', qualification: 'MBBS, MD', experience_years: 12, department_id: departments['General Practice'], consultation_fee: 50, rating: 4.8, patient_count: 1250, bio: 'Experienced general practitioner with 12 years of practice.' },
    { username: 'dr.chen', password_hash: 'Doctor@123', email: 'dr.chen@hospital.com', first_name: 'Li', last_name: 'Chen', specialization: 'Cardiology', qualification: 'MBBS, DM Cardiology', experience_years: 15, department_id: departments['Cardiology'], consultation_fee: 120, rating: 4.9, patient_count: 2100, bio: 'Leading cardiologist specializing in interventional cardiology.' },
    { username: 'dr.patel', password_hash: 'Doctor@123', email: 'dr.patel@hospital.com', first_name: 'Priya', last_name: 'Patel', specialization: 'Pediatrics', qualification: 'MBBS, DCH', experience_years: 8, department_id: departments['Pediatrics'], consultation_fee: 60, rating: 4.7, patient_count: 800, bio: 'Compassionate pediatrician focused on child wellness.' },
    { username: 'dr.johnson', password_hash: 'Doctor@123', email: 'dr.johnson@hospital.com', first_name: 'Sarah', last_name: 'Johnson', specialization: 'Neurology', qualification: 'MBBS, DM Neurology', experience_years: 18, department_id: departments['Neurology'], consultation_fee: 150, rating: 4.95, patient_count: 1800, bio: 'Expert neurologist with subspecialty in epilepsy and stroke.' },
    { username: 'dr.rahman', password_hash: 'Doctor@123', email: 'dr.rahman@hospital.com', first_name: 'Omar', last_name: 'Rahman', specialization: 'Orthopedics', qualification: 'MBBS, MS Ortho', experience_years: 10, department_id: departments['Orthopedics'], consultation_fee: 100, rating: 4.6, patient_count: 950, bio: 'Orthopedic surgeon specializing in joint replacement and sports injuries.' },
    { username: 'dr.silva', password_hash: 'Doctor@123', email: 'dr.silva@hospital.com', first_name: 'Maria', last_name: 'Silva', specialization: 'Dermatology', qualification: 'MBBS, DD', experience_years: 7, department_id: departments['Dermatology'], consultation_fee: 80, rating: 4.7, patient_count: 600, bio: 'Dermatologist specializing in skin conditions and cosmetic dermatology.' },
  ];
  for (const d of sampleDoctors) await Doctor.findOrCreate({ where: { username: d.username }, defaults: d });
  console.log('✅ Sample doctors seeded');

  // Sample Staff
  const sampleStaff = [
    { username: 'staff.medical1', password_hash: 'Staff@123', email: 'medical1@hospital.com', first_name: 'Alice', last_name: 'Nurse', role: 'medical_staff', employee_id: 'MS001' },
    { username: 'staff.lab1', password_hash: 'Staff@123', email: 'lab1@hospital.com', first_name: 'Bob', last_name: 'Tech', role: 'lab_technician', employee_id: 'LT001' },
    { username: 'staff.med1', password_hash: 'Staff@123', email: 'med1@hospital.com', first_name: 'Carol', last_name: 'Pharmacy', role: 'medicine_staff', employee_id: 'MS002' },
    { username: 'receptionist1', password_hash: 'Staff@123', email: 'reception1@hospital.com', first_name: 'David', last_name: 'Reception', role: 'receptionist', employee_id: 'RC001' },
  ];
  for (const s of sampleStaff) await Staff.findOrCreate({ where: { username: s.username }, defaults: s });
  console.log('✅ Sample staff seeded');

  console.log('\n🏥 Database seeded successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin Login:   superadmin / Admin@123456');
  console.log('Doctor Login:  dr.smith / Doctor@123');
  console.log('Staff Login:   staff.medical1 / Staff@123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
