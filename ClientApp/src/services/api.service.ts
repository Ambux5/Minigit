import axios from 'axios';
import { AnalyzeResult, FileEntry } from '../types/minigit';

export interface IApiService {
  analyzeDirectory(path: string): Promise<AnalyzeResult>;
}

// Real implementation
export class ApiService implements IApiService {
  private readonly baseUrl = `${process.env.REACT_APP_API_URL ?? 'http://localhost:5000/api'}/minigit`;

  async analyzeDirectory(path: string): Promise<AnalyzeResult> {
    try {
      console.log(`ApiService: Analyzing directory "${path}"`);
      
      const encodedPath = encodeURIComponent(path);
      const url = `${this.baseUrl}/analyze?path=${encodedPath}`;
      
      console.log(`API URL: ${url}`);
      
      const response = await axios.get<AnalyzeResult>(url);
 
      console.log('Mapped result:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API Error:', error);
      if (error.response?.status === 404) {
        throw new Error(`Directory not found: ${path}`);
      }
      throw new Error(`Failed to analyze directory: ${error.message}`);
    }
  }
}

// Mock implementation
export class MockApiService implements IApiService {
  async analyzeDirectory(path: string): Promise<AnalyzeResult> {
    // Simulate delay as if BE was running
    await new Promise(resolve => setTimeout(resolve, 500));

    // Different scenarios based on input path
    const lowerPath = path.toLowerCase();
    console.log(`MockApiService: Analyzing directory with path "${path}"`);

    // Scenario 1: First analyze (all files are new)
    if (lowerPath.includes('first')) {
      const newItems: FileEntry[] = [
        { relativePath: 'src', isDirectory: true, version: 1, contentHash: '' },
        {
          relativePath: 'src/App.tsx', isDirectory: false, version: 1,
          contentHash: ''
        },
        { relativePath: 'src/index.tsx', isDirectory: false, version: 1, contentHash: '' },
        { relativePath: 'src/components', isDirectory: true, version: 1, contentHash: '' },
        { relativePath: 'public', isDirectory: true, version: 1, contentHash: '' },
        { relativePath: 'public/index.html', isDirectory: false, version: 1, contentHash: '' },
        { relativePath: 'package.json', isDirectory: false, version: 1, contentHash: '' },
        { relativePath: 'README.md', isDirectory: false, version: 1, contentHash: '' },
        { relativePath: 'tsconfig.json', isDirectory: false, version: 1, contentHash: '' },
      ];

      return {
        isFirstRun: true,
        newItems: newItems,
        changedFiles: [],
        deletedItems: [],
        allCurrentEntries: newItems,
        totalChanges: newItems.length,
        analyzedAt: new Date().toISOString(),
      };
    }

    // Scenario 2: Modified files
    if (lowerPath.includes('modified')) {
      const allFiles: FileEntry[] = [
        { relativePath: 'src', isDirectory: true, version: 1, contentHash: '' },
        { relativePath: 'src/App.tsx', isDirectory: false, version: 2, contentHash: '' },
        { relativePath: 'src/index.tsx', isDirectory: false, version: 1, contentHash: '' },
        { relativePath: 'src/components', isDirectory: true, version: 1, contentHash: '' },
        { relativePath: 'src/components/Form.tsx', isDirectory: false, version: 1, contentHash: '' },
        { relativePath: 'src/components/Header.tsx', isDirectory: false, version: 1, contentHash: '' },
        { relativePath: 'public', isDirectory: true, version: 1, contentHash: '' },
        { relativePath: 'public/index.html', isDirectory: false, version: 1, contentHash: '' },
        { relativePath: 'node_modules', isDirectory: true, version: 1, contentHash: '' },
        { relativePath: 'package.json', isDirectory: false, version: 3, contentHash: '' },
        { relativePath: 'README.md', isDirectory: false, version: 1, contentHash: '' },
      ];

      return {
        isFirstRun: false,
        newItems: [
          { relativePath: 'src/components/Header.tsx', isDirectory: false, version: 1, contentHash: '' },
        ],
        changedFiles: [
          { relativePath: 'src/App.tsx', isDirectory: false, version: 2, contentHash: '' },
          { relativePath: 'package.json', isDirectory: false, version: 3, contentHash: '' },
          { relativePath: 'src/components', isDirectory: true, version: 2, contentHash: '' },
        ],
        deletedItems: [],
        allCurrentEntries: allFiles,
        totalChanges: 4,
        analyzedAt: new Date().toISOString(),
      };
    }

    // Scenario 3: Deleted files
    if (lowerPath.includes('deleted')) {
      const allFiles: FileEntry[] = [
        { relativePath: 'src', isDirectory: true, version: 1, contentHash: '' },
        { relativePath: 'src/App.tsx', isDirectory: false, version: 1, contentHash: '' },
        { relativePath: 'src/index.tsx', isDirectory: false, version: 1, contentHash: '' },
        { relativePath: 'public', isDirectory: true, version: 1, contentHash: '' },
        { relativePath: 'public/index.html', isDirectory: false, version: 1, contentHash: '' },
        { relativePath: 'package.json', isDirectory: false, version: 1, contentHash: '' },
      ];

      return {
        isFirstRun: false,
        newItems: [],
        changedFiles: [],
        deletedItems: [
          { relativePath: 'src/components', isDirectory: true, version: 1, contentHash: '' },
          { relativePath: 'src/components/OldComponent.tsx', isDirectory: false, version: 1, contentHash: '' },
          { relativePath: 'utils', isDirectory: true, version: 1, contentHash: '' },
          { relativePath: 'old-config.json', isDirectory: false, version: 1, contentHash: '' },
        ],
        allCurrentEntries: allFiles,
        totalChanges: 4,
        analyzedAt: new Date().toISOString(),
      };
    }

    // Scenario 4: Mix - new, modified and deleted (default)
    const allFiles: FileEntry[] = [
      { relativePath: 'src', isDirectory: true, version: 1, contentHash: '' },
      { relativePath: 'src/App.tsx', isDirectory: false, version: 2, contentHash: '' },
      { relativePath: 'src/index.tsx', isDirectory: false, version: 1, contentHash: '' },
      { relativePath: 'src/components', isDirectory: true, version: 1, contentHash: '' },
      { relativePath: 'src/components/Form.tsx', isDirectory: false, version: 1, contentHash: '' },
      { relativePath: 'src/components/NewForm.tsx', isDirectory: false, version: 1, contentHash: '' },
      { relativePath: 'src/utils', isDirectory: true, version: 1, contentHash: '' },
      { relativePath: 'src/utils/helpers.ts', isDirectory: false, version: 1, contentHash: '' },
      { relativePath: 'public', isDirectory: true, version: 1, contentHash: '' },
      { relativePath: 'public/index.html', isDirectory: false, version: 1, contentHash: '' },
      { relativePath: 'node_modules', isDirectory: true, version: 1, contentHash: '' },
      { relativePath: 'package.json', isDirectory: false, version: 2, contentHash: '' },
      { relativePath: 'README.md', isDirectory: false, version: 1, contentHash: '' },
      { relativePath: 'tsconfig.json', isDirectory: false, version: 1, contentHash: '' },
    ];

    return {
      isFirstRun: false,
      newItems: [
        { relativePath: 'src/utils', isDirectory: true, version: 1, contentHash: '' },
        { relativePath: 'src/utils/helpers.ts', isDirectory: false, version: 1, contentHash: '' },
        { relativePath: 'src/components/NewForm.tsx', isDirectory: false, version: 1, contentHash: '' },
      ],
      changedFiles: [
        { relativePath: 'src/App.tsx', isDirectory: false, version: 2, contentHash: '' },
        { relativePath: 'package.json', isDirectory: false, version: 2, contentHash: '' },
        { relativePath: 'src/components', isDirectory: true, version: 2, contentHash: '' },
      ],
      deletedItems: [
        { relativePath: 'src/old-helpers', isDirectory: true, version: 1, contentHash: '' },
        { relativePath: 'old-component.tsx', isDirectory: false, version: 1, contentHash: '' },
      ],
      allCurrentEntries: allFiles,
      totalChanges: 8,
      analyzedAt: new Date().toISOString(),
    };
  }
}

// Factory - select implementation based on environment variable
export const createApiService = (): IApiService => {
  // In CRA, REACT_APP_* variables are injected at build time
  const useMock = (globalThis as any).__REACT_APP_MOCK_API__ ?? process.env.REACT_APP_MOCK_API === 'true';
  
  if (useMock) {
    console.log('Using Mock API Service');
    return new MockApiService();
  }
  
  console.log('Using Real API Service');
  return new ApiService();
};

export const apiService = createApiService();
