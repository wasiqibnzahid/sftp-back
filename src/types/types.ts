export interface SftpConfig {
  company: string;
  config: {
    host: string;
    port: number;
    username: string;
    password: string;
    filePath: string;
  };
}
