let db;
const DB_NAME = 'CareLinkDB';
const DB_VERSION = 1;

function initIndexedDB() {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = function(event) {
        console.log('IndexedDB error:', event.target.error);
    };

    request.onsuccess = function(event) {
        db = event.target.result;
        console.log('IndexedDB connected');
        loadFromDB();
    };

    request.onupgradeneeded = function(event) {
        db = event.target.result;

        if (!db.objectStoreNames.contains('users')) {
            const userStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
            userStore.createIndex('email', 'email', { unique: true });
        }

        if (!db.objectStoreNames.contains('requests')) {
            const requestStore = db.createObjectStore('requests', { keyPath: 'id', autoIncrement: true });
            requestStore.createIndex('status', 'status', { unique: false });
            requestStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('professionals')) {
            const profStore = db.createObjectStore('professionals', { keyPath: 'id', autoIncrement: true });
            profStore.createIndex('type', 'type', { unique: false });
            profStore.createIndex('rating', 'rating', { unique: false });
        }

        console.log('IndexedDB stores created');
    };
}

function loadFromDB() {
    if (!db) return;

    const transaction = db.transaction(['users'], 'readonly');
    const store = transaction.objectStore('users');
    const request = store.getAll();

    request.onsuccess = function(event) {
        if (event.target.result.length === 0) {
            saveDefaultUser();
        }
    };

    loadProfessionals();
}

function saveDefaultUser() {
    if (!db) return;

    const transaction = db.transaction(['users'], 'readwrite');
    const store = transaction.objectStore('users');

    store.add({
        name: 'Maria Oliveira',
        email: 'maria@email.com',
        phone: '(11) 99999-9999',
        address: 'Rua das Flores, 123 - São Paulo/SP',
        dependents: [
            { name: 'João Silva', age: 78, relation: 'Pai' },
            { name: 'Ana Oliveira', age: 72, relation: 'Mãe' }
        ],
        createdAt: new Date().toISOString()
    });

    console.log('Default user created');
}

function loadProfessionals() {
    if (!db) return;

    const transaction = db.transaction(['professionals'], 'readonly');
    const store = transaction.objectStore('professionals');
    const request = store.count();

    request.onsuccess = function(event) {
        if (event.target.result === 0) {
            seedProfessionals();
        }
    };
}

function seedProfessionals() {
    if (!db) return;

    const professionals = [
        {
            name: 'Carlos Eduardo',
            type: 'tecnico',
            category: 'Técnico de Enfermagem',
            rating: 4.9,
            reviews: 238,
            distance: '1.2 km',
            pricePerHour: 25,
            specialties: ['Curativos', 'Medicação', 'Plantão'],
            corEn: '123456-SP',
            photo: 'CE'
        },
        {
            name: 'Juliana Costa',
            type: 'cuidador',
            category: 'Cuidadora de Idosos',
            rating: 4.8,
            reviews: 156,
            distance: '2.5 km',
            pricePerHour: 22,
            specialties: ['Alzheimer', 'Mobilidade', 'Banho'],
            certificate: 'Cuidadores Certificados',
            photo: 'JC'
        },
        {
            name: 'Dra. Amanda Reis',
            type: 'enfermeiro',
            category: 'Enfermeira',
            rating: 5.0,
            reviews: 312,
            distance: '3.8 km',
            pricePerHour: 40,
            specialties: ['UTI', 'Curativos Complexos', 'Pós-cirúrgico'],
            corEn: '78901-SP',
            photo: 'AR'
        },
        {
            name: 'Roberto Lima',
            type: 'tecnico',
            category: 'Técnico de Enfermagem',
            rating: 4.7,
            reviews: 89,
            distance: '0.8 km',
            pricePerHour: 25,
            specialties: ['Home Care', 'Idosos', 'Noturno'],
            corEn: '23456-SP',
            photo: 'RL'
        }
    ];

    const transaction = db.transaction(['professionals'], 'readwrite');
    const store = transaction.objectStore('professionals');
    professionals.forEach(prof => store.add(prof));
    console.log('Professionals seeded');
}

function saveRequest(requestData) {
    if (!db) return;

    const transaction = db.transaction(['requests'], 'readwrite');
    const store = transaction.objectStore('requests');
    store.add({ ...requestData, status: 'searching', timestamp: new Date().toISOString() });
}

function loadUserData(onLoaded) {
    if (!db) return;

    const transaction = db.transaction(['users'], 'readonly');
    const store = transaction.objectStore('users');
    const request = store.getAll();

    request.onsuccess = function(event) {
        const users = event.target.result;
        if (users.length > 0) onLoaded(users[0]);
    };
}
