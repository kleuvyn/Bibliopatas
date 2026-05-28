import { config } from "dotenv";
import { InferInsertModel } from "drizzle-orm";
import { db } from "./index";
import { books } from "./schema";

config({ path: ".env.local" });

type NewBook = InferInsertModel<typeof books>;

// Função pronta para rodar assim que o usuário mandar os dados
async function seed(newBooks: NewBook[]) {
  try {
    console.log(`Inserindo ${newBooks.length} livros...`);
    await db.insert(books).values(newBooks);
    console.log("Livros inseridos com sucesso no Turso!");
  } catch (error) {
    console.error("Erro ao inserir livros:", error);
  }
}

// Quando o usuário mandar a lista, vamos preencher este array e executar o arquivo!
const loteDeLivros: NewBook[] = [];

if (loteDeLivros.length > 0) {
  seed(loteDeLivros);
} else {
  console.log("Aguardando lista de livros...");
}
