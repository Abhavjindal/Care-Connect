// seed-patients.js — uses Node built-in fetch (Node 18+)

const BASE_URL = 'http://localhost:5000';

const patients = [
  { name: 'Abhey',       email: 'abhey@gmail.com' },
  { name: 'Divyanshu',   email: 'divyanshu@gmail.com' },
  { name: 'Pratyaksh',   email: 'pratyaksh@gmail.com' },
  { name: 'Garry',       email: 'garry@gmail.com' },
  { name: 'Gurman',      email: 'gurman@gmail.com' },
  { name: 'Harshinder',  email: 'harshinder@gmail.com' },
  { name: 'Vedant',      email: 'vedant@gmail.com' },
  { name: 'Jaskaran',    email: 'jaskaran@gmail.com' },
  { name: 'Taaran',      email: 'taaran@gmail.com' },
];

const PASSWORD = '11223344';

const timeSlots = [
  '9-10 AM', '10-11 AM', '11-12 PM', '1-2 PM', '2-3 PM',
  '3-4 PM', '4-5 PM', '5-6 PM', '6-7 PM'
];

const dates = [
  '2026-06-01','2026-06-02','2026-06-03','2026-06-04','2026-06-05',
  '2026-06-06','2026-06-07','2026-06-08','2026-06-09'
];

const phones = [
  '9876543210','9812345678','9823456789','9834567890','9845678901',
  '9856789012','9867890123','9878901234','9889012345'
];

async function postJSON(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { error: text }; }
}

async function main() {
  // 1. Test connection
  const testRes = await fetch(`${BASE_URL}/api/test`);
  const testData = await testRes.json();
  console.log('Backend test:', testData.message);

  // 2. Fetch available doctors
  const doctorsRes = await fetch(`${BASE_URL}/api/doctors`);
  const doctors = await doctorsRes.json();

  if (!Array.isArray(doctors) || doctors.length === 0) {
    console.error('No doctors found! Is the backend running?');
    process.exit(1);
  }

  console.log(`\nFound ${doctors.length} doctors:`);
  doctors.slice(0, 9).forEach((d, i) => console.log(`  [${i}] ${d.Name} — ${d.Field}`));
  console.log('');

  // 3. Create each patient & book their appointment
  for (let i = 0; i < patients.length; i++) {
    const { name, email } = patients[i];
    const doctor = doctors[i % doctors.length];

    // Sign up
    const signupRes = await postJSON('/api/auth/signup', { name, email, password: PASSWORD });

    if (signupRes.token) {
      console.log(`[${i+1}] ✅ Created account: ${name} (${email})`);
    } else if (signupRes.message === 'Email is already registered') {
      console.log(`[${i+1}] ⚠️  Already exists: ${email}`);
    } else {
      console.log(`[${i+1}] ❌ Signup failed for ${name}:`, signupRes.message || signupRes.error);
      continue;
    }

    // Login to get token
    const loginRes = await postJSON('/api/auth/login', { email, password: PASSWORD });
    if (!loginRes.token) {
      console.log(`     ❌ Login failed for ${name}:`, loginRes.message);
      continue;
    }

    // Book appointment
    const apptBody = {
      userName:   name,
      userEmail:  email,
      phone:      phones[i],
      date:       dates[i],
      time:       timeSlots[i],
      department: doctor.Field,
      doctor:     doctor.Name,
      message:    `Routine checkup with ${doctor.Name}`,
    };

    const apptRes = await postJSON('/api/appointments', apptBody);
    if (apptRes.appointment) {
      console.log(`     📅 Booked → ${doctor.Name} (${doctor.Field}) on ${dates[i]} at ${timeSlots[i]}`);
    } else {
      console.log(`     ❌ Appointment failed:`, apptRes.message || apptRes.error);
    }
  }

  console.log('\n🎉 All done! Patients created and appointments booked.');
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
