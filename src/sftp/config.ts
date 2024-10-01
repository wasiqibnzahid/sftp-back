import { SftpConfig } from "../types/types";

export const sftpConfigArray: SftpConfig[] = [
  {
    company: "Copaco",
    config: {
      host: "ftp.copaco.com",
      port: 22, // Assuming default FTP port
      username: "138462",
      password: "didcnhq8",
      filePath: "/Copaco/ZIP_ATP.ZIP",
    },
  },
  {
    company: "Travion",
    config: {
      host: "ftp.travion.nl",
      port: 22, // Assuming default FTP port
      username: "TD042510",
      password: "O0zgJhCNyXw2",
      filePath: "/stockfile/INVRPTTRAVION_D042510.xml",
    },
  },
  {
    company: "EET",
    config: {
      host: "ftp.eetgroup.com",
      port: 22, // Assuming default FTP port
      username: "ConXionBV",
      password: "ehRnjpyip9JYHU6bc3mr",
      filePath: "/EET_Price_Product_All.csv",
    },
  },

  //  -- note connected

  //   {
  //     company: "TD Synnex",
  //     config: {
  //       host: "nl.tdsynnex.com",
  //       port: 22,
  //       username: "",
  //       password: "",
  //       filePath: "",
  //     },
  //   },
  // {
  //   company: "Also",
  //   config: {
  //     host: "paco.also.com",
  //     port: 22,
  //     username: "lewecowodoboci",
  //     password: "zuro6modigi",
  //     filePath: "/stock.txt",
  //   },
  // },
  //   {
  //     company: "Flex IT Distribution",
  //     config: {
  //       host: "sftp.flexitdistribution.com",
  //       port: 22,
  //       username: "xmlorder_278527",
  //       password: "1p7mGXYx",
  //       filePath: "\\inf-ftp-p-app01\\XmlOrdering\\278527\\Outbound",
  //     },
  //   },
  //   {
  //     company: "Maxicom",
  //     config: {
  //       host: "",
  //       port: 0, // Unknown port
  //       username: "",
  //       password: "",
  //       filePath: "",
  //     },
  //   },
  //   {
  // company: "Intronics",
  // config: {
  //   host: "",
  //   port: 0, // Unknown port
  //   username: "",
  //   password: "",
  //   filePath: "",
  // },
  //   },

  //   {
  //     company: "API",
  //     config: {
  //       host: "www.apibv.nl",
  //       port: 0, // Unknown port
  //       username: "",
  //       password: "",
  //       filePath: "",
  //     },
  //   },
];
