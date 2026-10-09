package com.onlinefood.config;

import com.onlinefood.entity.*;
import com.onlinefood.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed & Refresh Users with valid encoded passwords
        User demoUser = userRepository.findByEmail("demo@food.com").orElse(new User());
        demoUser.setName("Demo User");
        demoUser.setEmail("demo@food.com");
        demoUser.setPassword(passwordEncoder.encode("password123"));
        demoUser.setPhone("9876543210");
        demoUser.setRole(Role.ROLE_USER);
        
        User adminUser = userRepository.findByEmail("admin@food.com").orElse(new User());
        adminUser.setName("Admin User");
        adminUser.setEmail("admin@food.com");
        adminUser.setPassword(passwordEncoder.encode("admin123"));
        adminUser.setPhone("9123456780");
        adminUser.setRole(Role.ROLE_ADMIN);
        
        userRepository.saveAll(Arrays.asList(demoUser, adminUser));

        // 2. Seed Default Addresses for demo user
        if (addressRepository.count() == 0) {
            Address addr1 = new Address(null, demoUser, "Demo User", "9876543210", "#42, 4th Cross, Green Glen Layout", "Bellandur", "Bengaluru", "Karnataka", "560103", "Home");
            Address addr2 = new Address(null, demoUser, "Demo User", "9876543210", "Prestige Tech Park, Tower 3, 4th Floor", "Marathahalli - Sarjapur Outer Ring Rd", "Bengaluru", "Karnataka", "560103", "Work");
            addressRepository.saveAll(Arrays.asList(addr1, addr2));
        }

        // 3. Seed Active Coupons
        if (couponRepository.count() == 0) {
            List<Coupon> coupons = Arrays.asList(
                new Coupon(null, "SWIGGY50", new BigDecimal("100.0"), new BigDecimal("199.0"), true, LocalDate.now().plusMonths(6), 1000, 0),
                new Coupon(null, "ZOMATO100", new BigDecimal("100.0"), new BigDecimal("399.0"), true, LocalDate.now().plusMonths(6), 1000, 0),
                new Coupon(null, "WELCOME50", new BigDecimal("50.0"), new BigDecimal("149.0"), true, LocalDate.now().plusMonths(6), 1000, 0),
                new Coupon(null, "FEAST20", new BigDecimal("150.0"), new BigDecimal("299.0"), true, LocalDate.now().plusMonths(6), 1000, 0),
                new Coupon(null, "FREEDEL", new BigDecimal("40.0"), new BigDecimal("199.0"), true, LocalDate.now().plusMonths(6), 1000, 0)
            );
            couponRepository.saveAll(coupons);
        }

        // 4. Seed / Enrich 110 Curated Menu Items across 11 Categories
        List<MenuItem> all110Items = getCurated110MenuItems();
        Map<String, MenuItem> existingItemsByName = menuItemRepository.findAll().stream()
                .collect(Collectors.toMap(MenuItem::getName, m -> m, (a, b) -> a));

        List<MenuItem> itemsToSave = new ArrayList<>();
        for (MenuItem cur : all110Items) {
            if (existingItemsByName.containsKey(cur.getName())) {
                MenuItem existing = existingItemsByName.get(cur.getName());
                existing.setDescription(cur.getDescription());
                existing.setPrice(cur.getPrice());
                existing.setCategory(cur.getCategory());
                existing.setAvailable(true);
                existing.setImageUrl(cur.getImageUrl());
                existing.setIsVeg(cur.getIsVeg());
                existing.setRating(cur.getRating());
                existing.setRestaurantName(cur.getRestaurantName());
                existing.setPrepTimeMinutes(cur.getPrepTimeMinutes());
                itemsToSave.add(existing);
            } else {
                itemsToSave.add(cur);
            }
        }

        if (!itemsToSave.isEmpty()) {
            menuItemRepository.saveAll(itemsToSave);
        }
    }

    private List<MenuItem> getCurated110MenuItems() {
        List<MenuItem> items = new ArrayList<>();

        // 1. BIRYANI & RICE BOWLS (10 items)
        items.add(new MenuItem(null, "Hyderabadi Chicken Dum Biryani", "Aromatic long-grain basmati rice layered with succulent marinated chicken, saffron and whole spices.", new BigDecimal("280.0"), "Biryani & Rice", true, "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80", false, 4.8, "Biryani Blues", 30));
        items.add(new MenuItem(null, "Royal Mutton Biryani", "Tender pieces of goat meat slow-cooked in sealed clay pot with aged basmati rice and aromatic ghee.", new BigDecimal("380.0"), "Biryani & Rice", true, "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/23/A_home_made_plate_of_mutton_biryani_served_with_chicken_kassa_cooked_in_the_bengali_style.jpg/960px-A_home_made_plate_of_mutton_biryani_served_with_chicken_kassa_cooked_in_the_bengali_style.jpg", false, 4.9, "Royal Nawabi Kitchen", 35));
        items.add(new MenuItem(null, "Paneer Tikka Biryani", "Char-grilled spicy paneer cubes cooked in saffron infused basmati rice with caramelized onions.", new BigDecimal("230.0"), "Biryani & Rice", true, "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2f/Veg_biryani.jpg/960px-Veg_biryani.jpg", true, 4.6, "Behrouz Biryani", 25));
        items.add(new MenuItem(null, "Kolkata Special Chicken Biryani", "Fragrant mild biryani prepared with tender chicken, golden spiced potato and boiled egg.", new BigDecimal("270.0"), "Biryani & Rice", true, "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80", false, 4.7, "Kolkata Biryani House", 25));
        items.add(new MenuItem(null, "Lucknowi Awadhi Murgh Biryani", "Rich delicately spiced pakki biryani cooked with tender chicken and subtle kewra floral aroma.", new BigDecimal("290.0"), "Biryani & Rice", true, "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5a/%22Hyderabadi_Dum_Biryani%22.jpg/960px-%22Hyderabadi_Dum_Biryani%22.jpg", false, 4.7, "Awadh Kitchen", 30));
        items.add(new MenuItem(null, "Spicy Egg Dum Biryani", "Farm-fresh boiled eggs fried in spices and layered with aromatic basmati rice and fresh mint.", new BigDecimal("210.0"), "Biryani & Rice", true, "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/16/Egg_Biryani_in_a_restaurant.jpg/960px-Egg_Biryani_in_a_restaurant.jpg", false, 4.5, "Biryani Express", 20));
        items.add(new MenuItem(null, "Mushroom & Matar Pulao", "Fragrant cumin pulao loaded with fresh button mushrooms, green peas, and whole cashews.", new BigDecimal("190.0"), "Biryani & Rice", true, "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=800&q=80", true, 4.4, "Pulao Junction", 20));
        items.add(new MenuItem(null, "Dal Makhani & Jeera Rice Bowl", "Creamy slow-cooked black lentils served with aromatic cumin infused basmati rice and pickled onions.", new BigDecimal("220.0"), "Biryani & Rice", true, "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/69/Punjabi_style_Dal_Makhani.jpg/960px-Punjabi_style_Dal_Makhani.jpg", true, 4.7, "Bowl Company", 20));
        items.add(new MenuItem(null, "Veg Schezwan Fried Rice", "Wok-tossed rice with colorful crunchy veggies, spring onion, and fiery Sichuan pepper sauce.", new BigDecimal("180.0"), "Biryani & Rice", true, "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80", true, 4.4, "Wok Express", 20));
        items.add(new MenuItem(null, "Chicken Fried Rice with Chilli Garlic", "Smoky wok-tossed jasmine rice with tender chicken shreds, egg ribbon, and spicy garlic glaze.", new BigDecimal("240.0"), "Biryani & Rice", true, "https://images.unsplash.com/photo-1600335895229-6e75511892c8?w=800&q=80", false, 4.6, "Mainland China", 25));

        // 2. PIZZAS & GARLIC BREADS (10 items)
        items.add(new MenuItem(null, "Classic Margherita Pizza", "Italian San Marzano tomato sauce, fresh buffalo mozzarella, fresh basil leaves, and extra virgin olive oil.", new BigDecimal("260.0"), "Pizzas", true, "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80", true, 4.7, "Ovenstory Pizza", 20));
        items.add(new MenuItem(null, "Farmhouse Veggie Supreme Pizza", "Loaded with crisp bell peppers, button mushrooms, sweet golden corn, red onions and ripe black olives.", new BigDecimal("320.0"), "Pizzas", true, "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80", true, 4.6, "Pizza Corner", 25));
        items.add(new MenuItem(null, "BBQ Smoked Chicken Pizza", "Tender barbecue chicken chunks, smoked gouda, red onions, cilantro, and spicy chipotle drizzle.", new BigDecimal("380.0"), "Pizzas", true, "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80", false, 4.8, "Wood Fire Pizza Co.", 25));
        items.add(new MenuItem(null, "Peppy Paneer & Capsicum Pizza", "Spiced cottage cheese cubes, crunchy capsicum, red paprika, and stretchy mozzarella cheese blend.", new BigDecimal("340.0"), "Pizzas", true, "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=800&q=80", true, 4.5, "Ovenstory Pizza", 20));
        items.add(new MenuItem(null, "Fiery Pepperoni Feast Pizza", "Crispy cured beef pepperoni slices over rich tomato pomodoro sauce and double mozzarella cheese.", new BigDecimal("440.0"), "Pizzas", true, "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=80", false, 4.9, "Crust & Craft", 30));
        items.add(new MenuItem(null, "Quattro Formaggi (Four Cheese)", "Decadent blend of imported Mozzarella, Gorgonzola, aged Parmesan, and Creamy Ricotta cheese.", new BigDecimal("420.0"), "Pizzas", true, "https://images.unsplash.com/photo-1573821663912-569905455b1c?w=800&q=80", true, 4.7, "Little Italy", 25));
        items.add(new MenuItem(null, "Cheesy Stuffed Garlic Breadsticks", "Freshly baked sourdough garlic bread stuffed with mozzarella and sweet corn, served with cheesy jalapeno dip.", new BigDecimal("160.0"), "Pizzas", true, "https://images.unsplash.com/photo-1619881589146-5ec5c9354089?w=800&q=80", true, 4.8, "Pizza Corner", 15));
        items.add(new MenuItem(null, "Paneer Pocket Calzone", "Folded pizza pocket stuffed with tandoori spiced paneer, onions, capsicum, and molten cheese.", new BigDecimal("190.0"), "Pizzas", true, "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/20/Wikimania_2016_Deryck_day_0_-_07_calzone.jpg/960px-Wikimania_2016_Deryck_day_0_-_07_calzone.jpg", true, 4.5, "Ovenstory Pizza", 20));
        items.add(new MenuItem(null, "Spicy Chicken Sausage Pizza", "Smoky chicken sausages, jalapenos, peri peri drizzle, and melted cheddar and mozzarella.", new BigDecimal("370.0"), "Pizzas", true, "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800&q=80", false, 4.6, "Wood Fire Pizza Co.", 25));
        items.add(new MenuItem(null, "Pesto Grilled Veggie Pizza", "Aromatic basil pesto base topped with grilled zucchini, sun-dried tomatoes, and crumbled feta cheese.", new BigDecimal("360.0"), "Pizzas", true, "https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?w=800&q=80", true, 4.6, "Little Italy", 25));

        // 3. BURGERS, SANDWICHES & WRAPS (10 items)
        items.add(new MenuItem(null, "Crispy Veg Supreme Burger", "Golden fried spiced potato & veggie patty topped with crisp lettuce, tomato, cheese slice, and creamy mayo.", new BigDecimal("140.0"), "Burgers & Wraps", true, "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80", true, 4.5, "The Burger Club", 15));
        items.add(new MenuItem(null, "Gourmet Double Cheeseburger", "Twin juicy grilled patties loaded with molten cheddar cheese, caramelized onions, gherkins and secret sauce.", new BigDecimal("240.0"), "Burgers & Wraps", true, "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&q=80", false, 4.8, "Burger King Express", 20));
        items.add(new MenuItem(null, "Fiery Peri Peri Chicken Burger", "Crispy fried chicken breast fillet tossed in spicy peri-peri dust, crunchy lettuce, and smoked paprika aioli.", new BigDecimal("220.0"), "Burgers & Wraps", true, "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80", false, 4.7, "The Burger Club", 20));
        items.add(new MenuItem(null, "Paneer Tikka Kathi Roll", "Smoky roasted paneer cubes tossed in mint sauce, crunchy onions, wrapped in a flaky paratha.", new BigDecimal("160.0"), "Burgers & Wraps", true, "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fc/Kolkata_Rolls.jpg/960px-Kolkata_Rolls.jpg", true, 4.6, "Faasos Express", 15));
        items.add(new MenuItem(null, "Butter Chicken Shawarma Roll", "Shredded succulent tandoori chicken cooked in rich makhani gravy, rolled with garlic toum in pita bread.", new BigDecimal("190.0"), "Burgers & Wraps", true, "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/00/Shawarma_2.jpg/960px-Shawarma_2.jpg", false, 4.8, "Shawarma Hub", 15));
        items.add(new MenuItem(null, "Falafel Hummus Pita Pocket", "Crispy spiced chickpea falafels with velvety hummus, pickled cucumbers, and tahini drizzle inside warm pita.", new BigDecimal("180.0"), "Burgers & Wraps", true, "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/57/Falafels_2.jpg/960px-Falafels_2.jpg", true, 4.5, "Lebanese Treat", 20));
        items.add(new MenuItem(null, "Grilled Veggie Club Sandwich", "Triple-decker toasted bread filled with fresh vegetables, cheese slices, mint chutney, served with peri-peri fries.", new BigDecimal("170.0"), "Burgers & Wraps", true, "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80", true, 4.5, "Sandwich Story", 15));
        items.add(new MenuItem(null, "Bombay Masala Toast Sandwich", "Street style spiced potato sandwich with butter, green chutney, beetroot, cucumber, and melted amul cheese.", new BigDecimal("130.0"), "Burgers & Wraps", true, "https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=800&q=80", true, 4.6, "Sandwich Story", 15));
        items.add(new MenuItem(null, "Crispy Fish Fillet Burger", "Panko crusted golden fish fillet with tartar sauce, shredded iceberg lettuce in toasted brioche bun.", new BigDecimal("260.0"), "Burgers & Wraps", true, "https://images.unsplash.com/photo-1521305916504-4a1121188589?w=800&q=80", false, 4.6, "Burger King Express", 20));
        items.add(new MenuItem(null, "Truffle Mushroom Smash Burger", "Sautéed wild button mushrooms with truffle oil, melted provolone cheese, and garlic herb spread.", new BigDecimal("270.0"), "Burgers & Wraps", true, "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=800&q=80", true, 4.7, "The Burger Club", 20));

        // 4. NORTH INDIAN CURRIES & THALIS (10 items)
        items.add(new MenuItem(null, "Butter Chicken (Murgh Makhani)", "Char-grilled boneless chicken tikka simmered in a velvety, rich tomato, butter, and cashew nut gravy.", new BigDecimal("320.0"), "North Indian", true, "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80", false, 4.9, "Punjab Grill", 25));
        items.add(new MenuItem(null, "Paneer Butter Masala", "Soft cottage cheese cubes cooked in a mildly sweet and spicy creamy tomato cashew gravy with kasuri methi.", new BigDecimal("270.0"), "North Indian", true, "https://images.unsplash.com/photo-1631452180519-c014fe946bc0?w=800&q=80", true, 4.8, "Punjab Grill", 20));
        items.add(new MenuItem(null, "Dal Makhani (Slow Cooked 24h)", "Black lentils and kidney beans slow-cooked overnight with fresh cream, butter, and mild aromatic spices.", new BigDecimal("240.0"), "North Indian", true, "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/69/Punjabi_style_Dal_Makhani.jpg/960px-Punjabi_style_Dal_Makhani.jpg", true, 4.9, "Dhaba Express", 20));
        items.add(new MenuItem(null, "Kadhai Paneer Special", "Cottage cheese cubes tossed with bell peppers, onions, and freshly ground aromatic kadhai spices.", new BigDecimal("260.0"), "North Indian", true, "https://images.unsplash.com/photo-1567184109890-9a660c20bfe5?w=800&q=80", true, 4.6, "Dhaba Express", 20));
        items.add(new MenuItem(null, "Chicken Tikka Masala", "Tender roasted chicken chunks in a rich spicy spiced curry sauce with capsicum and diced onions.", new BigDecimal("310.0"), "North Indian", true, "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80", false, 4.7, "Punjab Grill", 25));
        items.add(new MenuItem(null, "Mutton Rogan Josh", "Authentic Kashmiri style lamb curry cooked in aromatic kashmiri chili and fennel infused gravy.", new BigDecimal("420.0"), "North Indian", true, "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/67/Rogan_Josh_Kashmiri.jpg/960px-Rogan_Josh_Kashmiri.jpg", false, 4.8, "Royal Nawabi Kitchen", 30));
        items.add(new MenuItem(null, "Malai Kofta in White Gravy", "Crispy paneer and potato dumplings stuffed with dry fruits, served in a rich cashew and cream gravy.", new BigDecimal("280.0"), "North Indian", true, "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e3/MalaiKofta.jpg/960px-MalaiKofta.jpg", true, 4.7, "Punjab Grill", 25));
        items.add(new MenuItem(null, "Butter Garlic Naan (Pack of 2)", "Soft leavened bread baked in tandoor clay oven, brushed generously with garlic butter and fresh cilantro.", new BigDecimal("90.0"), "North Indian", true, "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4e/Annapurna_Naan.jpg/960px-Annapurna_Naan.jpg", true, 4.8, "Dhaba Express", 15));
        items.add(new MenuItem(null, "Amritsari Stuffed Kulcha with Chole", "Crispy layered stuffed potato onion kulcha served with spicy pindi chole and tamarind chutney.", new BigDecimal("210.0"), "North Indian", true, "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9e/Chole_Bhature_from_Nagpur.JPG/960px-Chole_Bhature_from_Nagpur.JPG", true, 4.7, "Amritsari Zaika", 20));
        items.add(new MenuItem(null, "Palak Paneer", "Fresh cottage cheese cubes cooked in a smooth, mildly spiced spinach puree tempered with garlic and cumin.", new BigDecimal("250.0"), "North Indian", true, "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&q=80", true, 4.6, "Dhaba Express", 20));

        // 5. SOUTH INDIAN SPECIALS (10 items)
        items.add(new MenuItem(null, "Crispy Masala Dosa", "Golden crisp fermented rice crepe stuffed with tempered spicy potato mash, served with 3 chutneys and sambar.", new BigDecimal("130.0"), "South Indian", true, "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&q=80", true, 4.8, "Dosa Corner", 15));
        items.add(new MenuItem(null, "Ghee Roast Paper Plain Dosa", "Extra long paper-thin dosa roasted in pure desi ghee until golden crisp, served with coconut chutney.", new BigDecimal("150.0"), "South Indian", true, "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800&q=80", true, 4.8, "Dosa Corner", 15));
        items.add(new MenuItem(null, "Mysore Masala Dosa", "Crispy dosa layered with spicy red garlic chutney and potato masala, served with piping hot sambar.", new BigDecimal("160.0"), "South Indian", true, "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d9/Mysore_masala_dosa_in_Mysuru%2C_July_2013.jpg/960px-Mysore_masala_dosa_in_Mysuru%2C_July_2013.jpg", true, 4.7, "Mysore Cafe", 15));
        items.add(new MenuItem(null, "Steamed Idli & Crispy Vada Combo", "Two pillowy soft steamed rice cakes and one crispy lentil doughnut with drumstick sambar & tomato chutney.", new BigDecimal("110.0"), "South Indian", true, "https://upload.wikimedia.org/wikipedia/commons/1/11/Idli_Sambar.JPG", true, 4.6, "Udupi Bhavan", 15));
        items.add(new MenuItem(null, "Malabar Parotta with Chicken Chettinad", "Two flaky layered Kerala parottas paired with fiery roasted coconut and pepper chicken Chettinad curry.", new BigDecimal("290.0"), "South Indian", true, "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fc/Kolkata_Rolls.jpg/960px-Kolkata_Rolls.jpg", false, 4.9, "Kerala Coastal Express", 25));
        items.add(new MenuItem(null, "Podi Onion Uttapam", "Thick fermented pancake topped with caramelized shallots, fresh coriander, and gun powder spice with ghee.", new BigDecimal("140.0"), "South Indian", true, "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c6/Mini_Uttappam.jpg/960px-Mini_Uttappam.jpg", true, 4.6, "Udupi Bhavan", 15));
        items.add(new MenuItem(null, "Curd Rice with Mustard Tadka", "Cooling tempered yoghurt rice garnished with mustard seeds, curry leaves, ginger, and fresh pomegranate.", new BigDecimal("130.0"), "South Indian", true, "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/58/Curd_Rice.jpg/960px-Curd_Rice.jpg", true, 4.5, "Udupi Bhavan", 15));
        items.add(new MenuItem(null, "Hyderabadi Mirchi Bajji Platter", "Crispy batter fried large green chilies stuffed with tangy peanut and tamarind spice, served hot.", new BigDecimal("90.0"), "South Indian", true, "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a9/Mirchi_Bada_from_Jodhpur_1.jpg/960px-Mirchi_Bada_from_Jodhpur_1.jpg", true, 4.4, "Andhra Mess", 15));
        items.add(new MenuItem(null, "Chettinad Veg Kurma & Appam (2 pcs)", "Soft lace hoppers with fluffy sponge center served with aromatic mixed vegetable coconut stew.", new BigDecimal("200.0"), "South Indian", true, "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c3/Appam_-_%E0%AE%85%E0%AE%AA%E0%AF%8D%E0%AE%AA%E0%AE%AE%E0%AF%8D.jpg/960px-Appam_-_%E0%AE%85%E0%AE%AA%E0%AF%8D%E0%AE%AA%E0%AE%AE%E0%AF%8D.jpg", true, 4.6, "Kerala Coastal Express", 20));
        items.add(new MenuItem(null, "Kothu Parotta (Egg & Chicken)", "Shredded flaky parotta stir-fried on hot iron griddle with eggs, chicken gravy, green chilies and onions.", new BigDecimal("230.0"), "South Indian", true, "https://upload.wikimedia.org/wikipedia/commons/f/f5/Kothu_Parotta_%28Chicken%29_as_served_in_Tamil_Nadu%2C_India.jpg", false, 4.8, "Madurai Muniyandi", 20));

        // 6. CHINESE & ASIAN (10 items)
        items.add(new MenuItem(null, "Veg Hakka Noodles", "Stir-fried noodles with julienned bell peppers, cabbage, carrots, spring onions and savory soya sauce.", new BigDecimal("190.0"), "Chinese & Asian", true, "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80", true, 4.6, "Wok Express", 20));
        items.add(new MenuItem(null, "Chicken Chilli Garlic Noodles", "Wok-tossed noodles with tender chicken strips, roasted red chilies, fried garlic flakes and spicy oil.", new BigDecimal("240.0"), "Chinese & Asian", true, "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=800&q=80", false, 4.7, "Mainland China", 20));
        items.add(new MenuItem(null, "Crispy Veg Spring Rolls (6 pcs)", "Golden fried crispy pastry rolls filled with shredded Asian vegetables, served with sweet chili dip.", new BigDecimal("160.0"), "Chinese & Asian", true, "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1e/Spring_Rolls_%283357696061%29.jpg/960px-Spring_Rolls_%283357696061%29.jpg", true, 4.5, "Wok Express", 15));
        items.add(new MenuItem(null, "Chilli Paneer Dry", "Crispy wok-tossed cottage cheese cubes with crunchy bell peppers, green chilies, and tangy soy sauce.", new BigDecimal("240.0"), "Chinese & Asian", true, "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2c/Chilly_Paneer_01.jpg/960px-Chilly_Paneer_01.jpg", true, 4.7, "Mainland China", 20));
        items.add(new MenuItem(null, "Chilli Chicken Gravy", "Crispy batter-fried chicken bites cooked in spicy dark soya garlic gravy with capsicum and spring onions.", new BigDecimal("280.0"), "Chinese & Asian", true, "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/07/Chicken_Chilli_1.jpg/960px-Chicken_Chilli_1.jpg", false, 4.8, "Mainland China", 20));
        items.add(new MenuItem(null, "Steamed Chicken Momos (8 pcs)", "Hand-crafted Tibetan dumplings stuffed with juicy minced chicken & herbs, served with fiery spicy red dip.", new BigDecimal("170.0"), "Chinese & Asian", true, "https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=800&q=80", false, 4.9, "Momo Kingdom", 15));
        items.add(new MenuItem(null, "Fried Veg Momos with Spicy Dip (8 pcs)", "Golden crispy dumplings filled with finely chopped cabbage, carrots & paneer, served with spicy mayo.", new BigDecimal("140.0"), "Chinese & Asian", true, "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&q=80", true, 4.6, "Momo Kingdom", 15));
        items.add(new MenuItem(null, "Schezwan Chicken Gravy", "Spicy chicken pieces tossed in authentic Sichuan peppercorn sauce with bell peppers and celery.", new BigDecimal("270.0"), "Chinese & Asian", true, "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&q=80", false, 4.6, "Wok Express", 20));
        items.add(new MenuItem(null, "Honey Chilli Potato", "Crispy fried potato fingers coated in a sticky, sweet honey chili sauce garnished with toasted sesame.", new BigDecimal("170.0"), "Chinese & Asian", true, "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=800&q=80", true, 4.5, "Wok Express", 15));
        items.add(new MenuItem(null, "Thai Green Curry with Jasmine Rice", "Aromatic coconut milk curry with bamboo shoots, basil, zucchini, served with steamed fragrant jasmine rice.", new BigDecimal("340.0"), "Chinese & Asian", true, "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80", true, 4.8, "Asia Seven", 25));

        // 7. PASTAS & ITALIAN (10 items)
        items.add(new MenuItem(null, "Creamy Fettuccine Alfredo", "Fresh fettuccine pasta tossed in rich parmesan and garlic cream sauce with sautéed button mushrooms.", new BigDecimal("280.0"), "Pastas", true, "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=800&q=80", true, 4.7, "Little Italy", 20));
        items.add(new MenuItem(null, "Penne Arrabbiata Spicy Tomato", "Penne tossed in fiery Italian tomato sauce with garlic, crushed red chilies, basil, and grated parmesan.", new BigDecimal("260.0"), "Pastas", true, "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&q=80", true, 4.6, "Pasta Express", 20));
        items.add(new MenuItem(null, "Basil Pesto Penne with Pine Nuts", "Fresh genovese basil pesto sauce with extra virgin olive oil, sundried tomatoes, and toasted pine nuts.", new BigDecimal("310.0"), "Pastas", true, "https://images.unsplash.com/photo-1588013273468-315fd88ea34c?w=800&q=80", true, 4.7, "Little Italy", 20));
        items.add(new MenuItem(null, "Cheesy Baked Lasagna", "Layers of pasta sheets, rich vegetable ragu, creamy bechamel, and melted golden mozzarella crust.", new BigDecimal("350.0"), "Pastas", true, "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800&q=80", true, 4.8, "Little Italy", 25));
        items.add(new MenuItem(null, "Pink Sauce Chicken Fusilli", "Fusilli pasta tossed in a harmonious blend of tomato marinara and creamy alfredo sauce with grilled chicken.", new BigDecimal("320.0"), "Pastas", true, "https://images.unsplash.com/photo-1621996316565-e3dbc646d9a9?w=800&q=80", false, 4.8, "Pasta Express", 20));
        items.add(new MenuItem(null, "Spaghetti Aglio e Olio", "Classic spaghetti tossed in extra virgin olive oil, sliced golden garlic, chili flakes, parsley and parmesan.", new BigDecimal("270.0"), "Pastas", true, "https://upload.wikimedia.org/wikipedia/commons/0/08/Aglio-e-olio.png", true, 4.6, "Crust & Craft", 15));
        items.add(new MenuItem(null, "Crispy Truffle Parmesan Fries", "Shoestring golden fries tossed in aromatic white truffle oil, grated aged parmesan, and fresh herbs.", new BigDecimal("190.0"), "Pastas", true, "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80", true, 4.8, "Crust & Craft", 15));
        items.add(new MenuItem(null, "Grilled Herb Chicken Steak", "Tender marinated chicken breast grilled with thyme herb butter, served with mashed potato and pepper jus.", new BigDecimal("380.0"), "Pastas", true, "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800&q=80", false, 4.8, "The Bistro", 25));
        items.add(new MenuItem(null, "Fish and Chips with Tartar Dip", "Beer batter fried flaky fish fillet served with crisp french fries, lemon wedges, and house tartar sauce.", new BigDecimal("340.0"), "Pastas", true, "https://images.unsplash.com/photo-1579208575657-c595a053b977?w=800&q=80", false, 4.7, "The Bistro", 20));
        items.add(new MenuItem(null, "Mac & Cheese Supreme", "Elbow macaroni in a rich three-cheese sauce topped with buttered panko breadcrumbs and baked golden.", new BigDecimal("250.0"), "Pastas", true, "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=800&q=80", true, 4.6, "Pasta Express", 20));

        // 8. STREET FOOD, CHAAT & STARTERS (10 items)
        items.add(new MenuItem(null, "Pani Puri / Golgappa Platter (8 pcs)", "Crispy puffed puris filled with spiced potato and chickpea mash, served with tangy mint water and sweet tamarind.", new BigDecimal("90.0"), "Street Food", true, "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e9/Pani_Puri1.JPG/960px-Pani_Puri1.JPG", true, 4.8, "Haldiram's Express", 10));
        items.add(new MenuItem(null, "Dahi Puri with Sweet Yogurt & Sev", "Crisp puris filled with spiced potatoes, sweet beaten yogurt, mint chutney, tamarind sauce and crispy nylon sev.", new BigDecimal("120.0"), "Street Food", true, "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/db/Dahi_Puri_by_Jai_Ambe_Chaat_Bhandaar_in_Bhopal_Madhya_Pradesh.jpg/960px-Dahi_Puri_by_Jai_Ambe_Chaat_Bhandaar_in_Bhopal_Madhya_Pradesh.jpg", true, 4.7, "Haldiram's Express", 10));
        items.add(new MenuItem(null, "Samosa Chaat with Tangy Chutneys", "Crushed golden potato samosas topped with warm chole masala, spiced curd, tamarind glaze, and fresh coriander.", new BigDecimal("110.0"), "Street Food", true, "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c4/Samosas%2C_snack_food_at_Wikipedia%27s_16th_Birthday_celebration_in_Chittagong_%2801%29.jpg/960px-Samosas%2C_snack_food_at_Wikipedia%27s_16th_Birthday_celebration_in_Chittagong_%2801%29.jpg", true, 4.8, "Chaat Junction", 10));
        items.add(new MenuItem(null, "Pav Bhaji with Extra Butter", "Spiced mashed vegetable curry cooked on flat iron tava, served with two buttery toasted pav buns and lemon.", new BigDecimal("160.0"), "Street Food", true, "https://upload.wikimedia.org/wikipedia/commons/4/4a/Bambayya_Pav_bhaji.jpg", true, 4.9, "Sardar Pav Bhaji", 15));
        items.add(new MenuItem(null, "Mumbai Vada Pav Combo (2 pcs)", "Spicy potato batata vada in soft pav smeared with dry garlic chutney and fried salted green chili.", new BigDecimal("80.0"), "Street Food", true, "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4e/Vada_Pav-Indian_street_food.JPG/960px-Vada_Pav-Indian_street_food.JPG", true, 4.8, "Goli Vada Pav", 10));
        items.add(new MenuItem(null, "Tandoori Paneer Tikka (6 pcs)", "Succulent cubes of cottage cheese marinated in spiced yogurt and grilled to smoky perfection with bell peppers.", new BigDecimal("260.0"), "Street Food", true, "https://upload.wikimedia.org/wikipedia/commons/b/b4/Paneertikkaindia.jpg", true, 4.8, "Punjab Grill", 20));
        items.add(new MenuItem(null, "Chicken Malai Tikka (6 pcs)", "Boneless chicken marinated in cream, cashew paste, mild cardamom and cheese, char-grilled over hot coals.", new BigDecimal("310.0"), "Street Food", true, "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/31/Malai_chicken_tikka.JPG/960px-Malai_chicken_tikka.JPG", false, 4.9, "Punjab Grill", 20));
        items.add(new MenuItem(null, "Tandoori Chicken (Half)", "Classic spring chicken marinated in yogurt and red spices, roasted in traditional tandoor, served with onion rings.", new BigDecimal("290.0"), "Street Food", true, "https://upload.wikimedia.org/wikipedia/commons/e/e1/Chickentandoori.jpg", false, 4.8, "Dhaba Express", 25));
        items.add(new MenuItem(null, "Dahi Ke Kebab (4 pcs)", "Melt-in-mouth spiced hung yogurt patties with herbs and green chilies, pan-fried to crisp perfection.", new BigDecimal("220.0"), "Street Food", true, "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b0/Dahi_Kebab.jpg/960px-Dahi_Kebab.jpg", true, 4.7, "Haldiram's Express", 15));
        items.add(new MenuItem(null, "Crispy Corn Salt & Pepper", "Sweet corn kernels tossed with crunchy onions, bell peppers, cracked black pepper and green onions.", new BigDecimal("180.0"), "Street Food", true, "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/ff/Crispy_chilli_baby_corn.....jpg/960px-Crispy_chilli_baby_corn.....jpg", true, 4.5, "Chaat Junction", 15));

        // 9. HEALTHY BOWLS & SALADS (10 items)
        items.add(new MenuItem(null, "Mediterranean Quinoa Salad", "Organic quinoa with diced cucumbers, cherry tomatoes, kalamata olives, feta cheese, and lemon vinaigrette.", new BigDecimal("240.0"), "Healthy Bowls", true, "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80", true, 4.7, "Salad Days", 15));
        items.add(new MenuItem(null, "Classic Caesar Salad with Grilled Chicken", "Crisp romaine lettuce, grilled chicken breast, herb croutons, and parmesan shavings with creamy caesar dressing.", new BigDecimal("270.0"), "Healthy Bowls", true, "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&q=80", false, 4.8, "Salad Days", 15));
        items.add(new MenuItem(null, "Greek Feta & Olive Salad", "Fresh crisp bell peppers, cucumbers, red onions, plump olives, and creamy feta block with extra virgin olive oil.", new BigDecimal("230.0"), "Healthy Bowls", true, "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80", true, 4.6, "Healthy Co.", 15));
        items.add(new MenuItem(null, "Tropical Acai Smoothie Bowl", "Superfood organic acai berry puree topped with sliced bananas, blueberries, chia seeds, and crunchy granola.", new BigDecimal("310.0"), "Healthy Bowls", true, "https://images.unsplash.com/photo-1590137583688-66d482594bc6?w=800&q=80", true, 4.9, "Acai & Greens", 15));
        items.add(new MenuItem(null, "Grilled Tofu & Avocado Protein Bowl", "Marinated grilled tofu, sliced avocado, edamame, brown rice, and sesame ginger dressing.", new BigDecimal("280.0"), "Healthy Bowls", true, "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80", true, 4.7, "Salad Days", 15));
        items.add(new MenuItem(null, "High Protein Sprout & Paneer Salad", "Sprouted moong, chopped raw paneer, pomegranate pearls, cucumber, tomato tossed in chatpata lemon dressing.", new BigDecimal("170.0"), "Healthy Bowls", true, "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80", true, 4.6, "Healthy Co.", 15));
        items.add(new MenuItem(null, "Oatmeal Berry Breakfast Bowl", "Warm rolled oats cooked in almond milk with wild berries, sliced almonds, pumpkin seeds and raw honey.", new BigDecimal("190.0"), "Healthy Bowls", true, "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=800&q=80", true, 4.6, "Acai & Greens", 15));
        items.add(new MenuItem(null, "Sourdough Avocado Toast with Poached Egg", "Artisanal toasted sourdough spread with creamy guacamole, microgreens, chili flakes, and organic poached egg.", new BigDecimal("210.0"), "Healthy Bowls", true, "https://images.unsplash.com/photo-1603048297172-c92544798d5e?w=800&q=80", false, 4.8, "The Green Cafe", 15));
        items.add(new MenuItem(null, "Grilled Salmon Superfood Bowl", "Pan-seared Atlantic salmon fillet with steamed asparagus, quinoa, cherry tomatoes, and honey mustard glaze.", new BigDecimal("490.0"), "Healthy Bowls", true, "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80", false, 4.9, "Salad Days", 25));
        items.add(new MenuItem(null, "Detox Green Goddess Salad", "Fresh baby spinach, kale, cucumbers, green apples, pistachios, and creamy avocado cilantro dressing.", new BigDecimal("220.0"), "Healthy Bowls", true, "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=800&q=80", true, 4.5, "The Green Cafe", 15));

        // 10. DESSERTS, CAKES & ICE CREAMS (10 items)
        items.add(new MenuItem(null, "Molten Choco Lava Cake", "Warm decadent dark chocolate cake with a molten chocolate center, served with vanilla ice cream scoop.", new BigDecimal("160.0"), "Desserts", true, "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&q=80", true, 4.9, "Sweet Tooth", 15));
        items.add(new MenuItem(null, "Warm Gulab Jamun with Rabri (2 pcs)", "Soft fried milk dough dumplings soaked in rose flavored sugar syrup, served warm over rich saffron rabri.", new BigDecimal("130.0"), "Desserts", true, "https://images.unsplash.com/photo-1666190092159-3171cf0fbb12?w=800&q=80", true, 4.9, "Haldiram's Express", 10));
        items.add(new MenuItem(null, "Royal Rasmalai (2 pcs)", "Flattened cottage cheese discs soaked in clotted saffron milk garnished with chopped pistachios and almonds.", new BigDecimal("140.0"), "Desserts", true, "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ae/Ras_Malai_2.JPG/960px-Ras_Malai_2.JPG", true, 4.8, "Haldiram's Express", 10));
        items.add(new MenuItem(null, "New York Baked Cheesecake Slice", "Dense, rich, and velvety smooth cream cheese cake baked over a buttery graham cracker crust with berry coulis.", new BigDecimal("240.0"), "Desserts", true, "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&q=80", true, 4.8, "The Cheesecake Co.", 10));
        items.add(new MenuItem(null, "Warm Chocolate Fudge Brownie with Ice Cream", "Gooey double chocolate brownie loaded with toasted walnuts and drizzled with hot fudge sauce.", new BigDecimal("190.0"), "Desserts", true, "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80", true, 4.9, "Sweet Tooth", 15));
        items.add(new MenuItem(null, "Alphonso Mango Kulfi Stick", "Traditional Indian slow-churned frozen milk dessert infused with pure Alphonso mango pulp and cardamom.", new BigDecimal("90.0"), "Desserts", true, "https://upload.wikimedia.org/wikipedia/commons/8/8a/Matka_kulfi.jpg", true, 4.7, "Kulfi Nation", 10));
        items.add(new MenuItem(null, "Belgian Dark Chocolate Waffle", "Freshly baked crisp Belgian waffle smothered in melted dark Belgian chocolate and dusted with powdered sugar.", new BigDecimal("220.0"), "Desserts", true, "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=800&q=80", true, 4.8, "Belgian Waffle Co.", 15));
        items.add(new MenuItem(null, "Classic Italian Tiramisu Tub", "Espresso dipped savoiardi ladyfingers layered with whipped mascarpone cream and dusted with cocoa powder.", new BigDecimal("250.0"), "Desserts", true, "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80", true, 4.8, "Little Italy", 10));
        items.add(new MenuItem(null, "Red Velvet Jar Cake", "Layers of crimson velvet sponge cake, silky cream cheese frosting, and chocolate crumbles in a keepsake glass jar.", new BigDecimal("160.0"), "Desserts", true, "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=800&q=80", true, 4.7, "The Cheesecake Co.", 10));
        items.add(new MenuItem(null, "Fluffy Buttermilk Pancakes with Maple Syrup", "Stack of three golden fluffy buttermilk pancakes topped with whipped butter and pure Canadian maple syrup.", new BigDecimal("220.0"), "Desserts", true, "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800&q=80", true, 4.7, "Sweet Tooth", 15));

        // 11. BEVERAGES, SHAKES & CHAI (10 items)
        items.add(new MenuItem(null, "Adrak Elaichi Masala Chai (Serves 2)", "Authentic boiled strong Assam tea brewed with crushed fresh ginger, green cardamom and whole milk in flask.", new BigDecimal("100.0"), "Beverages", true, "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80", true, 4.9, "Chai Point", 15));
        items.add(new MenuItem(null, "South Indian Filter Coffee", "Aromatic slow-dripped chicory coffee decoction frothed with boiling hot creamy milk in traditional brass dabarah.", new BigDecimal("90.0"), "Beverages", true, "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/51/Filter_kaapi.JPG/960px-Filter_kaapi.JPG", true, 4.9, "Udupi Bhavan", 15));
        items.add(new MenuItem(null, "Oreo Overload Thick Shake", "Creamy vanilla ice cream blended with crushed Oreo cookies, whole milk, and topped with chocolate fudge swirl.", new BigDecimal("170.0"), "Beverages", true, "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80", true, 4.8, "Shake Factory", 15));
        items.add(new MenuItem(null, "Alphonso Mango Lassi", "Thick sweet yogurt smoothie blended with ripe Alphonso mangoes and topped with crushed pistachios.", new BigDecimal("120.0"), "Beverages", true, "https://images.unsplash.com/photo-1553787499-6f9133860278?w=800&q=80", true, 4.8, "Haldiram's Express", 10));
        items.add(new MenuItem(null, "Cold Coffee with Vanilla Ice Cream", "Rich espresso blended cold with creamy milk, chocolate sauce, and topped with a scoop of vanilla ice cream.", new BigDecimal("150.0"), "Beverages", true, "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&q=80", true, 4.7, "Cafe Delight", 15));
        items.add(new MenuItem(null, "Fresh Virgin Mojito with Lime & Mint", "Refreshing fizzy mocktail muddled with fresh garden mint leaves, lime juice, brown sugar and chilled soda.", new BigDecimal("140.0"), "Beverages", true, "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80", true, 4.7, "Cafe Delight", 10));
        items.add(new MenuItem(null, "Fresh Watermelon Basil Juice", "100% cold pressed sweet watermelon juice infused with fresh basil leaves without any added sugar.", new BigDecimal("120.0"), "Beverages", true, "https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=800&q=80", true, 4.6, "Juice Lounge", 10));
        items.add(new MenuItem(null, "Iced Caramel Macchiato", "Bold espresso layered over chilled milk and sweet vanilla syrup, finished with a buttery caramel drizzle.", new BigDecimal("180.0"), "Beverages", true, "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&q=80", true, 4.8, "Cafe Delight", 15));
        items.add(new MenuItem(null, "Sweet Royal Badam Milk", "Warm or chilled saffron infused almond milk simmered with cardamom, crushed almonds and pistachio bits.", new BigDecimal("110.0"), "Beverages", true, "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80", true, 4.7, "Chai Point", 15));
        items.add(new MenuItem(null, "Peach Iced Tea with Fresh Mint", "Crisp brewed Ceylon black tea infused with natural peach nectar and served over crushed ice with fresh mint.", new BigDecimal("110.0"), "Beverages", true, "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80", true, 4.6, "Juice Lounge", 10));

        return items;
    }
}
