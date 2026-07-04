import fs from 'fs';
import path from 'path';

type THarEntry = {
  response: {
    content: {
      text: string;
    };
  };
};

type THarFile = {
  log: {
    entries: THarEntry[];
  };
};

type TMockIngredient = {
  _id: string;
  name: string;
  type: string;
  calories: number;
};

const readHarResponse = <T>(filename: string, entryIndex = 0): T => {
  const filePath = path.join(__dirname, 'hars', filename);
  const har = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as THarFile;

  return JSON.parse(har.log.entries[entryIndex].response.content.text) as T;
};

const ingredientsResponse = readHarResponse<{ data: TMockIngredient[] }>(
  'ingredients.har'
);

export const mockIngredients = ingredientsResponse.data;
export const mockBun = mockIngredients.find((item) => item.type === 'bun')!;
export const mockMain = mockIngredients.find((item) => item.type === 'main')!;
export const mockOrderNumber = readHarResponse<{ order: { number: number } }>(
  'orders.har'
).order.number;
