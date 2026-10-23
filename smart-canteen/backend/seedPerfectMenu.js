require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/product");
const User = require("./models/User");
const Order = require("./models/Order");

// 28 Handcrafted, Distinct Authentic Tamil Nadu Canteen Food Items
// Each item has a 100% UNIQUE, SPECIFIC, HIGH-DEFINITION LOCAL IMAGE - ZERO DUPLICATES!
const PERFECT_CANTEEN_MENU = [
  // =================== 1. TIFFIN SPECIALS (காலை & மாலை டிபன்) ===================
  {
    name: "Ghee Roast Dosa",
    category: "Tiffin Specials",
    price: 50,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 60,
    description: "Golden crispy paper-thin cone roast cooked with pure cow ghee. Served piping hot with drumstick sambar, fresh coconut chutney and spicy tomato chutney.",
    image: "/images/food/ghee_roast_dosa.jpg",
    imageUrl: "/images/food/ghee_roast_dosa.jpg"
  },
  {
    name: "Masala Dosa",
    category: "Tiffin Specials",
    price: 60,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 50,
    description: "Crispy folded golden dosa smeared with red chutney and packed with savory potato masala tempered with mustard, curry leaves, and green chillies.",
    image: "/images/food/masala_dosa.jpg",
    imageUrl: "/images/food/masala_dosa.jpg"
  },
  {
    name: "Onion Uthappam",
    category: "Tiffin Specials",
    price: 45,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 45,
    description: "Thick, soft and fluffy griddle pancake loaded with lots of chopped shallots, green chillies, curry leaves, and fresh coriander. Served with sambar and chutneys.",
    image: "/images/food/onion_uthappam.jpg",
    imageUrl: "/images/food/onion_uthappam.jpg"
  },
  {
    name: "Idli Sambar (2 pcs)",
    category: "Tiffin Specials",
    price: 30,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 60,
    description: "Pair of freshly steamed, soft fluffy white rice cakes served with piping hot Madras drumstick-shallot sambar and freshly ground coconut chutney.",
    image: "/images/food/idli_sambar.jpg",
    imageUrl: "/images/food/idli_sambar.jpg"
  },
  {
    name: "Ghee Podi Idli (2 pcs)",
    category: "Tiffin Specials",
    price: 40,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 50,
    description: "Steamed fluffy idlis tossed generously in spicy roasted gun powder (idli podi) and melted desi cow ghee with curry leaves.",
    image: "/images/food/ghee_podi_idli.jpg",
    imageUrl: "/images/food/ghee_podi_idli.jpg"
  },
  {
    name: "Medu Vada (2 pcs)",
    category: "Tiffin Specials",
    price: 30,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 50,
    description: "Golden brown crispy urad dal doughnut fritters seasoned with whole black pepper, ginger, and curry leaves. Served with hot sambar and coconut chutney.",
    image: "/images/food/medu_vada_chutney.jpg",
    imageUrl: "/images/food/medu_vada_chutney.jpg"
  },
  {
    name: "Sambar Vada (Dipped)",
    category: "Tiffin Specials",
    price: 35,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 45,
    description: "Crispy medu vadas immersed deep in piping hot drumstick sambar, topped with finely chopped raw onions, coriander, and ghee.",
    image: "/images/food/sambar_vada.jpg",
    imageUrl: "/images/food/sambar_vada.jpg"
  },
  {
    name: "Ghee Ven Pongal",
    category: "Tiffin Specials",
    price: 40,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 40,
    description: "Temple-style comforting rice & yellow moong dal cooked with crushed peppercorns, cumin, ginger, crunchy roasted cashews, and pure cow ghee.",
    image: "/images/food/hot_ven_pongal.jpg",
    imageUrl: "/images/food/hot_ven_pongal.jpg"
  },
  {
    name: "Poori Masala (2 pcs)",
    category: "Tiffin Specials",
    price: 40,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 50,
    description: "Hot puffed golden whole-wheat pooris served with authentic canteen potato-onion kilangu masala and coconut chutney.",
    image: "/images/food/poori_masala.jpg",
    imageUrl: "/images/food/poori_masala.jpg"
  },

  // =================== 2. MEALS & RICE (மதிய உணவு & சாதம்) ===================
  {
    name: "South Indian Veg Meals",
    category: "Meals & Rice",
    price: 80,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 60,
    description: "Complete traditional Tamil lunch thali: Steamed Ponni rice, Madras sambar, poondu rasam, vegetable kootu, poriyal, appalam, mor milagai, and fresh curd.",
    image: "/images/food/south_indian_meals.jpg",
    imageUrl: "/images/food/south_indian_meals.jpg"
  },
  {
    name: "Ghee Sambar Rice",
    category: "Meals & Rice",
    price: 50,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 50,
    description: "Slow-cooked aromatic rice blended with shallots, drumstick, and tamarind sambar, topped with melted desi ghee and served with crunchy fried appalam.",
    image: "/images/food/sambar_rice.jpg",
    imageUrl: "/images/food/sambar_rice.jpg"
  },
  {
    name: "Curd Rice",
    category: "Meals & Rice",
    price: 40,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 50,
    description: "Cooling soothing curd rice tempered with mustard, green chillies, grated ginger, curry leaves, and pomegranate seeds. Served with spicy mango pickle.",
    image: "/images/food/curd_rice.jpg",
    imageUrl: "/images/food/curd_rice.jpg"
  },
  {
    name: "Lemon Rice",
    category: "Meals & Rice",
    price: 45,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 45,
    description: "Tangy turmeric rice infused with fresh lemon juice, roasted peanuts, chana dal and curry leaves, accompanied by crispy spicy potato roast.",
    image: "/images/food/lemon_rice.jpg",
    imageUrl: "/images/food/lemon_rice.jpg"
  },

  // =================== 3. PAROTTA & BIRIYANI (பரோட்டா & பிரியாணி) ===================
  {
    name: "Chicken Biryani",
    category: "Parotta & Biriyani",
    price: 120,
    isVeg: false,
    available: true,
    isAvailable: true,
    stock: 60,
    description: "Aromatic Tamil Nadu dum biryani prepared with fragrant Seeraga Samba short-grain rice, tender chicken pieces, mint, and spices. Served with chicken salna and onion raita.",
    image: "/images/food/dindigul_biryani.jpg",
    imageUrl: "/images/food/dindigul_biryani.jpg"
  },
  {
    name: "Veg Biryani",
    category: "Parotta & Biriyani",
    price: 80,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 50,
    description: "Fragrant Seeraga Samba rice dum-cooked with carrots, beans, peas, fresh mint, and whole biryani spices. Served with vegetable salna and raita.",
    image: "/images/food/veg_biryani.jpg",
    imageUrl: "/images/food/veg_biryani.jpg"
  },
  {
    name: "Parotta with Salna (2 pcs)",
    category: "Parotta & Biriyani",
    price: 45,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 70,
    description: "Flaky, multi-layered golden crispy parottas crushed lightly and served hot with aromatic vegetable empty salna and onion raita.",
    image: "/images/food/bun_parotta_salna.jpg",
    imageUrl: "/images/food/bun_parotta_salna.jpg"
  },
  {
    name: "Egg Kothu Parotta",
    category: "Parotta & Biriyani",
    price: 80,
    isVeg: false,
    available: true,
    isAvailable: true,
    stock: 50,
    description: "Shredded layered parottas beaten on iron griddle with scrambled farm eggs, sautéed onions, green chillies, curry leaves, and rich spicy salna.",
    image: "/images/food/egg_kothu_parotta.jpg",
    imageUrl: "/images/food/egg_kothu_parotta.jpg"
  },
  {
    name: "Chicken Kothu Parotta",
    category: "Parotta & Biriyani",
    price: 110,
    isVeg: false,
    available: true,
    isAvailable: true,
    stock: 50,
    description: "Famous Madurai street-canteen delicacy: shredded parottas minced on tawa with juicy spiced chicken chunks, eggs, onions, and rich chicken salna gravy.",
    image: "/images/food/chicken_kothu_parotta.jpg",
    imageUrl: "/images/food/chicken_kothu_parotta.jpg"
  },
  {
    name: "Chicken Fried Rice",
    category: "Parotta & Biriyani",
    price: 95,
    isVeg: false,
    available: true,
    isAvailable: true,
    stock: 50,
    description: "Wok-tossed basmati rice seasoned with boneless spiced chicken cubes, scrambled egg shreds, crunchy cabbage, spring onions, and a splash of spicy gravy.",
    image: "/images/food/chicken_fried_rice.jpg",
    imageUrl: "/images/food/chicken_fried_rice.jpg"
  },

  // =================== 4. EVENING SNACKS (மாலை சிற்றுண்டி) ===================
  {
    name: "Chicken 65 (Boneless)",
    category: "Evening Snacks",
    price: 90,
    isVeg: false,
    available: true,
    isAvailable: true,
    stock: 45,
    description: "Crispy and juicy boneless chicken bites marinated with fiery red chillies, ginger-garlic paste, yogurt, and deep-fried with crispy curry leaves and lemon wedges.",
    image: "/images/food/chennai_chicken_65.jpg",
    imageUrl: "/images/food/chennai_chicken_65.jpg"
  },
  {
    name: "Egg Puffs",
    category: "Evening Snacks",
    price: 20,
    isVeg: false,
    available: true,
    isAvailable: true,
    stock: 55,
    description: "All-time campus classic: Golden flaky puff pastry stuffed with seasoned hard-boiled egg half and caramelized onion-tomato masala.",
    image: "/images/food/egg_puffs.jpg",
    imageUrl: "/images/food/egg_puffs.jpg"
  },
  {
    name: "Veg Samosa (2 pcs)",
    category: "Evening Snacks",
    price: 20,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 60,
    description: "Golden crunchy triangular pastries stuffed with spiced potatoes, green peas, and ajwain seeds. Served with sweet tamarind and mint chutney.",
    image: "/images/food/veg_samosa.jpg",
    imageUrl: "/images/food/veg_samosa.jpg"
  },
  {
    name: "Onion Pakoda",
    category: "Evening Snacks",
    price: 25,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 50,
    description: "Irresistibly crunchy fritters made with thinly sliced onions, crushed fennel seeds, curry leaves, and besan. The quintessential campus evening crunch.",
    image: "/images/food/onion_pakoda.jpg",
    imageUrl: "/images/food/onion_pakoda.jpg"
  },

  // =================== 5. BEVERAGES & COOLERS (பானங்கள் & குளிர்பானங்கள்) ===================
  {
    name: "Filter Coffee",
    category: "Beverages & Coolers",
    price: 20,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 100,
    description: "Authentic Kumbakonam degree decoction chicory blend coffee frothed to perfection with boiling fresh milk, served hot in traditional South Indian dabarah and tumbler.",
    image: "/images/food/filter_coffee.jpg",
    imageUrl: "/images/food/filter_coffee.jpg"
  },
  {
    name: "Masala Tea",
    category: "Beverages & Coolers",
    price: 15,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 100,
    description: "Steaming hot campus chai infused with freshly crushed ginger, green cardamom, and cloves. Brewed fresh continuously.",
    image: "/images/food/masala_tea.jpg",
    imageUrl: "/images/food/masala_tea.jpg"
  },
  {
    name: "Madurai Jigarthanda",
    category: "Beverages & Coolers",
    price: 45,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 50,
    description: "Famous cooling royal Madurai dessert beverage prepared with natural almond gum (badam pisin), nannari root syrup, thickened reduced milk (basundi) and vanilla ice cream.",
    image: "/images/food/madurai_jigarthanda.jpg",
    imageUrl: "/images/food/madurai_jigarthanda.jpg"
  },
  {
    name: "Rose Milk",
    category: "Beverages & Coolers",
    price: 30,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 60,
    description: "Refreshing cold sweetened milk infused with fragrant rose syrup, crushed ice, and soaked cooling basil seeds (sabja). The ultimate campus summer cooler.",
    image: "/images/food/rose_milk.jpg",
    imageUrl: "/images/food/rose_milk.jpg"
  },
  {
    name: "Fresh Lemon Juice",
    category: "Beverages & Coolers",
    price: 20,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 60,
    description: "Freshly squeezed lemon juice with chilled water or soda, fresh mint leaves, roasted cumin, and black salt. Tangy, crisp, and refreshing.",
    image: "/images/food/fresh_lemon_juice.jpg",
    imageUrl: "/images/food/fresh_lemon_juice.jpg"
  }
];

async function seedPerfectMenu() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Atlas Successfully ✅");

    // Clear old products to guarantee clean, uncorrupted names and images
    console.log("Refreshing product database with 28 100% unique food items & dedicated photos...");
    await Product.deleteMany({});

    // Insert new authentic products
    const inserted = await Product.insertMany(PERFECT_CANTEEN_MENU);
    console.log(`Successfully added ${inserted.length} authentic dishes with unique local images!`);

    // Ensure we have a student user to test orders
    let student = await User.findOne({ role: "student" });
    if (!student) {
      student = await User.create({
        name: "Karthik Student",
        email: "karthik@student.edu",
        password: "$2a$12$e0X7m1w0RzF8d5Z0gL3Oeu8q2dFk4iE9xX.fJqT.vG8w3l7cQjH1W",
        phone: "9876543210",
        role: "student"
      });
      console.log("Created test student account: karthik@student.edu");
    }

    // Ensure active order for staff KDS
    const activeOrdersCount = await Order.countDocuments({ status: { $in: ["Placed", "Preparing", "Ready"] } });
    if (activeOrdersCount === 0 && inserted.length > 2) {
      const sampleItem1 = inserted[0];
      const sampleItem2 = inserted[13];
      await Order.create({
        userId: student._id,
        items: [
          {
            productId: sampleItem1._id,
            nameSnapshot: sampleItem1.name,
            priceSnapshot: sampleItem1.price,
            price: sampleItem1.price,
            quantity: 2,
            lineTotal: sampleItem1.price * 2
          },
          {
            productId: sampleItem2._id,
            nameSnapshot: sampleItem2.name,
            priceSnapshot: sampleItem2.price,
            price: sampleItem2.price,
            quantity: 1,
            lineTotal: sampleItem2.price
          }
        ],
        pickupSlot: "Immediate (10-15 mins)",
        subtotal: sampleItem1.price * 2 + sampleItem2.price,
        totalAmount: sampleItem1.price * 2 + sampleItem2.price,
        status: "Placed",
        paymentStatus: "Pay on Pickup"
      });
      console.log("Created sample active order for Kitchen KDS display testing.");
    }

    console.log("\n========================================================");
    console.log("All 28 authentic dishes seeded cleanly with 100% unique images!");
    console.log("Zero duplicate images. Every dish has its own dedicated photo!");
    console.log("========================================================");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seedPerfectMenu();
