// Reference to vite/client removed to avoid "Cannot find type definition file" error
// The API_KEY is injected by vite define, so we augment NodeJS.ProcessEnv to satisfy Typescript.

declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    [key: string]: string | undefined;
  }
}
