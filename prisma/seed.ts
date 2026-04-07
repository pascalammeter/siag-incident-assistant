import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with test incidents...');

  // Clean up existing data (dev only!)
  await prisma.incident.deleteMany();

  // Test incident 1: Ransomware
  const incident1 = await prisma.incident.create({
    data: {
      erkennungszeitpunkt: new Date('2026-04-06T10:30:00Z'),
      erkannt_durch: 'Security team - file encryption detected',
      betroffene_systeme: ['Exchange Server', 'File Server 3', 'Workstation-42'],
      erste_erkenntnisse: 'Multiple file extensions changed to .encrypted; ransom note found',
      incident_type: 'ransomware',
      severity: 'critical',
      q1: 1,
      q2: 1,
      q3: 0,
      playbook: {
        checkedSteps: [],
        status: 'in_progress',
      },
      regulatorische_meldungen: {
        isg_24h: '2026-04-07T10:30:00Z',
        dsg: true,
        finma_24h: null,
        finma_72h: null,
      },
      metadata: {
        tags: ['test', 'ransomware'],
        notes: 'Seed data for development',
        custom_fields: {},
      },
    },
  });

  // Test incident 2: Phishing
  const incident2 = await prisma.incident.create({
    data: {
      erkennungszeitpunkt: new Date('2026-04-05T14:15:00Z'),
      erkannt_durch: 'Email gateway - suspicious URL detection',
      betroffene_systeme: ['Email System'],
      erste_erkenntnisse: 'Phishing email with Office 365 login clone detected',
      incident_type: 'phishing',
      severity: 'high',
      q1: 0,
      q2: 1,
      q3: 1,
      playbook: {
        checkedSteps: [],
        status: 'in_progress',
      },
      regulatorische_meldungen: {
        isg_24h: '2026-04-06T14:15:00Z',
        dsg: false,
        finma_24h: null,
        finma_72h: null,
      },
      metadata: {
        tags: ['test', 'phishing'],
        notes: 'Seed data for development',
        custom_fields: {},
      },
    },
  });

  // Test incident 3: DDoS
  const incident3 = await prisma.incident.create({
    data: {
      erkennungszeitpunkt: new Date('2026-04-04T09:00:00Z'),
      erkannt_durch: 'Network monitoring - traffic spike',
      betroffene_systeme: ['Web Server', 'API Gateway'],
      erste_erkenntnisse: '5x normal traffic from multiple IPs; service degradation observed',
      incident_type: 'ddos',
      severity: 'high',
      q1: 1,
      q2: 0,
      q3: 1,
      playbook: {
        checkedSteps: [],
        status: 'completed',
      },
      regulatorische_meldungen: {
        isg_24h: null,
        dsg: false,
        finma_24h: '2026-04-05T09:00:00Z',
        finma_72h: null,
      },
      metadata: {
        tags: ['test', 'ddos'],
        notes: 'Seed data for development',
        custom_fields: {},
      },
    },
  });

  console.log('✓ Seed complete:');
  console.log(`  - Incident 1 (Ransomware): ${incident1.id}`);
  console.log(`  - Incident 2 (Phishing): ${incident2.id}`);
  console.log(`  - Incident 3 (DDoS): ${incident3.id}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
