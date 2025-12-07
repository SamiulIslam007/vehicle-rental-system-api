import bcrypt from 'bcryptjs';
import { pool, initDB } from './db';

const seed = async () => {
  try {
    console.log('Starting seed...');

    // Initialize database first
    await initDB();

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const adminQuery = `
      INSERT INTO users (name, email, password, phone, role)
      VALUES($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        password = EXCLUDED.password,
        phone = EXCLUDED.phone,
        role = EXCLUDED.role
      RETURNING id, name, email, phone, role
    `;

    const adminResult = await pool.query(adminQuery, [
      'Admin User',
      'admin@example.com',
      adminPassword,
      '+1234567890',
      'admin',
    ]);

    console.log('Admin user created:', adminResult.rows[0].email);

    // Create sample customer
    const customerPassword = await bcrypt.hash('customer123', 12);
    const customerQuery = `
      INSERT INTO users (name, email, password, phone, role)
      VALUES($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        password = EXCLUDED.password,
        phone = EXCLUDED.phone,
        role = EXCLUDED.role
      RETURNING id, name, email, phone, role
    `;

    const customerResult = await pool.query(customerQuery, [
      'John Doe',
      'customer@example.com',
      customerPassword,
      '+1234567891',
      'customer',
    ]);

    console.log('Customer user created:', customerResult.rows[0].email);

    // Create sample vehicles
    const vehicles = [
      {
        vehicle_name: 'Toyota Camry 2024',
        type: 'car',
        registration_number: 'ABC-1234',
        daily_rent_price: 50,
        availability_status: 'available',
      },
      {
        vehicle_name: 'Honda Civic 2023',
        type: 'car',
        registration_number: 'XYZ-5678',
        daily_rent_price: 45,
        availability_status: 'available',
      },
      {
        vehicle_name: 'Yamaha R15',
        type: 'bike',
        registration_number: 'BIKE-001',
        daily_rent_price: 25,
        availability_status: 'available',
      },
      {
        vehicle_name: 'Ford Transit',
        type: 'van',
        registration_number: 'VAN-2024',
        daily_rent_price: 70,
        availability_status: 'available',
      },
      {
        vehicle_name: 'Toyota Land Cruiser',
        type: 'SUV',
        registration_number: 'SUV-5000',
        daily_rent_price: 100,
        availability_status: 'available',
      },
    ];

    const vehicleQuery = `
      INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status)
      VALUES($1, $2, $3, $4, $5)
      ON CONFLICT (registration_number) DO UPDATE SET
        vehicle_name = EXCLUDED.vehicle_name,
        type = EXCLUDED.type,
        daily_rent_price = EXCLUDED.daily_rent_price,
        availability_status = EXCLUDED.availability_status
      RETURNING id, vehicle_name, registration_number
    `;

    for (const vehicle of vehicles) {
      const result = await pool.query(vehicleQuery, [
        vehicle.vehicle_name,
        vehicle.type,
        vehicle.registration_number,
        vehicle.daily_rent_price,
        vehicle.availability_status,
      ]);
      console.log(`Vehicle created: ${result.rows[0].vehicle_name}`);
    }

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seed:', error);
    process.exit(1);
  }
};

seed();

