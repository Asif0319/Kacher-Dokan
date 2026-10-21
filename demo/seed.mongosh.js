// Synthetic demo data only. Run with mongosh; see DEMO_SETUP.md.
(() => {
  const demo = db.getSiblingDB('kaser_dokan_demo');
  const now = new Date();
  const id = suffix => ObjectId('dd00000000000000000000' + suffix);
  const point = (lng, lat) => ({type: 'Point', coordinates: [lng, lat]});
  // Public demo password: 123456. Matches AuthService's scrypt format.
  const passwordHash = 'scrypt$64656d6f2d6b61636865722d646f6b616e$6aaa504f08a8c26a365536c3eaff6ea1ff2bfb8769cc7a407b019f6ea2e45f8a952615a22e995bd45e78fc9f352dea8658fdfc60fb57e035b34eb74db88c1217';
  const users = [
    ['01', 'Demo Customer', 'customer@example.com', 'USER', '00000000001'],
    ['02', 'Demo Seller', 'seller@example.com', 'SHOP_OWNER', '00000000002'],
    ['03', 'Demo Seller Two', 'seller2@example.com', 'SHOP_OWNER', '00000000003'],
    ['04', 'Demo Rider', 'rider@example.com', 'RIDER', '00000000004']
  ];
  for (const [key, name, email, role, phone] of users) {
    demo.users.updateOne({_id: id(key)}, {$setOnInsert: {
      _id: id(key), name, email, role, phone, passwordHash,
      active: true, preferredLanguage: 'bn', voiceLanguage: 'bn',
      address: 'Demo address, Uttara, Dhaka', location: point(90.4125, 23.8103),
      ...(role === 'RIDER' ? {riderAvailable: true, vehicleType: 'Bicycle', riderVerificationStatus: 'NOT_SUBMITTED'} : {}),
      createdAt: now, updatedAt: now
    }}, {upsert: true});
  }
  const shops = [
    ['11', '02', 'Demo Grocery', 'ডেমো মুদি দোকান', 90.4127, 23.8105],
    ['12', '03', 'Demo Daily Store', 'ডেমো নিত্যপণ্যের দোকান', 90.4132, 23.8098]
  ];
  for (const [key, owner, shopName, shopNameBn, lng, lat] of shops) {
    demo.shops.updateOne({_id: id(key)}, {$setOnInsert: {
      _id: id(key), ownerId: id(owner), shopName, shopNameBn,
      phone: owner === '02' ? '00000000002' : '00000000003',
      address: 'Demo address, Uttara, Dhaka', location: point(lng, lat),
      description: 'Synthetic sample shop for local testing.',
      approved: true, open: true, deliveryAvailable: true,
      deliveryFee: 20, minDeliveryOrder: 0, openingTime: '00:00', closingTime: '23:59',
      rating: 0, totalRatings: 0, imageUrl: '/images/products/grocery.svg',
      createdAt: now, updatedAt: now
    }}, {upsert: true});
  }
  const products = [
    ['21', '11', 'Rice', 'চাল', '1 kg', 70, 'rice'],
    ['22', '11', 'Lentils', 'মসুর ডাল', '500 g', 60, 'lentil'],
    ['23', '11', 'Eggs', 'ডিম', '4 pcs', 48, 'eggs'],
    ['24', '12', 'Milk', 'দুধ', '1 litre', 100, 'milk'],
    ['25', '12', 'Bread', 'পাউরুটি', '1 pack', 50, 'bread'],
    ['26', '12', 'Salt', 'লবণ', '1 kg', 40, 'salt']
  ];
  for (const [key, shop, name, nameBn, unit, price, image] of products) {
    demo.products.updateOne({_id: id(key)}, {$setOnInsert: {
      _id: id(key), shopId: id(shop), name, nameBn, unit, price,
      stock: NumberInt(50), available: true, category: 'Groceries',
      imageUrl: `/images/products/${image}.svg`, createdAt: now, updatedAt: now
    }}, {upsert: true});
  }
  demo.users.createIndex({email: 1}, {unique: true});
  demo.users.createIndex({phone: 1}, {unique: true});
  demo.shops.createIndex({location: '2dsphere'});
  demo.shops.createIndex({ownerId: 1});
  demo.products.createIndex({shopId: 1});
  demo.orders.createIndex({userId: 1});
  demo.orders.createIndex({shopId: 1});
  print('Demo data ready in kaser_dokan_demo: 4 accounts, 2 shops, 6 products.');
  print('Password for all demo accounts: 123456. See DEMO_SETUP.md.');
  print('Existing records, stock, passwords and orders were preserved.');
})();
