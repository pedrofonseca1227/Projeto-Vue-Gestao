import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Para Firestore
import { getAuth } from "firebase/auth"; // Para autenticação (se necessário)
import { getStorage } from "firebase/storage"; // Para o storage (se necessário)

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBab58JFh81bRNGcw-621cwwtHV5dOpD9w",
  authDomain: "gestao-estoque-e67ca.firebaseapp.com",
  projectId: "gestao-estoque-e67ca",
  storageBucket: "gestao-estoque-e67ca.firebasestorage.app",
  messagingSenderId: "230015375493",
  appId: "1:230015375493:web:c2c170a80f58c04a84b1ec"
};

// Inicializando o Firebase
const app = initializeApp(firebaseConfig);

// Obter instâncias do Firestore, Auth e Storage
const db = getFirestore(app); // Firestore
const auth = getAuth(app); // Auth
const storage = getStorage(app); // Storage (se necessário)

// Exportar as instâncias para usá-las em outros arquivos
export { db, auth, storage };
