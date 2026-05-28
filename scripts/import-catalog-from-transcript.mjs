import fs from 'fs';

const transcriptPath = '/home/kleuvyn/.config/Code/User/workspaceStorage/d2920ca292469a162379a455ff187b71/GitHub.copilot-chat/transcripts/28875b22-0ff4-445d-b61b-6ba4a8d29669.jsonl';
const typesPath = 'lib/types.ts';

const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n').filter(Boolean);
let candidate = '';
for (const line of lines) {
  try {
    const obj = JSON.parse(line);
    if (obj.type === 'user.message' && typeof obj.data?.content === 'string') {
      const content = obj.data.content;
      if (content.includes('1000 Perguntas e Respostas') && content.length > candidate.length) {
        candidate = content;
      }
    }
  } catch {
    // ignore malformed lines
  }
}

if (!candidate) {
  console.error('Mensagem longa do catalogo nao encontrada no transcript.');
  process.exit(1);
}

const normalized = candidate
  .replace(/uloConservaçãoValor/g, ' ')
  .replace(/\r/g, ' ')
  .replace(/\n+/g, ' ')
  .replace(/\s+/g, ' ')
  .replace(/BomR\$/g, ' Bom R$')
  .replace(/MédioR\$/g, ' Médio R$')
  .replace(/RuimR\$/g, ' Ruim R$')
  .replace(/LacradoR\$/g, ' Lacrado R$')
  .replace(/R\$(\d+),(\d{2})(?=[A-Za-zÀ-ÿ])/g, 'R$$1,$2 ')
  .trim();

const entryRegex = /(.+?)\s+—\s+(.+?)\s+(Bom|Médio|Ruim|Lacrado)\s+R\$(\d+(?:,\d{2})?)/g;
const conditionMap = {
  Bom: 'seminovo',
  'Médio': 'usado',
  Ruim: 'usado',
  Lacrado: 'novo',
};

const parsed = [];
let m;
while ((m = entryRegex.exec(normalized)) !== null) {
  const title = m[1].trim();
  const author = m[2].trim();
  const condition = conditionMap[m[3]];
  const price = Number(m[4].replace(',', '.'));

  if (!title || !author || !Number.isFinite(price)) {
    continue;
  }

  parsed.push({ title, author, condition, price });
}

const typesContent = fs.readFileSync(typesPath, 'utf8');
const existingKeys = new Set(
  Array.from(typesContent.matchAll(/title: '([^']+)'[\s\S]*?author: '([^']+)'/g)).map(
    (x) => `${x[1]}|||${x[2]}`.toLowerCase(),
  ),
);

const ids = Array.from(typesContent.matchAll(/id: '(\d+)'/g)).map((x) => Number(x[1]));
let nextId = Math.max(...ids, 0) + 1;

const deduped = [];
for (const book of parsed) {
  const key = `${book.title}|||${book.author}`.toLowerCase();
  if (existingKeys.has(key)) {
    continue;
  }
  existingKeys.add(key);
  deduped.push(book);
}

if (deduped.length === 0) {
  console.log('Nenhum livro novo encontrado para adicionar.');
  process.exit(0);
}

const block = deduped
  .map(
    (book) => `  {
    id: '${nextId++}',
    title: '${book.title.replace(/'/g, "\\'")}',
    author: '${book.author.replace(/'/g, "\\'")}',
    price: ${book.price.toFixed(2)},
    cover_url: null,
    description: null,
    condition: '${book.condition}',
    genre: null,
    available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },`,
  )
  .join('\n');

const arrayEndRegex = /\n\]\s*$/;
let updated;
if (arrayEndRegex.test(typesContent)) {
  updated = typesContent.replace(arrayEndRegex, `\n${block}\n]\n`);
} else {
  // Fallback defensivo para garantir insercao no fim do arquivo.
  updated = `${typesContent.trimEnd()}\n${block}\n`;
}
fs.writeFileSync(typesPath, updated);

console.log(`Total parseado: ${parsed.length}`);
console.log(`Livros novos adicionados: ${deduped.length}`);
