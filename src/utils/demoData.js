export const DEMO_RESTAURANTS = [
    {
        name: "Alchemist",
        email: "demo.alchemist@nusion.ai",
        city: "Copenhagen",
        cuisine_type: "Holistic Cuisine",
        cover_url: "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=1600&auto=format&fit=crop",
        logo_url: "",
        status: "approved",
        menu: [
            { id: "alc-1", name: "Molecular Sphere Amuse", type: "Starter", cost: 28, price: "28", status: "Active", ingredients: ["Spherified essence", "Edible flowers"], spiceLevel: 1, protein: "Veg", allergens: [], flavorProfile: "Umami", description: "Edible spheres of concentrated flavor essence" },
            { id: "alc-2", name: "Deconstructed Forest Floor", type: "Main", cost: 65, price: "65", status: "Active", ingredients: ["Wild mushrooms", "Moss oil", "Charred bark"], spiceLevel: 2, protein: "Veg", allergens: ["Mushrooms"], flavorProfile: "Earthy", description: "Wild mushrooms, moss oil, and charred bark" },
            { id: "alc-3", name: "Liquid Nitrogen Ice Cream", type: "Dessert", cost: 22, price: "22", status: "Active", ingredients: ["Cream", "Liquid nitrogen", "Vanilla"], spiceLevel: 0, protein: "Veg", allergens: ["Dairy"], flavorProfile: "Sweet", description: "Made tableside with theatrical nitrogen fog" }
        ]
    },
    {
        name: "Atomix",
        email: "demo.atomix@nusion.ai",
        city: "New York",
        cuisine_type: "Innovative Korean",
        cover_url: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1600&auto=format&fit=crop",
        logo_url: "",
        status: "approved",
        menu: [
            { id: "atx-1", name: "Jang Trilogy", type: "Starter", cost: 24, price: "24", status: "Active", ingredients: ["Gochujang", "Doenjang", "Ganjang", "Seasonal vegetables"], spiceLevel: 3, protein: "Veg", allergens: [], flavorProfile: "Umami", description: "Three fermented sauces with seasonal vegetables" },
            { id: "atx-2", name: "Wagyu with Gochugaru", type: "Main", cost: 78, price: "78", status: "Active", ingredients: ["A5 Wagyu", "Korean chili", "Sesame"], spiceLevel: 4, protein: "Beef", allergens: [], flavorProfile: "Spicy", description: "A5 Wagyu with Korean chili and sesame" },
            { id: "atx-3", name: "Makgeolli Granita", type: "Dessert", cost: 18, price: "18", status: "Active", ingredients: ["Rice wine", "Pear", "Pine nut"], spiceLevel: 0, protein: "Veg", allergens: ["Dairy"], flavorProfile: "Sweet", description: "Rice wine ice with pear and pine nut" }
        ]
    },
    {
        name: "Odette",
        email: "demo.odette@nusion.ai",
        city: "Singapore",
        cuisine_type: "Modern French",
        cover_url: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1600&auto=format&fit=crop",
        logo_url: "",
        status: "approved",
        menu: [
            { id: "ode-1", name: "Hokkaido Scallop", type: "Starter", cost: 32, price: "32", status: "Active", ingredients: ["Hokkaido scallop", "Cauliflower", "Caviar"], spiceLevel: 1, protein: "Fish", allergens: ["Shellfish"], flavorProfile: "Delicate", description: "With cauliflower and caviar" },
            { id: "ode-2", name: "Pigeon en Croûte", type: "Main", cost: 68, price: "68", status: "Active", ingredients: ["Pigeon", "Puff pastry", "Foie gras"], spiceLevel: 2, protein: "Beef", allergens: ["Gluten"], flavorProfile: "Rich", description: "Wrapped in puff pastry with foie gras" },
            { id: "ode-3", name: "Mango Tart", type: "Dessert", cost: 24, price: "24", status: "Active", ingredients: ["Mango", "Passion fruit", "Coconut"], spiceLevel: 0, protein: "Veg", allergens: ["Dairy", "Gluten"], flavorProfile: "Fruity", description: "With passion fruit and coconut" }
        ]
    },
    {
        name: "Pujol",
        email: "demo.pujol@nusion.ai",
        city: "Mexico City",
        cuisine_type: "Contemporary Mexican",
        cover_url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1600&auto=format&fit=crop",
        logo_url: "",
        status: "approved",
        menu: [
            { id: "puj-1", name: "Baby Corn with Chicatana Ants", type: "Starter", cost: 22, price: "22", status: "Active", ingredients: ["Heirloom corn", "Chicatana ants", "Coffee", "Ant mayo"], spiceLevel: 3, protein: "Veg", allergens: [], flavorProfile: "Smoky", description: "Heirloom corn with ant mayo and coffee" },
            { id: "puj-2", name: "Mole Madre", type: "Main", cost: 58, price: "58", status: "Active", ingredients: ["Duck", "1000-day mole", "Sesame"], spiceLevel: 4, protein: "Beef", allergens: ["Nuts"], flavorProfile: "Complex", description: "1000+ day aged mole with duck" },
            { id: "puj-3", name: "Corn Husk Meringue", type: "Dessert", cost: 18, price: "18", status: "Active", ingredients: ["Corn husk", "Vanilla ice cream", "Corn silk"], spiceLevel: 1, protein: "Veg", allergens: ["Eggs"], flavorProfile: "Sweet", description: "With vanilla ice cream and corn silk" }
        ]
    },
    {
        name: "Gaggan Anand",
        email: "demo.gaggan@nusion.ai",
        city: "Bangkok",
        cuisine_type: "Progressive Indian",
        cover_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1600&auto=format&fit=crop",
        logo_url: "",
        status: "approved",
        menu: [
            { id: "gag-1", name: "Yogurt Explosion", type: "Starter", cost: 26, price: "26", status: "Active", ingredients: ["Spherified yogurt", "Curry leaf oil"], spiceLevel: 2, protein: "Veg", allergens: ["Dairy"], flavorProfile: "Tangy", description: "Spherified yogurt with curry leaf oil" },
            { id: "gag-2", name: "Tandoori Lamb Chops", type: "Main", cost: 72, price: "72", status: "Active", ingredients: ["Lamb", "Tandoori spices", "Mint chutney", "Pickled onions"], spiceLevel: 5, protein: "Beef", allergens: [], flavorProfile: "Spicy", description: "With mint chutney and pickled onions" },
            { id: "gag-3", name: "Charcoal Ice Cream", type: "Dessert", cost: 20, price: "20", status: "Active", ingredients: ["Activated charcoal", "Coconut", "Lime"], spiceLevel: 0, protein: "Veg", allergens: ["Dairy"], flavorProfile: "Smoky", description: "Activated charcoal with coconut and lime" }
        ]
    }
];
