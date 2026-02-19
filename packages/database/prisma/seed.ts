import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create company
  const company = await prisma.company.upsert({
    where: { cnpj: '12.345.678/0001-90' },
    update: {},
    create: {
      name: 'FastBurger Franquias Ltda',
      cnpj: '12.345.678/0001-90',
      planType: 'PRO',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Company created:', company.name);

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@fastteam.com' },
    update: {},
    create: {
      email: 'admin@fastteam.com',
      password: hashedPassword,
      fullName: 'Admin FastTeam',
      userType: 'ADMIN',
      companyId: company.id,
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create manager user
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@fastteam.com' },
    update: {},
    create: {
      email: 'manager@fastteam.com',
      password: hashedPassword,
      fullName: 'João Silva',
      userType: 'MANAGER',
      companyId: company.id,
    },
  });

  // Create store
  const store = await prisma.store.upsert({
    where: { id: 'store-seed-1' },
    update: {},
    create: {
      id: 'store-seed-1',
      companyId: company.id,
      name: 'FastBurger - Centro',
      address: {
        street: 'Av. Paulista',
        number: '1000',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100',
      },
      lat: -23.5614,
      lng: -46.6558,
      managerId: managerUser.id,
    },
  });

  console.log('✅ Store created:', store.name);

  // Create achievements
  const achievements = [
    {
      code: 'FIRST_DAY',
      name: 'Primeiro Dia',
      description: 'Completou o primeiro dia de trabalho',
      points: 100,
      criteria: { type: 'days_worked', value: 1 },
    },
    {
      code: 'PUNCTUALITY_STAR',
      name: 'Estrela da Pontualidade',
      description: 'Chegou no horário por 30 dias consecutivos',
      points: 500,
      criteria: { type: 'consecutive_punctual_days', value: 30 },
    },
    {
      code: 'TEAM_PLAYER',
      name: 'Jogador de Equipe',
      description: 'Indicou 3 amigos que foram contratados',
      points: 300,
      criteria: { type: 'referrals_hired', value: 3 },
    },
    {
      code: 'GIG_MASTER',
      name: 'Mestre dos Gigs',
      description: 'Completou 10 trabalhos como intermitente',
      points: 400,
      criteria: { type: 'gigs_completed', value: 10 },
    },
    {
      code: 'TOP_RATED',
      name: 'Avaliação Máxima',
      description: 'Manteve avaliação 5 estrelas por 5 gigs consecutivos',
      points: 600,
      criteria: { type: 'consecutive_5star_ratings', value: 5 },
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { code: achievement.code },
      update: {},
      create: achievement,
    });
  }

  console.log('✅ Achievements created');

  // Create sample employee user
  const empUser = await prisma.user.upsert({
    where: { email: 'funcionario@fastteam.com' },
    update: {},
    create: {
      email: 'funcionario@fastteam.com',
      password: hashedPassword,
      fullName: 'Maria Santos',
      userType: 'EMPLOYEE',
      companyId: company.id,
      phone: '(11) 99999-0001',
    },
  });

  await prisma.employee.upsert({
    where: { userId: empUser.id },
    update: {},
    create: {
      userId: empUser.id,
      companyId: company.id,
      storeId: store.id,
      position: 'Atendente',
      positionLevel: 'Junior',
      hireDate: new Date('2024-01-15'),
      salary: 1800.00,
      contractType: 'CLT',
    },
  });

  console.log('✅ Sample employee created');

  // Create intermittent worker
  const intermUser = await prisma.user.upsert({
    where: { email: 'intermitente@fastteam.com' },
    update: {},
    create: {
      email: 'intermitente@fastteam.com',
      password: hashedPassword,
      fullName: 'Pedro Costa',
      userType: 'INTERMITTENT',
      phone: '(11) 99999-0002',
      metadata: { lat: -23.5630, lng: -46.6543 },
    },
  });

  await prisma.intermittentWorker.upsert({
    where: { userId: intermUser.id },
    update: {},
    create: {
      userId: intermUser.id,
      level: 'SILVER',
      hourlyRate: 25.00,
      rating: 4.8,
      totalHours: 120,
      totalJobs: 15,
      attendanceRate: 98.5,
      skills: ['atendimento', 'caixa', 'limpeza'],
    },
  });

  console.log('✅ Sample intermittent worker created');

  // Create sample jobs
  await prisma.job.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'job-seed-1',
        companyId: company.id,
        storeId: store.id,
        title: 'Atendente de Balcão',
        description: 'Responsável pelo atendimento de clientes no balcão, preparação de pedidos e manutenção da limpeza da área de trabalho.',
        jobType: 'CLT',
        positionLevel: 'Junior',
        salaryMin: 1600,
        salaryMax: 1900,
        requirements: {
          education: 'Ensino Médio',
          experience: '0-1 anos',
          skills: ['comunicação', 'trabalho em equipe'],
        },
        status: 'ACTIVE',
        createdBy: adminUser.id,
      },
      {
        id: 'job-seed-2',
        companyId: company.id,
        storeId: store.id,
        title: 'Cozinheiro',
        description: 'Responsável pelo preparo de alimentos seguindo padrões de qualidade e higiene da rede.',
        jobType: 'CLT',
        positionLevel: 'Pleno',
        salaryMin: 2000,
        salaryMax: 2500,
        requirements: {
          education: 'Ensino Médio',
          experience: '1-2 anos em alimentação',
          skills: ['culinária', 'higiene alimentar'],
        },
        status: 'ACTIVE',
        createdBy: adminUser.id,
      },
    ],
  });

  console.log('✅ Sample jobs created');
  console.log('\n🎉 Seed completed successfully!');
  console.log('\nLogin credentials:');
  console.log('  Admin:     admin@fastteam.com / admin123');
  console.log('  Manager:   manager@fastteam.com / admin123');
  console.log('  Employee:  funcionario@fastteam.com / admin123');
  console.log('  Intermit.: intermitente@fastteam.com / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
