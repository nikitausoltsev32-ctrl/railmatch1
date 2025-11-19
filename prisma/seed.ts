import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начинаем сидирование базы данных...');

  // Очищаем существующие данные
  console.log('🗑️  Очистка существующих данных...');
  await prisma.dealStatusHistory.deleteMany();
  await prisma.message.deleteMany();
  await prisma.thread.deleteMany();
  await prisma.match.deleteMany();
  await prisma.analyticsSnapshot.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.request.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  // Создаем компании
  console.log('🏢 Создание компаний...');
  
  const operatorCompany = await prisma.company.create({
    data: {
      name: 'ЖД Логистика',
      inn: '7701234567',
      description: 'Крупнейший оператор железнодорожного транспорта в России',
      isOperator: true,
      isSeeker: false,
    },
  });

  const seekerCompany = await prisma.company.create({
    data: {
      name: 'Уральский Металлургический Завод',
      inn: '6601987654',
      description: 'Производитель металлопродукции с полным циклом',
      isOperator: false,
      isSeeker: true,
    },
  });

  // Создаем пользователей
  console.log('👥 Создание пользователей...');
  
  const operatorUser1 = await prisma.user.create({
    data: {
      email: 'manager@zhd-logistics.ru',
      name: 'Иванов Иван Иванович',
      role: 'OPERATOR',
      companyId: operatorCompany.id,
    },
  });

  const operatorUser2 = await prisma.user.create({
    data: {
      email: 'dispatcher@zhd-logistics.ru',
      name: 'Петрова Мария Сергеевна',
      role: 'OPERATOR',
      companyId: operatorCompany.id,
    },
  });

  const seekerUser1 = await prisma.user.create({
    data: {
      email: 'logist@umz.ru',
      name: 'Сидоров Петр Алексеевич',
      role: 'SEEKER',
      companyId: seekerCompany.id,
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@railmatch.ru',
      name: 'Администратор Системы',
      role: 'ADMIN',
      companyId: null,
    },
  });

  // Создаем предложения (offers)
  console.log('🚂 Создание предложений...');
  
  const offer1 = await prisma.offer.create({
    data: {
      companyId: operatorCompany.id,
      createdById: operatorUser1.id,
      wagonType: 'GONDOLA',
      cargoType: 'COAL',
      wagonCount: 50,
      departureStation: 'Кузбасс',
      departureRegion: 'Кемеровская область',
      arrivalStation: 'Новосибирск',
      arrivalRegion: 'Новосибирская область',
      availableFrom: new Date('2024-12-01'),
      availableUntil: new Date('2024-12-31'),
      pricePerWagon: 45000,
      description: 'Полувагоны для перевозки угля, в хорошем техническом состоянии',
    },
  });

  const offer2 = await prisma.offer.create({
    data: {
      companyId: operatorCompany.id,
      createdById: operatorUser2.id,
      wagonType: 'PLATFORM',
      cargoType: 'METAL',
      wagonCount: 30,
      departureStation: 'Екатеринбург',
      departureRegion: 'Свердловская область',
      arrivalStation: 'Москва',
      arrivalRegion: 'Московская область',
      availableFrom: new Date('2024-11-25'),
      availableUntil: new Date('2024-12-25'),
      pricePerWagon: 52000,
      description: 'Платформы для металлопроката, грузоподъемность 70 тонн',
    },
  });

  const offer3 = await prisma.offer.create({
    data: {
      companyId: operatorCompany.id,
      createdById: operatorUser1.id,
      wagonType: 'TANK',
      cargoType: 'OIL',
      wagonCount: 20,
      departureStation: 'Самара',
      departureRegion: 'Самарская область',
      arrivalStation: 'Санкт-Петербург',
      arrivalRegion: 'Ленинградская область',
      availableFrom: new Date('2024-12-05'),
      availableUntil: new Date('2024-12-20'),
      pricePerWagon: 68000,
      description: 'Цистерны для нефтепродуктов, сертифицированы',
    },
  });

  // Создаем заявки (requests)
  console.log('📋 Создание заявок...');
  
  const request1 = await prisma.request.create({
    data: {
      companyId: seekerCompany.id,
      createdById: seekerUser1.id,
      cargoType: 'METAL',
      wagonType: 'PLATFORM',
      cargoWeight: 2100,
      departureStation: 'Екатеринбург',
      departureRegion: 'Свердловская область',
      arrivalStation: 'Москва',
      arrivalRegion: 'Московская область',
      loadingDate: new Date('2024-12-01'),
      requiredByDate: new Date('2024-12-15'),
      maxPricePerWagon: 55000,
      description: 'Срочная перевозка металлопроката на стройку',
    },
  });

  const request2 = await prisma.request.create({
    data: {
      companyId: seekerCompany.id,
      createdById: seekerUser1.id,
      cargoType: 'COAL',
      wagonType: 'GONDOLA',
      cargoWeight: 3000,
      departureStation: 'Кемерово',
      departureRegion: 'Кемеровская область',
      arrivalStation: 'Новосибирск',
      arrivalRegion: 'Новосибирская область',
      loadingDate: new Date('2024-12-05'),
      requiredByDate: new Date('2024-12-20'),
      maxPricePerWagon: 48000,
      description: 'Перевозка угля для энергетического комплекса',
    },
  });

  const request3 = await prisma.request.create({
    data: {
      companyId: seekerCompany.id,
      createdById: seekerUser1.id,
      cargoType: 'GRAIN',
      wagonType: 'HOPPER',
      cargoWeight: 1500,
      departureStation: 'Омск',
      departureRegion: 'Омская область',
      arrivalStation: 'Казань',
      arrivalRegion: 'Республика Татарстан',
      loadingDate: new Date('2024-12-10'),
      requiredByDate: new Date('2024-12-25'),
      maxPricePerWagon: 42000,
      description: 'Транспортировка зерна на элеватор',
    },
  });

  // Создаем совпадения (matches)
  console.log('🤝 Создание совпадений...');
  
  const match1 = await prisma.match.create({
    data: {
      offerId: offer2.id,
      requestId: request1.id,
      score: 0.95,
      status: 'ACCEPTED',
      metadata: JSON.stringify({
        distanceMatch: 1.0,
        dateMatch: 0.9,
        priceMatch: 0.95,
        cargoTypeMatch: 1.0,
      }),
    },
  });

  const match2 = await prisma.match.create({
    data: {
      offerId: offer1.id,
      requestId: request2.id,
      score: 0.88,
      status: 'PENDING',
      metadata: JSON.stringify({
        distanceMatch: 0.95,
        dateMatch: 0.85,
        priceMatch: 0.92,
        cargoTypeMatch: 1.0,
      }),
    },
  });

  const match3 = await prisma.match.create({
    data: {
      offerId: offer3.id,
      requestId: request3.id,
      score: 0.65,
      status: 'REJECTED',
      metadata: JSON.stringify({
        distanceMatch: 0.7,
        dateMatch: 0.8,
        priceMatch: 0.5,
        cargoTypeMatch: 0.0,
      }),
    },
  });

  // Создаем треды (threads) и сообщения (messages)
  console.log('💬 Создание диалогов...');
  
  const thread1 = await prisma.thread.create({
    data: {
      matchId: match1.id,
      subject: 'Обсуждение перевозки металлопроката',
      isActive: true,
    },
  });

  await prisma.message.create({
    data: {
      threadId: thread1.id,
      senderId: seekerUser1.id,
      content: 'Добрый день! Заинтересованы в вашем предложении. Можем ли мы обсудить детали?',
      isRead: true,
    },
  });

  await prisma.message.create({
    data: {
      threadId: thread1.id,
      senderId: operatorUser2.id,
      content: 'Здравствуйте! Конечно, готовы к сотрудничеству. Какие детали вас интересуют?',
      isRead: true,
    },
  });

  await prisma.message.create({
    data: {
      threadId: thread1.id,
      senderId: seekerUser1.id,
      content: 'Нам нужно уточнить даты погрузки и возможность предоставления документов.',
      isRead: false,
    },
  });

  const thread2 = await prisma.thread.create({
    data: {
      requestId: request2.id,
      subject: 'Вопрос по заявке на уголь',
      isActive: true,
    },
  });

  await prisma.message.create({
    data: {
      threadId: thread2.id,
      senderId: operatorUser1.id,
      content: 'У нас есть подходящие вагоны. Хотели бы обсудить условия.',
      isRead: false,
    },
  });

  // Создаем историю статусов
  console.log('📊 Создание истории статусов...');
  
  await prisma.dealStatusHistory.create({
    data: {
      matchId: match1.id,
      status: 'PENDING',
      comment: 'Создано новое совпадение',
    },
  });

  await prisma.dealStatusHistory.create({
    data: {
      matchId: match1.id,
      status: 'NEGOTIATING',
      comment: 'Начаты переговоры между сторонами',
    },
  });

  await prisma.dealStatusHistory.create({
    data: {
      matchId: match1.id,
      status: 'ACCEPTED',
      comment: 'Сделка принята обеими сторонами',
    },
  });

  // Создаем аналитические снимки
  console.log('📈 Создание аналитических данных...');
  
  await prisma.analyticsSnapshot.create({
    data: {
      companyId: operatorCompany.id,
      date: new Date('2024-11-01'),
      activeOffers: 3,
      activeRequests: 0,
      matchesCount: 3,
      dealsCompleted: 1,
      revenue: 1560000,
    },
  });

  await prisma.analyticsSnapshot.create({
    data: {
      companyId: seekerCompany.id,
      date: new Date('2024-11-01'),
      activeOffers: 0,
      activeRequests: 3,
      matchesCount: 3,
      dealsCompleted: 1,
      revenue: 0,
    },
  });

  console.log('✅ Сидирование завершено успешно!');
  console.log(`   - Компаний: 2`);
  console.log(`   - Пользователей: 4`);
  console.log(`   - Предложений: 3`);
  console.log(`   - Заявок: 3`);
  console.log(`   - Совпадений: 3`);
  console.log(`   - Диалогов: 2`);
  console.log(`   - Сообщений: 4`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при сидировании:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
