const PRODUCTS = [
    {
        id: 1,
        title: "Cyberpunk 2088: Neon Genesis",
        genre: "accion",
        genreName: "Acción",
        platform: "PC / PS5 / Xbox Series X",
        priceCOP: 240000,
        originalPriceCOP: 320000,
        rating: 4.9,
        reviewsCount: 1420,
        badge: "DESTACADO 3D",
        image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
        description: "Sumérgete en la ciudad neón de Neo-Verdia. Un RPG de acción y combate en 3D hiperrealista con trazado de rayos (Ray Tracing) y gráficos de última generación.",
        features: ["Ray Tracing 4K", "Audio Tridimensional", "Mundo Abierto", "60 FPS Stable"],
        specs: {
            os: "Windows 11 64-bit",
            gpu: "Nvidia RTX 4070 / AMD RX 7800 XT",
            ram: "16 GB RAM",
            storage: "85 GB SSD"
        },
        reviews: [
            {
                author: "Alex_CyberGamer",
                rating: 5,
                date: "26 de Julio, 2026",
                verified: true,
                comment: "¡Gráficos 3D deslumbrantes! El trazado de rayos en las calles neón se ve increíble a 4K. La historia te atrapa desde el primer minuto."
            },
            {
                author: "Carlos_Hardcore",
                rating: 5,
                date: "20 de Julio, 2026",
                verified: true,
                comment: "El sistema de combate con cibernética 3D es el mejor que he probado en años. Totalmente recomendado."
            },
            {
                author: "Valeria_VR",
                rating: 4.5,
                date: "14 de Julio, 2026",
                verified: true,
                comment: "Excelente optimización y la banda sonora synthwave de fondo te mete de lleno en la atmósfera cyberpunk."
            }
        ]
    },
    {
        id: 2,
        title: "Silent Abyss: Nightmare Entity",
        genre: "terror",
        genreName: "Terror",
        platform: "PC / PS5 / VR",
        priceCOP: 180000,
        originalPriceCOP: 200000,
        rating: 4.8,
        reviewsCount: 890,
        badge: "TERROR 3D VR",
        image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
        description: "Una experiencia de terror psicológico en 3D en las profundidades de un hospital psiquiátrico abandonado en la Antártida. Compatible con VR para inmersión total.",
        features: ["Soporte VR 360°", "Físicas Realistas", "Audio Binaural 3D", "IA Adaptativa de Sobresaltos"],
        specs: {
            os: "Windows 10/11",
            gpu: "Nvidia RTX 3060",
            ram: "16 GB RAM",
            storage: "45 GB SSD"
        },
        reviews: [
            {
                author: "Marcos_HorrorFan",
                rating: 5,
                date: "25 de Julio, 2026",
                verified: true,
                comment: "Jugarlo con cascos VR y audio 3D es aterrador. Los sustos dinámicos impulsados por IA son brutales."
            },
            {
                author: "Sofia_Nightmare",
                rating: 4.8,
                date: "18 de Julio, 2026",
                verified: true,
                comment: "La ambientación en la Antártida y el renderizado 3D de las sombras te ponen la piel de gallina. 10/10."
            }
        ]
    },
    {
        id: 3,
        title: "Quantum Enigma: Mind Matrix",
        genre: "pensamiento",
        genreName: "Pensamiento / Puzzles",
        platform: "PC / Nintendo Switch",
        priceCOP: 120000,
        originalPriceCOP: 160000,
        rating: 4.95,
        reviewsCount: 650,
        badge: "MEJOR PUZZLE GOTY",
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
        description: "Desafía las leyes de la física y la lógica con acertijos espaciales 3D, manipulación del tiempo y portales tridimensionales que pondrán a prueba tu intelecto.",
        features: ["200+ Puzles 3D", "Físicas Gravitacionales", "Editor de Niveles", "Modo Cooperativo"],
        specs: {
            os: "Windows 10/11",
            gpu: "GTX 1660 Super",
            ram: "8 GB RAM",
            storage: "15 GB"
        },
        reviews: [
            {
                author: "Elena_LogicMaster",
                rating: 5,
                date: "27 de Julio, 2026",
                verified: true,
                comment: "Uno de los mejores juegos de lógica 3D desde Portal 2. La mecánica de portales dimensionales es brillantemente desafiante."
            },
            {
                author: "Mateo_Puzzler",
                rating: 5,
                date: "22 de Julio, 2026",
                verified: true,
                comment: "Los rompecabezas de gravedad tridimensional son adictivos. Perfecto para entrenar la mente."
            }
        ]
    },
    {
        id: 4,
        title: "Uncharted Horizon: Odyssey of Ancients",
        genre: "aventura",
        genreName: "Aventura",
        platform: "PS5 / PC",
        priceCOP: 280000,
        originalPriceCOP: 280000,
        rating: 4.9,
        reviewsCount: 2300,
        badge: "GOTY CANDIDATE",
        image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
        description: "Explora ruinas alienígenas olvidadas en islas flotantes 3D. Combate acrobático, escalada dinámica y narrativa profunda en un mundo cinemático.",
        features: ["4K 60FPS HDR", "Captura de Movimiento Facual", "Banda Sonora Sinfónica", "Sin Tiempos de Carga"],
        specs: {
            os: "Windows 11",
            gpu: "RTX 3080",
            ram: "32 GB RAM",
            storage: "110 GB NVMe"
        },
        reviews: [
            {
                author: "Gabriel_Explorer",
                rating: 5,
                date: "28 de Julio, 2026",
                verified: true,
                comment: "Paisajes épicos en 3D. La escala de las islas flotantes y la fluidez del combate son sencillamente de nivel cinematográfico."
            },
            {
                author: "Andrea_GamerGirl",
                rating: 4.9,
                date: "19 de Julio, 2026",
                verified: true,
                comment: "La narrativa me hizo emocionarme. Definitivamente merece ser nominado al juego del año."
            }
        ]
    },
    {
        id: 5,
        title: "Biohazard Protocol: Outbreak Z",
        genre: "terror",
        genreName: "Terror",
        platform: "PC / PS5 / Xbox Series X",
        priceCOP: 160000,
        originalPriceCOP: 220000,
        rating: 4.7,
        reviewsCount: 1100,
        badge: "SUPERVIVENCIA 3D",
        image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80",
        description: "Sobrevive a una plaga mutante en una estación espacial 3D sin gravedad. Gestión extrema de recursos y criaturas con IA fotosensible.",
        features: ["Zero Gravity Physics", "Dismembración 3D", "Multijugador Coop 4P", "Modo Pesadilla"],
        specs: {
            os: "Windows 11",
            gpu: "RTX 3070",
            ram: "16 GB RAM",
            storage: "60 GB SSD"
        },
        reviews: [
            {
                author: "David_DeadSpaceFan",
                rating: 4.7,
                date: "24 de Julio, 2026",
                verified: true,
                comment: "Gran tributo a los survival horror espaciales. Jugar en gravedad cero le añade una dimensión estratégica 3D fabulosa."
            }
        ]
    },
    {
        id: 6,
        title: "Mech Warfare 3D: Iron Vanguard",
        genre: "accion",
        genreName: "Acción",
        platform: "PC / Xbox Series X",
        priceCOP: 200000,
        originalPriceCOP: 240000,
        rating: 4.85,
        reviewsCount: 1750,
        badge: "COMBATE MECHA 3D",
        image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80",
        description: "Pilota mechas gigantes personalizables en batallas campales tridimensionales con destrucción masiva del entorno en tiempo real.",
        features: ["Destrucción Total 3D", "Personalización de Armas", "PvP 32v32", "Soporte de Joysticks H.O.T.A.S"],
        specs: {
            os: "Windows 10/11",
            gpu: "RTX 4060",
            ram: "16 GB RAM",
            storage: "70 GB SSD"
        },
        reviews: [
            {
                author: "Lucas_MechaPilot",
                rating: 5,
                date: "21 de Julio, 2026",
                verified: true,
                comment: "La sensación de peso y la destrucción de los edificios en 3D en tiempo real es impresionante."
            }
        ]
    },
    {
        id: 7,
        title: "Portal Dimension: Construct 3D",
        genre: "pensamiento",
        genreName: "Pensamiento / Puzzles",
        platform: "PC / VR / Switch",
        priceCOP: 100000,
        originalPriceCOP: 120000,
        rating: 4.9,
        reviewsCount: 940,
        badge: "INNOVACIÓN PUZZLE",
        image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
        description: "Construye geometría Imposible al estilo Escher en un lienzo 3D tridimensional. Cambia la perspectiva para crear puentes y resolver acertijos interdimensionales.",
        features: ["Ilusiones Ópticas 3D", "Relajante y Desafiante", "Modo Creador", "Soporte Háptico"],
        specs: {
            os: "Windows 10/11",
            gpu: "GTX 1060",
            ram: "8 GB RAM",
            storage: "10 GB"
        },
        reviews: [
            {
                author: "Camila_EscherMind",
                rating: 5,
                date: "23 de Julio, 2026",
                verified: true,
                comment: "Arte puro en forma de videojuego 3D. Jugar con las perspectivas ópticas es una maravilla mental."
            }
        ]
    },
    {
        id: 8,
        title: "Eldritch Realm: Souls of Chaos",
        genre: "rpg",
        genreName: "RPG / Fantasía",
        platform: "PC / PS5 / Xbox Series X",
        priceCOP: 260000,
        originalPriceCOP: 280000,
        rating: 4.98,
        reviewsCount: 3800,
        badge: "OBRA MAESTRA",
        image: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80",
        description: "Un RPG de acción osura ambientado en un mundo de fantasía oscura tridimensional. Jefes colosales, magias elementales y combate milimétrico.",
        features: ["Dificultad Hardcore", "Cientos de Armas 3D", "Lore Profundo", "Coop y Invasiones PvP"],
        specs: {
            os: "Windows 11",
            gpu: "RTX 3070 Ti",
            ram: "16 GB RAM",
            storage: "90 GB SSD"
        },
        reviews: [
            {
                author: "Daniel_SoulsBorne",
                rating: 5,
                date: "28 de Julio, 2026",
                verified: true,
                comment: "Exigente, gratificante y visualmente sobrecogedor. Los jefes colosales 3D son un desafío épico."
            }
        ]
    },
    {
        id: 9,
        title: "Galaxy Command: Interstellar 3D",
        genre: "scifi",
        genreName: "Sci-Fi / Estrategia",
        platform: "PC",
        priceCOP: 220000,
        originalPriceCOP: 220000,
        rating: 4.88,
        reviewsCount: 1540,
        badge: "ESTRATEGIA 3D",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
        description: "Comanda flotas de naves en combates espaciales verdaderamente tridimensionales en 360 grados. Conquista galaxias y gestiona imperios estelares.",
        features: ["Batallas 3D 360°", "Simulación Orbital", "Estrategia 4X", "Diplomacia galáctica"],
        specs: {
            os: "Windows 11",
            gpu: "RTX 3060 Ti",
            ram: "32 GB RAM",
            storage: "50 GB SSD"
        },
        reviews: [
            {
                author: "Commander_Vance",
                rating: 4.9,
                date: "25 de Julio, 2026",
                verified: true,
                comment: "Las batallas tácticas espaciales en 3D 360° son impresionantes. Si te gusta la ciencia ficción estratégica, es imprescindible."
            }
        ]
    }
];

const CURRENCIES = {
    COP: { code: 'COP', symbol: '$', rate: 1, label: 'COP ($ Colombia)', format: (amount) => 'COP $' + Math.round(amount).toLocaleString('es-CO') },
    USD: { code: 'USD', symbol: '$', rate: 0.00025, label: 'USD ($ EE.UU.)', format: (amount) => 'USD $' + (amount * 0.00025).toFixed(2) },
    EUR: { code: 'EUR', symbol: '€', rate: 0.00023, label: 'EUR (€ Europa)', format: (amount) => 'EUR €' + (amount * 0.00023).toFixed(2) },
    MXN: { code: 'MXN', symbol: '$', rate: 0.0045, label: 'MXN ($ México)', format: (amount) => 'MXN $' + (amount * 0.0045).toFixed(2) }
};
