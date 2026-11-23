import React, { useState, useEffect, useRef } from 'react';
import { soundService } from '../../services/soundService';

export interface MenuItemFeed {
  id: number;
  name: string;
  category: string;
  price: number;
  badge?: string;
  rating: number;
  reviewsCount: number;
  description: string;
  image: string;
  isPopular?: boolean;
}

export interface CartItemProp {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
  notes?: string;
}

export const MENU_ITEMS_CATALOG: MenuItemFeed[] = [
  // --- FIRST ROW: COFFEE, COLD COFFEE & CAPPUCCINO SPECIALS ---
  {
    id: 233,
    name: 'Classic Thick Cold Coffee with Ice Cream',
    category: 'Coffee & Brews',
    price: 179,
    badge: 'BESTSELLER',
    rating: 4.9,
    reviewsCount: 385,
    description: 'Rich slow-churned Arabica coffee blended thick with chilled creamy milk, topped with a scoop of vanilla ice cream & cocoa dust.',
    image: '/images/cold_coffee.jpg',
    isPopular: true,
  },
  {
    id: 235,
    name: 'Artisan Hot Foamy Cappuccino',
    category: 'Coffee & Brews',
    price: 149,
    badge: 'BARISTA SPEC',
    rating: 4.8,
    reviewsCount: 240,
    description: 'Freshly pulled dark roast espresso layered with velvety steamed whole milk, thick foam and artisan latte art.',
    image: '/images/hot_coffee.jpg',
    isPopular: true,
  },
  {
    id: 234,
    name: 'Hazelnut Frappe Chilled Cold Coffee',
    category: 'Coffee & Brews',
    price: 199,
    badge: 'CHEF CHOICE',
    rating: 4.9,
    reviewsCount: 290,
    description: 'Double-shot espresso blended with roasted hazelnut syrup, ice cream and topped with silky whipped cream swirl.',
    image: '/images/iced_latte.jpg',
    isPopular: true,
  },
  {
    id: 237,
    name: 'Belgian Mocha Chocolate Frappe',
    category: 'Coffee & Brews',
    price: 219,
    badge: 'DECADENT',
    rating: 4.9,
    reviewsCount: 320,
    description: 'Dark Belgian melted chocolate ganache fused with cold espresso, creamy milk, crushed ice & crunchy chocolate pearls.',
    image: '/images/cold_coffee.jpg',
    isPopular: true,
  },
  {
    id: 236,
    name: 'Caramel Macchiato Iced Coffee',
    category: 'Coffee & Brews',
    price: 189,
    badge: 'POPULAR',
    rating: 4.8,
    reviewsCount: 215,
    description: 'Chilled bold espresso poured over crystal ice and condensed milk, finished with buttery salted caramel drizzle.',
    image: '/images/iced_latte.jpg',
    isPopular: false,
  },

  // --- BUCKETS & CRISPY SPECIALS ---
  {
    id: 201,
    name: '8 Pcs Crispy Chicken Bucket',
    category: 'Buckets',
    price: 599,
    badge: 'BESTSELLER',
    rating: 4.9,
    reviewsCount: 380,
    description: 'Freshly breaded crunchy chicken with garlic mayo dip, golden fries & drinks.',
    image: '/images/chicken_banner.jpg',
    isPopular: true,
  },
  {
    id: 202,
    name: 'Zinger Crunch Chicken Burger',
    category: 'Burgers',
    price: 299,
    badge: 'POPULAR',
    rating: 4.8,
    reviewsCount: 290,
    description: 'Crispy fried breast fillet, spicy sriracha slaw, pickled gherkins & seasoned fries.',
    image: '/images/zinger_combo.jpg',
    isPopular: true,
  },
  {
    id: 205,
    name: 'New Orleans Pepperoni Pizza',
    category: 'Pizzas',
    price: 399,
    badge: 'CHEF CHOICE',
    rating: 4.9,
    reviewsCount: 420,
    description: '12-inch volcanic stone-fired crust, aged mozzarella, pepperoni & fresh basil.',
    image: '/images/pizza.jpg',
    isPopular: true,
  },
  {
    id: 204,
    name: 'Tuscan Beef Ragù Pasta',
    category: 'Pasta',
    price: 349,
    badge: 'CHEF CHOICE',
    rating: 4.9,
    reviewsCount: 312,
    description: 'Slow-simmered Tuscan beef ragù bolognese with handmade pasta & garlic crust.',
    image: '/images/pasta_bolognese.jpg',
    isPopular: true,
  },
  {
    id: 206,
    name: 'Creamy Truffle Fettuccine Alfredo',
    category: 'Pasta',
    price: 379,
    badge: 'GOURMET',
    rating: 4.9,
    reviewsCount: 265,
    description: 'Silky Parmigiano-Reggiano emulsion, wild black truffle butter & fresh cracked pepper.',
    image: '/images/pasta_alfredo.jpg',
    isPopular: true,
  },
  {
    id: 207,
    name: 'Spicy Garlic Penne Arrabiata',
    category: 'Pasta',
    price: 299,
    badge: 'SPICY',
    rating: 4.7,
    reviewsCount: 198,
    description: 'San Marzano tomatoes, roasted garlic, fiery Calabrian chili oil & fresh parsley.',
    image: '/images/pasta_arrabiata.jpg',
    isPopular: false,
  },
  {
    id: 208,
    name: 'Classic Roman Spaghetti Carbonara',
    category: 'Pasta',
    price: 349,
    badge: 'AUTHENTIC',
    rating: 4.8,
    reviewsCount: 215,
    description: 'Crispy smoked cured pork guanciale, pasture egg yolks & Pecorino Romano.',
    image: '/images/pasta_carbonara.jpg',
    isPopular: true,
  },
  {
    id: 209,
    name: 'Genovese Basil Pesto Tagliatelle',
    category: 'Pasta',
    price: 329,
    badge: 'FRESH',
    rating: 4.8,
    reviewsCount: 180,
    description: 'Hand-crushed basil, toasted pine nuts, extra virgin olive oil & toasted crust.',
    image: '/images/pasta_pesto.jpg',
    isPopular: false,
  },
  {
    id: 203,
    name: '4 Pcs Golden Chicken Tenders',
    category: 'Tenders & Sides',
    price: 249,
    badge: 'SAVE 15%',
    rating: 4.7,
    reviewsCount: 164,
    description: 'Buttermilk soaked tenderloins fried golden brown with smoky honey mustard.',
    image: '/images/chicken_banner.jpg',
    isPopular: true,
  },
  {
    id: 210,
    name: 'Sizzling Buffalo Wings Platter',
    category: 'Buckets',
    price: 399,
    badge: 'HOT',
    rating: 4.8,
    reviewsCount: 175,
    description: 'Glazed crispy wings in spicy butter buffalo sauce with gorgonzola dip & celery.',
    image: '/images/chicken_banner.jpg',
    isPopular: false,
  },

  // --- EXTRA GOURMET PIZZAS ---
  {
    id: 211,
    name: 'Quattro Formaggi Four-Cheese Pizza',
    category: 'Pizzas',
    price: 449,
    badge: 'CHEESY',
    rating: 4.9,
    reviewsCount: 230,
    description: 'Creamy gorgonzola, smoked provolone, fresh buffalo mozzarella & shaved parmesan with hot honey drizzle.',
    image: '/images/pizza.jpg',
    isPopular: true,
  },
  {
    id: 212,
    name: 'Smoky BBQ Chicken & Bacon Pizza',
    category: 'Pizzas',
    price: 429,
    badge: 'SMOKY',
    rating: 4.8,
    reviewsCount: 284,
    description: 'Slow-smoked pulled chicken breast, crispy pancetta bacon, red onions & sweet hickory barbecue drizzle.',
    image: '/images/pizza.jpg',
    isPopular: true,
  },
  {
    id: 213,
    name: 'Truffle Wild Mushroom Pizza',
    category: 'Pizzas',
    price: 449,
    badge: 'GOURMET',
    rating: 4.9,
    reviewsCount: 195,
    description: 'Fire-roasted portobello & cremini mushrooms, white truffle cream sauce, fresh thyme & fior di latte.',
    image: '/images/pizza.jpg',
    isPopular: false,
  },
  {
    id: 214,
    name: 'Rustic Margherita D.O.P.',
    category: 'Pizzas',
    price: 329,
    badge: 'CLASSIC',
    rating: 4.8,
    reviewsCount: 340,
    description: 'San Marzano plum tomatoes, torn fresh basil, virgin olive oil & creamy fior di latte on blistered stone dough.',
    image: '/images/pizza.jpg',
    isPopular: true,
  },

  // --- EXTRA ARTISAN BURGERS ---
  {
    id: 215,
    name: 'Double Smoked Bacon Cheeseburger',
    category: 'Burgers',
    price: 349,
    badge: 'BESTSELLER',
    rating: 4.9,
    reviewsCount: 360,
    description: 'Two 100% Angus smash patties, double aged cheddar, applewood smoked bacon, caramelized onions & house sauce on brioche.',
    image: '/images/zinger_combo.jpg',
    isPopular: true,
  },
  {
    id: 216,
    name: 'Truffle Mushroom Swiss Burger',
    category: 'Burgers',
    price: 369,
    badge: 'CHEF CHOICE',
    rating: 4.8,
    reviewsCount: 210,
    description: 'Seared beef patty smothered in buttery sautéed mushrooms, melted Alpine Swiss cheese & black truffle aioli.',
    image: '/images/zinger_combo.jpg',
    isPopular: true,
  },
  {
    id: 217,
    name: 'Spicy Nashville Hot Chicken Burger',
    category: 'Burgers',
    price: 299,
    badge: 'EXTRA SPICY',
    rating: 4.9,
    reviewsCount: 325,
    description: 'Ultra-crispy double-dredged chicken dipped in Nashville chili oil, cayenne dust, crinkle pickles & creamy slaw.',
    image: '/images/zinger_combo.jpg',
    isPopular: true,
  },
  {
    id: 218,
    name: 'Smoky Texas BBQ Pulled Beef Burger',
    category: 'Burgers',
    price: 329,
    badge: 'SMOKED',
    rating: 4.7,
    reviewsCount: 185,
    description: '14-hour hickory-smoked shredded beef brisket, smoky barbecue glaze, crispy fried onion strings & pickles.',
    image: '/images/zinger_combo.jpg',
    isPopular: false,
  },

  // --- EXTRA BUCKETS & FAMILY FEASTS ---
  {
    id: 219,
    name: '16 Pcs Mega Feast Family Bucket',
    category: 'Buckets',
    price: 899,
    badge: 'FAMILY COMBO',
    rating: 4.9,
    reviewsCount: 410,
    description: '16 pcs hand-breaded golden crispy chicken, 4 honey biscuits, large loaded crinkle fries & 4 chef signature dips.',
    image: '/images/chicken_banner.jpg',
    isPopular: true,
  },
  {
    id: 220,
    name: 'Sweet Honey Garlic Wings (12 Pcs)',
    category: 'Buckets',
    price: 379,
    badge: 'SWEET & SAVORY',
    rating: 4.8,
    reviewsCount: 245,
    description: 'Crispy double-fried chicken wings tossed in rich sticky honey roasted garlic glaze and toasted sesame seeds.',
    image: '/images/chicken_banner.jpg',
    isPopular: true,
  },
  {
    id: 221,
    name: 'Peri-Peri Flame-Grilled Half Chicken',
    category: 'Buckets',
    price: 429,
    badge: 'FLAME CHARRED',
    rating: 4.8,
    reviewsCount: 190,
    description: 'Marinated 24 hours in bird’s eye chilies, lemon & herbs, flame-charred over hot coals with spiced basmati rice.',
    image: '/images/chicken_banner.jpg',
    isPopular: false,
  },

  // --- EXTRA TENDERS & SIDES ---
  {
    id: 222,
    name: 'Loaded Cajun Cheese Fries',
    category: 'Tenders & Sides',
    price: 199,
    badge: 'LOADED',
    rating: 4.9,
    reviewsCount: 310,
    description: 'Crispy crinkle-cut fries smothered in warm molten cheddar cheese sauce, crispy bacon bits, jalapeños & ranch.',
    image: '/images/zinger_combo.jpg',
    isPopular: true,
  },
  {
    id: 223,
    name: 'Crispy Mozzarella Sticks (6 Pcs)',
    category: 'Tenders & Sides',
    price: 219,
    badge: 'CHEESE PULL',
    rating: 4.8,
    reviewsCount: 220,
    description: 'Stretchy aged Wisconsin mozzarella coated in herb-seasoned Italian breadcrumbs, served with warm marinara.',
    image: '/images/pizza.jpg',
    isPopular: true,
  },
  {
    id: 224,
    name: 'Truffle Parmesan Herb Fries',
    category: 'Tenders & Sides',
    price: 179,
    badge: 'GOURMET SIDE',
    rating: 4.8,
    reviewsCount: 180,
    description: 'Skin-on golden fries tossed with aromatic white truffle oil, grated Parmigiano-Reggiano & fresh chopped parsley.',
    image: '/images/zinger_combo.jpg',
    isPopular: false,
  },
  {
    id: 225,
    name: 'Spicy Fire-Roasted Jalapeño Poppers',
    category: 'Tenders & Sides',
    price: 189,
    badge: 'CRISPY & SPICY',
    rating: 4.7,
    reviewsCount: 155,
    description: 'Golden crunchy crumb poppers stuffed with velvety cream cheese and spicy roasted jalapeños with cilantro crema.',
    image: '/images/zinger_combo.jpg',
    isPopular: false,
  },

  // --- DESSERTS ---
  {
    id: 226,
    name: 'Warm Molten Dark Chocolate Lava Cake',
    category: 'Desserts',
    price: 249,
    badge: 'CHEF CHOICE',
    rating: 4.9,
    reviewsCount: 450,
    description: 'Decadent Belgian dark chocolate cake with a rich molten center that flows hot when cut, served with vanilla bean gelato.',
    image: '/images/pasta_alfredo.jpg',
    isPopular: true,
  },
  {
    id: 227,
    name: 'Classic Italian Tiramisu al Mascarpone',
    category: 'Desserts',
    price: 229,
    badge: 'TRADITIONAL',
    rating: 4.9,
    reviewsCount: 290,
    description: 'Espresso-dipped ladyfingers layered with whipped mascarpone cream, dark Dutch cocoa powder & amaretto aroma.',
    image: '/images/pasta_bolognese.jpg',
    isPopular: true,
  },
  {
    id: 228,
    name: 'New York Baked Berry Cheesecake',
    category: 'Desserts',
    price: 249,
    badge: 'SWEET TREAT',
    rating: 4.8,
    reviewsCount: 215,
    description: 'Velvety dense baked cream cheesecake on graham cracker butter crust with tart wild forest berry reduction.',
    image: '/images/pasta_alfredo.jpg',
    isPopular: false,
  },
  {
    id: 229,
    name: 'Cinnamon Sugar Churros with Dulce de Leche',
    category: 'Desserts',
    price: 199,
    badge: 'CRUNCHY TREAT',
    rating: 4.8,
    reviewsCount: 235,
    description: 'Golden fried Spanish dough pastry rolled in fragrant cinnamon sugar with warm dulce de leche & melted chocolate dips.',
    image: '/images/zinger_combo.jpg',
    isPopular: true,
  },

  // --- BEVERAGES & REFRESHMENTS ---
  {
    id: 230,
    name: 'Sparkling Passionfruit Mint Cooler',
    category: 'Beverages',
    price: 149,
    badge: 'REFRESHING',
    rating: 4.8,
    reviewsCount: 195,
    description: 'Real passionfruit pulp, fresh bruised mint leaves, lime juice, club soda & crushed ice in a frosty tall glass.',
    image: '/images/chicken_banner.jpg',
    isPopular: true,
  },
  {
    id: 231,
    name: 'Iced Salted Caramel Cold Brew',
    category: 'Beverages',
    price: 169,
    badge: 'ARTISAN COFFEE',
    rating: 4.9,
    reviewsCount: 240,
    description: 'Slow-steeped 16-hour artisan coffee poured over crystal ice, topped with thick salted caramel cold cream foam.',
    image: '/images/zinger_combo.jpg',
    isPopular: true,
  },
  {
    id: 232,
    name: 'Fresh Squeezed Strawberry Lemonade',
    category: 'Beverages',
    price: 139,
    badge: 'FRESH JUICE',
    rating: 4.7,
    reviewsCount: 170,
    description: 'Ripe sweet strawberries muddled with freshly squeezed tart lemons and raw cane sugar over crushed ice.',
    image: '/images/chicken_banner.jpg',
    isPopular: false,
  },
];

interface DiscoveryMenuFeedProps {
  onOpenPastaWheel?: () => void;
  onOpenPizzaStage?: () => void;
  onAddToCart: (item: MenuItemFeed, quantity: number) => void;
  cartCount: number;
  cartItems?: CartItemProp[];
  placedTableOrders?: CartItemProp[];
  onUpdateQuantity?: (name: string, delta: number) => void;
  onCheckoutOrder?: () => void;
  onOpenCart?: () => void;
  onOpenBillPayment?: () => void;
  onOpenCallServant?: () => void;
  onOpenTracker?: () => void;
  onOpenSplitBill?: () => void;
  onOpenReview?: () => void;
  onOpenQRStandee?: () => void;
  tableId?: number;
  onSelectTableId?: (id: number) => void;
  appliedCoupon?: string;
  discountPercent?: number;
  subtotal?: number;
  discountAmount?: number;
  finalTotal?: number;
  isOrderPlacedSuccess?: boolean;
  onDismissOrderSuccess?: () => void;
}

export interface PromoSlide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  item: MenuItemFeed;
  buttonText: string;
  dealTag?: string;
  gradient: string;
  mediaType: 'video' | 'image';
  mediaSrc: string;
  poster?: string;
  steamEmoji?: string;
}

export const PROMO_SLIDES: PromoSlide[] = [
  {
    id: 'pizza-deluxe-video',
    badge: 'FRESH FROM THE OVEN',
    title: 'SIZZLING HOT PEPPERONI PIZZA!',
    subtitle: 'Golden bubbly mozzarella, artisanal crisp dough, & aromatic spiced pepperoni served piping hot straight to your table.',
    item: MENU_ITEMS_CATALOG.find((i) => i.id === 205) || MENU_ITEMS_CATALOG[0],
    buttonText: 'Order Pepperoni Pizza (₹399)',
    gradient: 'from-[#b45309] via-[#d97706] to-[#78350f]',
    mediaType: 'video',
    mediaSrc: '/videos/pizza_deluxe.mp4',
    poster: '/images/pizza.jpg',
  },
  {
    id: 'bbq-flame-video',
    badge: 'OPEN FLAME GRILL',
    title: 'SIZZLING MASTER CHARCOAL GRILL!',
    subtitle: 'Juicy cuts of prime marinated meat searing and sizzling to smoky, tender perfection over hot barbecue embers.',
    item: MENU_ITEMS_CATALOG.find((i) => i.id === 202) || MENU_ITEMS_CATALOG[0],
    buttonText: 'Order Crunch Burger (₹299)',
    gradient: 'from-[#7c2d12] via-[#9a3412] to-[#431407]',
    mediaType: 'video',
    mediaSrc: '/videos/grill_roast.mp4',
    poster: '/images/zinger_combo.jpg',
  },
  {
    id: 'pasta-parmesan-video',
    badge: 'ARTISAN ITALIAN PASTA',
    title: 'FRESH BOLOGNESE & PARMESAN!',
    subtitle: 'Steaming handmade al dente pasta tossed in rich braised beef ragù, showered with freshly shaved aged parmesan cheese.',
    item: MENU_ITEMS_CATALOG.find((i) => i.id === 204) || MENU_ITEMS_CATALOG[0],
    buttonText: 'Order Bolognese (₹349)',
    gradient: 'from-[#831843] via-[#9d174d] to-[#500724]',
    mediaType: 'video',
    mediaSrc: '/videos/pasta_parmesan.mp4',
    poster: '/images/pasta_bolognese.jpg',
  },
  {
    id: 'chef-grill-video',
    badge: 'LIVE CHEF GRILL SPECIAL',
    title: 'LIVE SIZZLING SKEWERS & STEAKS!',
    subtitle: 'Watch our chef sear marinated skewers, prime steaks and tender chicken right on the blazing hot restaurant flat-top grill.',
    item: MENU_ITEMS_CATALOG.find((i) => i.id === 201) || MENU_ITEMS_CATALOG[0],
    buttonText: 'Order Chicken Combo (₹599)',
    gradient: 'from-[#991b1b] via-[#b91c1c] to-[#7f1d1d]',
    mediaType: 'video',
    mediaSrc: '/videos/chef_grill.mp4',
    poster: '/images/chicken_banner.jpg',
  },
  {
    id: 'chocolate-dessert-video',
    badge: 'DECADENT HOUSE DESSERT',
    title: 'WARM SILKY MOLTEN CHOCOLATE!',
    subtitle: 'Cascades of pure Belgian dark chocolate flowing warm and glossy, crafted for sweet lovers and chocolate indulgence.',
    item: MENU_ITEMS_CATALOG.find((i) => i.id === 226) || MENU_ITEMS_CATALOG[0],
    buttonText: 'Order Lava Cake (₹249)',
    gradient: 'from-[#4c1d95] via-[#6d28d9] to-[#3b0764]',
    mediaType: 'video',
    mediaSrc: '/videos/chocolate_fountain.mp4',
    poster: '/images/pasta_alfredo.jpg',
  },
  {
    id: 'chicken-bucket',
    badge: 'HOT & CRISPY SPECIAL',
    title: 'CRAVE THE CRISPY PERFECTION!',
    subtitle: 'Hand-breaded crunchy chicken, golden seasoned fries & chilled signature beverages cooked fresh for your table.',
    item: MENU_ITEMS_CATALOG.find((i) => i.id === 201) || MENU_ITEMS_CATALOG[0],
    buttonText: 'Order Bucket (₹599)',
    dealTag: '30% OFF DEAL',
    gradient: 'from-[#701a75] via-[#86198f] to-[#4a044e]',
    mediaType: 'image',
    mediaSrc: '/images/chicken_banner.jpg',
  },
];

export const DiscoveryMenuFeed: React.FC<DiscoveryMenuFeedProps> = ({
  onAddToCart,
  cartCount,
  cartItems = [],
  placedTableOrders = [],
  onUpdateQuantity,
  onCheckoutOrder,
  onOpenBillPayment,
  onOpenCallServant,
  onOpenTracker,
  onOpenSplitBill,
  onOpenReview,
  onOpenQRStandee,
  tableId = 1,
  onSelectTableId,
  appliedCoupon = 'BELLACRAVE',
  discountPercent = 30,
  subtotal: propSubtotal,
  discountAmount: propDiscountAmount,
  finalTotal: propFinalTotal,
  isOrderPlacedSuccess = false,
  onDismissOrderSuccess,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Items');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [wishlist, setWishlist] = useState<Record<number, boolean>>({});
  const [addedItemAlert, setAddedItemAlert] = useState<number | null>(null);
  const [callAttendantAlert, setCallAttendantAlert] = useState<boolean>(false);

  const categories = [
    { name: 'All Items' },
    { name: 'Coffee & Brews' },
    { name: 'Buckets' },
    { name: 'Pizzas' },
    { name: 'Burgers' },
    { name: 'Pasta' },
    { name: 'Tenders & Sides' },
    { name: 'Desserts' },
    { name: 'Beverages' },
  ];

  // Calculate totals if not passed via props
  const calcSubtotal =
    propSubtotal !== undefined
      ? propSubtotal
      : cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const calcDiscount =
    propDiscountAmount !== undefined
      ? propDiscountAmount
      : (calcSubtotal * discountPercent) / 100;
  const calcTax = Math.round((calcSubtotal - calcDiscount) * 0.05 * 100) / 100;
  const calcFinalTotal =
    propFinalTotal !== undefined
      ? propFinalTotal
      : Math.max(0, calcSubtotal - calcDiscount + calcTax);

  const toggleWishlist = (id: number) => {
    soundService.playTactileClick('high');
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddItem = (item: MenuItemFeed) => {
    soundService.playTactileClick('high');
    onAddToCart(item, 1);
    setAddedItemAlert(item.id);
    setTimeout(() => setAddedItemAlert(null), 1800);
  };

  const handleCallAttendant = () => {
    soundService.playTactileClick('high');
    const targetTableId = tableId || 1;
    const directCall = {
      id: `CALL-${Date.now()}`,
      tableId: targetTableId,
      type: 'Assistance / Service',
      note: 'Guest tapped Call Server from menu view',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(`restroai_table_${targetTableId}_service_call`, JSON.stringify(directCall));
      const channel = new BroadcastChannel('restro_orders_sync');
      channel.postMessage({
        type: 'SERVICE_CALL_REQUEST',
        call: directCall,
        tableId: targetTableId,
        timestamp: Date.now(),
      });
      setTimeout(() => {
        try { channel.close(); } catch(e) {}
      }, 3000);
    } catch(e) {}

    try {
      window.postMessage({ type: 'SERVICE_CALL_REQUEST', tableId: targetTableId, call: directCall }, '*');
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'SERVICE_CALL_REQUEST', tableId: targetTableId, call: directCall }, '*');
      }
      document.querySelectorAll('iframe').forEach(frame => {
        try { frame.contentWindow?.postMessage({ type: 'SERVICE_CALL_REQUEST', tableId: targetTableId, call: directCall }, '*'); } catch(e){}
      });
    } catch(e) {}

    try {
      fetch('/api/service-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ call: directCall }),
      }).catch(() => {});
    } catch(e) {}

    setCallAttendantAlert(true);
    setTimeout(() => setCallAttendantAlert(false), 4500);

    if (onOpenCallServant) {
      onOpenCallServant();
    }
  };

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchDeltaXRef = useRef<number>(0);

  // Auto-advance carousel every 4.0s unless hovered or dragging
  useEffect(() => {
    if (isCarouselPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % PROMO_SLIDES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isCarouselPaused]);

  // Touch and drag swipe handlers
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    touchStartXRef.current = clientX;
    touchDeltaXRef.current = 0;
    setIsCarouselPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (touchStartXRef.current === null) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    touchDeltaXRef.current = clientX - touchStartXRef.current;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current !== null) {
      if (touchDeltaXRef.current < -40) {
        soundService.playTactileClick('high');
        setCurrentSlide((prev) => (prev + 1) % PROMO_SLIDES.length);
      } else if (touchDeltaXRef.current > 40) {
        soundService.playTactileClick('high');
        setCurrentSlide((prev) => (prev - 1 + PROMO_SLIDES.length) % PROMO_SLIDES.length);
      }
    }
    touchStartXRef.current = null;
    touchDeltaXRef.current = 0;
    setTimeout(() => setIsCarouselPaused(false), 2500);
  };

  const handlePrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundService.playTactileClick('mid');
    setCurrentSlide((prev) => (prev - 1 + PROMO_SLIDES.length) % PROMO_SLIDES.length);
  };

  const handleNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundService.playTactileClick('mid');
    setCurrentSlide((prev) => (prev + 1) % PROMO_SLIDES.length);
  };

  const filteredItems = MENU_ITEMS_CATALOG.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All Items' ||
      item.category === selectedCategory ||
      (selectedCategory === 'Beverages' && item.category === 'Coffee & Brews');
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#f6efe2] text-[#3a1a0e] font-sans relative overflow-x-clip pb-16 selection:bg-[#d6361f] selection:text-[#fff4dc]">
      
      {/* 2. Order Booked Banner Alert */}
      {isOrderPlacedSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 animate-bounce font-sans">
          <div className="bg-[#ffd45e] border-3 border-[#3a1a0e] shadow-[6px_8px_0_#3a1a0e] rounded-2xl p-4 text-[#3a1a0e] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#d6361f] text-[#fff4dc] flex items-center justify-center font-semibold text-sm border border-[#3a1a0e]">
                ✓
              </div>
              <div>
                <h4 className="font-semibold text-lg uppercase tracking-wide">
                  Order Booked Successfully!
                </h4>
                <p className="text-xs font-bold text-[#3a1a0e]/80">
                  Chef is preparing your fresh meal for Table #{tableId}. Enjoy your food!
                </p>
              </div>
            </div>
            <button
              onClick={onDismissOrderSuccess}
              className="px-2.5 py-1 rounded-lg bg-[#3a1a0e] text-[#fff4dc] text-xs font-medium uppercase hover:bg-black transition-colors cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Call Attendant Alert */}
      {callAttendantAlert && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
          <div className="bg-[#3a1a0e] border-2 border-[#ffd45e] shadow-[4px_6px_0_#ffd45e] rounded-2xl p-3.5 text-[#fff4dc] flex items-center space-x-3">
            <div className="w-7 h-7 rounded-full bg-[#ffd45e] text-[#3a1a0e] flex items-center justify-center font-semibold text-[10px] font-black border border-[#3a1a0e]">
              CALL
            </div>
            <div className="flex-1">
              <h5 className="font-semibold text-sm tracking-wide text-[#ffd45e]">
                Attendant Summoned
              </h5>
              <p className="text-xs font-medium text-slate-200">
                A server is on their way to Table #{tableId}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Responsive Laptop / Desktop Container */}
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 relative z-10">
        
        {/* Top Header / Greeting Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-wide text-[#3a1a0e] leading-tight">
              Crispy. Juicy. Stone-Baked. Always Delicious.
            </h1>
          </div>

          {/* Scanned Table Badge */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="flex items-center space-x-2 bg-[#fff4dc] px-4 py-2 rounded-2xl border-2 border-[#3a1a0e] shadow-[3px_3px_0_#3a1a0e]">
              <div className="flex flex-col">
                <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Dine-In Customer
                </span>
                <span className="font-semibold text-base text-[#3a1a0e] leading-none">
                  Table #{tableId}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Desktop Two-Column Layout (Main Feed + Sticky Cart Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Food Catalog, Hero Banner, & Categories (8 Columns on desktop, 9 on ultra-wide) */}
          <div className="lg:col-span-8 xl:col-span-8 2xl:col-span-9 space-y-6">
            
            {/* Search & Quick Filter Bar */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search thick cold coffee, hot cappuccino, pizzas, crispy chicken, burgers..."
                  className="w-full bg-white border-2 border-[#3a1a0e] rounded-2xl pl-12 pr-4 py-3 text-sm font-semibold text-[#3a1a0e] placeholder:text-slate-400 shadow-[3px_3px_0_#3a1a0e] focus:outline-none focus:bg-[#fffdf7] transition-all"
                />
              </div>

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-3.5 py-2.5 rounded-2xl bg-[#fff4dc] border-2 border-[#3a1a0e] text-[#3a1a0e] font-semibold text-xs uppercase shadow-[2px_2px_0_#3a1a0e] hover:bg-[#ffeac2]"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Interactive Swipeable Hero Promo Carousel with Videos & Photos */}
            <div
              className="rounded-3xl border-3 border-[#3a1a0e] shadow-[6px_8px_0_#3a1a0e] overflow-hidden relative select-none cursor-grab active:cursor-grabbing group"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleTouchStart}
              onMouseMove={handleTouchMove}
              onMouseUp={handleTouchEnd}
              onMouseEnter={() => setIsCarouselPaused(true)}
              onMouseLeave={() => setIsCarouselPaused(false)}
            >
              {/* Carousel Track */}
              <div
                className="flex transition-transform duration-500 ease-out will-change-transform"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {PROMO_SLIDES.map((slide, idx) => (
                  <div
                    key={slide.id}
                    className={`w-full flex-shrink-0 relative bg-gradient-to-r ${slide.gradient} text-[#fff4dc] overflow-hidden min-h-[300px] sm:min-h-[360px] lg:min-h-[390px] xl:min-h-[420px] flex items-center`}
                  >
                    {/* Background / Right Media Layer (Local Videos & Photos) */}
                    <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[50%] lg:w-[54%] xl:w-[58%] overflow-hidden pointer-events-none">
                      {slide.mediaType === 'video' ? (
                        <video
                          key={slide.id}
                          ref={(el) => {
                            if (el) {
                              el.muted = true;
                              el.defaultMuted = true;
                              const p = el.play();
                              if (p !== undefined) p.catch(() => {});
                            }
                          }}
                          src={slide.mediaSrc}
                          autoPlay
                          muted
                          loop
                          playsInline
                          poster={slide.poster}
                          className="w-full h-full object-cover object-center filter saturate-125 contrast-105 brightness-105 transition-all duration-700"
                        />
                      ) : (
                        <img
                          src={slide.mediaSrc}
                          alt={slide.title}
                          className="w-full h-full object-cover object-center filter drop-shadow-2xl"
                        />
                      )}
                      {/* Smooth gradient blend into text side */}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent sm:from-black/25 sm:to-transparent" />
                    </div>

                    {/* Left Content Column */}
                    <div className="p-6 sm:p-8 lg:p-10 xl:p-12 relative z-10 max-w-xl lg:max-w-2xl">
                      <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#ffd45e] text-[#3a1a0e] text-xs font-semibold uppercase tracking-wider border border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] mb-2">
                        <span>{slide.badge}</span>
                      </div>

                      <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-wide leading-none text-[#fff4dc] drop-shadow-md">
                        {slide.title}
                      </h2>

                      <p className="text-xs sm:text-sm lg:text-base text-[#fff4dc]/90 font-medium mt-2 leading-relaxed max-w-lg">
                        {slide.subtitle}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => {
                            soundService.playTactileClick('high');
                            handleAddItem(slide.item);
                          }}
                          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-[#ffd45e] hover:bg-[#ffca36] text-[#3a1a0e] font-semibold text-sm uppercase tracking-wide border-2 border-[#3a1a0e] shadow-[3px_4px_0_#3a1a0e] active:translate-y-0.5 transition-all cursor-pointer"
                        >
                          <span>{slide.buttonText}</span>
                          <span>➔</span>
                        </button>

                        <button
                          onClick={() => {
                            soundService.playTactileClick('mid');
                            setSelectedCategory('All Items');
                          }}
                          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-[#fff4dc]/90 hover:bg-[#fff4dc] text-[#3a1a0e] font-semibold text-sm uppercase tracking-wide border-2 border-[#3a1a0e] shadow-[3px_4px_0_#3a1a0e] active:translate-y-0.5 transition-all cursor-pointer"
                        >
                          <span>Browse Full Menu</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Top-Right Slide Counter */}
              <div className="absolute top-4 right-4 flex items-center space-x-2 z-20 pointer-events-none">
                <div className="bg-black/60 backdrop-blur-sm text-[#fff4dc] font-semibold text-[11px] px-2.5 py-1.5 rounded-xl border border-white/20">
                  {currentSlide + 1} / {PROMO_SLIDES.length}
                </div>
              </div>

              {/* Prev Slide Navigation Arrow */}
              <button
                onClick={handlePrevSlide}
                aria-label="Previous special"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#fff4dc]/90 hover:bg-[#fff4dc] text-[#3a1a0e] border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] flex items-center justify-center font-black text-sm z-20 cursor-pointer active:scale-95 transition-all opacity-80 group-hover:opacity-100"
              >
                ◀
              </button>

              {/* Next Slide Navigation Arrow */}
              <button
                onClick={handleNextSlide}
                aria-label="Next special"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#fff4dc]/90 hover:bg-[#fff4dc] text-[#3a1a0e] border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] flex items-center justify-center font-black text-sm z-20 cursor-pointer active:scale-95 transition-all opacity-80 group-hover:opacity-100"
              >
                ▶
              </button>

              {/* Bottom Carousel Navigation Dots & Swipe Hint */}
              <div className="absolute bottom-3 left-0 right-0 flex flex-col items-center gap-1 z-20 pointer-events-auto">
                <div className="flex items-center space-x-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                  {PROMO_SLIDES.map((slide, idx) => (
                    <button
                      key={slide.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        soundService.playTactileClick('low');
                        setCurrentSlide(idx);
                      }}
                      aria-label={`Go to slide ${idx + 1}`}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        currentSlide === idx
                          ? 'w-6 bg-[#ffd45e]'
                          : 'w-2 bg-white/50 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-[#fff4dc]/80 font-semibold uppercase tracking-wider drop-shadow-sm sm:hidden">
                  Swipe left/right for more chef specials
                </span>
              </div>
            </div>

            {/* Chunky Category Selection Pills */}
            {/* Sticky Category Filter Pills Bar (pins neatly under top navbar) */}
            <div className="sticky top-[58px] z-30 bg-[#f6efe2]/95 backdrop-blur-md py-2.5 -mx-2 px-2 border-b border-[#3a1a0e]/15 shadow-xs transition-all">
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="font-bold text-base uppercase tracking-wide text-[#3a1a0e]">
                  Categories
                </h3>
                <span className="text-xs font-bold text-slate-500">
                  Showing {filteredItems.length} items
                </span>
              </div>

              <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
                {categories.map((cat) => {
                  const isActive = selectedCategory === cat.name;
                  return (
                    <button
                      key={cat.name}
                      onClick={() => {
                        soundService.playTactileClick('mid');
                        setSelectedCategory(cat.name);
                      }}
                      className={`shrink-0 px-4 py-2 rounded-2xl font-semibold text-xs uppercase tracking-wide border-2 border-[#3a1a0e] transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#d6361f] text-[#fff4dc] shadow-[3px_4px_0_#3a1a0e] -translate-y-0.5'
                          : 'bg-white text-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] hover:bg-[#fff4dc]'
                      }`}
                    >
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Laptop Multi-Column Catalog Cards Grid (Flipkart e-commerce product card aesthetic) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5">
              {filteredItems.map((item) => {
                const isLiked = wishlist[item.id];
                const cartMatch = cartItems.find((ci) => ci.name === item.name);
                const quantityInCart = cartMatch ? cartMatch.quantity : 0;
                const originalPrice = Math.round(item.price * 1.25);
                const bankOfferPrice = Math.round(item.price * 0.9);

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-slate-300 transition-all duration-200 flex flex-col justify-between overflow-hidden relative group"
                  >
                    {/* Top Image Box */}
                    <div className="relative w-full aspect-square bg-[#fbfbfb] flex items-center justify-center p-3 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Top-Left Deal Badge (Flipkart style Value 365 / Bestseller) */}
                      {item.badge ? (
                        <span className="absolute top-2.5 left-2.5 bg-[#c8222b] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs uppercase tracking-wider">
                          {item.badge === 'BESTSELLER' ? 'Value 365' : item.badge}
                        </span>
                      ) : (
                        <span className="absolute top-2.5 left-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs uppercase tracking-wider">
                          Chef Fresh
                        </span>
                      )}

                      {/* Top-Right Wishlist Heart Button */}
                      <button
                        onClick={() => toggleWishlist(item.id)}
                        className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 backdrop-blur-xs border border-slate-200/90 flex items-center justify-center shadow-xs hover:shadow-sm hover:scale-110 active:scale-95 transition-all cursor-pointer z-10"
                        title={isLiked ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <svg
                          className={`w-4 h-4 transition-colors ${
                            isLiked ? 'text-[#e53935] fill-[#e53935]' : 'text-slate-400 fill-none'
                          }`}
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      </button>

                      {/* Bottom-Left Green Rating Pill (Flipkart Signature) */}
                      <div className="absolute bottom-2 left-2.5 flex items-center gap-1.5 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-md shadow-xs border border-slate-200/80 z-10">
                        <span className="inline-flex items-center gap-0.5 bg-[#388e3c] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-[3px] leading-tight">
                          {item.rating} ★
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">
                          ({item.reviewsCount.toLocaleString()})
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                          {item.category}
                        </span>
                        <h4
                          className="font-semibold text-sm sm:text-base text-slate-900 group-hover:text-[#2874f0] transition-colors leading-snug line-clamp-1 mt-0.5"
                          title={item.name}
                        >
                          {item.name}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-1 font-normal mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Flipkart Signature Price Block in Indian Rupees */}
                      <div className="space-y-1 pt-1">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-xs text-slate-400 line-through font-medium">
                            ₹{originalPrice}
                          </span>
                          <span className="text-base sm:text-lg font-bold text-slate-900 leading-none">
                            ₹{item.price}
                          </span>
                          <span className="text-xs font-bold text-[#388e3c]">
                            20% off
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-[#2874f0] flex items-center gap-1 leading-tight">
                          <span>⚡</span>
                          <span>₹{bankOfferPrice} with Table Offer</span>
                        </p>
                      </div>

                      {/* Action Row: ADD or Stepper */}
                      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>{quantityInCart > 0 ? `${quantityInCart} added` : 'Instant Prep'}</span>
                        </div>

                        {quantityInCart > 0 ? (
                          <div className="flex items-center space-x-1.5 bg-[#f0f9ff] border border-[#2874f0]/40 rounded-lg px-2 py-1 shadow-xs">
                            <button
                              onClick={() => onUpdateQuantity?.(item.name, -1)}
                              className="w-6 h-6 rounded bg-white border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                              title="Decrease quantity"
                            >
                              −
                            </button>
                            <span className="font-bold text-xs px-2 text-[#2874f0]">
                              {quantityInCart}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity?.(item.name, 1)}
                              className="w-6 h-6 rounded bg-[#2874f0] text-white font-bold text-xs flex items-center justify-center hover:bg-blue-600 active:scale-95 transition-all cursor-pointer"
                              title="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddItem(item)}
                            className={`px-4 py-1.5 rounded-lg border font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs hover:shadow transition-all cursor-pointer ${
                              addedItemAlert === item.id
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-white text-[#2874f0] border-[#2874f0] hover:bg-[#2874f0] hover:text-white'
                            }`}
                          >
                            <span>{addedItemAlert === item.id ? '✓ Added' : 'ADD +'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Special Deals Card */}
            <div className="rounded-3xl bg-[#fff4dc] border-3 border-[#3a1a0e] shadow-[5px_6px_0_#3a1a0e] p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="inline-flex items-center space-x-1.5 text-xs font-semibold uppercase text-[#d6361f]">
                  <span>Chef's Special Promotion</span>
                </div>
                <h4 className="font-semibold text-xl sm:text-2xl uppercase tracking-wide text-[#3a1a0e]">
                  Save 30% on All Craft Combos
                </h4>
                <p className="text-xs font-medium text-slate-700 max-w-md">
                  Apply coupon <span className="font-semibold text-[#d6361f] bg-white px-2 py-0.5 rounded border border-[#3a1a0e]">BELLACRAVE</span> at checkout for table #{tableId}.
                </p>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <button
                  onClick={() => {
                    soundService.playTactileClick('high');
                    const zinger = MENU_ITEMS_CATALOG.find((i) => i.id === 202) || MENU_ITEMS_CATALOG[0];
                    handleAddItem(zinger);
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-[#d6361f] hover:bg-[#ea3b21] text-[#fff4dc] font-semibold text-xs uppercase tracking-wider border-2 border-[#3a1a0e] shadow-[2px_3px_0_#3a1a0e] active:translate-y-0.5 transition-all cursor-pointer"
                >
                  Add Zinger Combo (₹299)
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sticky Desktop Live Order & Bill Tray (4 Columns on Desktop, 3 on Ultra-Wide) */}
          <div className="lg:col-span-4 xl:col-span-4 2xl:col-span-3 lg:sticky lg:top-20 space-y-4">
            
            <div className="bg-[#fff4dc] rounded-3xl border-3 border-[#3a1a0e] shadow-[6px_8px_0_#3a1a0e] p-5 space-y-4">
              
              {/* Sidebar Header */}
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#3a1a0e]/20">
                <div>
                  <h3 className="font-bold text-lg uppercase tracking-wide text-[#3a1a0e] leading-none">
                    Live Order & Bill
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] font-bold text-slate-600">
                      Table #{tableId} • Direct Kitchen KOT
                    </span>
                    {onOpenQRStandee && (
                      <button
                        onClick={() => {
                          soundService.playTactileClick('high');
                          onOpenQRStandee();
                        }}
                        className="px-2 py-0.5 rounded-md bg-amber-100 hover:bg-amber-200 border border-amber-300 text-[10px] font-semibold text-[#3a1a0e] uppercase tracking-wider flex items-center gap-0.5 cursor-pointer"
                        title="View scannable Table QR Standee Card"
                      >
                        <span>QR</span>
                      </button>
                    )}
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-[#d6361f] text-[#fff4dc] font-semibold text-xs border border-[#3a1a0e]">
                  {cartItems.reduce((acc, ci) => acc + ci.quantity, 0)} Items
                </span>
              </div>

              {/* Cart Items List */}
              <div className="max-h-[300px] overflow-y-auto pr-1 space-y-2.5 no-scrollbar">
                {cartItems.length > 0 ? (
                  cartItems.map((ci) => (
                    <div
                      key={ci.name}
                      className="bg-white rounded-2xl p-3 border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center space-x-2.5 overflow-hidden">
                        <img
                          src={ci.image}
                          alt={ci.name}
                          className="w-11 h-11 rounded-xl object-cover border border-[#3a1a0e] shrink-0"
                        />
                        <div className="overflow-hidden">
                          <h5 className="font-semibold text-xs text-[#3a1a0e] truncate leading-tight">
                            {ci.name}
                          </h5>
                          <span className="text-[10px] font-bold text-slate-500">
                            ₹{ci.price.toFixed(2)} each
                          </span>
                        </div>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center space-x-1.5 shrink-0">
                        <button
                          onClick={() => onUpdateQuantity?.(ci.name, -1)}
                          className="w-6 h-6 rounded-lg bg-slate-100 border border-[#3a1a0e] text-[#3a1a0e] font-semibold text-xs flex items-center justify-center hover:bg-slate-200"
                        >
                          -
                        </button>
                        <span className="font-semibold text-xs px-1 text-[#3a1a0e]">
                          {ci.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity?.(ci.name, 1)}
                          className="w-6 h-6 rounded-lg bg-[#d6361f] text-white border border-[#3a1a0e] font-semibold text-xs flex items-center justify-center hover:bg-[#ea3b21]"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))
                ) : placedTableOrders.length > 0 ? (
                  <div className="bg-[#fffdf7] rounded-2xl p-4 border-2 border-emerald-600 shadow-[3px_3px_0_#15803d] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs uppercase text-emerald-800">
                        Table #{tableId} Active Bill
                      </span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Order Placed
                      </span>
                    </div>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {placedTableOrders.map((po, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs font-semibold text-slate-700 bg-white/70 px-2 py-1.5 rounded-lg border border-slate-200/80">
                          <span className="truncate pr-2">{po.quantity}x {po.name}</span>
                          <span className="font-bold text-[#d6361f]">₹{(po.price * po.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium text-center">
                      Your meal is booked. You can pay your bill now or after dining!
                    </p>
                    {onOpenTracker && (
                      <button
                        onClick={() => {
                          soundService.playTactileClick('high');
                          onOpenTracker();
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-[#d6361f] hover:bg-[#ea3b21] text-[#fff4dc] font-semibold text-xs uppercase tracking-wide border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center"
                      >
                        <span>Track Kitchen Cooking Live ➔</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="bg-white/60 rounded-2xl p-6 border-2 border-dashed border-[#3a1a0e]/40 text-center space-y-2">
                    <div className="w-10 h-10 mx-auto rounded-full bg-[#f6efe2] border-2 border-[#3a1a0e] flex items-center justify-center font-semibold text-xs text-[#3a1a0e]">
                      EMPTY
                    </div>
                    <p className="font-semibold text-sm text-[#3a1a0e] uppercase">
                      Your Table Tray is Empty
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      Select delicious dishes to book your meal for Table #{tableId}!
                    </p>
                  </div>
                )}
              </div>

              {/* Coupon Box */}
              <div className="bg-white rounded-2xl p-3 border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    Active Coupon
                  </span>
                  <span className="font-semibold text-xs text-[#d6361f]">
                    {appliedCoupon} (-{discountPercent}%)
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">
                  APPLIED
                </span>
              </div>

              {/* Bill Financials Breakdown */}
              <div className="bg-white rounded-2xl p-3.5 border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>Subtotal</span>
                  <span>₹{calcSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-emerald-700">
                  <span>Chef Discount ({discountPercent}%):</span>
                  <span>-₹{calcDiscount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>Taxes & GST (5%)</span>
                  <span>+₹{calcTax.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t-2 border-slate-100 flex justify-between items-baseline">
                  <span className="font-semibold text-sm uppercase text-[#3a1a0e]">
                    Estimated Total
                  </span>
                  <span className="font-extrabold text-2xl text-[#d6361f]">
                    ₹{calcFinalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Primary Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <button
                  disabled={cartItems.length === 0}
                  onClick={() => {
                    soundService.playTactileClick('high');
                    onCheckoutOrder?.();
                  }}
                  className={`w-full py-3.5 px-4 rounded-2xl font-semibold text-sm uppercase tracking-wider border-2 border-[#3a1a0e] flex items-center justify-center transition-all cursor-pointer ${
                    cartItems.length > 0
                      ? 'bg-[#d6361f] hover:bg-[#ea3b21] text-[#fff4dc] shadow-[4px_5px_0_#3a1a0e] active:translate-y-0.5'
                      : 'bg-slate-300 text-slate-500 border-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>Book Order (Table #{tableId})</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      soundService.playTactileClick('mid');
                      onOpenBillPayment?.();
                    }}
                    className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 text-[#3a1a0e] font-semibold text-xs uppercase tracking-wide border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] flex items-center justify-center active:translate-y-0.5 transition-all cursor-pointer"
                  >
                    <span>Pay Bill Online</span>
                  </button>

                  <button
                    onClick={handleCallAttendant}
                    className="py-2.5 px-3 rounded-xl bg-[#ffd45e] hover:bg-[#ffca36] text-[#3a1a0e] font-medium text-xs uppercase tracking-wide border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] flex items-center justify-center active:translate-y-0.5 transition-all cursor-pointer"
                  >
                    <span>Call Server</span>
                  </button>
                </div>


                {onOpenReview && (
                  <button
                    onClick={() => {
                      soundService.playTactileClick('high');
                      onOpenReview();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-semibold text-xs uppercase tracking-wide border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] flex items-center justify-center active:translate-y-0.5 transition-all cursor-pointer"
                    title="1-Tap Guest Review & Servant Tip"
                  >
                    <span>1-Tap Review & Tip Attendant ➔</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscoveryMenuFeed;
