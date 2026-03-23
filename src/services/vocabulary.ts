export const vocabulary = []

export const getAllWords = async () => vocabulary
export const getDueWords = async () => []
export const getAllWordsForStats = async () => []
export const getLibraryWords = async () => []
export const importWords = async (words: any[]) => {}
export const addWord = async (word: any) => {}
export const deleteWord = async (id: string) => {}
export const updateWord = async (id: string, data: any) => {}

export default {
  getAllWords,
  getDueWords,
  getAllWordsForStats,
  getLibraryWords,
  importWords,
  addWord,
  deleteWord,
  updateWord,
}