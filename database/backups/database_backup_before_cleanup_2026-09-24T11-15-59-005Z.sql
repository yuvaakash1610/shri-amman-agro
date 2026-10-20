-- Database Data Backup Created At 2026-09-24T11:15:59.086Z

-- Table: categories (2 records)
INSERT INTO "categories" ("category_id", "category_name", "description", "created_at") VALUES (1, 'Fertilizer', NULL, '2026-08-09T17:17:51.825Z');
INSERT INTO "categories" ("category_id", "category_name", "description", "created_at") VALUES (2, 'Pesticide', NULL, '2026-08-10T16:10:48.479Z');

-- Table: companies (2 records)
INSERT INTO "companies" ("company_id", "company_name", "contact_person", "phone", "email", "address", "gstin", "created_at", "updated_at") VALUES (6, 'akash', 'Yuvaakash K', '09994589432', 'yuvaakash16@gmail.com', 'no 20, siddartha nagar
kovilambakkam', NULL, '2026-08-09T17:17:21.505Z', '2026-08-09T17:17:21.505Z');
INSERT INTO "companies" ("company_id", "company_name", "contact_person", "phone", "email", "address", "gstin", "created_at", "updated_at") VALUES (7, 'Sabari crop care sciences', 'Sabari', '9865432678', 'sabari@gmail.com', 'Vellore', NULL, '2026-08-14T16:57:43.397Z', '2026-08-14T16:57:43.397Z');

-- Table: customers (7 records)
INSERT INTO "customers" ("id", "customer_id", "customer_name", "phone_number", "aadhaar_number", "address", "customer_type", "email", "created_at", "updated_at") VALUES (2, 'CUST-E89F92', 'Yuvaakash K', '9176018007', '236598237939', 'no 20, siddartha nagar
kovilambakkam', 'Farmer', 'yuvaakash16@gmail.com', '2026-08-08T16:17:27.003Z', '2026-08-08T16:34:14.840Z');
INSERT INTO "customers" ("id", "customer_id", "customer_name", "phone_number", "aadhaar_number", "address", "customer_type", "email", "created_at", "updated_at") VALUES (5, 'CUST-546633', 'vishnu.j', '9941194065', '237467576123', 'no:28,koudingaiyur,thendral nagar,chennai-600118', 'Dealer', 'jvishnu942008@gmail.com', '2026-08-10T01:50:03.252Z', '2026-08-10T01:50:03.252Z');
INSERT INTO "customers" ("id", "customer_id", "customer_name", "phone_number", "aadhaar_number", "address", "customer_type", "email", "created_at", "updated_at") VALUES (6, 'CUST-AA772E', 'Yuvaraj M', '8428539107', '722868822312', '8/30 vanniyar mettu street ,ayyappanthangal,chennai-56', 'Wholesaler', 'yuvi6054karthik@gmail.com', '2026-08-11T04:49:20.144Z', '2026-08-11T04:50:25.678Z');
INSERT INTO "customers" ("id", "customer_id", "customer_name", "phone_number", "aadhaar_number", "address", "customer_type", "email", "created_at", "updated_at") VALUES (7, 'CUST-26656F', 'sreekanth', '8220889747', '989471828391', 'kaniyakumari', 'Farmer', 'sreekanthaj23@gmail.com', '2026-08-11T15:47:29.622Z', '2026-08-11T15:47:29.622Z');
INSERT INTO "customers" ("id", "customer_id", "customer_name", "phone_number", "aadhaar_number", "address", "customer_type", "email", "created_at", "updated_at") VALUES (8, 'CUST-E8A1D9', 'kannan', '9894718182', '123456789012', 'Andiyappanur', 'Farmer', 'dee.kannan@hotmail.com', '2026-08-11T16:19:37.866Z', '2026-08-11T16:19:37.866Z');
INSERT INTO "customers" ("id", "customer_id", "customer_name", "phone_number", "aadhaar_number", "address", "customer_type", "email", "created_at", "updated_at") VALUES (9, 'CUST-B4207F', 'priya p', '9994589432', '987065432113', 'kovilambakkam', 'Farmer', 'priyasarathy2002@gmail.com', '2026-08-11T16:20:12.685Z', '2026-08-11T16:20:37.894Z');
INSERT INTO "customers" ("id", "customer_id", "customer_name", "phone_number", "aadhaar_number", "address", "customer_type", "email", "created_at", "updated_at") VALUES (10, 'CUST-D82044', 'Tharun v', '6374433825', '288145626889', 'arcot', 'Farmer', 'vt21250118@gmail.com', '2026-08-12T04:47:28.147Z', '2026-08-12T04:47:28.147Z');

-- Table: product_prices (3 records)
INSERT INTO "product_prices" ("price_id", "product_id", "purchase_price", "selling_price", "effective_from", "effective_to", "is_active") VALUES (1, 3, '100.00', '130.00', '2026-08-14T17:08:12.428Z', NULL, true);
INSERT INTO "product_prices" ("price_id", "product_id", "purchase_price", "selling_price", "effective_from", "effective_to", "is_active") VALUES (2, 2, '100.00', '150.00', '2026-08-26T07:31:37.548Z', NULL, true);
INSERT INTO "product_prices" ("price_id", "product_id", "purchase_price", "selling_price", "effective_from", "effective_to", "is_active") VALUES (3, 1, '200.00', '500.00', '2026-08-26T07:31:47.300Z', NULL, true);

-- Table: products (3 records)
INSERT INTO "products" ("product_id", "product_code", "product_name", "company_id", "category_id", "unit_id", "description", "status", "created_at", "hsn_code", "gst_rate") VALUES (1, 'PRD-B15C5D', 'My fertilizer', 6, 1, 1, NULL, 'Active', '2026-08-09T17:18:32.373Z', NULL, '0.00');
INSERT INTO "products" ("product_id", "product_code", "product_name", "company_id", "category_id", "unit_id", "description", "status", "created_at", "hsn_code", "gst_rate") VALUES (2, 'PRD-FBA89D', 'pest', 6, 2, 1, NULL, 'Active', '2026-08-10T16:20:41.640Z', NULL, '0.00');
INSERT INTO "products" ("product_id", "product_code", "product_name", "company_id", "category_id", "unit_id", "description", "status", "created_at", "hsn_code", "gst_rate") VALUES (3, 'PRD-FFB743', 'Hmp', 7, 2, 1, NULL, 'Active', '2026-08-14T17:00:33.375Z', NULL, '0.00');

-- Table: purchase_items (6 records)
INSERT INTO "purchase_items" ("purchase_item_id", "purchase_id", "product_id", "quantity", "purchase_price", "total_amount") VALUES (1, 1, 1, 10, '100.00', '1000.00');
INSERT INTO "purchase_items" ("purchase_item_id", "purchase_id", "product_id", "quantity", "purchase_price", "total_amount") VALUES (2, 2, 2, 100, '49.71', '4971.00');
INSERT INTO "purchase_items" ("purchase_item_id", "purchase_id", "product_id", "quantity", "purchase_price", "total_amount") VALUES (3, 3, 2, 100, '50.00', '5000.00');
INSERT INTO "purchase_items" ("purchase_item_id", "purchase_id", "product_id", "quantity", "purchase_price", "total_amount") VALUES (4, 4, 2, 100, '50.00', '5000.00');
INSERT INTO "purchase_items" ("purchase_item_id", "purchase_id", "product_id", "quantity", "purchase_price", "total_amount") VALUES (5, 5, 2, 20, '120.00', '2400.00');
INSERT INTO "purchase_items" ("purchase_item_id", "purchase_id", "product_id", "quantity", "purchase_price", "total_amount") VALUES (6, 6, 3, 10, '100.00', '1000.00');

-- Table: purchases (6 records)
INSERT INTO "purchases" ("purchase_id", "company_id", "purchase_date", "invoice_number", "total_amount", "notes", "created_at") VALUES (1, 6, '2026-08-09T18:30:00.000Z', NULL, '1000.00', NULL, '2026-08-10T16:05:24.536Z');
INSERT INTO "purchases" ("purchase_id", "company_id", "purchase_date", "invoice_number", "total_amount", "notes", "created_at") VALUES (2, 6, '2026-08-09T18:30:00.000Z', NULL, '4971.00', NULL, '2026-08-10T16:21:02.647Z');
INSERT INTO "purchases" ("purchase_id", "company_id", "purchase_date", "invoice_number", "total_amount", "notes", "created_at") VALUES (3, 6, '2026-08-10T18:30:00.000Z', NULL, '5000.00', NULL, '2026-08-11T04:52:27.009Z');
INSERT INTO "purchases" ("purchase_id", "company_id", "purchase_date", "invoice_number", "total_amount", "notes", "created_at") VALUES (4, 6, '2026-08-11T18:30:00.000Z', NULL, '5000.00', NULL, '2026-08-12T13:47:07.052Z');
INSERT INTO "purchases" ("purchase_id", "company_id", "purchase_date", "invoice_number", "total_amount", "notes", "created_at") VALUES (5, 6, '2026-08-11T18:30:00.000Z', NULL, '2400.00', NULL, '2026-08-12T13:48:00.657Z');
INSERT INTO "purchases" ("purchase_id", "company_id", "purchase_date", "invoice_number", "total_amount", "notes", "created_at") VALUES (6, 7, '2026-08-13T18:30:00.000Z', NULL, '1000.00', NULL, '2026-08-14T17:01:57.145Z');

-- Table: sale_items (14 records)
INSERT INTO "sale_items" ("sale_item_id", "sale_id", "product_id", "quantity", "selling_price", "total_amount", "gst_rate", "cgst_amount", "sgst_amount") VALUES (1, 1, 1, 15, '150.00', '2250.00', '0.00', '0.00', '0.00');
INSERT INTO "sale_items" ("sale_item_id", "sale_id", "product_id", "quantity", "selling_price", "total_amount", "gst_rate", "cgst_amount", "sgst_amount") VALUES (2, 2, 1, 1, '129.70', '129.70', '0.00', '0.00', '0.00');
INSERT INTO "sale_items" ("sale_item_id", "sale_id", "product_id", "quantity", "selling_price", "total_amount", "gst_rate", "cgst_amount", "sgst_amount") VALUES (3, 3, 1, 3, '110.00', '330.00', '0.00', '0.00', '0.00');
INSERT INTO "sale_items" ("sale_item_id", "sale_id", "product_id", "quantity", "selling_price", "total_amount", "gst_rate", "cgst_amount", "sgst_amount") VALUES (4, 4, 2, 100, '99.79', '9979.00', '0.00', '0.00', '0.00');
INSERT INTO "sale_items" ("sale_item_id", "sale_id", "product_id", "quantity", "selling_price", "total_amount", "gst_rate", "cgst_amount", "sgst_amount") VALUES (5, 5, 1, 1, '100.05', '100.05', '0.00', '0.00', '0.00');
INSERT INTO "sale_items" ("sale_item_id", "sale_id", "product_id", "quantity", "selling_price", "total_amount", "gst_rate", "cgst_amount", "sgst_amount") VALUES (6, 6, 2, 12, '10.00', '120.00', '0.00', '0.00', '0.00');
INSERT INTO "sale_items" ("sale_item_id", "sale_id", "product_id", "quantity", "selling_price", "total_amount", "gst_rate", "cgst_amount", "sgst_amount") VALUES (7, 7, 2, 28, '100.00', '2800.00', '0.00', '0.00', '0.00');
INSERT INTO "sale_items" ("sale_item_id", "sale_id", "product_id", "quantity", "selling_price", "total_amount", "gst_rate", "cgst_amount", "sgst_amount") VALUES (8, 8, 2, 10, '150.00', '1500.00', '0.00', '0.00', '0.00');
INSERT INTO "sale_items" ("sale_item_id", "sale_id", "product_id", "quantity", "selling_price", "total_amount", "gst_rate", "cgst_amount", "sgst_amount") VALUES (9, 9, 2, 14, '120.00', '1680.00', '0.00', '0.00', '0.00');
INSERT INTO "sale_items" ("sale_item_id", "sale_id", "product_id", "quantity", "selling_price", "total_amount", "gst_rate", "cgst_amount", "sgst_amount") VALUES (10, 10, 2, 6, '100.00', '600.00', '0.00', '0.00', '0.00');
INSERT INTO "sale_items" ("sale_item_id", "sale_id", "product_id", "quantity", "selling_price", "total_amount", "gst_rate", "cgst_amount", "sgst_amount") VALUES (11, 11, 2, 30, '100.00', '3000.00', '0.00', '0.00', '0.00');
INSERT INTO "sale_items" ("sale_item_id", "sale_id", "product_id", "quantity", "selling_price", "total_amount", "gst_rate", "cgst_amount", "sgst_amount") VALUES (12, 12, 2, 50, '99.83', '4991.50', '0.00', '0.00', '0.00');
INSERT INTO "sale_items" ("sale_item_id", "sale_id", "product_id", "quantity", "selling_price", "total_amount", "gst_rate", "cgst_amount", "sgst_amount") VALUES (13, 13, 3, 2, '120.00', '252.00', '5.00', '6.00', '6.00');
INSERT INTO "sale_items" ("sale_item_id", "sale_id", "product_id", "quantity", "selling_price", "total_amount", "gst_rate", "cgst_amount", "sgst_amount") VALUES (14, 14, 3, 5, '500.00', '2500.00', '0.00', '0.00', '0.00');

-- Table: sales (14 records)
INSERT INTO "sales" ("sale_id", "customer_id", "sale_date", "invoice_number", "total_amount", "notes", "created_at") VALUES (1, 2, '2026-08-09T18:30:00.000Z', NULL, '2250.00', NULL, '2026-08-10T16:06:13.836Z');
INSERT INTO "sales" ("sale_id", "customer_id", "sale_date", "invoice_number", "total_amount", "notes", "created_at") VALUES (2, 5, '2026-08-09T18:30:00.000Z', NULL, '129.70', NULL, '2026-08-10T16:07:14.911Z');
INSERT INTO "sales" ("sale_id", "customer_id", "sale_date", "invoice_number", "total_amount", "notes", "created_at") VALUES (3, 5, '2026-08-09T18:30:00.000Z', NULL, '330.00', NULL, '2026-08-10T16:07:45.402Z');
INSERT INTO "sales" ("sale_id", "customer_id", "sale_date", "invoice_number", "total_amount", "notes", "created_at") VALUES (4, 2, '2026-08-09T18:30:00.000Z', NULL, '9979.00', NULL, '2026-08-10T16:41:11.679Z');
INSERT INTO "sales" ("sale_id", "customer_id", "sale_date", "invoice_number", "total_amount", "notes", "created_at") VALUES (5, 6, '2026-08-10T18:30:00.000Z', NULL, '100.05', NULL, '2026-08-11T04:51:25.893Z');
INSERT INTO "sales" ("sale_id", "customer_id", "sale_date", "invoice_number", "total_amount", "notes", "created_at") VALUES (6, 2, '2026-08-10T18:30:00.000Z', 'SAAT0001', '120.00', NULL, '2026-08-11T14:25:00.259Z');
INSERT INTO "sales" ("sale_id", "customer_id", "sale_date", "invoice_number", "total_amount", "notes", "created_at") VALUES (7, 7, '2026-08-10T18:30:00.000Z', 'SAAT0002', '2800.00', NULL, '2026-08-11T15:48:39.666Z');
INSERT INTO "sales" ("sale_id", "customer_id", "sale_date", "invoice_number", "total_amount", "notes", "created_at") VALUES (8, 9, '2026-08-10T18:30:00.000Z', 'SAAT0003', '1500.00', NULL, '2026-08-11T16:21:10.309Z');
INSERT INTO "sales" ("sale_id", "customer_id", "sale_date", "invoice_number", "total_amount", "notes", "created_at") VALUES (9, 8, '2026-08-10T18:30:00.000Z', 'SAAT0004', '1680.00', NULL, '2026-08-11T16:22:50.755Z');
INSERT INTO "sales" ("sale_id", "customer_id", "sale_date", "invoice_number", "total_amount", "notes", "created_at") VALUES (10, 10, '2026-08-11T18:30:00.000Z', 'SAAT0005', '600.00', NULL, '2026-08-12T04:48:33.341Z');
INSERT INTO "sales" ("sale_id", "customer_id", "sale_date", "invoice_number", "total_amount", "notes", "created_at") VALUES (11, 8, '2026-08-11T18:30:00.000Z', 'SAAT0006', '3000.00', NULL, '2026-08-12T13:46:10.038Z');
INSERT INTO "sales" ("sale_id", "customer_id", "sale_date", "invoice_number", "total_amount", "notes", "created_at") VALUES (12, 9, '2026-08-11T18:30:00.000Z', 'SAAT0007', '4991.50', NULL, '2026-08-12T15:56:43.255Z');
INSERT INTO "sales" ("sale_id", "customer_id", "sale_date", "invoice_number", "total_amount", "notes", "created_at") VALUES (13, 9, '2026-08-13T18:30:00.000Z', 'SAAT0008', '252.00', NULL, '2026-08-14T17:04:38.146Z');
INSERT INTO "sales" ("sale_id", "customer_id", "sale_date", "invoice_number", "total_amount", "notes", "created_at") VALUES (14, 2, '2026-08-25T18:30:00.000Z', 'SAAT0009', '2500.00', NULL, '2026-08-26T07:24:20.343Z');

-- Table: stock (3 records)
INSERT INTO "stock" ("stock_id", "product_id", "quantity", "reorder_level", "updated_at") VALUES (1, 1, 0, 0, '2026-08-11T04:51:25.893Z');
INSERT INTO "stock" ("stock_id", "product_id", "quantity", "reorder_level", "updated_at") VALUES (3, 2, 70, 0, '2026-08-12T15:56:43.255Z');
INSERT INTO "stock" ("stock_id", "product_id", "quantity", "reorder_level", "updated_at") VALUES (7, 3, 3, 0, '2026-08-26T07:24:20.343Z');

-- Table: stock_movements (25 records)
INSERT INTO "stock_movements" ("movement_id", "product_id", "movement_type", "quantity", "reason", "created_at", "reference_id") VALUES (1, 1, 'PURCHASE', 78, NULL, '2026-08-09T17:18:59.670Z', NULL);
INSERT INTO "stock_movements" ("movement_id", "product_id", "movement_type", "quantity", "reason", "created_at", "reference_id") VALUES (2, 1, 'PURCHASE', 100, NULL, '2026-08-09T17:19:18.242Z', NULL);
INSERT INTO "stock_movements" ("movement_id", "product_id", "movement_type", "quantity", "reason", "created_at", "reference_id") VALUES (3, 1, 'SALE', 150, 'sold', '2026-08-09T17:19:33.441Z', NULL);
INSERT INTO "stock_movements" ("movement_id", "product_id", "movement_type", "quantity", "reason", "created_at", "reference_id") VALUES (4, 1, 'SALE', 28, NULL, '2026-08-09T17:19:57.950Z', NULL);
INSERT INTO "stock_movements" ("movement_id", "product_id", "movement_type", "quantity", "reason", "created_at", "reference_id") VALUES (5, 1, 'PURCHASE', 10, 'buy', '2026-08-10T01:51:02.292Z', NULL);
INSERT INTO "stock_movements" ("movement_id", "product_id", "movement_type", "quantity", "reason", "created_at", "reference_id") VALUES (6, 1, 'PURCHASE', 10, 'Purchase', '2026-08-10T16:05:24.536Z', 1);
INSERT INTO "stock_movements" ("movement_id", "product_id", "movement_type", "quantity", "reason", "created_at", "reference_id") VALUES (7, 1, 'SALE', 15, 'Sale', '2026-08-10T16:06:13.836Z', 1);
INSERT INTO "stock_movements" ("movement_id", "product_id", "movement_type", "quantity", "reason", "created_at", "reference_id") VALUES (8, 1, 'SALE', 1, 'Sale', '2026-08-10T16:07:14.911Z', 2);
INSERT INTO "stock_movements" ("movement_id", "product_id", "movement_type", "quantity", "reason", "created_at", "reference_id") VALUES (9, 1, 'SALE', 3, 'Sale', '2026-08-10T16:07:45.402Z', 3);
INSERT INTO "stock_movements" ("movement_id", "product_id", "movement_type", "quantity", "reason", "created_at", "reference_id") VALUES (10, 2, 'PURCHASE', 100, 'Purchase', '2026-08-10T16:21:02.647Z', 2);
INSERT INTO "stock_movements" ("movement_id", "product_id", "movement_type", "quantity", "reason", "created_at", "reference_id") VALUES (11, 2, 'SALE', 100, 'Sale', '2026-08-10T16:41:11.679Z', 4);
INSERT INTO "stock_movements" ("movement_id", "product_id", "movement_type", "quantity", "reason", "created_at", "reference_id") VALUES (12, 1, 'SALE', 1, 'Sale', '2026-08-11T04:51:25.893Z', 5);
INSERT INTO "stock_movements" ("movement_id", "product_id", "movement_type", "quantity", "reason", "created_at", "reference_id") VALUES (13, 2, 'PURCHASE', 100, 'Purchase', '2026-08-11T04:52:27.009Z', 3);
INSERT INTO "stock_movements" ("movement_id", "product_id", "movement_type", "quantity", "reason", "created_at", "reference_id") VALUES (14, 2, 'SALE', 12, 'Invoice: SAAT0001', '2026-08-11T14:25:00.259Z', 6);
INSERT INTO "stock_movements" ("movement_id", "product_id", "movement_type", "quantity", "reason", "created_at", "reference_id") VALUES (15, 2, 'SALE', 28, 'Invoice: SAAT0002', '2026-08-11T15:48:39.666Z', 7);
INSERT INTO "stock_movements" ("movement_id", "product_id", "movement_type", "quantity", "reason", "created_at", "reference_id") VALUES (16, 2, 'SALE', 10, 'Invoice: SAAT0003', '2026-08-11T16:21:10.309Z', 8);
INSERT INTO "stock_movements" ("movement_id", "product_id", "movement_type", "quantity", "reason", "created_at", "reference_id") VALUES (17, 2, 'SALE', 14, 'Invoice: SAAT0004', '2026-08-11T16:22:50.755Z', 9);
INSERT INTO "stock_movements" ("movement_id", "product_id", "movement_type", "quantity", "reason", "created_at", "reference_id") VALUES (18, 2, 'SALE', 6, 'Invoice: SAAT0005', '2026-08-12T04:48:33.341Z', 10);
INSERT INTO "stock_movements" ("movement_id", "product_id", "movement_type", "quantity", "reason", "created_at", "reference_id") VALUES (19, 2, 'SALE', 30, 'Invoice: SAAT0006', '2026-08-12T13:46:10.038Z', 11);
INSERT INTO "stock_movements" ("movement_id", "product_id", "movement_type", "quantity", "reason", "created_at", "reference_id") VALUES (20, 2, 'PURCHASE', 100, 'Purchase', '2026-08-12T13:47:07.052Z', 4);
INSERT INTO "stock_movements" ("movement_id", "product_id", "movement_type", "quantity", "reason", "created_at", "reference_id") VALUES (21, 2, 'PURCHASE', 20, 'Purchase', '2026-08-12T13:48:00.657Z', 5);
INSERT INTO "stock_movements" ("movement_id", "product_id", "movement_type", "quantity", "reason", "created_at", "reference_id") VALUES (22, 2, 'SALE', 50, 'Invoice: SAAT0007', '2026-08-12T15:56:43.255Z', 12);
INSERT INTO "stock_movements" ("movement_id", "product_id", "movement_type", "quantity", "reason", "created_at", "reference_id") VALUES (23, 3, 'PURCHASE', 10, 'Purchase', '2026-08-14T17:01:57.145Z', 6);
INSERT INTO "stock_movements" ("movement_id", "product_id", "movement_type", "quantity", "reason", "created_at", "reference_id") VALUES (24, 3, 'SALE', 2, 'Invoice: SAAT0008', '2026-08-14T17:04:38.146Z', 13);
INSERT INTO "stock_movements" ("movement_id", "product_id", "movement_type", "quantity", "reason", "created_at", "reference_id") VALUES (25, 3, 'SALE', 5, 'Invoice: SAAT0009', '2026-08-26T07:24:20.343Z', 14);

-- Table: units (1 records)
INSERT INTO "units" ("unit_id", "unit_name", "abbreviation", "created_at") VALUES (1, 'kg', 'kiligrams', '2026-08-09T17:18:18.448Z');

-- Table: users (4 records)
INSERT INTO "users" ("id", "full_name", "email", "password_hash", "role", "created_at", "updated_at") VALUES (1, 'System Admin', 'admin@shriammanagro.com', '$2b$10$nOnRDUl15gxraS1t7gb2jepecsm7n/p0GAhTMelir1.4eDcu6uglO', 'Admin', '2026-08-08T13:27:41.624Z', '2026-08-08T13:27:41.624Z');
INSERT INTO "users" ("id", "full_name", "email", "password_hash", "role", "created_at", "updated_at") VALUES (3, 'Yuvaakash', 'yuvaakash16@gmail.com', '$2b$10$AbymAU5c1kHHo4QgH1XR2uFZ6e3ItYQCTCabv4e5E7mh.HzBsX8rm', 'Staff', '2026-08-08T13:33:35.010Z', '2026-08-08T13:33:35.010Z');
INSERT INTO "users" ("id", "full_name", "email", "password_hash", "role", "created_at", "updated_at") VALUES (4, 'tharunpranaav', 'pranavsivrem@gmail.com', '$2b$10$W2OOvrVUrNMqWTpeQl9.DemqfSqm5tdPVGnLiTkjjipbXgEN1uj9O', 'Staff', '2026-08-13T17:24:01.601Z', '2026-08-13T17:24:01.601Z');
INSERT INTO "users" ("id", "full_name", "email", "password_hash", "role", "created_at", "updated_at") VALUES (5, 'Priya', 'priya@gmail.com', '$2b$10$/vI3ZH5YyjHF3QaiDMUOzeeUrHrhwjrMzVUH5hspvdYc4XglCtyUC', 'Staff', '2026-08-14T16:56:09.191Z', '2026-08-14T16:56:09.191Z');
