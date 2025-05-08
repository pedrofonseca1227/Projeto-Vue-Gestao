import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Para Firestore
import { getAuth } from "firebase/auth"; // Para autenticação (se necessário)
import { getStorage } from "firebase/storage"; // Para o storage (se necessário)

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAe1Qws4lAa5JLLW0eegoI7jhpPsg6V_0o",
  authDomain: "estoque-e-gado.firebaseapp.com",
  projectId: "estoque-e-gado",
  storageBucket: "estoque-e-gado.firebasestorage.app",
  messagingSenderId: "748923011191",
  appId: "1:748923011191:web:97c7be8f542df02849c672"
};

// Inicializando o Firebase
const app = initializeApp(firebaseConfig);

// Obter instâncias do Firestore, Auth e Storage
const db = getFirestore(app); // Firestore
const auth = getAuth(app); // Auth
const storage = getStorage(app); // Storage (se necessário)

// Exportar as instâncias para usá-las em outros arquivos
export { db, auth, storage };
