import axios from 'axios';
import { ScanResult, FileEntry } from '../types/minigit';

export interface IApiService {
  scanDirectory(path: string): Promise<ScanResult>;
}

// Mock implementation
export class MockApiService implements IApiService {
  async scanDirectory(path: string): Promise<ScanResult> {
    // Simulate delay as if BE was running
    await new Promise(resolve => setTimeout(resolve, 500));

    // Different scenarios based on input path
    const lowerPath = path.toLowerCase();
    console.log(`MockApiService: Scanning directory with path "${path}"`);

    // Scenario 1: First scan (all files are new)
    if (lowerPath.includes('first')) {
      const newItems: FileEntry[] = [
        { relativePath: 'src', isDirectory: true, version: '1.0' },
        { relativePath: 'src/App.tsx', isDirectory: false, version: '1.0' },
        { relativePath: 'src/index.tsx', isDirectory: false, version: '1.0' },
        { relativePath: 'src/components', isDirectory: true, version: '1.0' },
        { relativePath: 'public', isDirectory: true, version: '1.0' },
        { relativePath: 'public/index.html', isDirectory: false, version: '1.0' },
        { relativePath: 'package.json', isDirectory: false, version: '1.0' },
        { relativePath: 'README.md', isDirectory: false, version: '1.0' },
        { relativePath: 'tsconfig.json', isDirectory: false, version: '1.0' },
      ];

      return {
        isFistScan: true,
        newItems: newItems,
        modifiedItems: [],
        deletedItems: [],
        allCurrentItems: newItems,
        scanAt: new Date().toISOString(),
      };
    }

    // Scenario 2: Modified files
    if (lowerPath.includes('modified')) {
      const allFiles: FileEntry[] = [
        { relativePath: 'src', isDirectory: true, version: '1.0' },
        { relativePath: 'src/App.tsx', isDirectory: false, version: '2.0' },
        { relativePath: 'src/index.tsx', isDirectory: false, version: '1.0' },
        { relativePath: 'src/components', isDirectory: true, version: '1.0' },
        { relativePath: 'src/components/Form.tsx', isDirectory: false, version: '1.0' },
        { relativePath: 'src/components/Header.tsx', isDirectory: false, version: '1.0' },
        { relativePath: 'public', isDirectory: true, version: '1.0' },
        { relativePath: 'public/index.html', isDirectory: false, version: '1.0' },
        { relativePath: 'node_modules', isDirectory: true, version: '1.0' },
        { relativePath: 'package.json', isDirectory: false, version: '2.1' },
        { relativePath: 'README.md', isDirectory: false, version: '1.0' },
      ];

      return {
        isFistScan: false,
        newItems: [
          { relativePath: 'src/components/Header.tsx', isDirectory: false, version: '1.0' },
        ],
        modifiedItems: [
          { relativePath: 'src/App.tsx', isDirectory: false, version: '2.0' },
          { relativePath: 'package.json', isDirectory: false, version: '2.1' },
          { relativePath: 'src/components', isDirectory: true, version: '1.1' },
        ],
        deletedItems: [],
        allCurrentItems: allFiles,
        scanAt: new Date().toISOString(),
      };
    }

    // Scenario 3: Deleted files
    if (lowerPath.includes('deleted')) {
      const allFiles: FileEntry[] = [
        { relativePath: 'src', isDirectory: true, version: '1.0' },
        { relativePath: 'src/App.tsx', isDirectory: false, version: '1.0' },
        { relativePath: 'src/index.tsx', isDirectory: false, version: '1.0' },
        { relativePath: 'public', isDirectory: true, version: '1.0' },
        { relativePath: 'public/index.html', isDirectory: false, version: '1.0' },
        { relativePath: 'package.json', isDirectory: false, version: '1.0' },
      ];

      return {
        isFistScan: false,
        newItems: [],
        modifiedItems: [],
        deletedItems: [
          { relativePath: 'src/components', isDirectory: true, version: '1.0' },
          { relativePath: 'src/components/OldComponent.tsx', isDirectory: false, version: '1.0' },
          { relativePath: 'utils', isDirectory: true, version: '1.0' },
          { relativePath: 'old-config.json', isDirectory: false, version: '1.0' },
        ],
        allCurrentItems: allFiles,
        scanAt: new Date().toISOString(),
      };
    }

    // Scenario 4: Mix - new, modified and deleted (default)
    const allFiles: FileEntry[] = [
      { relativePath: 'src', isDirectory: true, version: '1.0' },
      { relativePath: 'src/App.tsx', isDirectory: false, version: '2.0' },
      { relativePath: 'src/index.tsx', isDirectory: false, version: '1.0' },
      { relativePath: 'src/components', isDirectory: true, version: '1.0' },
      { relativePath: 'src/components/Form.tsx', isDirectory: false, version: '1.0' },
      { relativePath: 'src/components/NewForm.tsx', isDirectory: false, version: '1.0' },
      { relativePath: 'src/utils', isDirectory: true, version: '1.0' },
      { relativePath: 'src/utils/helpers.ts', isDirectory: false, version: '1.0' },
      { relativePath: 'public', isDirectory: true, version: '1.0' },
      { relativePath: 'public/index.html', isDirectory: false, version: '1.0' },
      { relativePath: 'node_modules', isDirectory: true, version: '1.0' },
      { relativePath: 'package.json', isDirectory: false, version: '2.0' },
      { relativePath: 'README.md', isDirectory: false, version: '1.0' },
      { relativePath: 'tsconfig.json', isDirectory: false, version: '1.0' },
    ];

    return {
      isFistScan: false,
      newItems: [
        { relativePath: 'src/utils', isDirectory: true, version: '1.0' },
        { relativePath: 'src/utils/helpers.ts', isDirectory: false, version: '1.0' },
        { relativePath: 'src/components/NewForm.tsx', isDirectory: false, version: '1.0' },
      ],
      modifiedItems: [
        { relativePath: 'src/App.tsx', isDirectory: false, version: '2.0' },
        { relativePath: 'package.json', isDirectory: false, version: '2.0' },
        { relativePath: 'src/components', isDirectory: true, version: '1.1' },
      ],
      deletedItems: [
        { relativePath: 'src/old-helpers', isDirectory: true, version: '1.0' },
        { relativePath: 'old-component.tsx', isDirectory: false, version: '1.0' },
      ],
      allCurrentItems: allFiles,
      scanAt: new Date().toISOString(),
    };
  }
}

// Real implementation - calls backend API
export class ApiService implements IApiService {
  private apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  async scanDirectory(path: string): Promise<ScanResult> {
    const response = await axios.get<ScanResult>(`${this.apiUrl}/minigit/scan`, {
      params: { path: path.trim() },
    });
    return response.data;
  }
}

// Factory - select implementation based on environment variable
export const createApiService = (): IApiService => {
  // In CRA, REACT_APP_* variables are injected at build time
  const useMock = (window as any).__REACT_APP_MOCK_API__ ?? process.env.REACT_APP_MOCK_API === 'true';
  
  if (useMock) {
    console.log('Using Mock API Service');
    return new MockApiService();
  }
  
  console.log('Using Real API Service');
  return new ApiService();
};

export const apiService = createApiService();
