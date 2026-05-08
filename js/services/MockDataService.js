export class MockDataService {
    static async simulateDelay(ms = 1500) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static getCities() {
        return [
            {
                name: "Tokyo, Japan",
                lat: 35.6762,
                lng: 139.6503,
                reason: "An electric blend of ultra-modern neon cityscapes and deep-rooted cultural shrines."
            },
            {
                name: "Reykjavik, Iceland",
                lat: 64.1466,
                lng: -21.9426,
                reason: "The perfect hub for adventurous glacier hikes, hot springs, and Northern Lights."
            },
            {
                name: "Barcelona, Spain",
                lat: 41.3851,
                lng: 2.1734,
                reason: "A vibrant mix of stunning beaches, unique architecture, and late-night tapas culture."
            }
        ];
    }

    static getItinerary(cityName) {
        if (cityName === "Tokyo, Japan") {
            return {
                title: `Neon Nights in Tokyo`,
                days: [
                    { day: 1, theme: "Arrival & Shinjuku Lights", description: "Dive straight into the electric atmosphere of Shinjuku and explore the narrow alleys.", image_keyword: "Shinjuku neon night", activities: ["Check into hotel", "Walk through Kabukicho", "Dinner at an Izakaya"] },
                    { day: 2, theme: "Culture & Tech", description: "Experience the contrast of ancient traditions in Asakusa and the futuristic tech hub of Akihabara.", image_keyword: "Sensoji temple", activities: ["Visit Senso-ji Temple", "Explore Akihabara", "Sushi dinner in Ginza"] },
                    { day: 3, theme: "Harajuku & Shibuya", description: "Wander through the fashion capital of Harajuku and witness the Shibuya Crossing.", image_keyword: "Shibuya crossing", activities: ["Walk through Meiji Shrine", "Cross the Shibuya Scramble", "Transfer to Haneda Airport"] }
                ]
            };
        } else if (cityName === "Reykjavik, Iceland") {
            return {
                title: `Fire & Ice Adventures`,
                days: [
                    { day: 1, theme: "City Highlights & Geothermal Soaks", description: "Settle into Reykjavik and unwind in a local geothermal pool.", image_keyword: "Reykjavik city", activities: ["Visit Hallgrímskirkja church", "Walk around Tjörnin lake", "Soak in Sky Lagoon"] },
                    { day: 2, theme: "The Golden Circle", description: "Embark on the classic Icelandic route to witness erupting geysers and massive waterfalls.", image_keyword: "Gullfoss waterfall", activities: ["Thingvellir National Park", "Witness the Great Geysir", "Marvel at Gullfoss Waterfall"] },
                    { day: 3, theme: "Volcanic Wonders", description: "Explore the dramatic black sand beaches before flying out.", image_keyword: "black sand beach Iceland", activities: ["Drive to Reynisfjara", "Explore basalt columns", "Transfer to Keflavik Airport"] }
                ]
            };
        } else if (cityName === "Barcelona, Spain") {
            return {
                title: `Tapas & Gaudí in Barcelona`,
                days: [
                    { day: 1, theme: "Gothic Quarters & Tapas", description: "Get lost in the winding streets of the Gothic Quarter.", image_keyword: "Gothic Quarter Barcelona", activities: ["Check into hotel", "Walk down Las Ramblas", "Tapas hopping in El Born"] },
                    { day: 2, theme: "The Masterpieces of Gaudí", description: "Spend the day mesmerized by the surreal and colorful architecture of Antoni Gaudí.", image_keyword: "Sagrada Familia", activities: ["Tour the Sagrada Familia", "Stroll through Park Güell", "Sunset at Bunkers del Carmel"] },
                    { day: 3, theme: "Beachfront Bliss", description: "Relax by the Mediterranean sea before your departure.", image_keyword: "Barceloneta beach", activities: ["Relax at Barceloneta Beach", "Seafood paella for lunch", "Transfer to El Prat Airport"] }
                ]
            };
        }
        
        return {
            title: `Adventures in ${cityName || "Paradise"}`,
            days: [
                { day: 1, theme: "Arrival", description: "Drop your bags and explore.", image_keyword: "city center", activities: ["Check in", "Dinner", "Walk"] },
                { day: 2, theme: "Exploration", description: "See the sights.", image_keyword: "landmarks", activities: ["Museum", "Lunch", "Tour"] },
                { day: 3, theme: "Departure", description: "Head home.", image_keyword: "airport", activities: ["Breakfast", "Shop", "Fly"] }
            ]
        };
    }
}
